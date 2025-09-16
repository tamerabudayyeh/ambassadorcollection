'use client';

import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { CalendarDays, Users, CreditCard, BedDouble, Coffee, Ban, AlertCircle, Check } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface BookingSummaryProps {
  isCollapsible?: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ isCollapsible = false }) => {
  const { 
    selectedHotel,
    checkInDate,
    checkOutDate,
    adults,
    children,
    rooms,
    selectedRoom,
    selectedRate,
    guestInfo,
    bookingReference
  } = useBooking();
  
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  if (!selectedHotel || !checkInDate || !checkOutDate || !selectedRoom || !selectedRate) {
    return null;
  }
  
  const toggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  const formatDate = (date: Date) => {
    return format(date, 'EEE, MMM d, yyyy');
  };
  
  const nightsCount = differenceInDays(checkOutDate, checkInDate);
  const totalAmount = selectedRate.price * nightsCount;
  
  return (
    <div className="card overflow-visible">
      <div 
        className={`p-4 bg-primary-50 border-b border-primary-100 flex justify-between items-center ${isCollapsible ? 'cursor-pointer' : ''}`}
        onClick={toggleCollapse}
      >
        <h3 className="text-lg font-serif">Booking Summary</h3>
        {isCollapsible && (
          <button 
            type="button"
            className="text-primary-800"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand summary' : 'Collapse summary'}
          >
            {isCollapsed ? '+' : '−'}
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          {bookingReference && (
            <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md">
              <div className="font-medium">Booking Confirmed</div>
              <div className="text-sm">Reference: {bookingReference}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-base">{selectedHotel.name}</h4>
              <p className="text-sm text-gray-600">{selectedHotel.location}</p>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <CalendarDays size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div><span className="font-medium">Check-in:</span> {formatDate(checkInDate)}</div>
                <div><span className="font-medium">Check-out:</span> {formatDate(checkOutDate)}</div>
                <div className="text-gray-600">{nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <Users size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div>{adults} {adults === 1 ? 'Adult' : 'Adults'}{children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}</div>
                <div>{rooms} {rooms === 1 ? 'Room' : 'Rooms'}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <BedDouble size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{selectedRoom.name}</div>
                <div>{selectedRate.name}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRate.includesBreakfast && (
                    <span className="inline-flex items-center text-xs text-success-700 bg-success-50 rounded-full px-2 py-1">
                      <Coffee size={12} className="mr-1" />
                      Breakfast Included
                    </span>
                  )}
                  {selectedRate.isRefundable ? (
                    <span className="inline-flex items-center text-xs text-success-700 bg-success-50 rounded-full px-2 py-1">
                      <Check size={12} className="mr-1" />
                      Refundable
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-warning-700 bg-warning-50 rounded-full px-2 py-1">
                      <Ban size={12} className="mr-1" />
                      Non-Refundable
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {guestInfo && (
              <div className="flex items-start gap-3 text-sm">
                <CreditCard size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Guest Information</div>
                  <div>{guestInfo.firstName} {guestInfo.lastName}</div>
                  <div>{guestInfo.email}</div>
                  <div>{guestInfo.phone}</div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between mb-2">
                <span>Room rate ({nightsCount} {nightsCount === 1 ? 'night' : 'nights'})</span>
                <span>${selectedRate.price} × {nightsCount}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Taxes & fees</span>
                <span>Included</span>
              </div>
              
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${totalAmount}</span>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p className="flex items-start">
                  <AlertCircle size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                  Your card will not be charged now. It will be used to guarantee your reservation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
