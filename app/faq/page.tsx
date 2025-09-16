import { constructMetadata } from '@/components/shared/seo'
import { SectionHeading } from '@/components/ui/section-heading'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const metadata = constructMetadata({
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Ambassador Collection hotels, bookings, amenities, and policies.',
  canonicalUrl: '/faq',
})

export default function FAQPage() {
  const faqSections = [
    {
      category: "Bookings & Reservations",
      questions: [
        {
          question: "How can I make a reservation?",
          answer: "You can make a reservation through our website, by calling us directly, or through authorized travel agents. Online booking is available 24/7 and offers the best rates."
        },
        {
          question: "What is your cancellation policy?",
          answer: "Standard reservations can be cancelled up to 24 hours before arrival without penalty. Some promotional rates may be non-refundable. Group bookings may have different terms."
        },
        {
          question: "Can I modify my reservation?",
          answer: "Yes, modifications are subject to availability and may result in rate changes. Contact us directly or log into your booking to make changes."
        },
        {
          question: "Do you offer group discounts?",
          answer: "Yes, we offer special rates for groups of 10 or more rooms. Please contact our sales team for customized group packages and rates."
        }
      ]
    },
    {
      category: "Check-In & Check-Out",
      questions: [
        {
          question: "What are your check-in and check-out times?",
          answer: "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges."
        },
        {
          question: "What do I need for check-in?",
          answer: "You'll need a government-issued photo ID and the credit card used for booking. Additional authorization may be required for incidental charges."
        },
        {
          question: "Can I check in early or check out late?",
          answer: "Subject to availability, early check-in and late check-out can be arranged. Fees may apply for late check-out after 2:00 PM."
        },
        {
          question: "Do you offer express check-out?",
          answer: "Yes, we offer express check-out options. You can settle your bill the night before or use our mobile check-out service where available."
        }
      ]
    },
    {
      category: "Hotel Amenities & Services",
      questions: [
        {
          question: "Do you offer free Wi-Fi?",
          answer: "Yes, complimentary high-speed Wi-Fi is available throughout all our properties, including guest rooms and public areas."
        },
        {
          question: "Is breakfast included?",
          answer: "Breakfast inclusion varies by rate and package. Many of our rates include complimentary breakfast. Check your reservation details or upgrade during booking."
        },
        {
          question: "Do you have parking available?",
          answer: "Parking availability varies by property. Some locations offer complimentary parking while others may charge a daily fee. Contact the specific hotel for details."
        },
        {
          question: "Are your hotels accessible?",
          answer: "Yes, all our properties are designed to be accessible and offer facilities for guests with disabilities. Please inform us of any special requirements when booking."
        },
        {
          question: "Do you have fitness facilities?",
          answer: "Fitness facilities vary by property. Many of our hotels offer fitness centers, and some have partnerships with nearby gyms. Check individual hotel amenities."
        }
      ]
    },
    {
      category: "Location & Transportation",
      questions: [
        {
          question: "How close are you to major attractions?",
          answer: "All our properties are strategically located near major attractions. Our Jerusalem hotels are within walking distance of the Old City, and our Bethlehem property is close to the Church of the Nativity."
        },
        {
          question: "Do you provide airport transportation?",
          answer: "Airport shuttle services are available at most properties for an additional fee. We can also arrange private transfers or recommend reliable taxi services."
        },
        {
          question: "Is public transportation nearby?",
          answer: "Yes, all our hotels are conveniently located near public transportation options including buses and light rail where available."
        }
      ]
    },
    {
      category: "Policies & Guidelines",
      questions: [
        {
          question: "What is your pet policy?",
          answer: "Pets are allowed at select properties with prior approval and additional fees. Service animals are always welcome. Please contact us in advance to arrange pet-friendly accommodations."
        },
        {
          question: "Do you allow smoking?",
          answer: "All our properties are smoke-free. Designated outdoor smoking areas are available. Smoking in rooms will result in cleaning fees."
        },
        {
          question: "What is your policy for children?",
          answer: "Children are welcome at all our properties. Children under 12 stay free when sharing parents' room (maximum occupancy applies). Cribs and rollaway beds are available upon request."
        },
        {
          question: "Do you have a loyalty program?",
          answer: "We're developing a loyalty program for frequent guests. Sign up for our newsletter to be notified when it launches and receive exclusive offers."
        }
      ]
    },
    {
      category: "Payment & Billing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and cash for incidental charges. Bank transfers may be available for group bookings."
        },
        {
          question: "When will my card be charged?",
          answer: "For standard rates, your card may be pre-authorized to guarantee the reservation, with full payment due at check-in. Some promotional rates require immediate payment."
        },
        {
          question: "Are there additional fees?",
          answer: "Room rates include standard amenities. Additional charges may apply for extra services, parking, minibar, room service, or tourist taxes where applicable."
        },
        {
          question: "Can I get a receipt for my stay?",
          answer: "Yes, detailed receipts are provided at check-out and can be emailed to you. Additional copies can be requested from our front desk or billing department."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-32 pb-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about our hotels and services"
            center
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Search Suggestion */}
            <div className="mb-12 text-center">
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Try using Ctrl+F (Cmd+F on Mac) to search this page, 
                or <a href="/contact" className="text-primary hover:underline">contact us directly</a>.
              </p>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-12">
              {faqSections.map((section, sectionIndex) => (
                <div key={sectionIndex} data-testid={`faq-section-${sectionIndex}`}>
                  <h2 className="text-2xl font-serif mb-6 text-center">{section.category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((faq, questionIndex) => (
                      <AccordionItem 
                        key={questionIndex} 
                        value={`${sectionIndex}-${questionIndex}`}
                        data-testid={`faq-item-${sectionIndex}-${questionIndex}`}
                      >
                        <AccordionTrigger className="text-left hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-16 bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="text-xl font-serif mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our guest services team is here to help you 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
                  data-testid="faq-contact-form"
                >
                  Contact Form
                </a>
                <a 
                  href="tel:+972-2-123-4567" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted transition-colors rounded-md"
                  data-testid="faq-phone-call"
                >
                  Call: +972-2-123-4567
                </a>
                <a 
                  href="mailto:info@ambassadorcollection.com" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted transition-colors rounded-md"
                  data-testid="faq-email"
                >
                  Email Us
                </a>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                For urgent matters during your stay, call our 24/7 emergency line: 
                <a href="tel:+972-50-123-4567" className="font-medium text-primary hover:underline ml-1">
                  +972-50-123-4567
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}