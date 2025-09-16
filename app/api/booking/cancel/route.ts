import { NextRequest, NextResponse } from 'next/server'
import { supabase, getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.confirmationNumber) {
      return NextResponse.json({
        success: false,
        error: 'Confirmation number is required'
      }, { status: 400 })
    }
    
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('confirmation_number', body.confirmationNumber.toUpperCase())
      .single()
    
    if (bookingError || !booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }
    
    if (booking.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Booking is already cancelled'
      }, { status: 400 })
    }
    
    if (booking.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel a completed booking'
      }, { status: 400 })
    }
    
    // Check cancellation policy - 24 hour deadline
    const checkInDate = new Date(booking.check_in_date)
    const now = new Date()
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilCheckIn < 24) {
      return NextResponse.json({
        success: false,
        error: 'Cancellation deadline has passed. Bookings must be cancelled at least 24 hours before check-in.'
      }, { status: 400 })
    }
    
    const serviceSupabase = getServiceSupabase()
    if (!serviceSupabase) {
      return NextResponse.json({
        success: false,
        error: 'Database configuration error'
      }, { status: 500 })
    }

    // Cancel the booking and restore availability
    const { error: cancelError } = await serviceSupabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: body.reason || 'Guest cancellation',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (cancelError) {
      console.error('Error cancelling booking:', cancelError)
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel booking'
      }, { status: 500 })
    }

    // Restore room availability - we'll need to get current values and update
    // This is a simplified approach; in production you'd want atomic operations
    const { data: currentAvailability } = await serviceSupabase
      .from('room_availability')
      .select('available_quantity, booked_quantity')
      .eq('room_id', booking.room_id)
      .gte('date', booking.check_in_date)
      .lt('date', booking.check_out_date)
      .limit(1)
      .single()

    if (currentAvailability) {
      const { error: availabilityError } = await serviceSupabase
        .from('room_availability')
        .update({
          available_quantity: currentAvailability.available_quantity + 1,
          booked_quantity: Math.max(0, currentAvailability.booked_quantity - 1)
        })
        .eq('room_id', booking.room_id)
        .gte('date', booking.check_in_date)
        .lt('date', booking.check_out_date)

      if (availabilityError) {
        console.error('Error restoring availability:', availabilityError)
      }
    }
    
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        confirmationNumber: booking.confirmation_number,
        status: 'cancelled',
        cancelledAt: new Date(),
        refundAmount: booking.total_price,
        refundMethod: 'original_payment_method'
      }
    })
    
  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}