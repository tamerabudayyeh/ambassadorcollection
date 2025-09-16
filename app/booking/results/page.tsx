'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import BookingSteps from '@/components/booking/BookingSteps';
import RoomCard from '@/components/booking/RoomCard';
import BookingSummary from '@/components/booking/BookingSummary';
import { ArrowLeft, Filter, Loader, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { AvailableRoom } from '@/lib/booking-types';
import { BookingService } from '@/lib/booking-service';

// Mock room data
const mockRooms = [
  {
    id: '1',
    name: 'Deluxe King Room',
    description: 'Spacious room with king-size bed and city views',
    imageUrl: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    maxOccupancy: 2,
    amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Flat-screen TV', 'Safe'],
    rates: [
      {
        id: 'r1',
        name: 'Flexible Rate',
        price: 250,
        currency: 'USD',
        isRefundable: true,
        includesBreakfast: true,
        paymentType: 'pay_later' as const
      },
      {
        id: 'r2',
        name: 'Non-Refundable',
        price: 225,
        currency: 'USD',
        isRefundable: false,
        includesBreakfast: true,
        paymentType: 'pay_now' as const
      }
    ]
  },
  {
    id: '2',
    name: 'Premium Suite',
    description: 'Luxurious suite with separate living area and panoramic views',
    imageUrl: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    maxOccupancy: 4,
    amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Flat-screen TV', 'Safe', 'Bathtub', 'Living Area'],
    rates: [
      {
        id: 'r3',
        name: 'Suite Special',
        price: 450,
        currency: 'USD',
        isRefundable: true,
        includesBreakfast: true,
        paymentType: 'pay_later' as const
      }
    ]
  },
  {
    id: '3',
    name: 'Executive Twin Room',
    description: 'Modern room with two twin beds, perfect for business travelers',
    imageUrl: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    maxOccupancy: 2,
    amenities: ['Free WiFi', 'Air Conditioning', 'Work Desk', 'Room Service', 'Flat-screen TV', 'Safe'],
    rates: [
      {
        id: 'r4',
        name: 'Business Rate',
        price: 280,
        currency: 'USD',
        isRefundable: true,
        includesBreakfast: true,
        paymentType: 'pay_now' as const
      }
    ]
  }
];

export default function ResultsPage() {
  const router = useRouter();
  const { selectedHotel, checkInDate, checkOutDate, adults, children, rooms, setSelectedRoom } = useBooking();
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!selectedHotel || !checkInDate || !checkOutDate) {
      router.push('/booking');
      return;
    }
    
    checkAvailability();
  }, [selectedHotel, checkInDate, checkOutDate, router]);
  
  const checkAvailability = async () => {
    if (!selectedHotel || !checkInDate || !checkOutDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get hotel slug from the selected hotel
      const hotelSlug = selectedHotel.slug?.current || 
                       (selectedHotel.name === 'Ambassador Jerusalem' ? 'ambassador-jerusalem' : 'ambassador-boutique');
      
      const response = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: hotelSlug,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          adults,
          children: children || 0,
          roomCount: rooms || 1
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableRooms(data.availableRooms);
      } else {
        setError(data.error?.message || 'Failed to check availability');
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      setError('Unable to check availability. Please try again.');
      // Fallback to mock data for demo
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (!selectedHotel || !checkInDate || !checkOutDate) {
    return null;
  }
  
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="min-h-screen bg-gray-50 booking-page-content">
      {/* Mobile Header */}
      <div className="booking-mobile-header md:hidden">
        <button
          onClick={() => router.push('/booking')}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h1 className="text-lg font-serif font-bold">Room Selection</h1>
        <div className="w-8"></div>
      </div>

      <div className="hidden md:block">
        <BookingSteps currentStep={2} />
      </div>
      
      <div className="booking-container py-4 md:py-8">
        <button
          onClick={() => router.push('/booking')}
          className="hidden md:flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Search
        </button>
        
        <div className="booking-grid">
          <div className="booking-form-section">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-serif font-bold mb-2">{selectedHotel.name}</h1>
              <p className="text-gray-600 mb-4">{selectedHotel.location}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Check-in:</span>
                  <span className="ml-2 font-medium">{format(checkInDate, 'MMM d, yyyy')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Check-out:</span>
                  <span className="ml-2 font-medium">{format(checkOutDate, 'MMM d, yyyy')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nights:</span>
                  <span className="ml-2 font-medium">{nights}</span>
                </div>
                <div>
                  <span className="text-gray-500">Guests:</span>
                  <span className="ml-2 font-medium">
                    {adults} Adult{adults > 1 ? 's' : ''}
                    {children > 0 && `, ${children} Child${children > 1 ? 'ren' : ''}`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Rooms</h2>
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <Filter size={18} className="mr-2" />
                Filter
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
                  <p className="text-gray-600">Checking availability...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Check Availability</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button 
                  onClick={checkAvailability}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-900 mb-2">No Rooms Available</h3>
                <p className="text-yellow-700 mb-4">
                  Unfortunately, we don't have any rooms available for your selected dates.
                </p>
                <button 
                  onClick={() => router.push('/booking')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Modify Search
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {availableRooms.map((availableRoom) => {
                  // Defensive checks to ensure data integrity
                  if (!availableRoom || !availableRoom.roomType) {
                    console.warn('Invalid room data:', availableRoom);
                    return null;
                  }
                  
                  return (
                  <div key={availableRoom.roomType.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                      {/* Room Image */}
                      <div className="relative h-48 lg:h-auto">
                        <img
                          src={availableRoom.roomType.images?.[0] || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'}
                          alt={availableRoom.roomType.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Availability warning - can be added later when we track inventory */}
                      </div>
                      
                      {/* Room Details */}
                      <div className="p-6 lg:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
                              {availableRoom.roomType.name}
                            </h3>
                            <p className="text-gray-600 mb-3">{availableRoom.roomType.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span>Max {availableRoom.roomType.maxOccupancy} guests</span>
                              <span>•</span>
                              <span>{availableRoom.roomType.size}m²</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-serif font-light text-gray-900">
                              ${(availableRoom.lowestRate || 0).toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-500">avg per night</div>
                            <div className="text-sm text-gray-600 font-medium">
                              ${(availableRoom.totalPrice || 0).toFixed(0)} total
                            </div>
                          </div>
                        </div>
                        
                        {/* Amenities */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {availableRoom.roomType.amenities.slice(0, 6).map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                            {availableRoom.roomType.amenities.length > 6 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{availableRoom.roomType.amenities.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Rate Plan - Simplified to single rate */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900">Standard Rate</h4>
                              <p className="text-sm text-gray-600">Best available rate for your dates</p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-green-600">✓ Free cancellation</span>
                                <span className="text-green-600">✓ No prepayment</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ${(availableRoom.totalPrice || 0).toFixed(0)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${(availableRoom.lowestRate || 0).toFixed(0)} per night
                              </div>
                              <button 
                                onClick={() => {
                                  // Convert AvailableRoom to Room format for context
                                  const roomForContext = {
                                    id: availableRoom.roomType.id,
                                    name: availableRoom.roomType.name,
                                    description: availableRoom.roomType.description,
                                    imageUrl: availableRoom.roomType.images?.[0] || '',
                                    maxOccupancy: availableRoom.roomType.maxOccupancy,
                                    amenities: availableRoom.roomType.amenities,
                                    rates: [{
                                      id: 'standard',
                                      name: 'Standard Rate',
                                      price: availableRoom.lowestRate || 0,
                                      currency: 'USD',
                                      isRefundable: true,
                                      includesBreakfast: true,
                                      paymentType: 'pay_later' as const
                                    }]
                                  };
                                  setSelectedRoom(roomForContext);
                                  router.push('/booking/guest-info');
                                }}
                                className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                              >
                                Select Room
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                }).filter(Boolean)}
              </div>
            )}
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