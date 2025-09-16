import { NextRequest, NextResponse } from 'next/server';
import { BookingApiResponse } from '@/lib/booking-types';
import { supabaseAdmin } from '@/lib/supabase/client';
import { bookingQueries } from '@/lib/supabase/queries';

// Admin endpoint to manage all bookings - requires authentication
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const status = searchParams.get('status');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const guestEmail = searchParams.get('guestEmail');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        guest:guests(*),
        hotel:hotels(id, name, slug),
        room_type:room_types(id, name),
        rate_plan:rate_plans(id, name, rate_type)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (checkInDate) {
      query = query.gte('check_in_date', checkInDate);
    }
    
    if (checkOutDate) {
      query = query.lte('check_out_date', checkOutDate);
    }
    
    if (guestEmail) {
      // Join with guests table to filter by email
      query = query.eq('guest.email', guestEmail.toLowerCase());
    }
    
    const { data: bookings, error } = await query;
    
    if (error) throw error;
    
    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    
    if (hotelId) countQuery = countQuery.eq('hotel_id', hotelId);
    if (status) countQuery = countQuery.eq('status', status);
    if (checkInDate) countQuery = countQuery.gte('check_in_date', checkInDate);
    if (checkOutDate) countQuery = countQuery.lte('check_out_date', checkOutDate);
    
    const { count, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    return NextResponse.json<BookingApiResponse>({
      success: true,
      data: {
        bookings,
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      metadata: {
        timestamp: new Date(),
        requestId: `req_${Date.now()}`
      }
    });
    
  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    return NextResponse.json<BookingApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching bookings'
      }
    }, { status: 500 });
  }
}

// Update booking status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.bookingId || !body.status) {
      return NextResponse.json<BookingApiResponse>({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Booking ID and status are required'
        }
      }, { status: 400 });
    }
    
    // Update booking status
    const updatedBooking = await bookingQueries.updateStatus(
      body.bookingId,
      body.status,
      body.notes
    );
    
    return NextResponse.json<BookingApiResponse>({
      success: true,
      data: {
        booking: updatedBooking
      },
      metadata: {
        timestamp: new Date(),
        requestId: `req_${Date.now()}`
      }
    });
    
  } catch (error) {
    console.error('Admin booking update error:', error);
    return NextResponse.json<BookingApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating the booking'
      }
    }, { status: 500 });
  }
}