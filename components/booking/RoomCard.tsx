'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import { Check, ChevronDown, ChevronUp, Wifi, Coffee, Tv, Wind, Users } from 'lucide-react';
import Image from 'next/image';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    maxOccupancy: number;
    amenities: string[];
    rates: {
      id: string;
      name: string;
      price: number;
      currency: string;
      isRefundable: boolean;
      includesBreakfast: boolean;
      paymentType: 'pay_now' | 'pay_later';
    }[];
  };
  nights: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, nights }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setSelectedRoom, setSelectedRate } = useBooking();
  const router = useRouter();
  
  const { name, description, imageUrl, maxOccupancy, amenities, rates } = room;
  
  // Find the lowest price rate
  const lowestRate = [...rates].sort((a, b) => a.price - b.price)[0];
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleRateSelect = (rate: any) => {
    setSelectedRoom(room);
    setSelectedRate(rate);
    router.push('/booking/guest-info');
  };
  
  // Map amenity names to icons
  const amenityIcons: Record<string, JSX.Element> = {
    'Free WiFi': <Wifi size={16} />,
    'Breakfast Available': <Coffee size={16} />,
    'Smart TV': <Tv size={16} />,
    'Air Conditioning': <Wind size={16} />,
    'Room Service': <Coffee size={16} />,
  };
  
  return (
    <div className="card mb-6 hover:shadow-lg transition-shadow">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <Image 
            src={imageUrl} 
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="md:w-2/3 p-4 md:p-6">
          <h3 className="text-xl font-serif">{name}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mt-1 mb-2">
            <Users size={16} className="mr-1" />
            <span>Max occupancy: {maxOccupancy} {maxOccupancy === 1 ? 'person' : 'people'}</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="inline-flex items-center text-xs bg-gray-100 rounded-full px-3 py-1">
                {amenityIcons[amenity] && <span className="mr-1">{amenityIcons[amenity]}</span>}
                {amenity}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="inline-flex items-center text-xs bg-gray-100 rounded-full px-3 py-1">
                +{amenities.length - 4} more
              </span>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 pt-3 border-t border-gray-100">
            <div>
              <div className="text-sm text-gray-500">From</div>
              <div className="text-xl font-medium text-primary-800">
                {lowestRate.currency === 'USD' ? '$' : lowestRate.currency} {lowestRate.price}
                <span className="text-sm text-gray-500 font-normal"> / night</span>
              </div>
            </div>
            
            <button
              onClick={toggleExpand}
              className="btn-secondary mt-3 md:mt-0"
            >
              {isExpanded ? (
                <>Hide Rates <ChevronUp size={16} className="ml-1" /></>
              ) : (
                <>View Rates <ChevronDown size={16} className="ml-1" /></>
              )}
            </button>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-up">
              <div className="space-y-4">
                {rates.map((rate) => (
                  <div key={rate.id} className="p-3 border rounded-md hover:border-primary-300 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h4 className="font-medium">{rate.name}</h4>
                        <div className="mt-1 space-y-1">
                          {rate.isRefundable ? (
                            <div className="flex items-center text-sm text-success-700">
                              <Check size={16} className="mr-1" />
                              Fully refundable
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Non-refundable</div>
                          )}
                          {rate.includesBreakfast && (
                            <div className="flex items-center text-sm text-gray-700">
                              <Coffee size={16} className="mr-1" />
                              Breakfast included
                            </div>
                          )}
                          <div className="text-sm text-gray-700">
                            {rate.paymentType === 'pay_now' ? 'Pay now' : 'Pay at hotel'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0 md:text-right">
                        <div className="text-lg font-medium text-primary-800">
                          {rate.currency === 'USD' ? '$' : rate.currency} {rate.price}
                          <span className="text-sm text-gray-500 font-normal"> / night</span>
                        </div>
                        <button
                          onClick={() => handleRateSelect(rate)}
                          className="btn-primary w-full md:w-auto mt-2"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
