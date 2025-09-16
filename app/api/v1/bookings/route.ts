/**
 * Enhanced Bookings API v1
 * Comprehensive booking operations with proper error handling and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';
import { RealTimeInventoryManager } from '@/lib/inventory/real-time-manager';
import { YieldManagementEngine } from '@/lib/pricing/yield-management';
import { ReservationWorkflowManager } from '@/lib/reservations/workflow-manager';
import { FinancialManager } from '@/lib/payments/financial-manager';

// Validation schemas
const CreateBookingSchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  ratePlanId: z.string().uuid().optional(),
  checkInDate: z.string().transform(str => new Date(str)),
  checkOutDate: z.string().transform(str => new Date(str)),
  adults: z.number().min(1).max(10),
  children: z.number().min(0).max(8),
  rooms: z.number().min(1).max(5),
  
  guestDetails: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    country: z.string().min(2).max(3),
    address: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    dateOfBirth: z.string().transform(str => new Date(str)).optional(),
    nationality: z.string().max(3).optional(),
    passportNumber: z.string().max(50).optional(),
    specialRequests: z.string().max(1000).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
    marketingOptIn: z.boolean().default(false),
    vipStatus: z.boolean().default(false)
  }),

  paymentDetails: z.object({
    paymentMethod: z.enum(['card', 'bank_transfer', 'pay_at_hotel', 'corporate_billing']),
    paymentIntentId: z.string().optional(),
    corporateAccountId: z.string().uuid().optional(),
    depositOnly: z.boolean().default(false)
  }),

  addons: z.array(z.object({
    type: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    dateRequired: z.string().transform(str => new Date(str)).optional(),
    timeRequired: z.string().optional(),
    specialInstructions: z.string().optional()
  })).optional(),

  groupBookingId: z.string().uuid().optional(),
  promoCode: z.string().max(50).optional(),
  referralCode: z.string().max(50).optional(),
  source: z.enum(['website', 'phone', 'email', 'walk_in', 'ota']).default('website'),
  channel: z.string().max(100).optional(),
  
  metadata: z.record(z.any()).optional()
});

const UpdateBookingSchema = z.object({
  checkInDate: z.string().transform(str => new Date(str)).optional(),
  checkOutDate: z.string().transform(str => new Date(str)).optional(),
  adults: z.number().min(1).max(10).optional(),
  children: z.number().min(0).max(8).optional(),
  roomTypeId: z.string().uuid().optional(),
  specialRequests: z.string().max(1000).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'no_show', 'completed']).optional(),
  modificationReason: z.string().max(500).optional()
});

const QuerySchema = z.object({
  hotelId: z.string().uuid().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'no_show', 'completed']).optional(),
  checkInDate: z.string().transform(str => new Date(str)).optional(),
  checkOutDate: z.string().transform(str => new Date(str)).optional(),
  guestEmail: z.string().email().optional(),
  confirmationNumber: z.string().optional(),
  page: z.string().transform(str => parseInt(str)).default('1'),
  limit: z.string().transform(str => Math.min(parseInt(str), 100)).default('20'),
  sortBy: z.enum(['created_at', 'check_in_date', 'total_amount']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Error response helper
function createErrorResponse(message: string, code: string, statusCode: number = 400) {
  return NextResponse.json({
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  }, { status: statusCode });
}

// Success response helper
function createSuccessResponse(data: any, metadata?: any) {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  });
}

// Initialize services
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const inventoryManager = new RealTimeInventoryManager(supabase);
const yieldEngine = new YieldManagementEngine(supabase);
const workflowManager = new ReservationWorkflowManager(supabase);
const financialManager = new FinancialManager(supabase, process.env.STRIPE_SECRET_KEY!);

/**
 * GET /api/v1/bookings
 * Retrieve bookings with advanced filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // Build query with filters
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        *,
        guests(*),
        hotels(name, slug),
        room_types(name, slug),
        rate_plans(name),
        booking_addons(*),
        booking_tasks(id, title, status, priority, due_date),
        booking_modifications(*)
      `, { count: 'exact' });

    // Apply filters
    if (query.hotelId) {
      bookingsQuery = bookingsQuery.eq('hotel_id', query.hotelId);
    }
    if (query.status) {
      bookingsQuery = bookingsQuery.eq('status', query.status);
    }
    if (query.checkInDate) {
      bookingsQuery = bookingsQuery.gte('check_in_date', query.checkInDate.toISOString().split('T')[0]);
    }
    if (query.checkOutDate) {
      bookingsQuery = bookingsQuery.lte('check_out_date', query.checkOutDate.toISOString().split('T')[0]);
    }
    if (query.guestEmail) {
      bookingsQuery = bookingsQuery.eq('guests.email', query.guestEmail);
    }
    if (query.confirmationNumber) {
      bookingsQuery = bookingsQuery.eq('confirmation_number', query.confirmationNumber);
    }

    // Apply sorting and pagination
    bookingsQuery = bookingsQuery
      .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
      .range((query.page - 1) * query.limit, query.page * query.limit - 1);

    const { data: bookings, error, count } = await bookingsQuery;

    if (error) {
      console.error('Bookings query error:', error);
      return createErrorResponse('Failed to retrieve bookings', 'QUERY_ERROR', 500);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / query.limit);
    const hasNextPage = query.page < totalPages;
    const hasPreviousPage = query.page > 1;

    return createSuccessResponse(bookings, {
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error('GET bookings error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid query parameters', 'VALIDATION_ERROR');
    }
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/v1/bookings
 * Create a new booking with comprehensive validation and processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingData = CreateBookingSchema.parse(body);

    // Validate booking dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingData.checkInDate < today) {
      return createErrorResponse('Check-in date cannot be in the past', 'INVALID_DATES');
    }
    
    if (bookingData.checkInDate >= bookingData.checkOutDate) {
      return createErrorResponse('Check-out date must be after check-in date', 'INVALID_DATES');
    }

    const numberOfNights = Math.ceil(
      (bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (numberOfNights > 30) {
      return createErrorResponse('Maximum stay is 30 nights', 'STAY_TOO_LONG');
    }

    // Check availability
    const availability = await inventoryManager.checkAvailability({
      hotelId: bookingData.hotelId,
      roomTypeId: bookingData.roomTypeId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      roomCount: bookingData.rooms
    });

    const roomAvailability = availability.find(a => a.roomTypeId === bookingData.roomTypeId);
    if (!roomAvailability || roomAvailability.availableRooms < bookingData.rooms) {
      return createErrorResponse('Insufficient availability for selected dates', 'NO_AVAILABILITY');
    }

    // Get room type and rate plan details
    const { data: roomType, error: roomTypeError } = await supabase
      .from('room_types')
      .select('*')
      .eq('id', bookingData.roomTypeId)
      .single();

    if (roomTypeError || !roomType) {
      return createErrorResponse('Room type not found', 'ROOM_TYPE_NOT_FOUND');
    }

    // Calculate dynamic pricing
    const { finalRate } = await yieldEngine.calculateDynamicRate(
      bookingData.hotelId,
      bookingData.roomTypeId,
      bookingData.checkInDate,
      roomType.base_price
    );

    // Calculate total pricing
    let roomTotal = finalRate * numberOfNights * bookingData.rooms;
    
    // Apply promotional code if provided
    if (bookingData.promoCode) {
      // TODO: Implement promo code validation and discount calculation
    }

    // Calculate taxes and fees
    const { data: hotel } = await supabase
      .from('hotels')
      .select('tax_rate, service_fee')
      .eq('id', bookingData.hotelId)
      .single();

    const taxes = roomTotal * (hotel?.tax_rate || 0.17);
    const fees = (hotel?.service_fee || 25) * numberOfNights;
    
    // Calculate addon costs
    const addonTotal = bookingData.addons?.reduce((sum, addon) => 
      sum + (addon.unitPrice * addon.quantity), 0) || 0;

    const totalAmount = roomTotal + taxes + fees + addonTotal;

    // Create or find guest
    let guestId: string;
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', bookingData.guestDetails.email)
      .single();

    if (existingGuest) {
      guestId = existingGuest.id;
      
      // Update guest information
      await supabase
        .from('guests')
        .update({
          first_name: bookingData.guestDetails.firstName,
          last_name: bookingData.guestDetails.lastName,
          phone: bookingData.guestDetails.phone,
          country: bookingData.guestDetails.country,
          address: bookingData.guestDetails.address,
          city: bookingData.guestDetails.city,
          postal_code: bookingData.guestDetails.postalCode,
          date_of_birth: bookingData.guestDetails.dateOfBirth?.toISOString().split('T')[0],
          nationality: bookingData.guestDetails.nationality,
          passport_number: bookingData.guestDetails.passportNumber,
          marketing_opt_in: bookingData.guestDetails.marketingOptIn,
          vip_status: bookingData.guestDetails.vipStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGuest.id);
    } else {
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert({
          first_name: bookingData.guestDetails.firstName,
          last_name: bookingData.guestDetails.lastName,
          email: bookingData.guestDetails.email,
          phone: bookingData.guestDetails.phone,
          country: bookingData.guestDetails.country,
          address: bookingData.guestDetails.address,
          city: bookingData.guestDetails.city,
          postal_code: bookingData.guestDetails.postalCode,
          date_of_birth: bookingData.guestDetails.dateOfBirth?.toISOString().split('T')[0],
          nationality: bookingData.guestDetails.nationality,
          passport_number: bookingData.guestDetails.passportNumber,
          marketing_opt_in: bookingData.guestDetails.marketingOptIn,
          vip_status: bookingData.guestDetails.vipStatus
        })
        .select('id')
        .single();

      if (guestError) {
        console.error('Guest creation error:', guestError);
        return createErrorResponse('Failed to create guest profile', 'GUEST_CREATION_ERROR', 500);
      }

      guestId = newGuest.id;
    }

    // Generate confirmation number
    const { data: confirmationNumber } = await supabase.rpc('generate_confirmation_number');

    // Create booking in transaction
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        confirmation_number: confirmationNumber,
        hotel_id: bookingData.hotelId,
        guest_id: guestId,
        room_type_id: bookingData.roomTypeId,
        rate_plan_id: bookingData.ratePlanId,
        group_booking_id: bookingData.groupBookingId,
        check_in_date: bookingData.checkInDate.toISOString().split('T')[0],
        check_out_date: bookingData.checkOutDate.toISOString().split('T')[0],
        number_of_nights: numberOfNights,
        adults: bookingData.adults,
        children: bookingData.children,
        room_rate: finalRate,
        room_total: roomTotal,
        taxes,
        fees,
        total_amount: totalAmount,
        currency: 'USD', // TODO: Make this configurable
        special_requests: bookingData.guestDetails.specialRequests,
        booking_source: bookingData.source,
        booking_channel: bookingData.channel,
        promo_code: bookingData.promoCode,
        referral_code: bookingData.referralCode,
        status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return createErrorResponse('Failed to create booking', 'BOOKING_CREATION_ERROR', 500);
    }

    // Add booking addons
    if (bookingData.addons?.length) {
      const addonInserts = bookingData.addons.map(addon => ({
        booking_id: booking.id,
        addon_type: addon.type,
        addon_name: addon.name,
        quantity: addon.quantity,
        unit_price: addon.unitPrice,
        total_price: addon.unitPrice * addon.quantity,
        date_required: addon.dateRequired?.toISOString().split('T')[0],
        time_required: addon.timeRequired,
        special_instructions: addon.specialInstructions
      }));

      await supabase
        .from('booking_addons')
        .insert(addonInserts);
    }

    // Process payment if required
    if (bookingData.paymentDetails.paymentMethod === 'card' && bookingData.paymentDetails.paymentIntentId) {
      try {
        await financialManager.capturePayment(bookingData.paymentDetails.paymentIntentId, totalAmount);
        
        await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            payment_status: 'paid',
            payment_intent_id: bookingData.paymentDetails.paymentIntentId,
            confirmed_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        booking.status = 'confirmed';
        booking.payment_status = 'paid';
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        // Don't fail the booking, but mark payment as failed
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', booking.id);
      }
    } else if (bookingData.paymentDetails.paymentMethod === 'corporate_billing') {
      if (!bookingData.paymentDetails.corporateAccountId) {
        return createErrorResponse('Corporate account ID required for corporate billing', 'MISSING_CORPORATE_ACCOUNT');
      }

      try {
        await financialManager.createCorporateInvoice(booking.id, bookingData.paymentDetails.corporateAccountId);
        
        await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            payment_status: 'pending',
            payment_method: 'corporate_billing',
            confirmed_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        booking.status = 'confirmed';
        booking.payment_status = 'pending';
      } catch (invoiceError) {
        console.error('Corporate invoice error:', invoiceError);
        return createErrorResponse('Failed to process corporate billing', 'CORPORATE_BILLING_ERROR', 500);
      }
    }

    // Trigger workflow processes
    try {
      await workflowManager.processBookingEvent('booking_created', booking.id, {
        isVipGuest: bookingData.guestDetails.vipStatus,
        hasSpecialRequests: !!bookingData.guestDetails.specialRequests,
        paymentMethod: bookingData.paymentDetails.paymentMethod,
        totalAmount
      });
    } catch (workflowError) {
      console.error('Workflow processing error:', workflowError);
      // Don't fail the booking for workflow errors
    }

    // Return success response with booking details
    return createSuccessResponse({
      booking: {
        id: booking.id,
        confirmationNumber: booking.confirmation_number,
        status: booking.status,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        numberOfNights,
        totalAmount,
        currency: booking.currency,
        guestName: `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`,
        hotelId: booking.hotel_id,
        roomTypeId: booking.room_type_id
      }
    }, {
      processingTime: Date.now() - parseInt(request.headers.get('x-request-start') || '0')
    });

  } catch (error) {
    console.error('POST bookings error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'Invalid booking data: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        'VALIDATION_ERROR'
      );
    }
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}