'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import { CreditCard, Shield, AlertCircle, Loader2, Check, X } from 'lucide-react';
// Simple currency formatter
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};
import { CancellationPolicy } from '@/components/booking/CancellationPolicy';

interface MockPaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Mock card types for visual feedback
const getCardType = (cardNumber: string) => {
  const number = cardNumber.replace(/\s/g, '');
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  return 'unknown';
};

// Mock test card numbers that simulate different scenarios
const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  PROCESSING_ERROR: '4000000000000119',
};

export default function MockPaymentForm() {
  const router = useRouter();
  const { selectedRoom, selectedRate, guestInfo, dateRange, selectedHotel, selectedCurrency, exchangeRates } = useBooking();
  
  const [formData, setFormData] = useState<MockPaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: `${guestInfo?.firstName || ''} ${guestInfo?.lastName || ''}`.trim(),
    billingAddress: {
      line1: guestInfo?.address || '',
      city: guestInfo?.city || '',
      postalCode: guestInfo?.postalCode || '',
      country: guestInfo?.country || 'United States',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showTestCardInfo, setShowTestCardInfo] = useState(false);

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

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const number = value.replace(/\s/g, '');
    const formatted = number.match(/.{1,4}/g)?.join(' ') || number;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Validate form
  const isFormValid = () => {
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    return (
      cardNumber.length >= 13 &&
      formData.expiryDate.length === 5 &&
      formData.cvv.length >= 3 &&
      formData.cardholderName.trim().length > 0 &&
      formData.billingAddress.line1.trim().length > 0 &&
      formData.billingAddress.city.trim().length > 0 &&
      formData.billingAddress.postalCode.trim().length > 0
    );
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setError(null);
    
    if (field === 'cardNumber') {
      setFormData(prev => ({ ...prev, [field]: formatCardNumber(value) }));
    } else if (field === 'expiryDate') {
      setFormData(prev => ({ ...prev, [field]: formatExpiryDate(value) }));
    } else if (field === 'cvv') {
      setFormData(prev => ({ ...prev, [field]: value.replace(/\D/g, '').substring(0, 4) }));
    } else if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Simulate payment processing
  const simulatePayment = async (cardNumber: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    const number = cardNumber.replace(/\s/g, '');
    
    if (number === TEST_CARDS.DECLINED) {
      throw new Error('Your card was declined. Please try a different payment method.');
    }
    
    if (number === TEST_CARDS.INSUFFICIENT_FUNDS) {
      throw new Error('Your card has insufficient funds. Please try a different payment method.');
    }
    
    if (number === TEST_CARDS.EXPIRED_CARD) {
      throw new Error('Your card has expired. Please try a different payment method.');
    }
    
    if (number === TEST_CARDS.PROCESSING_ERROR) {
      throw new Error('We encountered an error processing your payment. Please try again.');
    }

    // All other cards succeed
    return {
      success: true,
      paymentId: `mock_payment_${Date.now()}`,
      amount: depositAmount,
      currency: selectedCurrency,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid()) {
      setError('Please fill in all required fields.');
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    try {
      // Create mock booking first
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: selectedHotel?._id,
          roomId: selectedRoom?.id,
          checkIn: dateRange?.from?.toISOString(),
          checkOut: dateRange?.to?.toISOString(),
          guestInfo,
          rateInfo: selectedRate,
          totalAmount: totalAmount / 100,
          depositAmount: depositAmount / 100,
          currency: selectedCurrency,
          paymentMethod: 'mock_card',
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const booking = await bookingResponse.json();

      // Simulate payment processing
      const paymentResult = await simulatePayment(formData.cardNumber);

      // Process mock payment
      const paymentResponse = await fetch('/api/payments/mock/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.data.id,
          paymentId: paymentResult.paymentId,
          amount: paymentResult.amount,
          currency: paymentResult.currency,
          cardInfo: {
            last4: formData.cardNumber.slice(-4),
            brand: getCardType(formData.cardNumber),
          },
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to process payment');
      }

      // Send confirmation email (mocked)
      await fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.data.id,
          email: guestInfo?.email,
        }),
      });

      // Store booking ID for confirmation page
      sessionStorage.setItem('confirmedBookingId', booking.data.id);

      // Payment successful - redirect to confirmation page
      router.push('/booking/confirmation');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const cardType = getCardType(formData.cardNumber);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">Payment Information</h2>
        <p className="text-gray-600 font-light">Secure mock payment processing for development</p>
      </div>

      {/* Development Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Development Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is a mock payment system for development and testing. No real charges will be made.
            </p>
            <button
              type="button"
              onClick={() => setShowTestCardInfo(!showTestCardInfo)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showTestCardInfo ? 'Hide' : 'Show'} test card numbers
            </button>
            {showTestCardInfo && (
              <div className="mt-3 text-xs text-blue-600 space-y-1">
                <p><strong>Success:</strong> 4242 4242 4242 4242</p>
                <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
                <p><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</p>
                <p><strong>Expired Card:</strong> 4000 0000 0000 0069</p>
                <p>Use any future expiry date and any 3-digit CVV</p>
              </div>
            )}
          </div>
        </div>
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
        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <CreditCard className="inline w-5 h-5 mr-2 text-amber-600" />
            Payment Method
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                {cardType !== 'unknown' && formData.cardNumber.length > 8 && (
                  <div className="absolute right-3 top-2.5">
                    <span className="text-xs text-gray-500 capitalize">{cardType}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Billing Address
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.billingAddress.line1}
                onChange={(e) => handleInputChange('billingAddress.line1', e.target.value)}
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                  placeholder="New York"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                  placeholder="10001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={formData.billingAddress.country}
                onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Italy">Italy</option>
                <option value="Spain">Spain</option>
              </select>
            </div>
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
              Your payment information is encrypted and processed securely. 
              This is a mock payment system for development purposes only.
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
            disabled={!isFormValid() || paymentProcessing}
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