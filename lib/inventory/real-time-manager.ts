/**
 * Real-Time Inventory Management System
 * Handles room availability, holds, and synchronization across all channels
 */

import { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface InventorySnapshot {
  roomTypeId: string;
  hotelId: string;
  date: string;
  totalRooms: number;
  bookedRooms: number;
  heldRooms: number;
  blockedRooms: number;
  availableRooms: number;
  netAvailable: number;
  lastUpdated: Date;
}

export interface BookingHold {
  id: string;
  sessionId: string;
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  roomCount: number;
  expiresAt: Date;
  status: 'active' | 'expired' | 'converted';
}

export interface AvailabilityRequest {
  hotelId: string;
  roomTypeId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomCount: number;
  excludeHoldId?: string;
}

export interface AvailabilityResponse {
  roomTypeId: string;
  availableRooms: number;
  rates: {
    min: number;
    max: number;
    average: number;
  };
  restrictions: {
    minimumStay?: number;
    maximumStay?: number;
    closedToArrival: boolean;
    closedToDeparture: boolean;
    closeOut: boolean;
  };
}

export class RealTimeInventoryManager {
  private supabase: SupabaseClient;
  private holdCleanupInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.startHoldCleanup();
    this.startPeriodicSync();
  }

  /**
   * Check real-time availability for given criteria
   */
  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse[]> {
    try {
      const { data, error } = await this.supabase.rpc('check_availability_with_holds', {
        p_hotel_id: request.hotelId,
        p_room_type_id: request.roomTypeId || null,
        p_check_in: request.checkInDate.toISOString().split('T')[0],
        p_check_out: request.checkOutDate.toISOString().split('T')[0],
        p_room_count: request.roomCount
      });

      if (error) {
        throw new Error(`Availability check failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Availability check error:', error);
      throw error;
    }
  }

  /**
   * Create a temporary hold on inventory
   */
  async createHold(
    sessionId: string,
    hotelId: string,
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    roomCount: number = 1,
    holdMinutes: number = 15
  ): Promise<string> {
    try {
      // First check if we have availability
      const availability = await this.checkAvailability({
        hotelId,
        roomTypeId,
        checkInDate,
        checkOutDate,
        roomCount
      });

      const roomTypeAvailability = availability.find(a => a.roomTypeId === roomTypeId);
      if (!roomTypeAvailability || roomTypeAvailability.availableRooms < roomCount) {
        throw new Error('Insufficient inventory available');
      }

      // Create the hold
      const { data: holdId, error } = await this.supabase.rpc('create_booking_hold', {
        p_session_id: sessionId,
        p_hotel_id: hotelId,
        p_room_type_id: roomTypeId,
        p_check_in: checkInDate.toISOString().split('T')[0],
        p_check_out: checkOutDate.toISOString().split('T')[0],
        p_room_count: roomCount,
        p_hold_minutes: holdMinutes
      });

      if (error) {
        throw new Error(`Failed to create hold: ${error.message}`);
      }

      // Update availability cache
      await this.updateAvailabilityCache(hotelId, roomTypeId, checkInDate, checkOutDate);

      // Notify other systems of inventory change
      await this.notifyInventoryChange(hotelId, roomTypeId, checkInDate, checkOutDate);

      return holdId;
    } catch (error) {
      console.error('Hold creation error:', error);
      throw error;
    }
  }

  /**
   * Convert a hold to a confirmed booking
   */
  async convertHoldToBooking(holdId: string, bookingId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('booking_holds')
        .update({ 
          status: 'converted',
          converted_to_booking_id: bookingId 
        })
        .eq('id', holdId);

      if (error) {
        throw new Error(`Failed to convert hold: ${error.message}`);
      }

      // Get hold details for cache update
      const { data: hold } = await this.supabase
        .from('booking_holds')
        .select('*')
        .eq('id', holdId)
        .single();

      if (hold) {
        await this.updateAvailabilityCache(
          hold.hotel_id,
          hold.room_type_id,
          new Date(hold.check_in_date),
          new Date(hold.check_out_date)
        );
      }
    } catch (error) {
      console.error('Hold conversion error:', error);
      throw error;
    }
  }

  /**
   * Release a hold (expired or cancelled)
   */
  async releaseHold(holdId: string): Promise<void> {
    try {
      const { data: hold, error: holdError } = await this.supabase
        .from('booking_holds')
        .select('*')
        .eq('id', holdId)
        .single();

      if (holdError || !hold) {
        throw new Error('Hold not found');
      }

      const { error } = await this.supabase
        .from('booking_holds')
        .update({ status: 'expired' })
        .eq('id', holdId);

      if (error) {
        throw new Error(`Failed to release hold: ${error.message}`);
      }

      // Update availability cache
      await this.updateAvailabilityCache(
        hold.hotel_id,
        hold.room_type_id,
        new Date(hold.check_in_date),
        new Date(hold.check_out_date)
      );

      // Notify inventory change
      await this.notifyInventoryChange(
        hold.hotel_id,
        hold.room_type_id,
        new Date(hold.check_in_date),
        new Date(hold.check_out_date)
      );
    } catch (error) {
      console.error('Hold release error:', error);
      throw error;
    }
  }

  /**
   * Get current holds for a session
   */
  async getSessionHolds(sessionId: string): Promise<BookingHold[]> {
    try {
      const { data, error } = await this.supabase
        .from('booking_holds')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to get session holds: ${error.message}`);
      }

      return data?.map(hold => ({
        id: hold.id,
        sessionId: hold.session_id,
        hotelId: hold.hotel_id,
        roomTypeId: hold.room_type_id,
        checkInDate: hold.check_in_date,
        checkOutDate: hold.check_out_date,
        roomCount: hold.room_count,
        expiresAt: new Date(hold.expires_at),
        status: hold.status as 'active' | 'expired' | 'converted'
      })) || [];
    } catch (error) {
      console.error('Session holds retrieval error:', error);
      throw error;
    }
  }

  /**
   * Block inventory for maintenance or group bookings
   */
  async createInventoryBlock(
    hotelId: string,
    roomTypeId: string,
    startDate: Date,
    endDate: Date,
    roomsBlocked: number,
    reason: 'maintenance' | 'group' | 'event' | 'other',
    blockName: string,
    notes?: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('inventory_blocks')
        .insert({
          hotel_id: hotelId,
          room_type_id: roomTypeId,
          block_name: blockName,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          rooms_blocked: roomsBlocked,
          reason,
          notes
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create inventory block: ${error.message}`);
      }

      // Update availability cache for the blocked period
      await this.updateAvailabilityCache(hotelId, roomTypeId, startDate, endDate);

      return data.id;
    } catch (error) {
      console.error('Inventory block creation error:', error);
      throw error;
    }
  }

  /**
   * Update availability cache for a date range
   */
  private async updateAvailabilityCache(
    hotelId: string,
    roomTypeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    try {
      const dates = this.generateDateRange(startDate, endDate);
      
      for (const date of dates) {
        const availability = await this.checkAvailability({
          hotelId,
          roomTypeId,
          checkInDate: date,
          checkOutDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          roomCount: 1
        });

        const roomAvailability = availability.find(a => a.roomTypeId === roomTypeId);
        if (roomAvailability) {
          await this.supabase
            .from('availability_cache')
            .upsert({
              hotel_id: hotelId,
              room_type_id: roomTypeId,
              date: date.toISOString().split('T')[0],
              available_rooms: roomAvailability.availableRooms,
              last_updated: new Date().toISOString()
            }, {
              onConflict: 'hotel_id,room_type_id,date'
            });
        }
      }
    } catch (error) {
      console.error('Availability cache update error:', error);
    }
  }

  /**
   * Notify external systems of inventory changes
   */
  private async notifyInventoryChange(
    hotelId: string,
    roomTypeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    try {
      // Get active channel integrations
      const { data: integrations } = await this.supabase
        .from('channel_integrations')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .eq('integration_status', 'active');

      if (!integrations?.length) return;

      // Queue sync jobs for each integration
      for (const integration of integrations) {
        await this.queueChannelSync(integration.id, 'availability', {
          roomTypeId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Inventory change notification error:', error);
    }
  }

  /**
   * Queue a channel manager sync job
   */
  private async queueChannelSync(
    integrationId: string,
    syncType: string,
    data: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('sync_logs')
        .insert({
          integration_id: integrationId,
          sync_type: syncType,
          direction: 'push',
          started_at: new Date().toISOString(),
          sync_data: data
        });
    } catch (error) {
      console.error('Channel sync queue error:', error);
    }
  }

  /**
   * Start periodic cleanup of expired holds
   */
  private startHoldCleanup(): void {
    this.holdCleanupInterval = setInterval(async () => {
      try {
        await this.supabase.rpc('cleanup_expired_holds');
      } catch (error) {
        console.error('Hold cleanup error:', error);
      }
    }, 60000); // Run every minute
  }

  /**
   * Start periodic availability cache sync
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncAvailabilityWithChannels();
      } catch (error) {
        console.error('Periodic sync error:', error);
      }
    }, 300000); // Run every 5 minutes
  }

  /**
   * Sync availability with all active channel managers
   */
  private async syncAvailabilityWithChannels(): Promise<void> {
    try {
      const { data: integrations } = await this.supabase
        .from('channel_integrations')
        .select('*')
        .eq('is_active', true)
        .eq('integration_status', 'active');

      if (!integrations?.length) return;

      for (const integration of integrations) {
        // Queue availability sync for the next 90 days
        const today = new Date();
        const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

        await this.queueChannelSync(integration.id, 'availability', {
          startDate: today.toISOString().split('T')[0],
          endDate: futureDate.toISOString().split('T')[0],
          fullSync: true
        });
      }
    } catch (error) {
      console.error('Channel sync error:', error);
    }
  }

  /**
   * Generate array of dates between start and end date
   */
  private generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Get occupancy forecast for yield management
   */
  async getOccupancyForecast(
    hotelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{[date: string]: number}> {
    try {
      const { data, error } = await this.supabase.rpc('get_occupancy_forecast', {
        p_hotel_id: hotelId,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0]
      });

      if (error) {
        throw new Error(`Failed to get occupancy forecast: ${error.message}`);
      }

      return data || {};
    } catch (error) {
      console.error('Occupancy forecast error:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.holdCleanupInterval) {
      clearInterval(this.holdCleanupInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

/**
 * Inventory event types for real-time updates
 */
export enum InventoryEventType {
  AVAILABILITY_CHANGED = 'availability_changed',
  HOLD_CREATED = 'hold_created',
  HOLD_RELEASED = 'hold_released',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  INVENTORY_BLOCKED = 'inventory_blocked',
  RATES_UPDATED = 'rates_updated'
}

export interface InventoryEvent {
  type: InventoryEventType;
  hotelId: string;
  roomTypeId: string;
  date: string;
  data: any;
  timestamp: Date;
}

/**
 * Real-time inventory event subscriber
 */
export class InventoryEventSubscriber {
  private supabase: SupabaseClient;
  private subscriptions: Map<string, any> = new Map();

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Subscribe to inventory events for a hotel
   */
  subscribeToHotelInventory(
    hotelId: string,
    callback: (event: InventoryEvent) => void
  ): string {
    const subscriptionId = `hotel_${hotelId}_${Date.now()}`;

    const subscription = this.supabase
      .channel(`inventory_${hotelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'availability_cache',
        filter: `hotel_id=eq.${hotelId}`
      }, (payload) => {
        callback({
          type: InventoryEventType.AVAILABILITY_CHANGED,
          hotelId,
          roomTypeId: (payload as any).new?.room_type_id || (payload as any).old?.room_type_id,
          date: (payload as any).new?.date || (payload as any).old?.date,
          data: payload,
          timestamp: new Date()
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'booking_holds',
        filter: `hotel_id=eq.${hotelId}`
      }, (payload) => {
        const eventType = payload.eventType === 'INSERT' 
          ? InventoryEventType.HOLD_CREATED 
          : InventoryEventType.HOLD_RELEASED;

        callback({
          type: eventType,
          hotelId,
          roomTypeId: (payload as any).new?.room_type_id || (payload as any).old?.room_type_id,
          date: (payload as any).new?.check_in_date || (payload as any).old?.check_in_date,
          data: payload,
          timestamp: new Date()
        });
      })
      .subscribe();

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Clean up all subscriptions
   */
  destroy(): void {
    for (const [id, subscription] of Array.from(this.subscriptions)) {
      this.supabase.removeChannel(subscription);
    }
    this.subscriptions.clear();
  }
}