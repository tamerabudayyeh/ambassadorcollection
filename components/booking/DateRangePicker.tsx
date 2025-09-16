'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DateRange {
  from?: Date;
  to?: Date;
}

const DateRangePicker: React.FC = () => {
  const { checkInDate, checkOutDate, setDates } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: checkInDate || undefined,
    to: checkOutDate || undefined,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Update internal state when context changes
  useEffect(() => {
    setRange({
      from: checkInDate || undefined,
      to: checkOutDate || undefined,
    });
  }, [checkInDate, checkOutDate]);
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    
    // Update context immediately
    setDates(selectedRange?.from || null, selectedRange?.to || null);
    
    // Close picker when both dates are selected
    if (selectedRange?.from && selectedRange?.to) {
      setTimeout(() => {
        setIsOpen(false);
      }, 300); // Small delay for better UX
    }
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  
  const handleClear = () => {
    setRange(undefined);
    setDates(null, null);
  };

  const displayText = () => {
    if (range?.from && range?.to) {
      return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`;
    } else if (range?.from) {
      return `${format(range.from, 'MMM d, yyyy')} - Select checkout`;
    } else {
      return 'Select dates';
    }
  };
  
  const numberOfNights = () => {
    if (range?.from && range?.to) {
      const diffTime = range.to.getTime() - range.from.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const today = new Date();

  return (
    <div 
      ref={containerRef} 
      className="relative date-picker-container" 
      data-testid="date-range-picker" 
      style={{ 
        zIndex: isOpen ? 9999 : 'auto',
        isolation: isOpen ? 'isolate' : 'auto'
      }}
    >
      <label htmlFor="dateRange" className="label">Check-in / Check-out</label>
      <div className="relative">
        {/* Custom input that triggers the date picker */}
        <input
          id="dateRange"
          type="text"
          className="input pl-10 pr-10 py-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
          placeholder="Select dates"
          value={displayText()}
          onClick={handleInputClick}
          readOnly
          autoComplete="off"
          role="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Select check-in and check-out dates"
        />
        <Calendar 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={18} 
          aria-hidden="true"
        />
        {range?.from && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Clear dates"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Nights indicator */}
      {range?.from && range?.to && (
        <div className="text-xs text-gray-500 mt-1 ml-1">
          {numberOfNights()} night{numberOfNights() !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* React Day Picker */}
      {isOpen && (
        <>
          {/* Desktop: Dropdown */}
          {!isMobile && (
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-[9999] desktop-datepicker-dropdown bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-visible min-w-[650px] backdrop-blur-sm"
              style={{ isolation: 'isolate' }}
            >
              <div className="ambassador-datepicker p-6">
                <DayPicker
                  mode="range"
                  defaultMonth={range?.from}
                  selected={range as any}
                  onSelect={handleRangeSelect}
                  disabled={{ before: today }}
                  numberOfMonths={2}
                  className="rdp-custom"
                  classNames={{
                    months: "rdp-months flex gap-6",
                    month: "rdp-month",
                    caption: "rdp-caption flex justify-center items-center h-10 mb-4 relative",
                    caption_label: "rdp-caption_label text-lg font-semibold text-gray-800",
                    nav: "rdp-nav flex items-center",
                    nav_button: "rdp-nav_button w-8 h-8 rounded-full flex items-center justify-center hover:bg-amber-50 transition-all duration-200",
                    nav_button_previous: "rdp-nav_button_previous absolute left-2",
                    nav_button_next: "rdp-nav_button_next absolute right-2",
                    table: "rdp-table w-full border-collapse",
                    head_row: "rdp-head_row",
                    head_cell: "rdp-head_cell w-10 h-10 text-center text-sm font-semibold text-gray-600 pb-2",
                    row: "rdp-row",
                    cell: "rdp-cell w-10 h-10 text-center relative",
                    day: "rdp-day w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-amber-50 hover:shadow-sm",
                    day_range_start: "rdp-day_range_start",
                    day_range_end: "rdp-day_range_end",
                    day_selected: "rdp-day_selected bg-amber-600 text-white font-semibold shadow-lg",
                    day_today: "rdp-day_today font-bold border-2 border-amber-600 text-amber-600",
                    day_outside: "rdp-day_outside text-gray-300",
                    day_disabled: "rdp-day_disabled text-gray-200 cursor-not-allowed",
                    day_range_middle: "rdp-day_range_middle bg-amber-50 text-amber-800",
                    day_hidden: "rdp-day_hidden invisible",
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Mobile: Full screen overlay */}
          {isMobile && (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Select Dates</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Close date picker"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              {/* Date display */}
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                <div className="text-sm text-amber-800">
                  {range?.from && range?.to 
                    ? `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')} • ${numberOfNights()} night${numberOfNights() !== 1 ? 's' : ''}` 
                    : range?.from 
                    ? `${format(range.from, 'MMM d, yyyy')} - Select checkout`
                    : 'Select your stay dates'
                  }
                </div>
              </div>
              
              {/* Calendar */}
              <div className="flex-1 overflow-auto p-4 booking-date-picker">
                <div className="ambassador-datepicker max-w-sm mx-auto">
                  <DayPicker
                    mode="range"
                    defaultMonth={range?.from}
                    selected={range as any}
                    onSelect={handleRangeSelect}
                    disabled={{ before: today }}
                    numberOfMonths={1}
                    className="rdp-custom"
                    classNames={{
                      months: "rdp-months",
                      month: "rdp-month mb-6",
                      caption: "rdp-caption flex justify-center items-center h-12 mb-4 relative",
                      caption_label: "rdp-caption_label text-xl font-bold text-gray-800",
                      nav: "rdp-nav flex items-center",
                      nav_button: "rdp-nav_button w-10 h-10 rounded-full flex items-center justify-center hover:bg-amber-50 transition-all duration-200",
                      nav_button_previous: "rdp-nav_button_previous absolute left-2",
                      nav_button_next: "rdp-nav_button_next absolute right-2",
                      table: "rdp-table w-full border-collapse",
                      head_row: "rdp-head_row mb-2",
                      head_cell: "rdp-head_cell w-12 h-12 text-center text-sm font-bold text-gray-600",
                      row: "rdp-row",
                      cell: "rdp-cell w-12 h-12 text-center relative p-1",
                      day: "rdp-day w-full h-full rounded-xl flex items-center justify-center text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-amber-50 hover:shadow-md active:scale-95",
                      day_range_start: "rdp-day_range_start",
                      day_range_end: "rdp-day_range_end",
                      day_selected: "rdp-day_selected bg-amber-600 text-white font-bold shadow-lg",
                      day_today: "rdp-day_today font-bold border-2 border-amber-600 text-amber-600",
                      day_outside: "rdp-day_outside text-gray-300",
                      day_disabled: "rdp-day_disabled text-gray-200 cursor-not-allowed opacity-50",
                      day_range_middle: "rdp-day_range_middle bg-amber-50 text-amber-800 font-semibold",
                      day_hidden: "rdp-day_hidden invisible",
                    }}
                  />
                </div>
              </div>
              
              {/* Footer with action buttons */}
              <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                {range?.from && (
                  <button
                    onClick={handleClear}
                    className="w-full py-3 px-4 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium transition-all duration-200 border border-amber-200"
                  >
                    Clear Dates
                  </button>
                )}
                <button
                  onClick={handleClose}
                  disabled={!range?.from || !range?.to}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg"
                >
                  {range?.from && range?.to ? 'Confirm Dates' : 'Select Check-out Date'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Desktop overlay - subtle backdrop */}
      {isOpen && !isMobile && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-sm" 
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DateRangePicker;