'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import { BookingService } from '@/lib/booking-service';
import { CreditCard, Lock } from 'lucide-react';

interface CreditCardFormProps {
  onSubmit?: () => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSubmit }) => {
  const { 
    paymentInfo, 
    setPaymentInfo, 
    setBookingReference,
    selectedHotel,
    selectedRoomType,
    selectedRatePlan,
    checkInDate,
    checkOutDate,
    adults,
    children,
    guestInfo
  } = useBooking();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    cardNumber: paymentInfo?.cardNumber || '',
    cardholderName: paymentInfo?.cardholderName || '',
    expiryDate: paymentInfo?.expiryDate || '',
    cvv: paymentInfo?.cvv || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\//g, '')
        .replace(/^(\d{2})(\d{0,2})/, (_, p1, p2) => p2 ? `${p1}/${p2}` : p1);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate card number (should be 16 digits, spaces allowed)
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    // Validate cardholder name
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    // Validate expiry date (format MM/YY)
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const expiryMonth = parseInt(month, 10);
      const expiryYear = parseInt(`20${year}`, 10);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      if (expiryMonth < 1 || expiryMonth > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (
        expiryYear < currentYear || 
        (expiryYear === currentYear && expiryMonth < currentMonth)
      ) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    // Validate CVV (3 or 4 digits)
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    
    if (!validateForm()) {
      return;
    }
    
    // Validate booking context
    if (!selectedHotel || !selectedRoomType || !selectedRatePlan || !checkInDate || !checkOutDate || !guestInfo) {
      setBookingError('Missing booking information. Please start over.');
      return;
    }
    
    setIsProcessing(true);
    setPaymentInfo(formData);
    
    try {
      // Prepare booking data
      const bookingData = {
        hotelId: selectedHotel._id,
        roomId: selectedRoomType.id, // Using room type ID as room ID for now
        roomTypeId: selectedRoomType.id,
        ratePlanId: selectedRatePlan.id,
        ratePlanName: selectedRatePlan.name,
        checkInDate,
        checkOutDate,
        adults,
        children,
        guestDetails: guestInfo,
        paymentMethod: 'card',
        roomCount: 1
      };
      
      // Create booking using the service
      const response = await BookingService.createBooking(bookingData);
      
      if (response.success && response.booking) {
        // Set booking reference for confirmation page
        setBookingReference(response.booking.confirmationNumber);
        
        // Navigate to confirmation
        if (onSubmit) {
          onSubmit();
        } else {
          router.push('/booking/confirmation');
        }
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
      
    } catch (error) {
      console.error('Booking creation failed:', error);
      setBookingError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-primary-50 p-4 rounded-md mb-6 flex items-start">
        <Lock size={20} className="text-primary-800 mt-0.5 mr-3 flex-shrink-0" />
        <p className="text-sm text-primary-900">
          Your payment information is secure. We only use your card details to hold the reservation. 
          No charges will be made until your stay, unless specified in the rate terms.
        </p>
      </div>
      
      {bookingError && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <div className="py-1">
              <svg className="w-4 h-4 text-error-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Booking Error</p>
              <p className="text-sm">{bookingError}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="cardNumber" className="label">Card Number*</label>
          <div className="relative">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              className={`input pl-10 ${errors.cardNumber ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleChange}
              maxLength={19} // 16 digits + 3 spaces
            />
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-error-500">{errors.cardNumber}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="cardholderName" className="label">Cardholder Name*</label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            className={`input ${errors.cardholderName ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
            placeholder="John Smith"
            value={formData.cardholderName}
            onChange={handleChange}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-error-500">{errors.cardholderName}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="expiryDate" className="label">Expiry Date*</label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              className={`input ${errors.expiryDate ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={handleChange}
              maxLength={5} // MM/YY
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-error-500">{errors.expiryDate}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="cvv" className="label">CVV*</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              className={`input ${errors.cvv ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
              placeholder="123"
              value={formData.cvv}
              onChange={handleChange}
              maxLength={4}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-error-500">{errors.cvv}</p>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Complete Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreditCardForm;
