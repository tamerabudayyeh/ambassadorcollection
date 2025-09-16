import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { paymentService } from '@/lib/stripe/payment-service';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }
  
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe is not configured for webhooks');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 503 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    console.log(`Received webhook event: ${event.type}`);
    
    // Handle the event
    await paymentService.handleWebhook(event);
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}