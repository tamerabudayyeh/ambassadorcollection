'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import { User, Mail, Phone, MapPin, MessageSquare, AlertCircle, Check } from 'lucide-react';

interface GuestFormProps {
  onSubmit?: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ onSubmit }) => {
  const { guestInfo, setGuestInfo } = useBooking();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: guestInfo?.firstName || '',
    lastName: guestInfo?.lastName || '',
    email: guestInfo?.email || '',
    phone: guestInfo?.phone || '',
    country: guestInfo?.country || '',
    city: guestInfo?.city || '',
    address: guestInfo?.address || '',
    postalCode: guestInfo?.postalCode || '',
    specialRequests: guestInfo?.specialRequests || '',
    estimatedArrivalTime: '',
    marketingOptIn: false,
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name contains invalid characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name contains invalid characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    // Optional field validation
    if (formData.postalCode && !/^[a-zA-Z0-9\s-]{2,12}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid postal code format';
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setGuestInfo(formData);
      
      if (onSubmit) {
        onSubmit();
      } else {
        router.push('/booking/payment');
      }
    }
  };
  
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
    'Italy', 'Spain', 'Netherlands', 'Israel', 'Palestine', 'Jordan', 'Egypt',
    'Other'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">Guest Information</h2>
        <p className="text-gray-600 font-light">Please provide your details for the reservation</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <User className="inline w-5 h-5 mr-2 text-amber-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <Mail className="inline w-5 h-5 mr-2 text-amber-600" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <MapPin className="inline w-5 h-5 mr-2 text-amber-600" />
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country*
              </label>
              <select
                id="country"
                name="country"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.country}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="12345"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.postalCode}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <MessageSquare className="inline w-5 h-5 mr-2 text-amber-600" />
            Additional Information
          </h3>
          
          <div className="form-group">
            <label htmlFor="estimatedArrivalTime" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Arrival Time
            </label>
            <select
              id="estimatedArrivalTime"
              name="estimatedArrivalTime"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              value={formData.estimatedArrivalTime}
              onChange={handleChange}
            >
              <option value="">Select arrival time (optional)</option>
              <option value="morning">Morning (6:00 AM - 12:00 PM)</option>
              <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
              <option value="evening">Evening (6:00 PM - 10:00 PM)</option>
              <option value="late">Late (After 10:00 PM)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests or dietary restrictions..."
            />
            <p className="text-sm text-gray-500 mt-1">We'll do our best to accommodate your requests (subject to availability)</p>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="marketingOptIn"
                  name="marketingOptIn"
                  className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  checked={formData.marketingOptIn}
                  onChange={handleChange}
                />
                <label htmlFor="marketingOptIn" className="ml-3 text-sm text-gray-700">
                  I would like to receive special offers and updates from Ambassador Collection
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  className={`mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded ${
                    errors.termsAccepted ? 'border-red-500' : ''
                  }`}
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                <label htmlFor="termsAccepted" className="ml-3 text-sm text-gray-700">
                  I accept the <a href="#" className="text-amber-600 hover:text-amber-700 underline">Terms and Conditions</a> and <a href="#" className="text-amber-600 hover:text-amber-700 underline">Privacy Policy</a>*
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-600 flex items-center ml-7">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.termsAccepted}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Room Selection
          </button>
          
          <button 
            type="submit" 
            className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center"
          >
            Continue to Payment
            <Check className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestForm;
