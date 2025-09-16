'use client';

import React, { useState } from 'react';
import { Search, Mail, User, Calendar, MapPin, Phone, CreditCard, Clock, AlertCircle, CheckCircle, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { BookingService } from '@/lib/booking-service';

interface BookingDetails {
  id: string;
  confirmationNumber: string;
  hotelId: string;
  hotelName: string;
  status: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomTypeName: string;
  ratePlanName: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paymentStatus: string;
  canModify?: boolean;
  canCancel?: boolean;
  daysUntilCheckIn?: number;
}

export default function ManageBookingPage() {
  const [searchMethod, setSearchMethod] = useState<'confirmation' | 'email'>('confirmation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  const [formData, setFormData] = useState({
    confirmationNumber: '',
    email: '',
    lastName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const lookupData = {
        confirmationNumber: searchMethod === 'confirmation' ? formData.confirmationNumber : undefined,
        email: searchMethod === 'email' ? formData.email : undefined,
        lastName: searchMethod === 'email' ? formData.lastName : undefined,
      };
      
      const response = await BookingService.lookupBooking(lookupData);
      
      if (response.success && response.data?.booking) {
        setBooking(response.data.booking as any);
      } else {
        setError(response.error?.message || 'Booking not found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Unable to search for booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setCancelling(true);
    
    try {
      const response = await BookingService.cancelBooking(booking.id, cancelReason);
      
      if (response.success) {
        setBooking(prev => prev ? { ...prev, status: 'cancelled', canModify: false, canCancel: false } : null);
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        setError(typeof response.error === 'string' ? response.error : (response.error as any)?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setError('Unable to cancel booking. Please try again or contact support.');
    } finally {
      setCancelling(false);
    }
  };

  const getHotelImage = (hotelId: string) => {
    const images = {
      'ambassador-jerusalem': 'https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600',
      'ambassador-boutique': 'https://cdn.sanity.io/images/qr7oyxid/production/11972dd6afb2d611a7426f8d592bd9f385e48245-1920x1281.jpg?rect=106,0,1708,1281&w=800&h=600',
      'ambassador-city': 'https://cdn.sanity.io/images/qr7oyxid/production/6c2eb363c8fedc676fcf4318983aa395d11d7bd3-1024x683.jpg?rect=57,0,911,683&w=800&h=600',
      'ambassador-city-hotel': 'https://cdn.sanity.io/images/qr7oyxid/production/6c2eb363c8fedc676fcf4318983aa395d11d7bd3-1024x683.jpg?rect=57,0,911,683&w=800&h=600',
      'ambassador-comfort': 'https://cdn.sanity.io/images/qr7oyxid/production/6854c851288c6847d988d22f4ad849b6bbb6ee92-1024x683.jpg?rect=57,0,911,683&w=800&h=600',
    };
    return images[hotelId as keyof typeof images] || 'https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-light text-gray-900 mb-4">
              Manage Your Booking
            </h1>
            <p className="text-lg text-gray-600">
              View, modify, or cancel your reservation
            </p>
          </div>

          {!booking ? (
            /* Search Form */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 text-center">
                  Find Your Booking
                </h2>
                
                {/* Search Method Toggle */}
                <div className="flex rounded-lg border border-gray-300 mb-6">
                  <button
                    onClick={() => setSearchMethod('confirmation')}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-l-lg transition-colors ${
                      searchMethod === 'confirmation'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Confirmation Number
                  </button>
                  <button
                    onClick={() => setSearchMethod('email')}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-r-lg transition-colors ${
                      searchMethod === 'email'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Email & Last Name
                  </button>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  {searchMethod === 'confirmation' ? (
                    <div>
                      <label htmlFor="confirmationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmation Number
                      </label>
                      <input
                        type="text"
                        id="confirmationNumber"
                        name="confirmationNumber"
                        value={formData.confirmationNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        placeholder="e.g., AB123456"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-800">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Find Booking
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Booking Details */
            <div className="space-y-6">
              {/* Header with actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
                      Booking Details
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-medium text-gray-900">
                        {booking.confirmationNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setBooking(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Search className="w-4 h-4 mr-2 inline" />
                      New Search
                    </button>
                    {booking.canModify && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Edit className="w-4 h-4 mr-2 inline" />
                        Modify
                      </button>
                    )}
                    {booking.canCancel && (
                      <button 
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2 inline" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main booking details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Hotel Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={getHotelImage(booking.hotelId)}
                        alt={booking.hotelName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-serif font-medium">{booking.hotelName}</h3>
                        <div className="flex items-center mt-1">
                          <MapPin size={16} className="mr-2" />
                          <span className="text-sm">Jerusalem, Israel</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stay Details */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                      Stay Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <Clock className="w-4 h-4 mr-2" />
                          Check-in
                        </div>
                        <p className="font-medium text-lg">{format(new Date(booking.checkInDate), 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-sm text-gray-600">From 3:00 PM</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <Clock className="w-4 h-4 mr-2" />
                          Check-out
                        </div>
                        <p className="font-medium text-lg">{format(new Date(booking.checkOutDate), 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-sm text-gray-600">Until 11:00 AM</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Room Type</p>
                        <p className="font-medium">{booking.roomTypeName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Rate Plan</p>
                        <p className="font-medium">{booking.ratePlanName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Guests</p>
                        <p className="font-medium">
                          {booking.adults} Adult{booking.adults > 1 ? 's' : ''}
                          {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Total Cost</p>
                        <p className="font-bold text-lg text-gray-900">${booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-amber-600" />
                      Guest Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Primary Guest</p>
                        <p className="font-medium text-lg">{booking.guestFirstName} {booking.guestLastName}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Mail size={16} className="mr-3 text-gray-400" />
                          <span>{booking.guestEmail}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone size={16} className="mr-3 text-gray-400" />
                          <span>{booking.guestPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Booking Status</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium text-sm">Booking Confirmed</p>
                          <p className="text-xs text-gray-600">Payment processed</p>
                        </div>
                      </div>
                      
                      {booking.daysUntilCheckIn !== undefined && booking.daysUntilCheckIn > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">
                            {booking.daysUntilCheckIn} days until check-in
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
                    
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm">
                        Email Confirmation
                      </button>
                      <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Print Confirmation
                      </button>
                      <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Add to Calendar
                      </button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Need Help?</h3>
                    
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
                          <p className="text-gray-600">support@ambassadorcollection.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Booking</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Please let us know why you're cancelling..."
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Cancellation Policy</p>
                    <p>Cancellations must be made at least 24 hours before check-in. No refund fees may apply based on your rate plan.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}