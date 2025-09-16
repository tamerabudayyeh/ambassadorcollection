'use client';

import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { MapPin } from 'lucide-react';

const HotelSelector: React.FC = () => {
  const { hotels, selectedHotel, setSelectedHotel } = useBooking();
  
  const handleHotelChange = (hotelId: string) => {
    if (hotelId === '') {
      setSelectedHotel(null);
    } else {
      const hotel = hotels.find(h => h._id === hotelId);
      setSelectedHotel(hotel || null);
    }
  };
  
  return (
    <div className="relative">
      <label htmlFor="hotel" className="label">Hotel</label>
      <div className="relative">
        <select
          id="hotel"
          className="input pl-10 pr-4 py-3 appearance-none"
          value={selectedHotel?._id || ''}
          onChange={(e) => handleHotelChange(e.target.value)}
        >
          <option value="">Select a hotel</option>
          {hotels.map((hotel) => (
            <option key={hotel._id} value={hotel._id}>
              {hotel.name} - {hotel.location}
            </option>
          ))}
        </select>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        {/* Dropdown arrow */}
        <svg 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default HotelSelector;
