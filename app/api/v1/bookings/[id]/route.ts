/**
 * Individual Booking Operations API
 * Handle GET, PUT, DELETE for specific bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';
import { ReservationWorkflowManager } from '@/lib/reservations/workflow-manager';
import { FinancialManager } from '@/lib/payments/financial-manager';

const UpdateBookingSchema = z.object({
  checkInDate: z.string().transform(str => new Date(str)).optional(),
  checkOutDate: z.string().transform(str => new Date(str)).optional(),
  adults: z.number().min(1).max(10).optional(),
  children: z.number().min(0).max(8).optional(),
  roomTypeId: z.string().uuid().optional(),
  specialRequests: z.string().max(1000).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'no_show', 'completed']).optional(),
  modificationReason: z.string().max(500).optional(),
  internalNotes: z.string().max(1000).optional()
});

const CancellationSchema = z.object({
  reason: z.enum(['guest_request', 'no_show', 'overbooking', 'force_majeure', 'other']),
  reasonDetails: z.string().max(500).optional(),
  refundAmount: z.number().min(0).optional(),
  waiveCancellationFee: z.boolean().default(false),
  sendNotification: z.boolean().default(true)
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

const workflowManager = new ReservationWorkflowManager(supabase);
const financialManager = new FinancialManager(supabase, process.env.STRIPE_SECRET_KEY!);

/**
 * GET /api/v1/bookings/[id]
 * Retrieve detailed booking information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    if (!bookingId || !z.string().uuid().safeParse(bookingId).success) {
      return createErrorResponse('Invalid booking ID', 'INVALID_BOOKING_ID');
    }

    // Get comprehensive booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guests(*),
        hotels(name, slug, address, city, country, phone, email, check_in_time, check_out_time),
        room_types(name, slug, description, max_occupancy, size_sqm, bed_configuration, amenities),
        rate_plans(name, description, includes_breakfast, cancellation_type, payment_terms),
        rooms(room_number, floor, building),
        booking_addons(*),
        booking_tasks(*),
        booking_modifications(*),
        group_bookings(group_name, group_type)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND', 404);
    }

    // Get guest communication history
    const communications = await workflowManager.getGuestCommunications(
      booking.guest_id,
      bookingId
    );

    // Get payment history
    const { data: paymentIntents } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    // Get payment schedules
    const { data: paymentSchedules } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('booking_id', bookingId)
      .order('due_date', { ascending: true });

    // Calculate stay metrics
    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);
    const today = new Date();
    
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isCheckedIn = booking.checked_in_at !== null;
    const isCheckedOut = booking.checked_out_at !== null;

    // Calculate cancellation deadline and penalties
    let cancellationInfo = null;
    if (booking.status === 'confirmed' && !isCheckedIn) {
      const cancellationDeadline = new Date(checkInDate);
      cancellationDeadline.setHours(cancellationDeadline.getHours() - 24); // Default 24h before
      
      const canCancel = today < cancellationDeadline;
      const cancellationFee = canCancel ? 0 : booking.room_total * 0.1; // 10% penalty after deadline

      cancellationInfo = {
        canCancel,
        deadline: cancellationDeadline,
        fee: cancellationFee,
        refundAmount: booking.total_amount - cancellationFee
      };
    }

    const enrichedBooking = {
      ...booking,
      stayMetrics: {
        daysUntilCheckIn,
        isCheckedIn,
        isCheckedOut,
        stayStatus: isCheckedOut ? 'completed' : isCheckedIn ? 'in_house' : 'upcoming'
      },
      cancellationInfo,
      communications,
      paymentHistory: paymentIntents || [],
      paymentSchedules: paymentSchedules || []
    };

    return createSuccessResponse(enrichedBooking);
  } catch (error) {
    console.error('GET booking error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * PUT /api/v1/bookings/[id]
 * Update booking details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const updateData = UpdateBookingSchema.parse(body);

    if (!bookingId || !z.string().uuid().safeParse(bookingId).success) {
      return createErrorResponse('Invalid booking ID', 'INVALID_BOOKING_ID');
    }

    // Get current booking details
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !currentBooking) {
      return createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND', 404);
    }

    // Check if booking can be modified
    if (currentBooking.status === 'cancelled') {
      return createErrorResponse('Cannot modify cancelled booking', 'BOOKING_CANCELLED');
    }

    if (currentBooking.status === 'completed') {
      return createErrorResponse('Cannot modify completed booking', 'BOOKING_COMPLETED');
    }

    // Store previous values for modification tracking
    const previousValues = {
      check_in_date: currentBooking.check_in_date,
      check_out_date: currentBooking.check_out_date,
      adults: currentBooking.adults,
      children: currentBooking.children,
      room_type_id: currentBooking.room_type_id,
      special_requests: currentBooking.special_requests,
      status: currentBooking.status
    };

    // Prepare update object
    const updateObject: any = {
      updated_at: new Date().toISOString()
    };

    if (updateData.checkInDate) {
      updateObject.check_in_date = updateData.checkInDate.toISOString().split('T')[0];
    }
    if (updateData.checkOutDate) {
      updateObject.check_out_date = updateData.checkOutDate.toISOString().split('T')[0];
    }
    if (updateData.adults !== undefined) {
      updateObject.adults = updateData.adults;
    }
    if (updateData.children !== undefined) {
      updateObject.children = updateData.children;
    }
    if (updateData.roomTypeId) {
      updateObject.room_type_id = updateData.roomTypeId;
    }
    if (updateData.specialRequests !== undefined) {
      updateObject.special_requests = updateData.specialRequests;
    }
    if (updateData.status) {
      updateObject.status = updateData.status;
      
      if (updateData.status === 'confirmed' && currentBooking.status !== 'confirmed') {
        updateObject.confirmed_at = new Date().toISOString();
      }
    }
    if (updateData.internalNotes !== undefined) {
      updateObject.internal_notes = updateData.internalNotes;
    }

    // Validate date changes
    if (updateData.checkInDate || updateData.checkOutDate) {
      const checkIn = updateData.checkInDate || new Date(currentBooking.check_in_date);
      const checkOut = updateData.checkOutDate || new Date(currentBooking.check_out_date);
      
      if (checkIn >= checkOut) {
        return createErrorResponse('Check-out date must be after check-in date', 'INVALID_DATES');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today && updateData.checkInDate) {
        return createErrorResponse('Check-in date cannot be in the past', 'INVALID_DATES');
      }

      // Recalculate pricing if dates changed
      if (updateData.checkInDate || updateData.checkOutDate) {
        const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        updateObject.number_of_nights = numberOfNights;
        
        // TODO: Recalculate room total, taxes, fees, and total amount
        // This would involve checking availability and repricing
      }
    }

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateObject)
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Booking update error:', updateError);
      return createErrorResponse('Failed to update booking', 'UPDATE_ERROR', 500);
    }

    // Record modification history
    const { error: modificationError } = await supabase
      .from('booking_modifications')
      .insert({
        booking_id: bookingId,
        modification_type: updateData.status === 'cancelled' ? 'cancellation' : 
                          updateData.roomTypeId ? 'room_change' : 'date_change',
        previous_values: previousValues,
        new_values: updateObject,
        reason: updateData.modificationReason,
        modified_by: 'system' // TODO: Get from auth context
      });

    if (modificationError) {
      console.error('Modification recording error:', modificationError);
    }

    // Trigger workflow for modifications
    try {
      await workflowManager.processBookingEvent('booking_modified', bookingId, {
        modificationType: updateData.status === 'cancelled' ? 'cancellation' : 'modification',
        previousValues,
        newValues: updateObject,
        reason: updateData.modificationReason
      });
    } catch (workflowError) {
      console.error('Workflow processing error:', workflowError);
    }

    return createSuccessResponse({
      booking: updatedBooking,
      modifications: {
        changed: Object.keys(updateObject).filter(key => key !== 'updated_at'),
        previousValues,
        reason: updateData.modificationReason
      }
    });

  } catch (error) {
    console.error('PUT booking error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'Invalid update data: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        'VALIDATION_ERROR'
      );
    }
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * DELETE /api/v1/bookings/[id]
 * Cancel a booking
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const cancellationData = CancellationSchema.parse(body);

    if (!bookingId || !z.string().uuid().safeParse(bookingId).success) {
      return createErrorResponse('Invalid booking ID', 'INVALID_BOOKING_ID');
    }

    // Get current booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND', 404);
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return createErrorResponse('Booking is already cancelled', 'ALREADY_CANCELLED');
    }

    if (booking.status === 'completed') {
      return createErrorResponse('Cannot cancel completed booking', 'BOOKING_COMPLETED');
    }

    if (booking.checked_in_at) {
      return createErrorResponse('Cannot cancel checked-in booking', 'GUEST_CHECKED_IN');
    }

    // Calculate cancellation fees and refund amount
    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60);

    let cancellationFee = 0;
    let refundAmount = booking.total_amount;

    if (!cancellationData.waiveCancellationFee) {
      if (hoursUntilCheckIn < 24) {
        cancellationFee = booking.room_total; // Full night penalty
      } else if (hoursUntilCheckIn < 48) {
        cancellationFee = booking.room_total * 0.5; // 50% penalty
      }
      // No penalty if cancelled more than 48 hours in advance
    }

    if (cancellationData.refundAmount !== undefined) {
      refundAmount = cancellationData.refundAmount;
    } else {
      refundAmount = Math.max(0, booking.total_amount - cancellationFee);
    }

    // Cancel the booking
    const { error: cancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        internal_notes: booking.internal_notes ? 
          `${booking.internal_notes}\n\nCancelled: ${cancellationData.reasonDetails || cancellationData.reason}` :
          `Cancelled: ${cancellationData.reasonDetails || cancellationData.reason}`
      })
      .eq('id', bookingId);

    if (cancelError) {
      console.error('Booking cancellation error:', cancelError);
      return createErrorResponse('Failed to cancel booking', 'CANCELLATION_ERROR', 500);
    }

    // Record the cancellation modification
    await supabase
      .from('booking_modifications')
      .insert({
        booking_id: bookingId,
        modification_type: 'cancellation',
        previous_values: { status: booking.status },
        new_values: { 
          status: 'cancelled',
          cancellation_reason: cancellationData.reason,
          cancellation_details: cancellationData.reasonDetails,
          cancellation_fee: cancellationFee,
          refund_amount: refundAmount
        },
        reason: cancellationData.reasonDetails || cancellationData.reason,
        modified_by: 'system' // TODO: Get from auth context
      });

    // Process refund if applicable
    let refundId: string | null = null;
    if (refundAmount > 0 && booking.payment_status === 'paid' && booking.payment_intent_id) {
      try {
        // Create refund request
        const { data: refundRequest, error: refundRequestError } = await supabase
          .from('refund_requests')
          .insert({
            booking_id: bookingId,
            original_payment_intent_id: booking.payment_intent_id,
            amount: refundAmount,
            currency: booking.currency,
            reason: 'cancellation',
            reason_details: cancellationData.reasonDetails,
            status: 'approved', // Auto-approve cancellation refunds
            requested_by: 'system'
          })
          .select()
          .single();

        if (refundRequestError) {
          console.error('Refund request creation error:', refundRequestError);
        } else {
          // Process the refund
          refundId = await financialManager.processRefund(refundRequest.id, 'system');
        }
      } catch (refundError) {
        console.error('Refund processing error:', refundError);
        // Don't fail the cancellation if refund fails
      }
    }

    // Trigger cancellation workflow
    try {
      await workflowManager.processBookingEvent('cancellation', bookingId, {
        reason: cancellationData.reason,
        reasonDetails: cancellationData.reasonDetails,
        cancellationFee,
        refundAmount,
        refundId,
        sendNotification: cancellationData.sendNotification
      });
    } catch (workflowError) {
      console.error('Cancellation workflow error:', workflowError);
    }

    return createSuccessResponse({
      bookingId,
      status: 'cancelled',
      cancellationFee,
      refundAmount,
      refundId,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('DELETE booking error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'Invalid cancellation data: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        'VALIDATION_ERROR'
      );
    }
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}