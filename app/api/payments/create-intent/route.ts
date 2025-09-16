import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/stripe/payment-service';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive().int(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  guestId: z.string().uuid(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createPaymentIntentSchema.parse(body);
    
    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(validatedData);
    
    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
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
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create payment intent',
      },
      { status: 500 }
    );
  }
}