import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG, SupportedCurrency } from './config';
import { createClient } from '@/lib/supabase/server';

export interface CreatePaymentIntentParams {
  bookingId: string;
  amount: number;
  currency: SupportedCurrency;
  guestId: string;
  description?: string;
  metadata?: Record<string, string>;
  captureMethod?: 'automatic' | 'manual';
}

export interface PaymentMethodDetails {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name?: string;
    email?: string;
    address?: Stripe.Address;
  };
}

export class PaymentService {
  private supabase = createClient();

  /**
   * Create a payment intent for a booking
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe not initialized. Payment functionality is disabled in development mode.');
    }

    try {
      // Validate booking exists and belongs to guest
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select('id, total_amount, currency, guest_id')
        .eq('id', params.bookingId)
        .eq('guest_id', params.guestId)
        .single();

      if (bookingError || !booking) {
        throw new Error('Booking not found or access denied');
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency.toLowerCase(),
        description: params.description || `Booking ${params.bookingId}`,
        metadata: {
          bookingId: params.bookingId,
          guestId: params.guestId,
          ...params.metadata,
        },
        capture_method: params.captureMethod || STRIPE_CONFIG.captureMethod,
        payment_method_types: [...STRIPE_CONFIG.paymentMethodTypes],
      });

      // Store payment intent in database
      const { error: dbError } = await this.supabase
        .from('payment_intents')
        .insert({
          booking_id: params.bookingId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: params.amount,
          currency: params.currency,
          status: paymentIntent.status,
          description: params.description,
          metadata: params.metadata || {},
        });

      if (dbError) {
        console.error('Failed to store payment intent:', dbError);
        // Don't fail the request, but log the error
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe not initialized. Payment functionality is disabled in development mode.');
    }

    try {
      const params: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethodId) {
        params.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        params
      );

      // Update database record
      await this.updatePaymentIntentStatus(paymentIntentId, paymentIntent.status);

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  /**
   * Capture a payment intent (for manual capture)
   */
  async capturePaymentIntent(
    paymentIntentId: string,
    amountToCapture?: number
  ): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe not initialized. Payment functionality is disabled in development mode.');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.capture(
        paymentIntentId,
        amountToCapture ? { amount_to_capture: amountToCapture } : {}
      );

      await this.updatePaymentIntentStatus(paymentIntentId, paymentIntent.status);

      return paymentIntent;
    } catch (error) {
      console.error('Error capturing payment intent:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    chargeId: string,
    amount?: number,
    reason?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Refund> {
    if (!stripe) {
      throw new Error('Stripe not initialized. Payment functionality is disabled in development mode.');
    }

    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount,
        reason: reason as Stripe.RefundCreateParams.Reason,
        metadata,
      });

      // Store refund in database
      const { data: transaction } = await this.supabase
        .from('payment_transactions')
        .select('booking_id')
        .eq('stripe_charge_id', chargeId)
        .single();

      if (transaction) {
        await this.supabase
          .from('refunds')
          .insert({
            booking_id: transaction.booking_id,
            stripe_refund_id: refund.id,
            amount: refund.amount,
            currency: refund.currency.toUpperCase(),
            reason: refund.reason,
            status: refund.status,
          });
      }

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Save a payment method for future use
   */
  async savePaymentMethod(
    guestId: string,
    paymentMethodId: string,
    isDefault = false
  ): Promise<void> {
    if (!stripe) {
      throw new Error('Stripe not initialized. Payment functionality is disabled in development mode.');
    }

    try {
      // Retrieve payment method from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      // If setting as default, unset other default payment methods
      if (isDefault) {
        await this.supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('guest_id', guestId);
      }

      // Store in database
      const { error } = await this.supabase
        .from('payment_methods')
        .insert({
          guest_id: guestId,
          stripe_payment_method_id: paymentMethodId,
          type: paymentMethod.type,
          card_brand: paymentMethod.card?.brand,
          card_last4: paymentMethod.card?.last4,
          card_exp_month: paymentMethod.card?.exp_month,
          card_exp_year: paymentMethod.card?.exp_year,
          billing_details: paymentMethod.billing_details,
          is_default: isDefault,
        });

      if (error) {
        throw new Error(`Failed to save payment method: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  }

  /**
   * Get guest's saved payment methods
   */
  async getGuestPaymentMethods(guestId: string): Promise<PaymentMethodDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .select('*')
        .eq('guest_id', guestId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch payment methods: ${error.message}`);
      }

      return data.map(pm => ({
        id: pm.stripe_payment_method_id,
        type: pm.type,
        card: pm.card_brand ? {
          brand: pm.card_brand,
          last4: pm.card_last4,
          exp_month: pm.card_exp_month,
          exp_year: pm.card_exp_year,
        } : undefined,
        billing_details: pm.billing_details,
      }));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Process a deposit payment
   */
  async processDeposit(
    bookingId: string,
    guestId: string,
    depositAmount: number,
    currency: SupportedCurrency,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      // Create payment intent for deposit
      const paymentIntent = await this.createPaymentIntent({
        bookingId,
        amount: depositAmount,
        currency,
        guestId,
        description: `Deposit for booking ${bookingId}`,
        metadata: {
          type: 'deposit',
          bookingId,
        },
      });

      // If payment method provided, confirm immediately
      if (paymentMethodId) {
        return await this.confirmPaymentIntent(paymentIntent.id, paymentMethodId);
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  }

  /**
   * Update payment intent status in database
   */
  private async updatePaymentIntentStatus(
    stripePaymentIntentId: string,
    status: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('payment_intents')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', stripePaymentIntentId);

      if (error) {
        console.error('Failed to update payment intent status:', error);
      }
    } catch (error) {
      console.error('Error updating payment intent status:', error);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;
        case 'charge.failed':
          await this.handleChargeFailed(event.data.object as Stripe.Charge);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Update payment intent status
    await this.updatePaymentIntentStatus(paymentIntent.id, 'succeeded');

    // Update booking status if this completes payment
    const bookingId = paymentIntent.metadata.bookingId;
    if (bookingId) {
      await this.supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          stripe_payment_intent_id: paymentIntent.id,
          deposit_paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      // Send confirmation emails
      try {
        // Send payment confirmation
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/bookings/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            type: 'payment_confirmation'
          }),
        });

        // Send booking confirmation
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/bookings/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            type: 'booking_confirmation'
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the payment process if email fails
      }
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.updatePaymentIntentStatus(paymentIntent.id, 'payment_failed');

    // Update booking status and send failure notification
    const bookingId = paymentIntent.metadata.bookingId;
    if (bookingId) {
      await this.supabase
        .from('bookings')
        .update({ 
          status: 'payment_failed',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      // Send payment failed email
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/bookings/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            type: 'payment_failed'
          }),
        });
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }
    }
  }

  private async handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
    // Store successful charge transaction
    const paymentIntentId = charge.payment_intent as string;
    
    const { data: paymentIntent } = await this.supabase
      .from('payment_intents')
      .select('booking_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (paymentIntent) {
      await this.supabase
        .from('payment_transactions')
        .insert({
          booking_id: paymentIntent.booking_id,
          stripe_charge_id: charge.id,
          transaction_type: 'payment',
          amount: charge.amount,
          currency: charge.currency.toUpperCase(),
          status: 'succeeded',
          gateway_response: charge,
          processed_at: new Date().toISOString(),
        });
    }
  }

  private async handleChargeFailed(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId = charge.payment_intent as string;
    
    const { data: paymentIntent } = await this.supabase
      .from('payment_intents')
      .select('booking_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (paymentIntent) {
      await this.supabase
        .from('payment_transactions')
        .insert({
          booking_id: paymentIntent.booking_id,
          stripe_charge_id: charge.id,
          transaction_type: 'payment',
          amount: charge.amount,
          currency: charge.currency.toUpperCase(),
          status: 'failed',
          failure_reason: charge.failure_message || 'Payment failed',
          gateway_response: charge,
        });
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();