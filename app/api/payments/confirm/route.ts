import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/stripe/payment-service';
import { z } from 'zod';

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { paymentIntentId, paymentMethodId } = confirmPaymentSchema.parse(body);
    
    // Confirm payment intent
    const paymentIntent = await paymentService.confirmPaymentIntent(
      paymentIntentId,
      paymentMethodId
    );
    
    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    
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
    
    // Handle Stripe errors
    if (error.type?.startsWith('Stripe')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment processing error',
          message: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to confirm payment',
      },
      { status: 500 }
    );
  }
}