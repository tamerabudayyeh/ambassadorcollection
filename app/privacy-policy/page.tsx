import { constructMetadata } from '@/components/shared/seo'
import { SectionHeading } from '@/components/ui/section-heading'

export const metadata = constructMetadata({
  title: 'Privacy Policy',
  description: 'Ambassador Collection Privacy Policy - Learn how we protect and handle your personal information when you visit our hotels or use our services.',
  canonicalUrl: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-32 pb-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Privacy Policy"
            subtitle="How we protect and handle your personal information"
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
              <section data-testid="privacy-introduction">
                <h2 className="text-2xl font-serif mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Ambassador Collection. We are committed to protecting your privacy and ensuring the security 
                  of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you visit our hotels, use our website, or engage with our services.
                </p>
              </section>

              <section data-testid="privacy-information-collected">
                <h2 className="text-2xl font-serif mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-medium mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Government-issued ID for hotel registration</li>
                  <li>Preferences and special requests</li>
                </ul>

                <h3 className="text-xl font-medium mb-3 mt-6">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Website usage data and analytics</li>
                  <li>Device information and IP addresses</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section data-testid="privacy-how-we-use">
                <h2 className="text-2xl font-serif mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>To process and fulfill your reservations</li>
                  <li>To provide customer service and support</li>
                  <li>To communicate about your bookings and services</li>
                  <li>To personalize your experience with us</li>
                  <li>To send promotional offers (with your consent)</li>
                  <li>To comply with legal obligations</li>
                  <li>To improve our services and website functionality</li>
                </ul>
              </section>

              <section data-testid="privacy-sharing">
                <h2 className="text-2xl font-serif mb-4">4. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Service providers who assist us in operating our business</li>
                  <li>Payment processors for secure transaction handling</li>
                  <li>Legal compliance when required by law or regulation</li>
                  <li>Protection of our rights, property, or safety</li>
                  <li>Business transfers in case of merger or acquisition</li>
                </ul>
              </section>

              <section data-testid="privacy-security">
                <h2 className="text-2xl font-serif mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, 
                  access controls, and regular security assessments.
                </p>
              </section>

              <section data-testid="privacy-cookies">
                <h2 className="text-2xl font-serif mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your browsing experience. You can control cookie 
                  settings through your browser preferences. Some cookies are essential for website functionality, 
                  while others help us understand how you use our site.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We may use analytics services like Google Analytics to understand website usage patterns and improve our services.
                </p>
              </section>

              <section data-testid="privacy-rights">
                <h2 className="text-2xl font-serif mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Right to access your personal data</li>
                  <li>Right to correct inaccurate information</li>
                  <li>Right to delete your personal data</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to certain processing</li>
                  <li>Right to withdraw consent</li>
                </ul>
              </section>

              <section data-testid="privacy-retention">
                <h2 className="text-2xl font-serif mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information only as long as necessary to fulfill the purposes outlined in this 
                  policy, comply with legal obligations, resolve disputes, and enforce our agreements. Guest information 
                  is typically retained for up to 7 years for legal and business purposes.
                </p>
              </section>

              <section data-testid="privacy-children">
                <h2 className="text-2xl font-serif mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not directed to children under 16. We do not knowingly collect personal information 
                  from children under 16. If we become aware that we have collected such information, we will take steps 
                  to delete it promptly.
                </p>
              </section>

              <section data-testid="privacy-international">
                <h2 className="text-2xl font-serif mb-4">10. International Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure 
                  appropriate safeguards are in place to protect your information in accordance with applicable data 
                  protection laws.
                </p>
              </section>

              <section data-testid="privacy-updates">
                <h2 className="text-2xl font-serif mb-4">11. Policy Updates</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                  We will notify you of any material changes by posting the new policy on our website and updating the 
                  "Last updated" date.
                </p>
              </section>

              <section data-testid="privacy-contact">
                <h2 className="text-2xl font-serif mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="font-medium mb-2">Ambassador Collection</p>
                  <p className="text-muted-foreground">Email: privacy@ambassadorcollection.com</p>
                  <p className="text-muted-foreground">Phone: +972-2-123-4567</p>
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