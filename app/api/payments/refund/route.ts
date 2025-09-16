import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/stripe/payment-service';
import { z } from 'zod';

const createRefundSchema = z.object({
  chargeId: z.string(),
  amount: z.number().positive().int().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { chargeId, amount, reason, metadata } = createRefundSchema.parse(body);
    
    // Create refund
    const refund = await paymentService.createRefund(
      chargeId,
      amount,
      reason,
      metadata
    );
    
    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
      },
    });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    
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
          error: 'Refund processing error',
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
        message: 'Failed to process refund',
      },
      { status: 500 }
    );
  }
}