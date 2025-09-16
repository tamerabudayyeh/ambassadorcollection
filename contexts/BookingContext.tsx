'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { RoomType, RatePlanWithPricing } from '@/lib/booking-types';
import { SupportedCurrency } from '@/lib/stripe/config';

interface Hotel {
  _id: string;
  name: string;
  slug?: { current: string };
  location: string;
  description: string;
  image?: any;
  imageUrl?: string;
  rating?: number;
  featured?: boolean;
  order?: number;
}

interface Room {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  maxOccupancy: number;
  amenities: string[];
  rates: Rate[];
}

interface Rate {
  id: string;
  name: string;
  price: number;
  currency: string;
  isRefundable: boolean;
  includesBreakfast: boolean;
  paymentType: 'pay_now' | 'pay_later';
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  address?: string;
  postalCode?: string;
  specialRequests?: string;
  estimatedArrivalTime?: string;
  marketingOptIn?: boolean;
  termsAccepted?: boolean;
}

interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

interface BookingContextType {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  adults: number;
  children: number;
  rooms: number;
  selectedRoom: Room | null;
  selectedRate: Rate | null;
  selectedRoomType: RoomType | null;
  selectedRatePlan: RatePlanWithPricing | null;
  guestInfo: GuestInfo | null;
  paymentInfo: PaymentInfo | null;
  bookingReference: string | null;
  selectedCurrency: SupportedCurrency;
  exchangeRates: Record<SupportedCurrency, number>;
  dateRange: { from: Date | undefined; to: Date | undefined } | undefined;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setDates: (checkIn: Date | null, checkOut: Date | null) => void;
  setGuests: (adults: number, children: number, rooms: number) => void;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedRate: (rate: Rate | null) => void;
  setSelectedRoomType: (roomType: RoomType | null) => void;
  setSelectedRatePlan: (ratePlan: RatePlanWithPricing | null) => void;
  setGuestInfo: (info: GuestInfo | null) => void;
  setPaymentInfo: (info: PaymentInfo | null) => void;
  setBookingReference: (reference: string | null) => void;
  setSelectedCurrency: (currency: SupportedCurrency) => void;
  setDateRange: (range: { from: Date | undefined; to: Date | undefined } | undefined) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Fetch hotels from the API to match website hotels
const fetchHotels = async (): Promise<Hotel[]> => {
  try {
    const response = await fetch('/api/hotels');
    const data = await response.json();
    
    if (data.success && data.hotels) {
      // Convert API hotel format to BookingContext format
      return data.hotels.map((hotel: any) => ({
        _id: hotel.id,
        name: hotel.name,
        slug: { current: hotel.slug },
        location: hotel.location,
        description: hotel.description,
        imageUrl: hotel.image_url,
        rating: hotel.rating
      }));
    }
  } catch (error) {
    console.error('Failed to fetch hotels from API:', error);
  }
  
  // Fallback to all 4 hotels if API fails
  return [
    {
      _id: 'a1111111-1111-1111-1111-111111111111',
      name: 'Ambassador Jerusalem',
      location: 'Jerusalem, Israel',
      description: 'A luxury hotel in the heart of Jerusalem, offering stunning city views and world-class amenities.',
      imageUrl: 'https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600',
      rating: 5,
      slug: { current: 'ambassador-jerusalem' }
    },
    {
      _id: 'a2222222-2222-2222-2222-222222222222',
      name: 'Ambassador Boutique',
      location: 'Jerusalem, Israel',
      description: 'An intimate boutique hotel offering personalized luxury and exceptional service.',
      imageUrl: 'https://cdn.sanity.io/images/qr7oyxid/production/11972dd6afb2d611a7426f8d592bd9f385e48245-1920x1281.jpg?rect=106,0,1708,1281&w=800&h=600',
      rating: 5,
      slug: { current: 'ambassador-boutique' }
    },
    {
      _id: 'a3333333-3333-3333-3333-333333333333',
      name: 'Ambassador City Hotel',
      location: 'Bethlehem',
      description: 'Located at the entrance of historical Star Street, Ambassador City has modern rooms and a rooftop restaurant with views of Bethlehem and Jerusalem.',
      imageUrl: 'https://cdn.sanity.io/images/qr7oyxid/production/6c2eb363c8fedc676fcf4318983aa395d11d7bd3-1024x683.jpg?rect=57,0,911,683&w=800&h=600',
      rating: 4.5,
      slug: { current: 'ambassador-city' }
    },
    {
      _id: 'a4444444-4444-4444-4444-444444444444',
      name: 'Ambassador Comfort',
      location: 'East Jerusalem',
      description: 'One of the oldest hotels in East Jerusalem, newly renovated. Located a short walk from the Old City, with balconies overlooking Mount Scopus.',
      imageUrl: 'https://cdn.sanity.io/images/qr7oyxid/production/6854c851288c6847d988d22f4ad849b6bbb6ee92-1024x683.jpg?rect=57,0,911,683&w=800&h=600',
      rating: 5,
      slug: { current: 'ambassador-comfort' }
    }
  ];
};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children: childrenProp }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlanWithPricing | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number>>({
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.75,
    CAD: 1.35,
    AUD: 1.45,
  });
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>();
  
  // Load hotels from CMS on mount
  useEffect(() => {
    const loadHotels = async () => {
      const fetchedHotels = await fetchHotels();
      setHotels(fetchedHotels);
    };
    
    loadHotels();
  }, []);

  const setDates = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  }, []);

  const setGuests = useCallback((a: number, c: number, r: number) => {
    setAdults(a);
    setChildren(c);
    setRooms(r);
  }, []);

  const resetBooking = useCallback(() => {
    setSelectedHotel(null);
    setCheckInDate(null);
    setCheckOutDate(null);
    setAdults(2);
    setChildren(0);
    setRooms(1);
    setSelectedRoom(null);
    setSelectedRate(null);
    setSelectedRoomType(null);
    setSelectedRatePlan(null);
    setGuestInfo(null);
    setPaymentInfo(null);
    setBookingReference(null);
    setSelectedCurrency('USD');
    setDateRange(undefined);
  }, []);

  const value = {
    hotels,
    selectedHotel,
    checkInDate,
    checkOutDate,
    adults,
    children,
    rooms,
    selectedRoom,
    selectedRate,
    selectedRoomType,
    selectedRatePlan,
    guestInfo,
    paymentInfo,
    bookingReference,
    selectedCurrency,
    exchangeRates,
    dateRange,
    setSelectedHotel,
    setDates,
    setGuests,
    setSelectedRoom,
    setSelectedRate,
    setSelectedRoomType,
    setSelectedRatePlan,
    setGuestInfo,
    setPaymentInfo,
    setBookingReference,
    setSelectedCurrency,
    setDateRange,
    resetBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {childrenProp}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};