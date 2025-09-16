'use client';

import React, { useState } from 'react';
import { emailService, BookingEmailData } from '@/lib/email/email-service';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailTestPage() {
  const [emailType, setEmailType] = useState<'booking_confirmation' | 'payment_confirmation' | 'payment_failed'>('booking_confirmation');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const mockBookingData: BookingEmailData = {
    bookingReference: 'AMB-TEST123',
    guestName: 'John Doe',
    guestEmail: testEmail,
    hotelName: 'Ambassador Jerusalem',
    hotelLocation: 'Jerusalem, Israel', 
    hotelPhone: '+972-2-123-4567',
    roomType: 'Deluxe Suite',
    ratePlan: 'Bed & Breakfast',
    checkInDate: 'Friday, December 22, 2024',
    checkOutDate: 'Sunday, December 24, 2024',
    nights: 2,
    adults: 2,
    children: 1,
    totalAmount: 580.00,
    depositAmount: 174.00,
    balanceAmount: 406.00,
    currency: 'USD',
    specialRequests: 'Late check-in, extra towels',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
  };

  const handleSendTestEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      const updatedData = { ...mockBookingData, guestEmail: testEmail };
      let success = false;

      switch (emailType) {
        case 'booking_confirmation':
          success = await emailService.sendBookingConfirmation(updatedData);
          break;
        case 'payment_confirmation':
          success = await emailService.sendPaymentConfirmation(updatedData);
          break;
        case 'payment_failed':
          success = await emailService.sendPaymentFailed(updatedData);
          break;
      }

      setResult({
        success,
        message: success 
          ? `${emailType.replace('_', ' ')} email sent successfully!`
          : 'Failed to send email. Check console for details.'
      });
    } catch (error) {
      console.error('Email test error:', error);
      setResult({
        success: false,
        message: 'Error sending email: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-light text-gray-900 mb-2">
              Email System Testing
            </h1>
            <p className="text-gray-600">
              Test the Ambassador Collection email templates and delivery system
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Configuration */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="booking_confirmation">Booking Confirmation</option>
                  <option value="payment_confirmation">Payment Confirmation</option>
                  <option value="payment_failed">Payment Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="your-email@example.com"
                />
              </div>

              <button
                onClick={handleSendTestEmail}
                disabled={loading || !testEmail}
                className="w-full flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Test Email
                  </>
                )}
              </button>

              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    <span className="font-medium">{result.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mock Data Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Mock Booking Data
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{mockBookingData.bookingReference}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Guest:</span>
                  <span className="font-medium">{mockBookingData.guestName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Hotel:</span>
                  <span className="font-medium">{mockBookingData.hotelName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{mockBookingData.roomType}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-medium">{mockBookingData.checkInDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">to:</span>
                  <span className="font-medium">{mockBookingData.checkOutDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">${mockBookingData.totalAmount} {mockBookingData.currency}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-medium">${mockBookingData.depositAmount} {mockBookingData.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Development Notes
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Currently using console.log for email delivery (development mode)</li>
              <li>• To enable real emails, configure an email provider in lib/email/email-service.ts</li>
              <li>• Supported providers: Resend, SendGrid, AWS SES, Mailgun</li>
              <li>• Templates are stored in the database and can be customized</li>
              <li>• Email tracking is logged in the bookings table</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}