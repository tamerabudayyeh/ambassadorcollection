import { constructMetadata } from '@/components/shared/seo'
import { SectionHeading } from '@/components/ui/section-heading'

export const metadata = constructMetadata({
  title: 'Terms & Conditions',
  description: 'Ambassador Collection Terms & Conditions - Read our terms of service for hotel bookings, cancellations, and guest policies.',
  canonicalUrl: '/terms',
})

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-32 pb-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Terms & Conditions"
            subtitle="Terms of service for hotel bookings and guest policies"
            center
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div className="space-y-8">
              <section data-testid="terms-introduction">
                <h2 className="text-2xl font-serif mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Ambassador Collection. These Terms and Conditions ("Terms") govern your use of our website, 
                  booking services, and accommodation at our properties. By making a reservation or using our services, 
                  you agree to be bound by these Terms.
                </p>
              </section>

              <section data-testid="terms-definitions">
                <h2 className="text-2xl font-serif mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>"Company," "we," "us," "our"</strong> refers to Ambassador Collection and its properties</li>
                  <li><strong>"Guest," "you," "your"</strong> refers to the person making a reservation or staying at our hotels</li>
                  <li><strong>"Property" or "Hotel"</strong> refers to any Ambassador Collection hotel</li>
                  <li><strong>"Reservation"</strong> refers to a confirmed booking for accommodation</li>
                  <li><strong>"Services"</strong> refers to accommodation, amenities, and related hotel services</li>
                </ul>
              </section>

              <section data-testid="terms-reservations">
                <h2 className="text-2xl font-serif mb-4">3. Reservations and Bookings</h2>
                
                <h3 className="text-xl font-medium mb-3">Booking Process</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Reservations are subject to availability and confirmation</li>
                  <li>All rates are quoted in the specified currency and include applicable taxes unless stated otherwise</li>
                  <li>A valid credit card is required to secure your reservation</li>
                  <li>Special requests are subject to availability and cannot be guaranteed</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Age Requirements</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Guests must be at least 18 years old to make a reservation. Minors must be accompanied by an adult.
                </p>

                <h3 className="text-xl font-medium mb-3">Group Bookings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Reservations for 10 or more rooms are considered group bookings and may be subject to different terms, 
                  rates, and cancellation policies.
                </p>
              </section>

              <section data-testid="terms-payment">
                <h2 className="text-2xl font-serif mb-4">4. Payment Terms</h2>
                
                <h3 className="text-xl font-medium mb-3">Payment Methods</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>We accept major credit cards (Visa, MasterCard, American Express)</li>
                  <li>Debit cards and bank transfers may be accepted at certain properties</li>
                  <li>Cash payments are accepted for incidental charges</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Charges and Authorization</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Credit cards may be pre-authorized to guarantee the reservation</li>
                  <li>Full payment may be charged at the time of booking for certain rates</li>
                  <li>Additional charges may apply for extra services, minibar, parking, or damages</li>
                  <li>A security deposit may be required upon check-in</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Currency and Taxes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All rates are subject to applicable taxes, service charges, and tourist taxes. Exchange rates for 
                  foreign currency transactions are determined by your bank or credit card company.
                </p>
              </section>

              <section data-testid="terms-cancellation">
                <h2 className="text-2xl font-serif mb-4">5. Cancellation and Modification</h2>
                
                <h3 className="text-xl font-medium mb-3">Standard Cancellation Policy</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Cancellations must be made at least 24 hours before arrival for standard rates</li>
                  <li>Late cancellations or no-shows will be charged one night's accommodation</li>
                  <li>Some promotional rates may be non-refundable</li>
                  <li>Group bookings may have different cancellation terms</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Modifications</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Reservation modifications are subject to availability and may result in rate changes. Contact us directly 
                  to modify your booking.
                </p>

                <h3 className="text-xl font-medium mb-3">Force Majeure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In case of events beyond our control (natural disasters, government actions, pandemics), we will work 
                  with guests to provide alternative arrangements or refunds as appropriate.
                </p>
              </section>

              <section data-testid="terms-checkin-checkout">
                <h2 className="text-2xl font-serif mb-4">6. Check-In and Check-Out</h2>
                
                <h3 className="text-xl font-medium mb-3">Check-In Process</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Standard check-in time is 3:00 PM</li>
                  <li>Government-issued photo ID is required for all guests</li>
                  <li>Credit card authorization may be required for incidental charges</li>
                  <li>Early check-in is subject to availability and may incur additional charges</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Check-Out Process</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Standard check-out time is 11:00 AM</li>
                  <li>Late check-out is subject to availability and may incur additional charges</li>
                  <li>Express check-out options may be available</li>
                  <li>Final bill settlement must be completed before departure</li>
                </ul>
              </section>

              <section data-testid="terms-guest-conduct">
                <h2 className="text-2xl font-serif mb-4">7. Guest Conduct and Responsibilities</h2>
                
                <h3 className="text-xl font-medium mb-3">Acceptable Behavior</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Guests must respect other guests, staff, and property</li>
                  <li>Quiet hours are typically observed from 10:00 PM to 7:00 AM</li>
                  <li>Smoking is prohibited in non-smoking rooms and designated areas</li>
                  <li>Pets may be allowed with prior approval and additional charges</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Prohibited Activities</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Illegal activities or possession of prohibited substances</li>
                  <li>Disturbing other guests or creating excessive noise</li>
                  <li>Damage to hotel property</li>
                  <li>Unauthorized use of hotel facilities or services</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Liability for Damages</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Guests are responsible for any damage to hotel property caused by themselves or their visitors. 
                  Repair costs will be charged to the guest's account.
                </p>
              </section>

              <section data-testid="terms-liability">
                <h2 className="text-2xl font-serif mb-4">8. Limitation of Liability</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>We are not liable for loss or damage to personal belongings</li>
                  <li>Guests should use hotel safes for valuable items</li>
                  <li>We are not responsible for services provided by third parties</li>
                  <li>Our liability is limited to the cost of accommodation</li>
                  <li>We recommend guests obtain appropriate travel insurance</li>
                </ul>
              </section>

              <section data-testid="terms-privacy">
                <h2 className="text-2xl font-serif mb-4">9. Privacy and Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your privacy is important to us. Please refer to our Privacy Policy for information about how we 
                  collect, use, and protect your personal information.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Security cameras may be installed in public areas for safety and security purposes.
                </p>
              </section>

              <section data-testid="terms-intellectual-property">
                <h2 className="text-2xl font-serif mb-4">10. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on our website and properties, including text, images, logos, and designs, is protected 
                  by intellectual property rights. Unauthorized use is prohibited.
                </p>
              </section>

              <section data-testid="terms-governing-law">
                <h2 className="text-2xl font-serif mb-4">11. Governing Law and Disputes</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms are governed by the laws of Israel. Any disputes will be resolved through arbitration 
                  or in the courts of Jerusalem.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We encourage guests to contact us directly to resolve any concerns before pursuing legal action.
                </p>
              </section>

              <section data-testid="terms-modifications">
                <h2 className="text-2xl font-serif mb-4">12. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. Updated terms will be posted on our website 
                  and become effective immediately upon posting.
                </p>
              </section>

              <section data-testid="terms-contact">
                <h2 className="text-2xl font-serif mb-4">13. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For questions about these Terms or to discuss your reservation, please contact us:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="font-medium mb-2">Ambassador Collection</p>
                  <p className="text-muted-foreground">Email: reservations@ambassadorcollection.com</p>
                  <p className="text-muted-foreground">Phone: +972-2-123-4567</p>
                  <p className="text-muted-foreground">Emergency: +972-50-123-4567 (24/7)</p>
                  <p className="text-muted-foreground">Address: Jerusalem & Bethlehem, Holy Land</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}