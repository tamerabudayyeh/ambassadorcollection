-- Enhanced Email Templates for Ambassador Collection
-- Run this SQL in your Supabase dashboard to update email templates

-- Delete existing templates to update them
DELETE FROM email_templates WHERE template_name IN (
  'booking_confirmation',
  'payment_confirmation', 
  'payment_failed',
  'booking_modification',
  'booking_cancellation',
  'refund_processed',
  'pre_arrival',
  'post_checkout'
);

-- Booking Confirmation Template
INSERT INTO email_templates (template_name, subject, body_html, body_text, variables) VALUES (
  'booking_confirmation',
  'Booking Confirmed - Ambassador Collection {{booking_reference}}',
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; background: #ffffff; }
      .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
      .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
      .btn { background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🏨 Ambassador Collection</h1>
        <h2>Booking Confirmed!</h2>
        <p>Reference: {{booking_reference}}</p>
      </div>
      
      <div class="content">
        <p>Dear {{guest_name}},</p>
        
        <p>Thank you for choosing Ambassador Collection! Your reservation has been confirmed.</p>
        
        <div class="booking-details">
          <h3>📋 Booking Details</h3>
          <div class="detail-row">
            <strong>Hotel:</strong>
            <span>{{hotel_name}}</span>
          </div>
          <div class="detail-row">
            <strong>Location:</strong>
            <span>{{hotel_location}}</span>
          </div>
          <div class="detail-row">
            <strong>Room Type:</strong>
            <span>{{room_type}}</span>
          </div>
          <div class="detail-row">
            <strong>Rate Plan:</strong>
            <span>{{rate_plan}}</span>
          </div>
        </div>
        
        <div class="booking-details">
          <h3>📅 Stay Details</h3>
          <div class="detail-row">
            <strong>Check-in:</strong>
            <span>{{check_in_date}} (from 3:00 PM)</span>
          </div>
          <div class="detail-row">
            <strong>Check-out:</strong>
            <span>{{check_out_date}} (until 11:00 AM)</span>
          </div>
          <div class="detail-row">
            <strong>Nights:</strong>
            <span>{{nights}}</span>
          </div>
          <div class="detail-row">
            <strong>Guests:</strong>
            <span>{{adults}} Adult(s), {{children}} Children</span>
          </div>
        </div>
        
        <div class="booking-details">
          <h3>💰 Payment Summary</h3>
          <div class="detail-row">
            <strong>Total Amount:</strong>
            <span>{{total_amount}}</span>
          </div>
          <div class="detail-row">
            <strong>Deposit Paid:</strong>
            <span>{{deposit_amount}}</span>
          </div>
          <div class="detail-row">
            <strong>Balance at Check-in:</strong>
            <span>{{balance_amount}}</span>
          </div>
        </div>
        
        <div class="booking-details">
          <h3>📝 Important Information</h3>
          <ul>
            <li>Please bring a valid photo ID for check-in</li>
            <li>Free WiFi throughout the hotel</li>
            <li>Complimentary parking (subject to availability)</li>
            <li>24/7 front desk service</li>
          </ul>
          
          <p><strong>Special Requests:</strong> {{special_requests}}</p>
          <p><strong>Cancellation Policy:</strong> {{cancellation_policy}}</p>
        </div>
        
        <p>We look forward to welcoming you to Ambassador Collection!</p>
        
        <a href="tel:{{hotel_phone}}" class="btn">Contact Hotel: {{hotel_phone}}</a>
      </div>
      
      <div class="footer">
        <p>Ambassador Collection | {{hotel_location}}</p>
        <p>Email: reservations@ambassadorcollection.com | Phone: {{hotel_phone}}</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>',
  'BOOKING CONFIRMED - Ambassador Collection

Dear {{guest_name}},

Thank you for choosing Ambassador Collection! Your reservation has been confirmed.

Booking Reference: {{booking_reference}}

HOTEL DETAILS:
- Hotel: {{hotel_name}}
- Location: {{hotel_location}}
- Room Type: {{room_type}}
- Rate Plan: {{rate_plan}}

STAY DETAILS:
- Check-in: {{check_in_date}} (from 3:00 PM)
- Check-out: {{check_out_date}} (until 11:00 AM)
- Nights: {{nights}}
- Guests: {{adults}} Adult(s), {{children}} Children

PAYMENT SUMMARY:
- Total Amount: {{total_amount}}
- Deposit Paid: {{deposit_amount}}
- Balance at Check-in: {{balance_amount}}

IMPORTANT INFORMATION:
- Please bring a valid photo ID for check-in
- Free WiFi throughout the hotel
- Complimentary parking (subject to availability)
- 24/7 front desk service

Special Requests: {{special_requests}}
Cancellation Policy: {{cancellation_policy}}

Contact Hotel: {{hotel_phone}}

We look forward to welcoming you to Ambassador Collection!

Ambassador Collection | {{hotel_location}}
Email: reservations@ambassadorcollection.com
Phone: {{hotel_phone}}',
  '{"guest_name": "string", "booking_reference": "string", "hotel_name": "string", "hotel_location": "string", "hotel_phone": "string", "room_type": "string", "rate_plan": "string", "check_in_date": "date", "check_out_date": "date", "nights": "number", "adults": "number", "children": "number", "total_amount": "string", "deposit_amount": "string", "balance_amount": "string", "special_requests": "string", "cancellation_policy": "string"}'::jsonb
);

-- Payment Confirmation Template
INSERT INTO email_templates (template_name, subject, body_html, body_text, variables) VALUES (
  'payment_confirmation',
  'Payment Confirmed - Ambassador Collection {{booking_reference}}',
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; background: #ffffff; }
      .payment-success { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
      .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>✅ Payment Confirmed</h1>
        <p>Ambassador Collection</p>
      </div>
      
      <div class="content">
        <p>Dear {{guest_name}},</p>
        
        <div class="payment-success">
          <h2>💳 Payment Successfully Processed</h2>
          <p><strong>Amount: {{amount}} {{currency}}</strong></p>
          <p>Booking Reference: {{booking_reference}}</p>
        </div>
        
        <p>Your payment has been successfully processed for your upcoming stay at {{hotel_name}}.</p>
        
        <h3>Booking Summary:</h3>
        <ul>
          <li><strong>Check-in:</strong> {{check_in_date}}</li>
          <li><strong>Check-out:</strong> {{check_out_date}}</li>
          <li><strong>Hotel:</strong> {{hotel_name}}</li>
        </ul>
        
        <p>You will receive a separate booking confirmation email with complete details.</p>
        
        <p>Thank you for choosing Ambassador Collection!</p>
      </div>
      
      <div class="footer">
        <p>Ambassador Collection</p>
        <p>This payment confirmation serves as your receipt.</p>
      </div>
    </div>
  </body>
  </html>',
  'PAYMENT CONFIRMED - Ambassador Collection

Dear {{guest_name}},

Your payment has been successfully processed!

PAYMENT DETAILS:
- Amount: {{amount}} {{currency}}
- Booking Reference: {{booking_reference}}
- Hotel: {{hotel_name}}
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}

You will receive a separate booking confirmation email with complete details.

Thank you for choosing Ambassador Collection!

This payment confirmation serves as your receipt.',
  '{"guest_name": "string", "amount": "string", "currency": "string", "booking_reference": "string", "hotel_name": "string", "check_in_date": "date", "check_out_date": "date"}'::jsonb
);

-- Payment Failed Template
INSERT INTO email_templates (template_name, subject, body_html, body_text, variables) VALUES (
  'payment_failed',
  'Payment Failed - Action Required for {{booking_reference}}',
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; background: #ffffff; }
      .alert { background: #fef2f2; border: 2px solid #f87171; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .btn { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
      .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>⚠️ Payment Failed</h1>
        <p>Ambassador Collection</p>
      </div>
      
      <div class="content">
        <p>Dear {{guest_name}},</p>
        
        <div class="alert">
          <h3>Action Required</h3>
          <p>We were unable to process your payment for booking <strong>{{booking_reference}}</strong>.</p>
        </div>
        
        <p>To secure your reservation at {{hotel_name}}, please update your payment information within 24 hours.</p>
        
        <h3>What to do next:</h3>
        <ol>
          <li>Check that your payment method has sufficient funds</li>
          <li>Verify your billing information is correct</li>
          <li>Try a different payment method if needed</li>
          <li>Contact us if you continue to experience issues</li>
        </ol>
        
        <a href="mailto:reservations@ambassadorcollection.com" class="btn">Contact Support</a>
        
        <p>If you do not complete your payment within 24 hours, your reservation may be automatically cancelled.</p>
        
        <p>We apologize for any inconvenience and look forward to welcoming you.</p>
      </div>
      
      <div class="footer">
        <p>Ambassador Collection</p>
        <p>Need help? Contact: reservations@ambassadorcollection.com</p>
      </div>
    </div>
  </body>
  </html>',
  'PAYMENT FAILED - Action Required

Dear {{guest_name}},

We were unable to process your payment for booking {{booking_reference}}.

To secure your reservation at {{hotel_name}}, please update your payment information within 24 hours.

WHAT TO DO NEXT:
1. Check that your payment method has sufficient funds
2. Verify your billing information is correct
3. Try a different payment method if needed
4. Contact us if you continue to experience issues

If you do not complete your payment within 24 hours, your reservation may be automatically cancelled.

Contact Support: reservations@ambassadorcollection.com

We apologize for any inconvenience and look forward to welcoming you.

Ambassador Collection',
  '{"guest_name": "string", "booking_reference": "string", "hotel_name": "string"}'::jsonb
);

-- Refund Processed Template
INSERT INTO email_templates (template_name, subject, body_html, body_text, variables) VALUES (
  'refund_processed',
  'Refund Processed - {{booking_reference}}',
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; background: #ffffff; }
      .refund-details { background: #e0f2fe; border: 2px solid #0891b2; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>💰 Refund Processed</h1>
        <p>Ambassador Collection</p>
      </div>
      
      <div class="content">
        <p>Dear {{guest_name}},</p>
        
        <div class="refund-details">
          <h3>Refund Confirmation</h3>
          <p><strong>Refund Amount: {{amount}} {{currency}}</strong></p>
          <p>Booking Reference: {{booking_reference}}</p>
        </div>
        
        <p>Your refund has been processed and will appear in your account within 5-10 business days, depending on your payment method.</p>
        
        <h3>Important Notes:</h3>
        <ul>
          <li>Credit card refunds typically take 3-5 business days</li>
          <li>Bank transfers may take 5-10 business days</li>
          <li>The refund will appear on your statement as "Ambassador Collection"</li>
        </ul>
        
        <p>If you have any questions about this refund, please contact our support team.</p>
        
        <p>Thank you for choosing Ambassador Collection. We hope to welcome you again in the future.</p>
      </div>
      
      <div class="footer">
        <p>Ambassador Collection</p>
        <p>Questions? Contact: reservations@ambassadorcollection.com</p>
      </div>
    </div>
  </body>
  </html>',
  'REFUND PROCESSED - Ambassador Collection

Dear {{guest_name}},

Your refund has been processed!

REFUND DETAILS:
- Amount: {{amount}} {{currency}}
- Booking Reference: {{booking_reference}}

Your refund will appear in your account within 5-10 business days, depending on your payment method.

IMPORTANT NOTES:
- Credit card refunds typically take 3-5 business days
- Bank transfers may take 5-10 business days
- The refund will appear on your statement as "Ambassador Collection"

If you have any questions about this refund, please contact our support team.

Thank you for choosing Ambassador Collection. We hope to welcome you again in the future.

Contact: reservations@ambassadorcollection.com',
  '{"guest_name": "string", "amount": "string", "currency": "string", "booking_reference": "string"}'::jsonb
);

-- Pre-arrival Template
INSERT INTO email_templates (template_name, subject, body_html, body_text, variables) VALUES (
  'pre_arrival',
  'Your Stay Begins Tomorrow - {{hotel_name}}',
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; background: #ffffff; }
      .checkin-info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🎉 Almost Here!</h1>
        <p>Your stay begins tomorrow</p>
      </div>
      
      <div class="content">
        <p>Dear {{guest_name}},</p>
        
        <p>We are excited to welcome you to {{hotel_name}} tomorrow!</p>
        
        <div class="checkin-info">
          <h3>Check-in Information</h3>
          <ul>
            <li><strong>Date:</strong> {{check_in_date}}</li>
            <li><strong>Time:</strong> From 3:00 PM</li>
            <li><strong>Booking Reference:</strong> {{booking_reference}}</li>
            <li><strong>Room Type:</strong> {{room_type}}</li>
          </ul>
        </div>
        
        <h3>What to Bring:</h3>
        <ul>
          <li>Valid photo ID (passport or drivers license)</li>
          <li>Credit card for incidentals</li>
          <li>This email confirmation</li>
        </ul>
        
        <h3>Hotel Amenities:</h3>
        <ul>
          <li>Free WiFi throughout the property</li>
          <li>Complimentary parking (subject to availability)</li>
          <li>24/7 front desk service</li>
          <li>Concierge services</li>
        </ul>
        
        <p>If you have any special requests or need assistance, please call us at {{hotel_phone}}.</p>
        
        <p>We look forward to providing you with an exceptional stay!</p>
      </div>
      
      <div class="footer">
        <p>{{hotel_name}} | {{hotel_location}}</p>
        <p>Phone: {{hotel_phone}} | Email: reservations@ambassadorcollection.com</p>
      </div>
    </div>
  </body>
  </html>',
  'YOUR STAY BEGINS TOMORROW - {{hotel_name}}

Dear {{guest_name}},

We are excited to welcome you to {{hotel_name}} tomorrow!

CHECK-IN INFORMATION:
- Date: {{check_in_date}}
- Time: From 3:00 PM
- Booking Reference: {{booking_reference}}
- Room Type: {{room_type}}

WHAT TO BRING:
- Valid photo ID (passport or drivers license)
- Credit card for incidentals
- This email confirmation

HOTEL AMENITIES:
- Free WiFi throughout the property
- Complimentary parking (subject to availability)
- 24/7 front desk service
- Concierge services

If you have any special requests or need assistance, please call us at {{hotel_phone}}.

We look forward to providing you with an exceptional stay!

{{hotel_name}} | {{hotel_location}}
Phone: {{hotel_phone}}
Email: reservations@ambassadorcollection.com',
  '{"guest_name": "string", "hotel_name": "string", "hotel_location": "string", "hotel_phone": "string", "check_in_date": "date", "booking_reference": "string", "room_type": "string"}'::jsonb
);

-- Post-checkout Template  
INSERT INTO email_templates (template_name, subject, body_html, body_text, variables) VALUES (
  'post_checkout',
  'Thank You for Staying with Ambassador Collection',
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; background: #ffffff; }
      .feedback-section { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
      .btn { background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; }
      .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🙏 Thank You!</h1>
        <p>Ambassador Collection</p>
      </div>
      
      <div class="content">
        <p>Dear {{guest_name}},</p>
        
        <p>Thank you for choosing {{hotel_name}} for your recent stay. We hope you had a wonderful experience!</p>
        
        <div class="feedback-section">
          <h3>How Was Your Stay?</h3>
          <p>Your feedback helps us improve our service for future guests.</p>
          <a href="https://forms.gle/ambassador-collection-feedback" class="btn">Leave a Review</a>
        </div>
        
        <h3>We Hope You Enjoyed:</h3>
        <ul>
          <li>Your comfortable {{room_type}} accommodation</li>
          <li>Our personalized service and attention to detail</li>
          <li>The unique ambiance of our {{hotel_location}} location</li>
          <li>Our local recommendations and concierge services</li>
        </ul>
        
        <p><strong>Booking Reference:</strong> {{booking_reference}}</p>
        <p><strong>Stay Dates:</strong> {{check_in_date}} to {{check_out_date}}</p>
        
        <p>We would love to welcome you back on your next visit to {{hotel_location}}. As a returning guest, you will enjoy special benefits and priority reservations.</p>
        
        <a href="mailto:reservations@ambassadorcollection.com" class="btn">Book Your Next Stay</a>
        
        <p>Thank you again for choosing Ambassador Collection!</p>
      </div>
      
      <div class="footer">
        <p>Ambassador Collection | {{hotel_location}}</p>
        <p>Stay connected: Follow us on social media for special offers</p>
      </div>
    </div>
  </body>
  </html>',
  'THANK YOU - Ambassador Collection

Dear {{guest_name}},

Thank you for choosing {{hotel_name}} for your recent stay. We hope you had a wonderful experience!

BOOKING DETAILS:
- Reference: {{booking_reference}}
- Stay Dates: {{check_in_date}} to {{check_out_date}}
- Room Type: {{room_type}}

HOW WAS YOUR STAY?
Your feedback helps us improve our service for future guests.
Please consider leaving a review: https://forms.gle/ambassador-collection-feedback

We would love to welcome you back on your next visit to {{hotel_location}}. As a returning guest, you will enjoy special benefits and priority reservations.

Book your next stay: reservations@ambassadorcollection.com

Thank you again for choosing Ambassador Collection!

Ambassador Collection | {{hotel_location}}
Stay connected: Follow us on social media for special offers',
  '{"guest_name": "string", "hotel_name": "string", "hotel_location": "string", "booking_reference": "string", "check_in_date": "date", "check_out_date": "date", "room_type": "string"}'::jsonb
);