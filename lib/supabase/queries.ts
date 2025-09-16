// Supabase query helpers and database operations
// This file contains optimized queries for the Ambassador Collection booking system

import { supabase, supabaseAdmin } from './client';
import { Database } from './types';
import { addDays, differenceInDays, format } from 'date-fns';

// Type aliases for cleaner code
type Tables = Database['public']['Tables'];
type Hotel = Tables['hotels']['Row'];
type RoomType = Tables['room_types']['Row'];
type RatePlan = Tables['rate_plans']['Row'];
type Booking = Tables['bookings']['Row'];
type Guest = Tables['guests']['Row'];
type AvailabilityCache = Tables['availability_cache']['Row'];

// Hotel queries
export const hotelQueries = {
  async getAll(): Promise<Hotel[]> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string): Promise<Hotel | null> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async getById(id: string): Promise<Hotel | null> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }
};

// Room type queries with related data
export const roomTypeQueries = {
  async getByHotel(hotelId: string): Promise<RoomType[]> {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<RoomType | null> {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
};

// Rate plan queries
export const ratePlanQueries = {
  async getByRoomType(roomTypeId: string): Promise<RatePlan[]> {
    const { data, error } = await supabase
      .from('rate_plans')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .lte('valid_from', new Date().toISOString().split('T')[0])
      .gte('valid_to', new Date().toISOString().split('T')[0])
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<RatePlan | null> {
    const { data, error } = await supabase
      .from('rate_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
};

// Guest management
export const guestQueries = {
  async findOrCreate(guestData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    country?: string;
  }): Promise<Guest> {
    // First try to find existing guest by email
    const { data: existingGuest, error: findError } = await supabase
      .from('guests')
      .select('*')
      .eq('email', guestData.email.toLowerCase())
      .single();

    if (existingGuest && !findError) {
      // Update existing guest with new information
      const { data: updatedGuest, error: updateError } = await supabase
        .from('guests')
        .update({
          first_name: guestData.first_name,
          last_name: guestData.last_name,
          phone: guestData.phone || existingGuest.phone,
          country: guestData.country || existingGuest.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGuest.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedGuest;
    }

    // Create new guest
    const { data: newGuest, error: createError } = await supabase
      .from('guests')
      .insert({
        first_name: guestData.first_name,
        last_name: guestData.last_name,
        email: guestData.email.toLowerCase(),
        phone: guestData.phone,
        country: guestData.country,
      })
      .select()
      .single();

    if (createError) throw createError;
    return newGuest;
  },

  async getById(id: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
};

// Availability checking with caching
export const availabilityQueries = {
  async checkAvailability(
    hotelId: string,
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    roomsNeeded: number = 1
  ): Promise<boolean> {
    const startDate = format(checkInDate, 'yyyy-MM-dd');
    const endDate = format(addDays(checkOutDate, -1), 'yyyy-MM-dd'); // Exclude checkout date
    
    const { data, error } = await supabase
      .from('availability_cache')
      .select('available_rooms')
      .eq('hotel_id', hotelId)
      .eq('room_type_id', roomTypeId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    // Check if all dates have sufficient availability
    return data.every(day => day.available_rooms >= roomsNeeded);
  },

  async getAvailabilityRange(
    hotelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityCache[]> {
    const { data, error } = await supabase
      .from('availability_cache')
      .select('*')
      .eq('hotel_id', hotelId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('room_type_id')
      .order('date');
    
    if (error) throw error;
    return data;
  },

  async updateAvailabilityCache(
    hotelId: string,
    roomTypeId: string,
    date: Date,
    bookedRoomsChange: number = 0,
    blockedRoomsChange: number = 0,
    heldRoomsChange: number = 0
  ): Promise<void> {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Use upsert to update or insert availability cache entry
    const { error } = await supabaseAdmin
      .from('availability_cache')
      .upsert({
        hotel_id: hotelId,
        room_type_id: roomTypeId,
        date: dateStr,
        booked_rooms: bookedRoomsChange,
        blocked_rooms: blockedRoomsChange,
        held_rooms: heldRoomsChange,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'hotel_id,room_type_id,date',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
  }
};

// Booking management with inventory control
export const bookingQueries = {
  async create(bookingData: {
    hotel_id: string;
    guest_id: string;
    room_type_id: string;
    rate_plan_id: string;
    check_in_date: Date;
    check_out_date: Date;
    adults: number;
    children?: number;
    room_rate: number;
    room_total: number;
    taxes: number;
    fees: number;
    total_amount: number;
    special_requests?: string;
    booking_source?: string;
    promo_code?: string;
  }): Promise<Booking> {
    // Create booking with automatic confirmation number generation
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        hotel_id: bookingData.hotel_id,
        guest_id: bookingData.guest_id,
        room_type_id: bookingData.room_type_id,
        rate_plan_id: bookingData.rate_plan_id,
        check_in_date: format(bookingData.check_in_date, 'yyyy-MM-dd'),
        check_out_date: format(bookingData.check_out_date, 'yyyy-MM-dd'),
        adults: bookingData.adults,
        children: bookingData.children || 0,
        room_rate: bookingData.room_rate,
        room_total: bookingData.room_total,
        taxes: bookingData.taxes,
        fees: bookingData.fees,
        total_amount: bookingData.total_amount,
        special_requests: bookingData.special_requests,
        booking_source: (bookingData.booking_source as any) || 'website',
        promo_code: bookingData.promo_code,
      })
      .select()
      .single();

    if (error) throw error;

    // Update availability cache for each night
    const nights = differenceInDays(bookingData.check_out_date, bookingData.check_in_date);
    for (let i = 0; i < nights; i++) {
      const date = addDays(bookingData.check_in_date, i);
      await availabilityQueries.updateAvailabilityCache(
        bookingData.hotel_id,
        bookingData.room_type_id,
        date,
        1, // Increase booked rooms by 1
        0,
        0
      );
    }

    return data;
  },

  async getByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guest:guests(*),
        hotel:hotels(*),
        room_type:room_types(*),
        rate_plan:rate_plans(*)
      `)
      .eq('confirmation_number', confirmationNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getByGuestEmail(email: string, limit: number = 10): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guest:guests!inner(*),
        hotel:hotels(*),
        room_type:room_types(*),
        rate_plan:rate_plans(*)
      `)
      .eq('guest.email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async updateStatus(
    bookingId: string, 
    newStatus: Database['public']['Enums']['booking_status'],
    notes?: string
  ): Promise<Booking> {
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (newStatus === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (newStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }

    if (notes) {
      updateData.internal_notes = notes;
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancel(bookingId: string, reason?: string): Promise<Booking> {
    // Get booking details for inventory update
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) throw fetchError;

    // Update booking status
    const { data: cancelledBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        internal_notes: reason
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Free up inventory for each night
    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);
    const nights = differenceInDays(checkOutDate, checkInDate);
    
    for (let i = 0; i < nights; i++) {
      const date = addDays(checkInDate, i);
      await availabilityQueries.updateAvailabilityCache(
        booking.hotel_id,
        booking.room_type_id,
        date,
        -1, // Decrease booked rooms by 1
        0,
        0
      );
    }

    return cancelledBooking;
  }
};

// Booking hold management for reservation process
export const holdQueries = {
  async createHold(
    sessionId: string,
    hotelId: string,
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    roomCount: number = 1,
    expirationMinutes: number = 30
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const { data, error } = await supabase
      .from('booking_holds')
      .insert({
        session_id: sessionId,
        hotel_id: hotelId,
        room_type_id: roomTypeId,
        check_in_date: format(checkInDate, 'yyyy-MM-dd'),
        check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
        room_count: roomCount,
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    // Update availability cache to reflect held rooms
    const nights = differenceInDays(checkOutDate, checkInDate);
    for (let i = 0; i < nights; i++) {
      const date = addDays(checkInDate, i);
      await availabilityQueries.updateAvailabilityCache(
        hotelId,
        roomTypeId,
        date,
        0,
        0,
        roomCount // Increase held rooms
      );
    }

    return data.id;
  },

  async releaseHold(holdId: string): Promise<void> {
    // Get hold details first
    const { data: hold, error: fetchError } = await supabase
      .from('booking_holds')
      .select('*')
      .eq('id', holdId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the hold
    const { error: deleteError } = await supabaseAdmin
      .from('booking_holds')
      .delete()
      .eq('id', holdId);

    if (deleteError) throw deleteError;

    // Update availability cache to free held rooms
    const checkInDate = new Date(hold.check_in_date);
    const checkOutDate = new Date(hold.check_out_date);
    const nights = differenceInDays(checkOutDate, checkInDate);
    
    for (let i = 0; i < nights; i++) {
      const date = addDays(checkInDate, i);
      await availabilityQueries.updateAvailabilityCache(
        hold.hotel_id,
        hold.room_type_id,
        date,
        0,
        0,
        -hold.room_count // Decrease held rooms
      );
    }
  },

  async cleanupExpiredHolds(): Promise<number> {
    const { data: expiredCount } = await supabaseAdmin
      .rpc('cleanup_expired_holds');

    return expiredCount || 0;
  }
};

// Dynamic pricing calculations
export const pricingQueries = {
  async getDynamicPricing(
    hotelId: string,
    roomTypeId: string,
    ratePlanId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Tables['dynamic_pricing']['Row'][]> {
    const { data, error } = await supabase
      .from('dynamic_pricing')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('room_type_id', roomTypeId)
      .eq('rate_plan_id', ratePlanId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date');

    if (error) throw error;
    return data;
  },

  calculateNightlyRates(
    basePrice: number,
    rateModifier: number,
    checkInDate: Date,
    checkOutDate: Date,
    dynamicPricing: Tables['dynamic_pricing']['Row'][] = []
  ): { date: Date; rate: number }[] {
    const nights = differenceInDays(checkOutDate, checkInDate);
    const rates: { date: Date; rate: number }[] = [];

    for (let i = 0; i < nights; i++) {
      const date = addDays(checkInDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Find dynamic pricing for this date
      const dynamicRate = dynamicPricing.find(dp => dp.date === dateStr);
      
      let finalRate = basePrice * rateModifier;
      
      if (dynamicRate) {
        finalRate *= dynamicRate.base_rate_multiplier;
        
        if (dynamicRate.minimum_rate && finalRate < dynamicRate.minimum_rate) {
          finalRate = dynamicRate.minimum_rate;
        }
        if (dynamicRate.maximum_rate && finalRate > dynamicRate.maximum_rate) {
          finalRate = dynamicRate.maximum_rate;
        }
      }
      
      rates.push({
        date,
        rate: Math.round(finalRate * 100) / 100 // Round to 2 decimal places
      });
    }

    return rates;
  }
};

// Real-time subscriptions for live updates
export const subscriptions = {
  subscribeToBookingChanges(
    hotelId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`bookings-${hotelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `hotel_id=eq.${hotelId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToAvailabilityChanges(
    hotelId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`availability-${hotelId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'availability_cache',
          filter: `hotel_id=eq.${hotelId}`
        },
        callback
      )
      .subscribe();
  }
};