/**
 * Comprehensive Payment and Financial Management System
 * Handles all payment processing, refunds, deposits, and financial operations
 */

import { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'cash' | 'corporate_billing';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  isDefault: boolean;
  metadata: any;
}

export interface PaymentIntent {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId: string;
  description: string;
  metadata: any;
  createdAt: Date;
  confirmedAt?: Date;
  failureReason?: string;
}

export interface PaymentSchedule {
  id: string;
  bookingId: string;
  type: 'deposit' | 'balance' | 'installment';
  amount: number;
  currency: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentIntentId?: string;
  paidAt?: Date;
  notes?: string;
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  originalPaymentIntentId: string;
  amount: number;
  currency: string;
  reason: 'cancellation' | 'modification' | 'guest_complaint' | 'overbooking' | 'other';
  reasonDetails?: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  processedAt?: Date;
  refundId?: string;
}

export interface CorporateBilling {
  id: string;
  companyName: string;
  contactEmail: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  paymentTerms: 'net_15' | 'net_30' | 'net_45' | 'net_60';
  creditLimit: number;
  currentBalance: number;
  isActive: boolean;
  taxId?: string;
  authorizedUsers: string[];
}

export interface FinancialReport {
  period: { start: Date; end: Date };
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  paymentMethodBreakdown: { [method: string]: number };
  currencyBreakdown: { [currency: string]: number };
  outstandingPayments: number;
  averageBookingValue: number;
  paymentFailureRate: number;
}

export class FinancialManager {
  private supabase: SupabaseClient;
  private stripe: Stripe;

  constructor(supabaseClient: SupabaseClient, stripeSecretKey: string) {
    this.supabase = supabaseClient;
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil'
    });
  }

  /**
   * Process a payment for a booking
   */
  async processPayment(
    bookingId: string,
    amount: number,
    currency: string,
    paymentMethodId: string,
    captureImmediately: boolean = true
  ): Promise<PaymentIntent> {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error('Booking not found');
      }

      // Create Stripe payment intent
      const stripePaymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        capture_method: captureImmediately ? 'automatic' : 'manual',
        description: `Booking ${booking.confirmation_number}`,
        metadata: {
          bookingId,
          hotelId: booking.hotel_id,
          confirmationNumber: booking.confirmation_number
        }
      });

      // Store payment intent in database
      const { data: paymentIntent, error: paymentError } = await this.supabase
        .from('payment_intents')
        .insert({
          id: stripePaymentIntent.id,
          booking_id: bookingId,
          amount,
          currency,
          status: stripePaymentIntent.status,
          payment_method_id: paymentMethodId,
          description: `Payment for booking ${booking.confirmation_number}`,
          metadata: {
            stripePaymentIntentId: stripePaymentIntent.id,
            captureMethod: captureImmediately ? 'automatic' : 'manual'
          }
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error(`Failed to store payment intent: ${paymentError.message}`);
      }

      // Update booking payment status
      await this.updateBookingPaymentStatus(bookingId, stripePaymentIntent.status);

      return {
        id: paymentIntent.id,
        bookingId: paymentIntent.booking_id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as any,
        paymentMethodId: paymentIntent.payment_method_id,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata,
        createdAt: new Date(paymentIntent.created_at),
        confirmedAt: paymentIntent.confirmed_at ? new Date(paymentIntent.confirmed_at) : undefined,
        failureReason: paymentIntent.failure_reason
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Capture a previously authorized payment
   */
  async capturePayment(paymentIntentId: string, amount?: number): Promise<void> {
    try {
      const captureAmount = amount ? Math.round(amount * 100) : undefined;

      await this.stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: captureAmount
      });

      // Update payment intent status
      await this.supabase
        .from('payment_intents')
        .update({
          status: 'succeeded',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId);

      // Update booking payment status
      const { data: paymentIntent } = await this.supabase
        .from('payment_intents')
        .select('booking_id')
        .eq('id', paymentIntentId)
        .single();

      if (paymentIntent) {
        await this.updateBookingPaymentStatus(paymentIntent.booking_id, 'succeeded');
      }
    } catch (error) {
      console.error('Payment capture error:', error);
      throw error;
    }
  }

  /**
   * Process a refund
   */
  async processRefund(
    refundRequestId: string,
    approvedBy: string
  ): Promise<string> {
    try {
      // Get refund request details
      const { data: refundRequest, error: refundError } = await this.supabase
        .from('refund_requests')
        .select('*')
        .eq('id', refundRequestId)
        .single();

      if (refundError || !refundRequest) {
        throw new Error('Refund request not found');
      }

      if (refundRequest.status !== 'approved') {
        throw new Error('Refund request is not approved');
      }

      // Process refund with Stripe
      const stripeRefund = await this.stripe.refunds.create({
        payment_intent: refundRequest.original_payment_intent_id,
        amount: Math.round(refundRequest.amount * 100),
        reason: this.mapRefundReason(refundRequest.reason),
        metadata: {
          refundRequestId,
          bookingId: refundRequest.booking_id,
          approvedBy
        }
      });

      // Update refund request
      await this.supabase
        .from('refund_requests')
        .update({
          status: 'processed',
          refund_id: stripeRefund.id,
          processed_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', refundRequestId);

      // Update booking payment status
      await this.updateBookingPaymentStatus(refundRequest.booking_id, 'refunded');

      return stripeRefund.id;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  /**
   * Create a payment schedule for a booking
   */
  async createPaymentSchedule(
    bookingId: string,
    schedule: Omit<PaymentSchedule, 'id' | 'bookingId'>[]
  ): Promise<string[]> {
    try {
      const scheduleIds: string[] = [];

      for (const payment of schedule) {
        const { data, error } = await this.supabase
          .from('payment_schedules')
          .insert({
            booking_id: bookingId,
            type: payment.type,
            amount: payment.amount,
            currency: payment.currency,
            due_date: payment.dueDate.toISOString(),
            status: payment.status,
            notes: payment.notes
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create payment schedule: ${error.message}`);
        }

        scheduleIds.push(data.id);
      }

      return scheduleIds;
    } catch (error) {
      console.error('Payment schedule creation error:', error);
      throw error;
    }
  }

  /**
   * Process scheduled payment
   */
  async processScheduledPayment(
    scheduleId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    try {
      // Get payment schedule details
      const { data: schedule, error } = await this.supabase
        .from('payment_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error || !schedule) {
        throw new Error('Payment schedule not found');
      }

      // Process the payment
      const paymentIntent = await this.processPayment(
        schedule.booking_id,
        schedule.amount,
        schedule.currency,
        paymentMethodId
      );

      // Update schedule status
      await this.supabase
        .from('payment_schedules')
        .update({
          status: 'paid',
          payment_intent_id: paymentIntent.id,
          paid_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      return paymentIntent;
    } catch (error) {
      console.error('Scheduled payment processing error:', error);
      throw error;
    }
  }

  /**
   * Handle corporate billing
   */
  async createCorporateInvoice(
    bookingId: string,
    corporateAccountId: string
  ): Promise<string> {
    try {
      // Get booking and corporate account details
      const [bookingResult, corporateResult] = await Promise.all([
        this.supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single(),
        this.supabase
          .from('corporate_accounts')
          .select('*')
          .eq('id', corporateAccountId)
          .single()
      ]);

      if (bookingResult.error || !bookingResult.data) {
        throw new Error('Booking not found');
      }

      if (corporateResult.error || !corporateResult.data) {
        throw new Error('Corporate account not found');
      }

      const booking = bookingResult.data;
      const corporateAccount = corporateResult.data;

      // Check credit limit
      const newBalance = corporateAccount.current_balance + booking.total_amount;
      if (newBalance > corporateAccount.credit_limit) {
        throw new Error('Corporate credit limit exceeded');
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await this.supabase
        .from('corporate_invoices')
        .insert({
          booking_id: bookingId,
          corporate_account_id: corporateAccountId,
          invoice_number: await this.generateInvoiceNumber(),
          amount: booking.total_amount,
          currency: booking.currency,
          due_date: this.calculateInvoiceDueDate(corporateAccount.payment_terms),
          status: 'pending',
          line_items: [{
            description: `Hotel stay - ${booking.confirmation_number}`,
            quantity: booking.number_of_nights,
            unit_price: booking.room_rate,
            total: booking.total_amount
          }]
        })
        .select()
        .single();

      if (invoiceError) {
        throw new Error(`Failed to create invoice: ${invoiceError.message}`);
      }

      // Update corporate account balance
      await this.supabase
        .from('corporate_accounts')
        .update({
          current_balance: newBalance
        })
        .eq('id', corporateAccountId);

      // Update booking payment status
      await this.supabase
        .from('bookings')
        .update({
          payment_status: 'pending',
          payment_method: 'corporate_billing'
        })
        .eq('id', bookingId);

      return invoice.id;
    } catch (error) {
      console.error('Corporate invoice creation error:', error);
      throw error;
    }
  }

  /**
   * Generate financial reports
   */
  async generateFinancialReport(
    hotelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport> {
    try {
      // Get all payments in the period
      const { data: payments, error: paymentsError } = await this.supabase
        .from('payment_intents')
        .select(`
          *,
          bookings!inner(hotel_id, total_amount, currency, payment_method)
        `)
        .eq('bookings.hotel_id', hotelId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'succeeded');

      if (paymentsError) {
        throw new Error(`Failed to get payments: ${paymentsError.message}`);
      }

      // Get refunds in the period
      const { data: refunds, error: refundsError } = await this.supabase
        .from('refund_requests')
        .select(`
          *,
          bookings!inner(hotel_id)
        `)
        .eq('bookings.hotel_id', hotelId)
        .gte('processed_at', startDate.toISOString())
        .lte('processed_at', endDate.toISOString())
        .eq('status', 'processed');

      if (refundsError) {
        throw new Error(`Failed to get refunds: ${refundsError.message}`);
      }

      // Calculate metrics
      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalRefunds = refunds?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const netRevenue = totalRevenue - totalRefunds;

      // Payment method breakdown
      const paymentMethodBreakdown = payments?.reduce((acc, p) => {
        const method = p.bookings.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + p.amount;
        return acc;
      }, {} as { [method: string]: number }) || {};

      // Currency breakdown
      const currencyBreakdown = payments?.reduce((acc, p) => {
        const currency = p.currency;
        acc[currency] = (acc[currency] || 0) + p.amount;
        return acc;
      }, {} as { [currency: string]: number }) || {};

      // Outstanding payments
      const { data: outstandingData } = await this.supabase
        .from('payment_schedules')
        .select('amount')
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());

      const outstandingPayments = outstandingData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      // Average booking value
      const averageBookingValue = payments?.length ? totalRevenue / payments.length : 0;

      // Payment failure rate
      const { data: failedPayments } = await this.supabase
        .from('payment_intents')
        .select('id')
        .eq('status', 'failed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const totalPaymentAttempts = (payments?.length || 0) + (failedPayments?.length || 0);
      const paymentFailureRate = totalPaymentAttempts ? 
        (failedPayments?.length || 0) / totalPaymentAttempts : 0;

      return {
        period: { start: startDate, end: endDate },
        totalRevenue,
        totalRefunds,
        netRevenue,
        paymentMethodBreakdown,
        currencyBreakdown,
        outstandingPayments,
        averageBookingValue,
        paymentFailureRate
      };
    } catch (error) {
      console.error('Financial report generation error:', error);
      throw error;
    }
  }

  /**
   * Handle payment webhook from Stripe
   */
  async handlePaymentWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async updateBookingPaymentStatus(
    bookingId: string,
    paymentStatus: string
  ): Promise<void> {
    const statusMap: { [key: string]: string } = {
      'succeeded': 'paid',
      'requires_capture': 'partial',
      'processing': 'pending',
      'failed': 'pending',
      'refunded': 'refunded'
    };

    await this.supabase
      .from('bookings')
      .update({
        payment_status: statusMap[paymentStatus] || 'pending'
      })
      .eq('id', bookingId);
  }

  private mapRefundReason(reason: string): Stripe.RefundCreateParams.Reason {
    const reasonMap: { [key: string]: Stripe.RefundCreateParams.Reason } = {
      'cancellation': 'requested_by_customer',
      'modification': 'requested_by_customer',
      'guest_complaint': 'requested_by_customer',
      'overbooking': 'fraudulent',
      'other': 'requested_by_customer'
    };

    return reasonMap[reason] || 'requested_by_customer';
  }

  private async generateInvoiceNumber(): Promise<string> {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `INV-${timestamp}-${random}`.toUpperCase();
  }

  private calculateInvoiceDueDate(paymentTerms: string): Date {
    const daysMap: { [key: string]: number } = {
      'net_15': 15,
      'net_30': 30,
      'net_45': 45,
      'net_60': 60
    };

    const days = daysMap[paymentTerms] || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.supabase
      .from('payment_intents')
      .update({
        status: 'succeeded',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', paymentIntent.id);

    if (paymentIntent.metadata.bookingId) {
      await this.updateBookingPaymentStatus(paymentIntent.metadata.bookingId, 'succeeded');
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.supabase
      .from('payment_intents')
      .update({
        status: 'failed',
        failure_reason: paymentIntent.last_payment_error?.message
      })
      .eq('id', paymentIntent.id);

    if (paymentIntent.metadata.bookingId) {
      await this.updateBookingPaymentStatus(paymentIntent.metadata.bookingId, 'failed');
    }
  }

  private async handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
    // Record dispute in database
    await this.supabase
      .from('payment_disputes')
      .insert({
        stripe_dispute_id: dispute.id,
        payment_intent_id: dispute.payment_intent as string,
        amount: dispute.amount / 100,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        evidence_due_by: dispute.evidence_details.due_by ? new Date(dispute.evidence_details.due_by * 1000).toISOString() : null
      });

    // TODO: Notify relevant staff about the dispute
  }
}

/**
 * Payment processor factory for different providers
 */
export class PaymentProcessorFactory {
  static createProcessor(
    provider: 'stripe' | 'square' | 'adyen',
    config: any,
    supabaseClient: SupabaseClient
  ): FinancialManager {
    switch (provider) {
      case 'stripe':
        return new FinancialManager(supabaseClient, config.secretKey);
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }
}