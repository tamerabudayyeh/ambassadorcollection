import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch bookings for the authenticated user
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        confirmation_number,
        check_in_date,
        check_out_date,
        total_amount,
        currency,
        status,
        payment_status,
        adults,
        children,
        special_requests,
        created_at,
        hotels (
          name,
          location
        ),
        room_types (
          name,
          description
        )
      `)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedBookings = bookings?.map(booking => ({
      id: booking.id,
      hotelName: (booking.hotels as any)?.name || 'Unknown Hotel',
      roomType: (booking.room_types as any)?.name || 'Standard Room',
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      status: booking.status,
      totalAmount: booking.total_amount,
      currency: booking.currency,
      guests: booking.adults + booking.children,
      confirmationNumber: booking.confirmation_number,
      paymentStatus: booking.payment_status,
      specialRequests: booking.special_requests,
      createdAt: booking.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
    });
  } catch (error) {
    console.error('Error in GET /api/guests/bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}