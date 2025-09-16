import { supabase as supabaseClient } from '@/lib/supabase/client';

// Email service configuration
export const EMAIL_CONFIG = {
  from: {
    name: 'Ambassador Collection',
    email: process.env.FROM_EMAIL || 'reservations@ambassadorcollection.com',
  },
  replyTo: process.env.REPLY_TO_EMAIL || 'support@ambassadorcollection.com',
};

// Email template types
export type EmailTemplateType = 
  | 'booking_confirmation'
  | 'payment_confirmation' 
  | 'payment_failed'
  | 'booking_modification'
  | 'booking_cancellation'
  | 'refund_processed'
  | 'pre_arrival'
  | 'post_checkout';

// Booking data interface for email templates
export interface BookingEmailData {
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  hotelLocation: string;
  hotelPhone?: string;
  roomType: string;
  ratePlan: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children?: number;
  totalAmount: number;
  depositAmount?: number;
  balanceAmount?: number;
  currency: string;
  specialRequests?: string;
  paymentStatus?: string;
  cancellationPolicy?: string;
}

// Email service class
export class EmailService {
  private supabase = supabaseClient;

  /**
   * Send email using the configured email provider
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    try {
      // Mock email service for development
      console.log('📧 ============= MOCK EMAIL SENT =============');
      console.log('📧 To:', to);
      console.log('📧 From:', `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`);
      console.log('📧 Subject:', subject);
      console.log('📧 HTML Content Preview:');
      console.log(htmlContent.substring(0, 300) + (htmlContent.length > 300 ? '...' : ''));
      if (textContent) {
        console.log('📧 Text Content Preview:');
        console.log(textContent.substring(0, 200) + (textContent.length > 200 ? '...' : ''));
      }
      console.log('📧 =========================================');

      // TODO: Integrate with your email provider:
      // - SendGrid: https://sendgrid.com/
      // - Resend: https://resend.com/
      // - AWS SES: https://aws.amazon.com/ses/
      // - Mailgun: https://www.mailgun.com/
      
      // Example with Resend:
      /*
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent,
      });
      return !!result.data;
      */

      // For development, always return success
      return true;
    } catch (error) {
      console.error('📧 Email sending failed:', error);
      return false;
    }
  }

  /**
   * Get email template from database or return fallback template
   */
  async getEmailTemplate(templateName: EmailTemplateType): Promise<{
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables: Record<string, any>;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .select('subject, body_html, body_text, variables')
        .eq('template_name', templateName)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('Template not found in database:', templateName, 'Using fallback template');
        return this.getFallbackTemplate(templateName);
      }

      return {
        subject: data.subject,
        bodyHtml: data.body_html,
        bodyText: data.body_text,
        variables: data.variables || {},
      };
    } catch (error) {
      console.error('Error fetching email template:', error);
      return this.getFallbackTemplate(templateName);
    }
  }

  /**
   * Get fallback email template for development
   */
  private getFallbackTemplate(templateName: EmailTemplateType): {
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables: Record<string, any>;
  } | null {
    const fallbackTemplates = {
      'booking_confirmation': {
        subject: 'Booking Confirmation - {{booking_reference}}',
        bodyHtml: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #d4af37;">Booking Confirmation</h1>
                <p>Dear {{guest_name}},</p>
                <p>Thank you for your booking! Your reservation has been confirmed.</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0;">Booking Details</h2>
                  <p><strong>Confirmation Number:</strong> {{booking_reference}}</p>
                  <p><strong>Hotel:</strong> {{hotel_name}}</p>
                  <p><strong>Location:</strong> {{hotel_location}}</p>
                  <p><strong>Room Type:</strong> {{room_type}}</p>
                  <p><strong>Check-in:</strong> {{check_in_date}}</p>
                  <p><strong>Check-out:</strong> {{check_out_date}}</p>
                  <p><strong>Nights:</strong> {{nights}}</p>
                  <p><strong>Guests:</strong> {{adults}} adults, {{children}} children</p>
                  <p><strong>Total Amount:</strong> {{total_amount}}</p>
                </div>
                
                <p>We look forward to welcoming you to {{hotel_name}}!</p>
                <p>Best regards,<br>{{hotel_name}} Team</p>
              </div>
            </body>
          </html>
        `,
        bodyText: `
Booking Confirmation

Dear {{guest_name}},

Thank you for your booking! Your reservation has been confirmed.

Booking Details:
- Confirmation Number: {{booking_reference}}
- Hotel: {{hotel_name}}
- Location: {{hotel_location}}
- Room Type: {{room_type}}
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}
- Nights: {{nights}}
- Guests: {{adults}} adults, {{children}} children
- Total Amount: {{total_amount}}

We look forward to welcoming you to {{hotel_name}}!

Best regards,
{{hotel_name}} Team
        `,
        variables: {}
      },
      'payment_confirmation': {
        subject: 'Payment Confirmation - {{booking_reference}}',
        bodyHtml: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #d4af37;">Payment Confirmation</h1>
                <p>Dear {{guest_name}},</p>
                <p>Your payment has been successfully processed!</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0;">Payment Details</h2>
                  <p><strong>Booking Reference:</strong> {{booking_reference}}</p>
                  <p><strong>Hotel:</strong> {{hotel_name}}</p>
                  <p><strong>Amount Paid:</strong> {{amount}} {{currency}}</p>
                  <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p>Your booking is now confirmed. We look forward to your stay!</p>
                <p>Best regards,<br>{{hotel_name}} Team</p>
              </div>
            </body>
          </html>
        `,
        variables: {}
      },
      'payment_failed': {
        subject: 'Payment Failed - {{booking_reference}}',
        bodyHtml: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #dc3545;">Payment Failed</h1>
                <p>Dear {{guest_name}},</p>
                <p>Unfortunately, we were unable to process your payment for booking {{booking_reference}}.</p>
                
                <p>Please try again or contact us directly at {{hotel_phone}} for assistance.</p>
                
                <p>Best regards,<br>{{hotel_name}} Team</p>
              </div>
            </body>
          </html>
        `,
        variables: {}
      }
    };

    return fallbackTemplates[templateName as keyof typeof fallbackTemplates] || null;
  }

  /**
   * Replace template variables with actual data
   */
  private replaceTemplateVariables(
    content: string,
    data: Record<string, any>
  ): string {
    let result = content;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = value?.toString() || '';
      result = result.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return result;
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('booking_confirmation');
      if (!template) {
        console.error('Booking confirmation template not found');
        return false;
      }

      // Prepare template data
      const templateData = {
        guest_name: bookingData.guestName,
        booking_reference: bookingData.bookingReference,
        hotel_name: bookingData.hotelName,
        hotel_location: bookingData.hotelLocation,
        hotel_phone: bookingData.hotelPhone || '+972-2-123-4567',
        room_type: bookingData.roomType,
        rate_plan: bookingData.ratePlan,
        check_in_date: bookingData.checkInDate,
        check_out_date: bookingData.checkOutDate,
        nights: bookingData.nights.toString(),
        adults: bookingData.adults.toString(),
        children: bookingData.children?.toString() || '0',
        total_amount: `${bookingData.totalAmount.toFixed(2)} ${bookingData.currency}`,
        deposit_amount: bookingData.depositAmount ? `${bookingData.depositAmount.toFixed(2)} ${bookingData.currency}` : '',
        balance_amount: bookingData.balanceAmount ? `${bookingData.balanceAmount.toFixed(2)} ${bookingData.currency}` : '',
        special_requests: bookingData.specialRequests || 'None',
        cancellation_policy: bookingData.cancellationPolicy || 'Free cancellation up to 24 hours before check-in',
      };

      // Replace variables in template
      const subject = this.replaceTemplateVariables(template.subject, templateData);
      const htmlContent = this.replaceTemplateVariables(template.bodyHtml, templateData);
      const textContent = template.bodyText 
        ? this.replaceTemplateVariables(template.bodyText, templateData)
        : undefined;

      // Send email
      return await this.sendEmail(
        bookingData.guestEmail,
        subject,
        htmlContent,
        textContent
      );
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('payment_confirmation');
      if (!template) {
        console.error('Payment confirmation template not found');
        return false;
      }

      const templateData = {
        guest_name: bookingData.guestName,
        booking_reference: bookingData.bookingReference,
        hotel_name: bookingData.hotelName,
        amount: bookingData.depositAmount ? 
          `${bookingData.depositAmount.toFixed(2)}` : 
          `${bookingData.totalAmount.toFixed(2)}`,
        currency: bookingData.currency,
        check_in_date: bookingData.checkInDate,
        check_out_date: bookingData.checkOutDate,
      };

      const subject = this.replaceTemplateVariables(template.subject, templateData);
      const htmlContent = this.replaceTemplateVariables(template.bodyHtml, templateData);
      const textContent = template.bodyText 
        ? this.replaceTemplateVariables(template.bodyText, templateData)
        : undefined;

      return await this.sendEmail(
        bookingData.guestEmail,
        subject,
        htmlContent,
        textContent
      );
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return false;
    }
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('payment_failed');
      if (!template) {
        console.error('Payment failed template not found');
        return false;
      }

      const templateData = {
        guest_name: bookingData.guestName,
        booking_reference: bookingData.bookingReference,
        hotel_name: bookingData.hotelName,
      };

      const subject = this.replaceTemplateVariables(template.subject, templateData);
      const htmlContent = this.replaceTemplateVariables(template.bodyHtml, templateData);
      const textContent = template.bodyText 
        ? this.replaceTemplateVariables(template.bodyText, templateData)
        : undefined;

      return await this.sendEmail(
        bookingData.guestEmail,
        subject,
        htmlContent,
        textContent
      );
    } catch (error) {
      console.error('Error sending payment failed email:', error);
      return false;
    }
  }

  /**
   * Send refund processed email
   */
  async sendRefundProcessed(
    bookingData: BookingEmailData,
    refundAmount: number
  ): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('refund_processed');
      if (!template) {
        console.error('Refund processed template not found');
        return false;
      }

      const templateData = {
        guest_name: bookingData.guestName,
        booking_reference: bookingData.bookingReference,
        amount: refundAmount.toFixed(2),
        currency: bookingData.currency,
      };

      const subject = this.replaceTemplateVariables(template.subject, templateData);
      const htmlContent = this.replaceTemplateVariables(template.bodyHtml, templateData);
      const textContent = template.bodyText 
        ? this.replaceTemplateVariables(template.bodyText, templateData)
        : undefined;

      return await this.sendEmail(
        bookingData.guestEmail,
        subject,
        htmlContent,
        textContent
      );
    } catch (error) {
      console.error('Error sending refund processed email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();