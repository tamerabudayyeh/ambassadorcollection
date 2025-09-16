import { NextRequest, NextResponse } from 'next/server';
import { emailService, BookingEmailData } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const sendConfirmationSchema = z.object({
  bookingId: z.string().uuid(),
  type: z.enum(['booking_confirmation', 'payment_confirmation', 'payment_failed']).default('booking_confirmation'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, type } = sendConfirmationSchema.parse(body);
    
    const supabase = createClient();
    
    // Fetch booking details from database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels (
          name,
          location,
          phone
        ),
        room_types (
          name
        ),
        rate_plans (
          name
        ),
        guests (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
          message: bookingError?.message || 'Booking does not exist',
        },
        { status: 404 }
      );
    }

    // Calculate nights
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Prepare email data
    const emailData: BookingEmailData = {
      bookingReference: booking.confirmation_number || `AMB-${booking.id.slice(-6).toUpperCase()}`,
      guestName: `${booking.guests?.first_name || booking.guest_first_name} ${booking.guests?.last_name || booking.guest_last_name}`,
      guestEmail: booking.guests?.email || booking.guest_email,
      hotelName: booking.hotels?.name || 'Ambassador Collection',
      hotelLocation: booking.hotels?.location || 'Jerusalem, Israel',
      hotelPhone: booking.hotels?.phone || '+972-2-123-4567',
      roomType: booking.room_types?.name || booking.room_type_name || 'Standard Room',
      ratePlan: booking.rate_plans?.name || booking.rate_plan_name || 'Standard Rate',
      checkInDate: checkIn.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      checkOutDate: checkOut.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      nights,
      adults: booking.adults || 2,
      children: booking.children || 0,
      totalAmount: (booking.total_amount || 0) / 100, // Convert from cents
      depositAmount: (booking.deposit_amount || 0) / 100, // Convert from cents
      balanceAmount: ((booking.total_amount || 0) - (booking.deposit_amount || 0)) / 100, // Convert from cents
      currency: booking.currency || 'USD',
      specialRequests: booking.special_requests || undefined,
      paymentStatus: booking.payment_status,
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in. Late cancellations may incur charges.',
    };

    // Send email based on type
    let emailSent = false;
    
    switch (type) {
      case 'booking_confirmation':
        emailSent = await emailService.sendBookingConfirmation(emailData);
        break;
      case 'payment_confirmation':
        emailSent = await emailService.sendPaymentConfirmation(emailData);
        break;
      case 'payment_failed':
        emailSent = await emailService.sendPaymentFailed(emailData);
        break;
    }

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email sending failed',
          message: 'Unable to send confirmation email',
        },
        { status: 500 }
      );
    }

    // Update booking to track email sent
    await supabase
      .from('bookings')
      .update({
        [`${type}_sent_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      message: `${type.replace('_', ' ')} email sent successfully`,
      data: {
        bookingId,
        emailType: type,
        recipientEmail: emailData.guestEmail,
        sentAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to send confirmation email',
      },
      { status: 500 }
    );
  }
}