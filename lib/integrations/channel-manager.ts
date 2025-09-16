/**
 * Channel Manager Integration Framework
 * Handles connections to multiple OTAs and distribution channels
 */

import { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface ChannelIntegration {
  id: string;
  hotelId: string;
  channelName: string;
  channelType: 'direct' | 'ota' | 'gds' | 'corporate' | 'group';
  status: 'active' | 'inactive' | 'error' | 'syncing';
  apiEndpoint: string;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  configuration: {
    syncFrequencyMinutes: number;
    syncTypes: ('rates' | 'availability' | 'bookings' | 'inventory')[];
    rateMappings: { [roomTypeId: string]: string };
    propertyMappings: { [key: string]: string };
    defaultCurrency: string;
    timezone: string;
    commissionRate?: number;
  };
  lastSyncAt?: Date;
  lastSyncStatus?: string;
  errorCount: number;
  lastErrorMessage?: string;
  isActive: boolean;
}

export interface SyncOperation {
  id: string;
  integrationId: string;
  syncType: 'rates' | 'availability' | 'bookings' | 'inventory';
  direction: 'push' | 'pull' | 'both';
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  errorDetails?: any;
  syncData?: any;
}

export interface BookingData {
  externalId: string;
  confirmationNumber: string;
  hotelId: string;
  channelName: string;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: any;
  };
  stayDetails: {
    checkInDate: Date;
    checkOutDate: Date;
    adults: number;
    children: number;
    infants?: number;
  };
  roomDetails: {
    roomTypeId: string;
    roomTypeName: string;
    ratePlanId?: string;
    ratePlanName?: string;
    quantity: number;
  };
  pricing: {
    roomRate: number;
    totalAmount: number;
    currency: string;
    commissionAmount?: number;
    netRate?: number;
  };
  status: 'confirmed' | 'modified' | 'cancelled';
  specialRequests?: string;
  metadata?: any;
}

export interface RateData {
  roomTypeId: string;
  ratePlanId?: string;
  date: Date;
  rate: number;
  currency: string;
  minimumStay?: number;
  maximumStay?: number;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
  restrictions?: any;
}

export interface AvailabilityData {
  roomTypeId: string;
  date: Date;
  totalRooms: number;
  availableRooms: number;
  soldRooms: number;
  closeOut?: boolean;
}

export abstract class ChannelManagerAdapter {
  protected integration: ChannelIntegration;
  protected supabase: SupabaseClient;

  constructor(integration: ChannelIntegration, supabaseClient: SupabaseClient) {
    this.integration = integration;
    this.supabase = supabaseClient;
  }

  abstract authenticate(): Promise<boolean>;
  abstract pushRates(rates: RateData[]): Promise<SyncOperation>;
  abstract pushAvailability(availability: AvailabilityData[]): Promise<SyncOperation>;
  abstract pullBookings(startDate: Date, endDate: Date): Promise<BookingData[]>;
  abstract pushBookingModification(bookingId: string, modification: any): Promise<boolean>;
  abstract validateCredentials(): Promise<boolean>;

  protected async logSyncOperation(
    syncType: string,
    direction: 'push' | 'pull',
    data?: any
  ): Promise<string> {
    const { data: syncLog, error } = await this.supabase
      .from('sync_logs')
      .insert({
        integration_id: this.integration.id,
        sync_type: syncType,
        direction,
        started_at: new Date().toISOString(),
        sync_data: data
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log sync operation: ${error.message}`);
    }

    return syncLog.id;
  }

  protected async updateSyncOperation(
    syncId: string,
    updates: Partial<SyncOperation>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('sync_logs')
      .update({
        ...updates,
        completed_at: updates.completedAt?.toISOString(),
        sync_duration_ms: updates.duration
      })
      .eq('id', syncId);

    if (error) {
      console.error('Failed to update sync operation:', error);
    }
  }

  protected async updateIntegrationStatus(
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = {
      integration_status: status,
      last_sync_at: new Date().toISOString(),
      last_sync_status: status
    };

    if (errorMessage) {
      updates.error_count = this.integration.errorCount + 1;
      updates.last_error_message = errorMessage;
    } else if (status === 'active') {
      updates.error_count = 0;
      updates.last_error_message = null;
    }

    await this.supabase
      .from('channel_integrations')
      .update(updates)
      .eq('id', this.integration.id);
  }
}

/**
 * Booking.com Channel Manager Implementation
 */
export class BookingComAdapter extends ChannelManagerAdapter {
  private baseUrl = 'https://distribution-xml.booking.com/2.6';

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(
            `${this.integration.credentials.username}:${this.integration.credentials.password}`
          ).toString('base64')}`
        }
      });

      if (response.ok) {
        await this.updateIntegrationStatus('active');
        return true;
      } else {
        await this.updateIntegrationStatus('error', 'Authentication failed');
        return false;
      }
    } catch (error) {
      await this.updateIntegrationStatus('error', `Authentication error: ${error}`);
      return false;
    }
  }

  async validateCredentials(): Promise<boolean> {
    return this.authenticate();
  }

  async pushRates(rates: RateData[]): Promise<SyncOperation> {
    const syncId = await this.logSyncOperation('rates', 'push', { rates });
    const startTime = Date.now();

    try {
      let successful = 0;
      let failed = 0;

      for (const rate of rates) {
        try {
          const xml = this.buildRateXML(rate);
          const response = await this.sendXMLRequest('/rates', xml);
          
          if (response.ok) {
            successful++;
          } else {
            failed++;
            console.error('Rate push failed:', await response.text());
          }
        } catch (error) {
          failed++;
          console.error('Rate processing error:', error);
        }
      }

      const operation: Partial<SyncOperation> = {
        status: failed === 0 ? 'completed' : 'failed',
        recordsProcessed: rates.length,
        recordsSuccessful: successful,
        recordsFailed: failed,
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      await this.updateSyncOperation(syncId, operation);
      await this.updateIntegrationStatus(failed === 0 ? 'active' : 'error');

      return { ...operation, id: syncId } as SyncOperation;
    } catch (error) {
      await this.updateSyncOperation(syncId, {
        status: 'failed',
        errorDetails: { message: String(error) },
        completedAt: new Date(),
        duration: Date.now() - startTime
      });
      
      await this.updateIntegrationStatus('error', String(error));
      throw error;
    }
  }

  async pushAvailability(availability: AvailabilityData[]): Promise<SyncOperation> {
    const syncId = await this.logSyncOperation('availability', 'push', { availability });
    const startTime = Date.now();

    try {
      let successful = 0;
      let failed = 0;

      for (const avail of availability) {
        try {
          const xml = this.buildAvailabilityXML(avail);
          const response = await this.sendXMLRequest('/availability', xml);
          
          if (response.ok) {
            successful++;
          } else {
            failed++;
            console.error('Availability push failed:', await response.text());
          }
        } catch (error) {
          failed++;
          console.error('Availability processing error:', error);
        }
      }

      const operation: Partial<SyncOperation> = {
        status: failed === 0 ? 'completed' : 'failed',
        recordsProcessed: availability.length,
        recordsSuccessful: successful,
        recordsFailed: failed,
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      await this.updateSyncOperation(syncId, operation);
      return { ...operation, id: syncId } as SyncOperation;
    } catch (error) {
      await this.updateSyncOperation(syncId, {
        status: 'failed',
        errorDetails: { message: String(error) },
        completedAt: new Date(),
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  async pullBookings(startDate: Date, endDate: Date): Promise<BookingData[]> {
    try {
      const xml = this.buildBookingPullXML(startDate, endDate);
      const response = await this.sendXMLRequest('/bookings', xml);
      
      if (!response.ok) {
        throw new Error(`Booking pull failed: ${response.status}`);
      }

      const responseText = await response.text();
      return this.parseBookingsXML(responseText);
    } catch (error) {
      await this.updateIntegrationStatus('error', `Booking pull error: ${error}`);
      throw error;
    }
  }

  async pushBookingModification(bookingId: string, modification: any): Promise<boolean> {
    try {
      const xml = this.buildModificationXML(bookingId, modification);
      const response = await this.sendXMLRequest('/booking-modifications', xml);
      return response.ok;
    } catch (error) {
      console.error('Booking modification push error:', error);
      return false;
    }
  }

  private async sendXMLRequest(endpoint: string, xml: string): Promise<Response> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Basic ${Buffer.from(
          `${this.integration.credentials.username}:${this.integration.credentials.password}`
        ).toString('base64')}`
      },
      body: xml
    });
  }

  private buildRateXML(rate: RateData): string {
    const mappedRoomType = this.integration.configuration.rateMappings[rate.roomTypeId] || rate.roomTypeId;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
      <RateUpdateRQ>
        <Authentication username="${this.integration.credentials.username}" password="${this.integration.credentials.password}"/>
        <Property property_id="${this.integration.configuration.propertyMappings.propertyId}"/>
        <RatePlan rate_plan_id="${rate.ratePlanId || 'default'}">
          <Date date="${rate.date.toISOString().split('T')[0]}"/>
          <RoomType room_type_id="${mappedRoomType}">
            <Rates>
              <Rate rate="${rate.rate}" currency="${rate.currency}"/>
            </Rates>
            ${rate.minimumStay ? `<MinimumStay nights="${rate.minimumStay}"/>` : ''}
            ${rate.maximumStay ? `<MaximumStay nights="${rate.maximumStay}"/>` : ''}
            ${rate.closedToArrival ? '<ClosedToArrival/>' : ''}
            ${rate.closedToDeparture ? '<ClosedToDeparture/>' : ''}
          </RoomType>
        </RatePlan>
      </RateUpdateRQ>`;
  }

  private buildAvailabilityXML(availability: AvailabilityData): string {
    const mappedRoomType = this.integration.configuration.rateMappings[availability.roomTypeId] || availability.roomTypeId;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
      <AvailabilityUpdateRQ>
        <Authentication username="${this.integration.credentials.username}" password="${this.integration.credentials.password}"/>
        <Property property_id="${this.integration.configuration.propertyMappings.propertyId}"/>
        <Date date="${availability.date.toISOString().split('T')[0]}"/>
        <RoomType room_type_id="${mappedRoomType}">
          <Availability rooms="${availability.availableRooms}"/>
          ${availability.closeOut ? '<CloseOut/>' : ''}
        </RoomType>
      </AvailabilityUpdateRQ>`;
  }

  private buildBookingPullXML(startDate: Date, endDate: Date): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <BookingPullRQ>
        <Authentication username="${this.integration.credentials.username}" password="${this.integration.credentials.password}"/>
        <Property property_id="${this.integration.configuration.propertyMappings.propertyId}"/>
        <DateRange start="${startDate.toISOString().split('T')[0]}" end="${endDate.toISOString().split('T')[0]}"/>
      </BookingPullRQ>`;
  }

  private buildModificationXML(bookingId: string, modification: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <BookingModificationRQ>
        <Authentication username="${this.integration.credentials.username}" password="${this.integration.credentials.password}"/>
        <Booking booking_id="${bookingId}">
          <Status>${modification.status}</Status>
          ${modification.reason ? `<Reason>${modification.reason}</Reason>` : ''}
        </Booking>
      </BookingModificationRQ>`;
  }

  private parseBookingsXML(xml: string): BookingData[] {
    // This would implement actual XML parsing
    // For now, return empty array
    return [];
  }
}

/**
 * Expedia Channel Manager Implementation
 */
export class ExpediaAdapter extends ChannelManagerAdapter {
  private baseUrl = 'https://services.expediapartnercentral.com/eqc/ar';

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/properties`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${this.integration.credentials.username}:${this.integration.credentials.password}`
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await this.updateIntegrationStatus('active');
        return true;
      } else {
        await this.updateIntegrationStatus('error', 'Authentication failed');
        return false;
      }
    } catch (error) {
      await this.updateIntegrationStatus('error', `Authentication error: ${error}`);
      return false;
    }
  }

  async validateCredentials(): Promise<boolean> {
    return this.authenticate();
  }

  async pushRates(rates: RateData[]): Promise<SyncOperation> {
    const syncId = await this.logSyncOperation('rates', 'push', { rates });
    const startTime = Date.now();

    try {
      const rateUpdates = rates.map(rate => ({
        resourceId: this.integration.configuration.rateMappings[rate.roomTypeId],
        date: rate.date.toISOString().split('T')[0],
        rate: {
          rate: rate.rate,
          currency: rate.currency
        },
        restrictions: {
          minimumStay: rate.minimumStay,
          maximumStay: rate.maximumStay,
          closedToArrival: rate.closedToArrival,
          closedToDeparture: rate.closedToDeparture
        }
      }));

      const response = await fetch(`${this.baseUrl}/v2/properties/${this.integration.configuration.propertyMappings.propertyId}/rates`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${this.integration.credentials.username}:${this.integration.credentials.password}`
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rateUpdates)
      });

      const operation: Partial<SyncOperation> = {
        status: response.ok ? 'completed' : 'failed',
        recordsProcessed: rates.length,
        recordsSuccessful: response.ok ? rates.length : 0,
        recordsFailed: response.ok ? 0 : rates.length,
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      await this.updateSyncOperation(syncId, operation);
      return { ...operation, id: syncId } as SyncOperation;
    } catch (error) {
      await this.updateSyncOperation(syncId, {
        status: 'failed',
        errorDetails: { message: String(error) },
        completedAt: new Date(),
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  async pushAvailability(availability: AvailabilityData[]): Promise<SyncOperation> {
    const syncId = await this.logSyncOperation('availability', 'push', { availability });
    const startTime = Date.now();

    try {
      const availUpdates = availability.map(avail => ({
        resourceId: this.integration.configuration.rateMappings[avail.roomTypeId],
        date: avail.date.toISOString().split('T')[0],
        availability: avail.availableRooms,
        closeOut: avail.closeOut
      }));

      const response = await fetch(`${this.baseUrl}/v2/properties/${this.integration.configuration.propertyMappings.propertyId}/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${this.integration.credentials.username}:${this.integration.credentials.password}`
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(availUpdates)
      });

      const operation: Partial<SyncOperation> = {
        status: response.ok ? 'completed' : 'failed',
        recordsProcessed: availability.length,
        recordsSuccessful: response.ok ? availability.length : 0,
        recordsFailed: response.ok ? 0 : availability.length,
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      await this.updateSyncOperation(syncId, operation);
      return { ...operation, id: syncId } as SyncOperation;
    } catch (error) {
      await this.updateSyncOperation(syncId, {
        status: 'failed',
        errorDetails: { message: String(error) },
        completedAt: new Date(),
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  async pullBookings(startDate: Date, endDate: Date): Promise<BookingData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/properties/${this.integration.configuration.propertyMappings.propertyId}/reservations?` +
        `from=${startDate.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.integration.credentials.username}:${this.integration.credentials.password}`
            ).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Booking pull failed: ${response.status}`);
      }

      const reservations = await response.json();
      return this.parseExpediaBookings(reservations);
    } catch (error) {
      await this.updateIntegrationStatus('error', `Booking pull error: ${error}`);
      throw error;
    }
  }

  async pushBookingModification(bookingId: string, modification: any): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/properties/${this.integration.configuration.propertyMappings.propertyId}/reservations/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.integration.credentials.username}:${this.integration.credentials.password}`
            ).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(modification)
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Booking modification push error:', error);
      return false;
    }
  }

  private parseExpediaBookings(reservations: any[]): BookingData[] {
    return reservations.map(reservation => ({
      externalId: reservation.id,
      confirmationNumber: reservation.confirmationNumber,
      hotelId: this.integration.hotelId,
      channelName: 'Expedia',
      guestDetails: {
        firstName: reservation.guest.firstName,
        lastName: reservation.guest.lastName,
        email: reservation.guest.email,
        phone: reservation.guest.phone
      },
      stayDetails: {
        checkInDate: new Date(reservation.checkIn),
        checkOutDate: new Date(reservation.checkOut),
        adults: reservation.adults,
        children: reservation.children || 0,
        infants: reservation.infants || 0
      },
      roomDetails: {
        roomTypeId: reservation.roomType.id,
        roomTypeName: reservation.roomType.name,
        quantity: reservation.quantity || 1
      },
      pricing: {
        roomRate: reservation.rate,
        totalAmount: reservation.totalAmount,
        currency: reservation.currency,
        commissionAmount: reservation.commission,
        netRate: reservation.netRate
      },
      status: reservation.status,
      specialRequests: reservation.specialRequests,
      metadata: {
        originalData: reservation
      }
    }));
  }
}

/**
 * Channel Manager Factory
 */
export class ChannelManagerFactory {
  static createAdapter(
    integration: ChannelIntegration,
    supabaseClient: SupabaseClient
  ): ChannelManagerAdapter {
    switch (integration.channelName.toLowerCase()) {
      case 'booking.com':
        return new BookingComAdapter(integration, supabaseClient);
      case 'expedia':
        return new ExpediaAdapter(integration, supabaseClient);
      default:
        throw new Error(`Unsupported channel: ${integration.channelName}`);
    }
  }
}

/**
 * Channel Manager Service
 */
export class ChannelManagerService {
  private supabase: SupabaseClient;
  private adapters: Map<string, ChannelManagerAdapter> = new Map();

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async loadIntegrations(hotelId: string): Promise<void> {
    const { data: integrations, error } = await this.supabase
      .from('channel_integrations')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to load integrations: ${error.message}`);
    }

    for (const integration of integrations || []) {
      try {
        const adapter = ChannelManagerFactory.createAdapter(integration as ChannelIntegration, this.supabase);
        this.adapters.set(integration.id, adapter);
      } catch (error) {
        console.error(`Failed to create adapter for ${integration.channel_name}:`, error);
      }
    }
  }

  async syncRates(hotelId: string, rates: RateData[]): Promise<void> {
    const hotelAdapters = Array.from(this.adapters.values()).filter(
      adapter => adapter['integration'].hotelId === hotelId
    );

    const syncPromises = hotelAdapters.map(adapter => 
      adapter.pushRates(rates).catch(error => {
        console.error(`Rate sync failed for ${adapter['integration'].channelName}:`, error);
        return null;
      })
    );

    await Promise.all(syncPromises);
  }

  async syncAvailability(hotelId: string, availability: AvailabilityData[]): Promise<void> {
    const hotelAdapters = Array.from(this.adapters.values()).filter(
      adapter => adapter['integration'].hotelId === hotelId
    );

    const syncPromises = hotelAdapters.map(adapter => 
      adapter.pushAvailability(availability).catch(error => {
        console.error(`Availability sync failed for ${adapter['integration'].channelName}:`, error);
        return null;
      })
    );

    await Promise.all(syncPromises);
  }

  async pullAllBookings(hotelId: string, startDate: Date, endDate: Date): Promise<BookingData[]> {
    const hotelAdapters = Array.from(this.adapters.values()).filter(
      adapter => adapter['integration'].hotelId === hotelId
    );

    const bookingPromises = hotelAdapters.map(adapter => 
      adapter.pullBookings(startDate, endDate).catch(error => {
        console.error(`Booking pull failed for ${adapter['integration'].channelName}:`, error);
        return [];
      })
    );

    const results = await Promise.all(bookingPromises);
    return results.flat();
  }

  async testConnection(integrationId: string): Promise<boolean> {
    const adapter = this.adapters.get(integrationId);
    if (!adapter) {
      throw new Error('Integration not found');
    }

    return adapter.validateCredentials();
  }

  async schedulePeriodicSync(): Promise<void> {
    // This would be implemented as a background job/cron
    console.log('Scheduling periodic sync...');
  }
}