'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import BookingSteps from '@/components/booking/BookingSteps';
import MockPaymentForm from '@/components/booking/MockPaymentForm';
import BookingSummary from '@/components/booking/BookingSummary';
import { ArrowLeft } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { guestInfo, selectedRoom, selectedRate, selectedHotel } = useBooking();
  
  React.useEffect(() => {
    if (!guestInfo || !selectedRoom || !selectedRate || !selectedHotel) {
      router.push('/booking');
    }
  }, [guestInfo, selectedRoom, selectedRate, selectedHotel, router]);
  
  if (!guestInfo || !selectedRoom || !selectedRate) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="booking-mobile-header md:hidden">
        <button
          onClick={() => router.push('/booking/guest-info')}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h1 className="text-lg font-serif font-bold">Payment</h1>
        <div className="w-8"></div>
      </div>

      <div className="hidden md:block">
        <BookingSteps currentStep={4} />
      </div>
      
      <div className="booking-container py-4 md:py-8">
        <button
          onClick={() => router.push('/booking/guest-info')}
          className="hidden md:flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Guest Information
        </button>
        
        <div className="booking-grid">
          <div className="booking-form-section">
            <MockPaymentForm />
          </div>
          
          <div className="booking-summary-section">
            <div className="mobile-sticky-bottom">
              <BookingSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}