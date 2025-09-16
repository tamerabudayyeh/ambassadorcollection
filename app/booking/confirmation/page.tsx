'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { CheckCircle, Download, Mail, MapPin, Calendar, Users, CreditCard, Phone, Star, Clock, Shield, Car, Utensils, Wifi, Printer } from 'lucide-react';
import Image from 'next/image';
import { BookingService } from '@/lib/booking-service';

export default function ConfirmationPage() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    bookingReference, 
    selectedHotel, 
    selectedRoom, 
    selectedRate,
    selectedRoomType,
    selectedRatePlan,
    checkInDate,
    checkOutDate,
    adults,
    children,
    rooms,
    guestInfo,
    resetBooking
  } = useBooking();
  
  React.useEffect(() => {
    // Try to get booking ID from session storage (from mock payment flow)
    const confirmedBookingId = sessionStorage.getItem('confirmedBookingId');
    
    if (confirmedBookingId) {
      // Fetch booking details from API
      fetch(`/api/v1/bookings/${confirmedBookingId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            setBookingDetails(data.data);
          }
        })
        .catch(error => {
          console.error('Error fetching booking details:', error);
        })
        .finally(() => {
          setLoading(false);
          // Clear the booking ID from session storage
          sessionStorage.removeItem('confirmedBookingId');
        });
    } else if (!bookingReference) {
      // If no booking reference from context and no booking ID from session, redirect
      setLoading(false);
      router.push('/booking');
    } else {
      setLoading(false);
    }
  }, [bookingReference, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Use booking details from API if available, otherwise fall back to context
  const activeBooking = bookingDetails || {
    confirmationNumber: bookingReference,
    hotelName: selectedHotel?.name,
    roomName: selectedRoom?.name || selectedRoomType?.name,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    totalAmount: 0,
    guestName: guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}` : '',
  };

  if (!activeBooking.confirmationNumber && (!bookingReference || !selectedHotel || !checkInDate || !checkOutDate || !guestInfo)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your booking details.</p>
          <button 
            onClick={() => router.push('/booking')}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Start New Booking
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate nights and other details based on active booking
  const bookingCheckInDate = bookingDetails ? new Date(bookingDetails.checkInDate) : checkInDate;
  const bookingCheckOutDate = bookingDetails ? new Date(bookingDetails.checkOutDate) : checkOutDate;
  const nights = Math.ceil((bookingCheckOutDate!.getTime() - bookingCheckInDate!.getTime()) / (1000 * 60 * 60 * 24));
  
  // Use booking details if available, otherwise fall back to context
  const displayHotel = bookingDetails ? { 
    name: bookingDetails.hotelName,
    location: bookingDetails.hotelLocation || selectedHotel?.location,
    imageUrl: selectedHotel?.imageUrl,
    rating: selectedHotel?.rating
  } : selectedHotel;
  
  const displayGuestInfo = bookingDetails ? {
    firstName: bookingDetails.guestName?.split(' ')[0] || '',
    lastName: bookingDetails.guestName?.split(' ').slice(1).join(' ') || '',
    email: bookingDetails.guestEmail || guestInfo?.email,
    phone: bookingDetails.guestPhone || guestInfo?.phone,
    country: bookingDetails.guestCountry || guestInfo?.country,
    specialRequests: bookingDetails.specialRequests || guestInfo?.specialRequests,
  } : guestInfo;
  
  // Use selectedRatePlan if available, otherwise fall back to selectedRate
  const rate = selectedRatePlan || selectedRate;
  const roomType = selectedRoomType || selectedRoom || { name: bookingDetails?.roomName };
  const roomRate = bookingDetails ? (bookingDetails.totalAmount / nights) : (rate ? (selectedRatePlan ? selectedRatePlan.averageRate : selectedRate?.price || 0) : 0);
  const totalPrice = bookingDetails ? bookingDetails.totalAmount : (rate ? (selectedRatePlan ? selectedRatePlan.totalPrice : (selectedRate?.price || 0) * nights * (rooms || 1)) : 0);
  const taxes = bookingDetails ? (bookingDetails.taxes || 0) : (selectedRatePlan ? selectedRatePlan.totalTaxes : totalPrice * 0.17);
  const fees = bookingDetails ? (bookingDetails.fees || 0) : (selectedRatePlan ? selectedRatePlan.totalFees : nights * (rooms || 1) * 25);
  const displayAdults = bookingDetails?.adults || adults || 2;
  const displayChildren = bookingDetails?.children || children || 0;
  const displayRooms = rooms || 1;
  
  const handleSendConfirmationEmail = async () => {
    const email = displayGuestInfo?.email;
    const confirmationNumber = activeBooking.confirmationNumber;
    
    if (!email || !confirmationNumber) return;
    
    setSendingEmail(true);
    
    try {
      // Use booking ID if available from bookingDetails, otherwise create mock request
      let response;
      
      if (bookingDetails?.id) {
        // Real booking - use the booking ID
        response = await fetch('/api/bookings/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: bookingDetails.id,
            email: email
          })
        });
      } else {
        // Mock booking from context - create mock booking object
        const mockBooking = {
          id: `booking_${Date.now()}`,
          confirmationNumber: confirmationNumber,
          hotelId: selectedHotel?._id || '',
          status: 'confirmed' as const,
          guestFirstName: displayGuestInfo.firstName,
          guestLastName: displayGuestInfo.lastName,
          guestEmail: email,
          guestPhone: displayGuestInfo.phone,
          guestCountry: displayGuestInfo.country,
          specialRequests: displayGuestInfo.specialRequests,
          checkInDate: bookingCheckInDate!,
          checkOutDate: bookingCheckOutDate!,
          adults: displayAdults,
          children: displayChildren,
          roomTypeId: selectedRoomType?.id || selectedRoom?.id || '',
          roomTypeName: roomType?.name || '',
          ratePlanId: selectedRatePlan?.id || selectedRate?.id || '',
          ratePlanName: rate?.name || '',
          roomRate: roomRate,
          numberOfNights: nights,
          roomTotal: roomRate * nights * displayRooms,
          taxes,
          fees,
          totalAmount: totalPrice,
          currency: 'USD',
          paymentStatus: 'paid' as const,
          paymentMethod: 'card' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          bookingSource: 'website' as const,
        };
        
        response = await fetch('/api/bookings/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockBooking)
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to send confirmation email');
      }
      setEmailSent(true);
      
      // Show success message for 3 seconds
      setTimeout(() => setEmailSent(false), 3000);
      
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleNewBooking = () => {
    resetBooking();
    router.push('/booking');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl font-light text-green-100 mb-8">
            Your reservation has been successfully confirmed
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block border border-white/20">
            <p className="text-sm text-green-100 mb-2">Confirmation Number</p>
            <p className="text-3xl font-bold text-white">{activeBooking.confirmationNumber}</p>
            <p className="text-sm text-green-100 mt-2">Please save this number for your records</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Printer className="w-5 h-5" />
              Print Confirmation
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button 
              onClick={handleSendConfirmationEmail}
              disabled={sendingEmail}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-sm ${
                emailSent 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {sendingEmail ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Email Sent!
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Email Confirmation
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Booking Details */}
            <div className="lg:col-span-2 space-y-6">
            
              {/* Hotel Information Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative h-48">
                  <Image 
                    src={displayHotel?.imageUrl || 'https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600'} 
                    alt={displayHotel?.name || 'Hotel'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-serif font-light">{displayHotel?.name}</h2>
                    <div className="flex items-center mt-2">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm">{displayHotel?.location}</span>
                    </div>
                    {displayHotel?.rating && (
                      <div className="flex items-center mt-1">
                        {[...Array(Math.floor(displayHotel.rating))].map((_, i) => (
                          <Star key={i} size={14} className="text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm ml-2">{displayHotel.rating} Star Hotel</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Booking Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-serif font-medium text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-amber-600" />
                  Your Reservation Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Clock className="w-4 h-4 mr-2" />
                        Check-in
                      </div>
                      <p className="font-medium text-lg">{format(bookingCheckInDate!, 'EEEE, MMMM d, yyyy')}</p>
                      <p className="text-sm text-gray-600">From 3:00 PM</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Clock className="w-4 h-4 mr-2" />
                        Check-out
                      </div>
                      <p className="font-medium text-lg">{format(bookingCheckOutDate!, 'EEEE, MMMM d, yyyy')}</p>
                      <p className="text-sm text-gray-600">Until 11:00 AM</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Room Type</p>
                      <p className="font-medium text-lg">{roomType?.name || 'Standard Room'}</p>
                      {(roomType as any)?.description && (
                        <p className="text-sm text-gray-600">{(roomType as any).description}</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Rate Plan</p>
                      <p className="font-medium">{rate?.name || 'Standard Rate'}</p>
                      {rate && 'includesBreakfast' in rate && rate.includesBreakfast && (
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <Utensils className="w-4 h-4 mr-1" />
                          Breakfast included
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {displayAdults} Adult{displayAdults > 1 ? 's' : ''}
                        {displayChildren > 0 && `, ${displayChildren} Child${displayChildren > 1 ? 'ren' : ''}`}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {nights} Night{nights > 1 ? 's' : ''} • {displayRooms} Room{displayRooms > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Guest Information Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-serif font-medium text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-amber-600" />
                  Guest Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Primary Guest</p>
                    <p className="font-medium text-lg">{displayGuestInfo?.firstName} {displayGuestInfo?.lastName}</p>
                    {displayGuestInfo?.country && (
                      <p className="text-sm text-gray-600 mt-1">{displayGuestInfo.country}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail size={16} className="mr-3 text-gray-400" />
                      <span>{displayGuestInfo?.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone size={16} className="mr-3 text-gray-400" />
                      <span>{displayGuestInfo?.phone}</span>
                    </div>
                  </div>
                </div>
                
                {displayGuestInfo?.specialRequests && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-gray-500 text-sm mb-2">Special Requests</p>
                    <p className="text-sm text-gray-700">{displayGuestInfo.specialRequests}</p>
                  </div>
                )}
              </div>
              
            </div>
            
            {/* Sidebar with Summary and Actions */}
            <div className="space-y-6">
              {/* Payment Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-serif font-medium text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-amber-600" />
                  Payment Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Room Rate ({nights} nights)</span>
                    <span className="font-medium">${roomRate.toFixed(0)} × {nights}</span>
                  </div>
                  
                  {displayRooms > 1 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Rooms</span>
                      <span className="font-medium">× {displayRooms}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${(roomRate * nights * displayRooms).toFixed(0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">${(taxes + fees).toFixed(0)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                      <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Payment Confirmed</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">Your payment has been processed successfully</p>
                </div>
              </div>
              
              
              {/* Important Information Card */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                <h3 className="font-medium text-amber-900 mb-3">Important Information</h3>
                <div className="space-y-2 text-sm text-amber-800">
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Check-in: 3:00 PM | Check-out: 11:00 AM</span>
                  </div>
                  <div className="flex items-start">
                    <Car className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Free parking available (subject to availability)</span>
                  </div>
                  <div className="flex items-start">
                    <Wifi className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Complimentary WiFi throughout the hotel</span>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Please bring a valid photo ID for check-in</span>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Need Assistance?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Hotel Reception</p>
                      <p className="text-gray-600">+972-2-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-gray-600">reservations@ambassadorcollection.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                  onClick={handleNewBooking}
                  className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Make Another Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}