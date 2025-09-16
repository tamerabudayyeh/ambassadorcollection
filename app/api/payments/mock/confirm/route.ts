import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mockPaymentConfirmSchema = z.object({
  bookingId: z.string().uuid(),
  paymentId: z.string(),
  amount: z.number().positive().int(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  cardInfo: z.object({
    last4: z.string().length(4),
    brand: z.enum(['visa', 'mastercard', 'amex', 'unknown']),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = mockPaymentConfirmSchema.parse(body);
    
    // Create payment record in the database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: validatedData.bookingId,
        payment_intent_id: validatedData.paymentId,
        amount: validatedData.amount,
        currency: validatedData.currency.toLowerCase(),
        status: 'succeeded',
        payment_method: 'card',
        payment_method_details: {
          card: {
            last4: validatedData.cardInfo.last4,
            brand: validatedData.cardInfo.brand,
          },
          type: 'card',
        },
        metadata: {
          mock_payment: true,
          processed_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error('Failed to create payment record');
    }

    // Update booking status to confirmed
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.bookingId);

    if (bookingError) {
      console.error('Error updating booking status:', bookingError);
      throw new Error('Failed to update booking status');
    }

    // Log mock payment success
    console.log('✅ Mock payment processed successfully:', {
      bookingId: validatedData.bookingId,
      paymentId: validatedData.paymentId,
      amount: validatedData.amount / 100, // Convert back to dollars for logging
      currency: validatedData.currency,
      cardLast4: validatedData.cardInfo.last4,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: 'succeeded',
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: {
          type: 'card',
          card: {
            last4: validatedData.cardInfo.last4,
            brand: validatedData.cardInfo.brand,
          },
        },
        createdAt: payment.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error confirming mock payment:', error);
    
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
        message: error.message || 'Failed to confirm mock payment',
      },
      { status: 500 }
    );
  }
}