'use client';

import React, { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Users, Plus, Minus, ChevronDown } from 'lucide-react';

const GuestSelector: React.FC = () => {
  const { adults, children, rooms, setGuests } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);
  const [localRooms, setLocalRooms] = useState(rooms);
  
  useEffect(() => {
    setLocalAdults(adults);
    setLocalChildren(children);
    setLocalRooms(rooms);
  }, [adults, children, rooms]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.guest-selector-container')) {
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const applyChanges = () => {
    setGuests(localAdults, localChildren, localRooms);
    setIsOpen(false);
  };
  
  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, max: number) => {
    if (value < max) {
      setter(value + 1);
    }
  };
  
  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number) => {
    if (value > min) {
      setter(value - 1);
    }
  };
  
  // Generate display text for the input
  const displayText = () => {
    const adultText = `${adults} ${adults === 1 ? 'Adult' : 'Adults'}`;
    const childrenText = children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : '';
    const roomText = `, ${rooms} ${rooms === 1 ? 'Room' : 'Rooms'}`;
    return `${adultText}${childrenText}${roomText}`;
  };
  
  return (
    <div className="relative guest-selector-container">
      <label htmlFor="guests" className="label">Guests & Rooms</label>
      <div className="relative">
        <input
          id="guests"
          type="text"
          className="input pl-10 pr-8 py-3"
          placeholder="Add guests"
          value={displayText()}
          onClick={toggleDropdown}
          readOnly
        />
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <ChevronDown 
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={18} 
        />
      </div>
      
      {isOpen && (
        <div className="fixed left-0 right-0 md:absolute z-[90] mt-1 w-full bg-white shadow-lg rounded-md animate-fade-in" style={{ isolation: 'isolate' }}>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Adults</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    onClick={() => handleDecrement(setLocalAdults, localAdults, 1)}
                    disabled={localAdults <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="mx-4 min-w-8 text-center">{localAdults}</span>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    onClick={() => handleIncrement(setLocalAdults, localAdults, 10)}
                    disabled={localAdults >= 10}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Ages 13+</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Children</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    onClick={() => handleDecrement(setLocalChildren, localChildren, 0)}
                    disabled={localChildren <= 0}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="mx-4 min-w-8 text-center">{localChildren}</span>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    onClick={() => handleIncrement(setLocalChildren, localChildren, 6)}
                    disabled={localChildren >= 6}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Ages 0-12</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Rooms</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    onClick={() => handleDecrement(setLocalRooms, localRooms, 1)}
                    disabled={localRooms <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="mx-4 min-w-8 text-center">{localRooms}</span>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    onClick={() => handleIncrement(setLocalRooms, localRooms, 5)}
                    disabled={localRooms >= 5}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={applyChanges}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestSelector;
