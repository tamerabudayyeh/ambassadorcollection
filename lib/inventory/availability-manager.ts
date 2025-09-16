/**
 * Real-time Availability Management Service
 * Handles inventory tracking, room allocation, and overbooking protection
 */

import { supabase } from '@/lib/supabase';

export interface InventoryQuery {
  hotelId: string;
  roomTypeId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomsRequested: number;
}

export interface InventoryStatus {
  roomTypeId: string;
  totalInventory: number;
  availableRooms: number;
  blockedRooms: number;
  maintenanceRooms: number;
  heldRooms: number;
  netAvailable: number;
  oversellLimit: number;
  canBookRooms: number;
  restrictions: InventoryRestriction[];
}

export interface InventoryRestriction {
  type: 'minimum_stay' | 'maximum_stay' | 'closed_to_arrival' | 'closed_to_departure' | 'stop_sell';
  value?: number;
  message: string;
  active: boolean;
}

export interface InventoryAlert {
  type: 'low_inventory' | 'overbooking_risk' | 'maintenance_conflict' | 'restriction_violation';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  roomTypeId: string;
  date: Date;
}

export class AvailabilityManager {
  private static readonly LOW_INVENTORY_THRESHOLD = 3;
  private static readonly OVERBOOKING_THRESHOLD = 0.95; // 95% occupancy triggers alert

  /**
   * Check real-time availability with all restrictions
   */
  static async checkAvailability(query: InventoryQuery): Promise<{
    available: boolean;
    inventory: InventoryStatus[];
    alerts: InventoryAlert[];
    restrictions: InventoryRestriction[];
  }> {
    try {
      const { hotelId, roomTypeId, checkInDate, checkOutDate, roomsRequested } = query;
      
      // Get room types for the hotel (or specific room type)
      const roomTypesQuery = supabase
        .from('room_types')
        .select('*')
        .eq('hotel_id', hotelId);
      
      if (roomTypeId) {
        roomTypesQuery.eq('id', roomTypeId);
      }
      
      const { data: roomTypes, error: roomTypesError } = await roomTypesQuery;
      
      if (roomTypesError) {
        throw new Error(`Failed to fetch room types: ${roomTypesError.message}`);
      }

      const inventoryStatuses: InventoryStatus[] = [];
      const alerts: InventoryAlert[] = [];
      const allRestrictions: InventoryRestriction[] = [];

      // Check each room type
      for (const roomType of roomTypes) {
        const status = await this.getRoomTypeInventory(
          roomType.id,
          checkInDate,
          checkOutDate
        );
        
        inventoryStatuses.push(status);
        allRestrictions.push(...status.restrictions);

        // Generate alerts
        const roomAlerts = this.generateInventoryAlerts(status, checkInDate, checkOutDate);
        alerts.push(...roomAlerts);
      }

      // Check if booking is possible
      const totalAvailable = inventoryStatuses.reduce((sum, status) => sum + status.canBookRooms, 0);
      const available = totalAvailable >= roomsRequested;

      return {
        available,
        inventory: inventoryStatuses,
        alerts,
        restrictions: allRestrictions.filter(r => r.active)
      };

    } catch (error) {
      console.error('Availability check failed:', error);
      throw error;
    }
  }

  /**
   * Get detailed inventory status for a specific room type
   */
  private static async getRoomTypeInventory(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<InventoryStatus> {
    // Get room type details
    const { data: roomType, error: roomTypeError } = await supabase
      .from('room_types')
      .select('*')
      .eq('id', roomTypeId)
      .single();

    if (roomTypeError) {
      throw new Error(`Failed to fetch room type: ${roomTypeError.message}`);
    }

    const totalInventory = roomType.total_inventory || 10; // Default if not set

    // Calculate available rooms for the date range
    const availableRooms = await this.calculateAvailableRooms(
      roomTypeId,
      checkInDate,
      checkOutDate,
      totalInventory
    );

    // Get blocked/maintenance rooms
    const blockedRooms = await this.getBlockedRooms(roomTypeId, checkInDate, checkOutDate);
    const maintenanceRooms = await this.getMaintenanceRooms(roomTypeId, checkInDate, checkOutDate);
    
    // Get held rooms (from booking holds)
    const heldRooms = await this.getHeldRooms(roomTypeId, checkInDate, checkOutDate);

    // Calculate net availability
    const netAvailable = Math.max(0, availableRooms - blockedRooms - maintenanceRooms - heldRooms);

    // Get restrictions
    const restrictions = await this.getRoomTypeRestrictions(roomTypeId, checkInDate, checkOutDate);

    // Calculate oversell limit (usually 10% of inventory)
    const oversellLimit = Math.floor(totalInventory * 0.1);
    const canBookRooms = Math.min(netAvailable + oversellLimit, totalInventory);

    return {
      roomTypeId,
      totalInventory,
      availableRooms,
      blockedRooms,
      maintenanceRooms,
      heldRooms,
      netAvailable,
      oversellLimit,
      canBookRooms: Math.max(0, canBookRooms),
      restrictions
    };
  }

  /**
   * Calculate available rooms for date range
   */
  private static async calculateAvailableRooms(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    totalInventory: number
  ): Promise<number> {
    // Use the existing database function
    const { data, error } = await supabase
      .rpc('get_room_availability', {
        p_room_type_id: roomTypeId,
        p_check_in: checkInDate.toISOString().split('T')[0],
        p_check_out: checkOutDate.toISOString().split('T')[0]
      });

    if (error) {
      console.error('Error calculating availability:', error);
      return totalInventory; // Fallback to total inventory
    }

    return data?.[0]?.available_rooms || totalInventory;
  }

  /**
   * Get blocked rooms for date range
   */
  private static async getBlockedRooms(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<number> {
    const { data, error } = await supabase
      .from('inventory_blocks')
      .select('rooms_blocked')
      .eq('room_type_id', roomTypeId)
      .lte('start_date', checkOutDate.toISOString().split('T')[0])
      .gte('end_date', checkInDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching blocked rooms:', error);
      return 0;
    }

    return data?.reduce((sum, block) => sum + block.rooms_blocked, 0) || 0;
  }

  /**
   * Get maintenance rooms for date range
   */
  private static async getMaintenanceRooms(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<number> {
    const { data, error } = await supabase
      .from('inventory_blocks')
      .select('rooms_blocked')
      .eq('room_type_id', roomTypeId)
      .eq('reason', 'maintenance')
      .lte('start_date', checkOutDate.toISOString().split('T')[0])
      .gte('end_date', checkInDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching maintenance rooms:', error);
      return 0;
    }

    return data?.reduce((sum, block) => sum + block.rooms_blocked, 0) || 0;
  }

  /**
   * Get held rooms (from active booking holds)
   */
  private static async getHeldRooms(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<number> {
    const { data, error } = await supabase
      .from('booking_holds')
      .select('room_count')
      .eq('room_type_id', roomTypeId)
      .eq('status', 'active')
      .lte('check_in_date', checkOutDate.toISOString().split('T')[0])
      .gte('check_out_date', checkInDate.toISOString().split('T')[0])
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error fetching held rooms:', error);
      return 0;
    }

    return data?.reduce((sum, hold) => sum + hold.room_count, 0) || 0;
  }

  /**
   * Get room type restrictions for date range
   */
  private static async getRoomTypeRestrictions(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<InventoryRestriction[]> {
    const { data, error } = await supabase
      .from('room_restrictions')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .lte('start_date', checkOutDate.toISOString().split('T')[0])
      .gte('end_date', checkInDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching restrictions:', error);
      return [];
    }

    return data?.map(restriction => ({
      type: restriction.restriction_type as any,
      value: restriction.value,
      message: restriction.description || this.getRestrictionMessage(restriction.restriction_type, restriction.value),
      active: restriction.active
    })) || [];
  }

  /**
   * Generate standard restriction messages
   */
  private static getRestrictionMessage(type: string, value?: number): string {
    switch (type) {
      case 'minimum_stay':
        return `Minimum stay of ${value} night${value !== 1 ? 's' : ''} required`;
      case 'maximum_stay':
        return `Maximum stay of ${value} night${value !== 1 ? 's' : ''} allowed`;
      case 'closed_to_arrival':
        return 'Closed to arrival on this date';
      case 'closed_to_departure':
        return 'Closed to departure on this date';
      case 'stop_sell':
        return 'Not available for booking';
      default:
        return 'Booking restriction applies';
    }
  }

  /**
   * Generate inventory alerts
   */
  private static generateInventoryAlerts(
    status: InventoryStatus,
    checkInDate: Date,
    checkOutDate: Date
  ): InventoryAlert[] {
    const alerts: InventoryAlert[] = [];

    // Low inventory alert
    if (status.netAvailable <= this.LOW_INVENTORY_THRESHOLD && status.netAvailable > 0) {
      alerts.push({
        type: 'low_inventory',
        severity: 'warning',
        message: `Only ${status.netAvailable} room${status.netAvailable !== 1 ? 's' : ''} left!`,
        roomTypeId: status.roomTypeId,
        date: checkInDate
      });
    }

    // Overbooking risk alert
    const occupancyRate = (status.totalInventory - status.netAvailable) / status.totalInventory;
    if (occupancyRate >= this.OVERBOOKING_THRESHOLD) {
      alerts.push({
        type: 'overbooking_risk',
        severity: 'critical',
        message: 'High occupancy - monitor for overbooking',
        roomTypeId: status.roomTypeId,
        date: checkInDate
      });
    }

    // Maintenance conflict alert
    if (status.maintenanceRooms > 0) {
      alerts.push({
        type: 'maintenance_conflict',
        severity: 'info',
        message: `${status.maintenanceRooms} room${status.maintenanceRooms !== 1 ? 's' : ''} under maintenance`,
        roomTypeId: status.roomTypeId,
        date: checkInDate
      });
    }

    // Restriction violation alerts
    status.restrictions.forEach(restriction => {
      if (restriction.active) {
        alerts.push({
          type: 'restriction_violation',
          severity: 'warning',
          message: restriction.message,
          roomTypeId: status.roomTypeId,
          date: checkInDate
        });
      }
    });

    return alerts;
  }

  /**
   * Create a booking hold for inventory
   */
  static async createBookingHold(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    roomCount: number,
    expiresInMinutes: number = 15
  ): Promise<string | null> {
    try {
      const holdId = `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from('booking_holds')
        .insert({
          hold_id: holdId,
          room_type_id: roomTypeId,
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          room_count: roomCount,
          expires_at: expiresAt.toISOString(),
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking hold:', error);
        return null;
      }

      return holdId;
    } catch (error) {
      console.error('Failed to create booking hold:', error);
      return null;
    }
  }

  /**
   * Release a booking hold
   */
  static async releaseBookingHold(holdId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('booking_holds')
        .update({
          status: 'expired',
          released_at: new Date().toISOString()
        })
        .eq('hold_id', holdId);

      return !error;
    } catch (error) {
      console.error('Failed to release booking hold:', error);
      return false;
    }
  }

  /**
   * Convert booking hold to confirmed booking
   */
  static async convertHoldToBooking(holdId: string, bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('booking_holds')
        .update({
          status: 'converted',
          booking_id: bookingId,
          converted_at: new Date().toISOString()
        })
        .eq('hold_id', holdId);

      return !error;
    } catch (error) {
      console.error('Failed to convert hold to booking:', error);
      return false;
    }
  }

  /**
   * Clean up expired holds
   */
  static async cleanupExpiredHolds(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('booking_holds')
        .update({
          status: 'expired',
          released_at: new Date().toISOString()
        })
        .eq('status', 'active')
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) {
        console.error('Error cleaning up expired holds:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Failed to cleanup expired holds:', error);
      return 0;
    }
  }

  /**
   * Get inventory summary for admin dashboard
   */
  static async getInventorySummary(hotelId: string, date: Date): Promise<{
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    blockedRooms: number;
    maintenanceRooms: number;
    heldRooms: number;
    occupancyRate: number;
    revPAR: number;
  }> {
    // This would be implemented for admin dashboard
    // Placeholder implementation
    return {
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      blockedRooms: 0,
      maintenanceRooms: 0,
      heldRooms: 0,
      occupancyRate: 0,
      revPAR: 0
    };
  }
}