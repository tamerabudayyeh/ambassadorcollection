import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/stripe/payment-service';
import { z } from 'zod';

const processDepositSchema = z.object({
  bookingId: z.string().uuid(),
  guestId: z.string().uuid(),
  depositAmount: z.number().positive().int(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  paymentMethodId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = processDepositSchema.parse(body);
    
    // Process deposit payment
    const paymentIntent = await paymentService.processDeposit(
      validatedData.bookingId,
      validatedData.guestId,
      validatedData.depositAmount,
      validatedData.currency,
      validatedData.paymentMethodId
    );
    
    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    
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
        message: 'Failed to process deposit',
      },
      { status: 500 }
    );
  }
}