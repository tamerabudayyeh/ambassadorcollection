/**
 * Conversion Optimization Component
 * Implements hospitality best practices for booking flow UX
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Star, Shield, Zap, Users, Calendar, CreditCard } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';

interface UrgencyIndicatorProps {
  availableRooms: number;
  totalRooms?: number;
  bookingTrend?: 'high' | 'medium' | 'low';
}

interface SocialProofProps {
  recentBookings?: number;
  averageRating?: number;
  totalReviews?: number;
  currentViewers?: number;
}

interface TrustSignalsProps {
  securePayment?: boolean;
  freeCancellation?: boolean;
  bestPriceGuarantee?: boolean;
  instantConfirmation?: boolean;
}

export function UrgencyIndicator({ availableRooms, totalRooms = 10, bookingTrend = 'medium' }: UrgencyIndicatorProps) {
  const urgencyLevel = availableRooms <= 3 ? 'high' : availableRooms <= 6 ? 'medium' : 'low';
  
  const urgencyMessages = {
    high: `Only ${availableRooms} room${availableRooms !== 1 ? 's' : ''} left!`,
    medium: `${availableRooms} rooms available`,
    low: 'Good availability'
  };

  const urgencyStyles = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-amber-50 border-amber-200 text-amber-800',
    low: 'bg-green-50 border-green-200 text-green-800'
  };

  if (urgencyLevel === 'low') return null; // Don't show for good availability

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium ${urgencyStyles[urgencyLevel]}`}>
      <AlertTriangle className="w-4 h-4 mr-2" />
      {urgencyMessages[urgencyLevel]}
    </div>
  );
}

export function SocialProof({ recentBookings = 0, averageRating = 0, totalReviews = 0, currentViewers = 0 }: SocialProofProps) {
  const [viewerCount, setViewerCount] = useState(currentViewers);

  useEffect(() => {
    // Simulate dynamic viewer count
    const interval = setInterval(() => {
      const variance = Math.random() > 0.5 ? 1 : -1;
      setViewerCount(prev => Math.max(1, prev + variance));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {recentBookings > 0 && (
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2 text-green-600" />
          <span>{recentBookings} people booked this hotel in the last 24 hours</span>
        </div>
      )}
      
      {averageRating > 0 && (
        <div className="flex items-center text-sm text-gray-600">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span>{averageRating.toFixed(1)} ({totalReviews.toLocaleString()} reviews)</span>
        </div>
      )}
      
      {viewerCount > 1 && (
        <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-orange-600 rounded-full mr-2 animate-pulse"></div>
          <span>{viewerCount} other people are viewing this hotel</span>
        </div>
      )}
    </div>
  );
}

export function TrustSignals({ 
  securePayment = true, 
  freeCancellation = true, 
  bestPriceGuarantee = false, 
  instantConfirmation = true 
}: TrustSignalsProps) {
  const signals = [
    {
      show: securePayment,
      icon: Shield,
      text: 'Secure payment',
      subtext: 'SSL encrypted'
    },
    {
      show: freeCancellation,
      icon: Calendar,
      text: 'Free cancellation',
      subtext: 'Cancel up to 24 hours before'
    },
    {
      show: bestPriceGuarantee,
      icon: Star,
      text: 'Best price guarantee',
      subtext: 'We match competitor prices'
    },
    {
      show: instantConfirmation,
      icon: Zap,
      text: 'Instant confirmation',
      subtext: 'Immediate booking receipt'
    }
  ];

  const activeSignals = signals.filter(signal => signal.show);

  return (
    <div className="grid grid-cols-2 gap-3">
      {activeSignals.map((signal, index) => (
        <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
          <signal.icon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-900">{signal.text}</div>
            <div className="text-xs text-gray-500">{signal.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface BookingTimerProps {
  expiresAt?: Date;
  onExpire?: () => void;
}

export function BookingTimer({ expiresAt, onExpire }: BookingTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        onExpire?.();
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!timeRemaining) return null;

  const isUrgent = timeRemaining.minutes < 5;

  return (
    <div className={`flex items-center justify-center p-4 rounded-lg border-2 ${
      isUrgent 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : 'bg-blue-50 border-blue-200 text-blue-700'
    }`}>
      <Clock className="w-5 h-5 mr-2" />
      <div className="text-center">
        <div className="font-semibold">
          {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm">
          {isUrgent ? 'Complete booking now!' : 'Reserved for you'}
        </div>
      </div>
    </div>
  );
}

interface PriceDropAlertProps {
  originalPrice: number;
  currentPrice: number;
  currency: string;
}

export function PriceDropAlert({ originalPrice, currentPrice, currency }: PriceDropAlertProps) {
  const savings = originalPrice - currentPrice;
  const savingsPercentage = Math.round((savings / originalPrice) * 100);

  if (savings <= 0) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">%</span>
          </div>
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-green-800">
            Great news! Price dropped
          </div>
          <div className="text-sm text-green-600">
            Save {currency} {savings.toFixed(2)} ({savingsPercentage}% off)
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function BookingProgress({ currentStep, totalSteps, stepLabels }: BookingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% complete</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between">
        {stepLabels.map((label, index) => (
          <div 
            key={index}
            className={`text-xs ${
              index < currentStep 
                ? 'text-amber-600 font-medium' 
                : index === currentStep 
                ? 'text-gray-900 font-medium'
                : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface MobileOptimizedCTAProps {
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryText: string;
  secondaryText?: string;
  price: string;
  loading?: boolean;
  disabled?: boolean;
}

export function MobileOptimizedCTA({
  onPrimaryAction,
  onSecondaryAction,
  primaryText,
  secondaryText,
  price,
  loading = false,
  disabled = false
}: MobileOptimizedCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-lg font-bold text-gray-900">{price}</div>
        </div>
        {secondaryText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 text-amber-600 text-sm font-medium"
            disabled={loading}
          >
            {secondaryText}
          </button>
        )}
      </div>
      
      <button
        onClick={onPrimaryAction}
        disabled={disabled || loading}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-4 rounded-lg text-lg transition-colors flex items-center justify-center"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          primaryText
        )}
      </button>
    </div>
  );
}

// Main conversion optimizer component that uses all the above
export function ConversionOptimizer() {
  const { selectedRoom, selectedHotel, checkInDate, checkOutDate } = useBooking();
  
  if (!selectedRoom || !selectedHotel) return null;

  return (
    <div className="space-y-4">
      <UrgencyIndicator availableRooms={3} />
      <SocialProof 
        recentBookings={12}
        averageRating={4.5}
        totalReviews={248}
        currentViewers={7}
      />
      <TrustSignals />
    </div>
  );
}