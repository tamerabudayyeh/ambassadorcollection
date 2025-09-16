'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/contexts/BookingContext';
import HotelSelector from '@/components/booking/HotelSelector';
import DateRangePicker from '@/components/booking/DateRangePicker';
import GuestSelector from '@/components/booking/GuestSelector';
import { Search, MapPin, Building2, Star } from 'lucide-react';
import Image from 'next/image';

function BookingPageContent() {
  const { 
    hotels, 
    selectedHotel, 
    checkInDate, 
    checkOutDate,
    adults,
    children,
    setSelectedHotel,
    setDates,
    setGuests
  } = useBooking();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pre-fill form from URL parameters
  useEffect(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');
    const hotelParam = searchParams.get('hotel');
    
    if (checkIn) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = checkOut ? new Date(checkOut) : null;
      setDates(checkInDate, checkOutDate);
    }
    
    if (guestsParam) {
      const guestCount = parseInt(guestsParam);
      setGuests(guestCount, 0, 1); // adults, children, rooms
    }
    
    if (hotelParam) {
      const hotel = hotels.find(h => h.name === hotelParam);
      if (hotel) {
        setSelectedHotel(hotel);
      }
    }
  }, [searchParams, hotels, setDates, setGuests, setSelectedHotel]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedHotel && checkInDate && checkOutDate) {
      router.push('/booking/results');
    } else {
      alert('Please select a hotel, check-in and check-out dates');
    }
  };
  
  return (
    <div className="min-h-screen booking-page-content">
      {/* Mobile Header */}
      <div className="booking-mobile-header md:hidden">
        <h1 className="text-lg font-serif font-bold">Book Your Stay</h1>
      </div>

      {/* Booking Bar */}
      <div className="relative z-20 bg-white shadow-lg border-b">
        <div className="booking-container py-4 md:py-6">
          <h1 className="hidden md:block text-3xl font-serif font-bold text-center mb-6">Book Your Stay</h1>
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
            <div className="booking-search-form grid grid-cols-1 md:grid-cols-3 gap-4 relative" style={{ overflow: 'visible' }}>
              <HotelSelector />
              <DateRangePicker />
              <GuestSelector />
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                className="btn-primary w-full md:w-auto px-8"
                disabled={!selectedHotel || !checkInDate || !checkOutDate}
              >
                <Search size={18} className="mr-2" />
                Search Rooms
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600" 
            alt="Luxury hotel" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/70"></div>
        </div>
        
        <div className="relative z-10 booking-container h-full flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-serif font-bold mb-4">
            Experience Exceptional Luxury
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-2xl">
            Discover our collection of distinguished hotels
          </p>
        </div>
      </section>
      
      {/* Featured Hotels Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">Our Hotels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {hotels.map((hotel) => (
              <Link 
                key={hotel._id} 
                href={`/hotels/${hotel.slug?.current || hotel._id}`}
                className="bg-white rounded-lg shadow-md group hover:-translate-y-1 transition-transform block"
              >
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image 
                    src={hotel.imageUrl || 'https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600'} 
                    alt={hotel.name} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {hotel.rating && (
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center z-10">
                      {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                        <Star key={i} size={14} className="text-yellow-500 fill-current" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-serif font-medium">{hotel.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {hotel.location}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{hotel.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}