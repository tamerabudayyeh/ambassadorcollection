'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useBooking } from '@/contexts/BookingContext';
import { CreditCard, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/stripe/config';
import { CancellationPolicy } from '@/components/booking/CancellationPolicy';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { selectedRoom, selectedRate, guestInfo, dateRange, selectedHotel, selectedCurrency, exchangeRates } = useBooking();
  
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Calculate total amount using centralized rate calculator
  const numberOfNights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  
  const basePriceUSD = selectedRate?.price || 0;
  
  // Use the centralized rate calculator for consistent pricing
  const rateCalculation = React.useMemo(() => {
    if (!selectedRoom || !selectedHotel || !dateRange?.from || !dateRange?.to) return null;
    
    const { RateCalculator } = require('@/lib/pricing/rate-calculator');
    return RateCalculator.calculateRate({
      baseRate: basePriceUSD,
      numberOfNights,
      hotelId: selectedHotel._id,
      roomTypeId: selectedRoom.id,
      checkInDate: dateRange.from,
      checkOutDate: dateRange.to,
      currency: selectedCurrency,
      exchangeRates,
      ratePlanType: selectedRate?.paymentType === 'pay_now' ? 'non_refundable' : 'flexible',
      guests: { adults: 2, children: 0 } // This should come from booking context
    });
  }, [selectedRoom, selectedHotel, selectedRate, dateRange, selectedCurrency, exchangeRates, numberOfNights, basePriceUSD]);

  const totalAmount = Math.round((rateCalculation?.totalAmount || basePriceUSD) * 100); // Convert to cents
  const depositAmount = Math.round((rateCalculation?.depositAmount || basePriceUSD * 0.3) * 100); // Convert to cents

  // Create payment intent on component mount
  useEffect(() => {
    if (!selectedRoom || !selectedRate || !guestInfo || !selectedHotel) return;

    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: 'temp-booking-id', // This would be replaced with actual booking ID
            amount: depositAmount,
            currency: selectedCurrency,
            guestId: 'temp-guest-id', // This would be replaced with actual guest ID
            description: `Deposit for ${selectedHotel.name} - ${selectedRoom.name}`,
            metadata: {
              hotelId: selectedHotel._id,
              roomId: selectedRoom.id,
              checkIn: dateRange?.from?.toISOString() || '',
              checkOut: dateRange?.to?.toISOString() || '',
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment intent');
        }

        setClientSecret(data.data.clientSecret);
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [selectedRoom, selectedRate, guestInfo, selectedHotel, dateRange, depositAmount, selectedCurrency]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Payment successful - redirect to confirmation page
      router.push('/booking/confirmation');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <span className="ml-3 text-gray-600">Initializing payment...</span>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12 text-red-600">
          <AlertCircle className="w-8 h-8 mr-3" />
          <span>Failed to initialize payment. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">Payment Information</h2>
        <p className="text-gray-600 font-light">Secure payment processing with Stripe</p>
      </div>

      {/* Payment Summary */}
      <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          {rateCalculation && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Rate ({numberOfNights} night{numberOfNights !== 1 ? 's' : ''}):</span>
                <span className="font-medium">{formatCurrency(rateCalculation.baseAmount * 100, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees:</span>
                <span className="font-medium">{formatCurrency((rateCalculation.taxes.totalTaxes + rateCalculation.fees.totalFees) * 100, selectedCurrency)}</span>
              </div>
              {rateCalculation.discounts.totalDiscounts > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Savings:</span>
                  <span className="font-medium">-{formatCurrency(rateCalculation.discounts.totalDiscounts * 100, selectedCurrency)}</span>
                </div>
              )}
              <div className="border-t border-amber-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Booking Amount:</span>
                  <span className="font-medium">{formatCurrency(totalAmount, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Required ({Math.round(rateCalculation.depositPercentage * 100)}%):</span>
                  <span className="font-medium text-amber-600">{formatCurrency(depositAmount, selectedCurrency)}</span>
                </div>
                <div className="border-t border-amber-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Amount to Pay Today:</span>
                    <span className="font-bold text-lg">{formatCurrency(depositAmount, selectedCurrency)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Remaining balance will be charged at check-in
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <CreditCard className="inline w-5 h-5 mr-2 text-amber-600" />
            Payment Method
          </h3>
          
          <div className="stripe-element-container">
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: `${guestInfo?.firstName} ${guestInfo?.lastName}`,
                    email: guestInfo?.email,
                    phone: guestInfo?.phone,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Billing Address
          </h3>
          
          <div className="stripe-element-container">
            <AddressElement 
              options={{
                mode: 'billing',
                defaultValues: {
                  name: `${guestInfo?.firstName} ${guestInfo?.lastName}`,
                  address: {
                    line1: guestInfo?.address || '',
                    city: guestInfo?.city || '',
                    postal_code: guestInfo?.postalCode || '',
                    country: guestInfo?.country === 'United States' ? 'US' : 
                              guestInfo?.country === 'United Kingdom' ? 'GB' : 'US',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Cancellation Policy
          </h3>
          
          <CancellationPolicy
            policyType={selectedRate?.paymentType === 'pay_now' ? 'non_refundable' : 'flexible'}
            checkInDate={dateRange?.from || new Date()}
            totalAmount={rateCalculation?.totalAmount || basePriceUSD}
            currency={selectedCurrency}
          />
        </div>

        {/* Security Notice */}
        <div className="flex items-start p-4 bg-gray-50 rounded-lg">
          <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Your payment is secure</p>
            <p>
              Your payment information is encrypted and processed securely through Stripe. 
              We never store your payment details on our servers.
            </p>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>
            By clicking "Complete Booking", you agree to our Terms and Conditions and confirm 
            that you have read our Privacy Policy. Your booking is subject to availability 
            and hotel policies.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={paymentProcessing}
          >
            Back to Guest Info
          </button>
          
          <button 
            type="submit" 
            disabled={!stripe || !elements || paymentProcessing}
            className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {paymentProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Booking
                <CreditCard className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}