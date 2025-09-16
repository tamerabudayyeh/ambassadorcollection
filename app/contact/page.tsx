'use client'

import { useState } from 'react'
import { SectionHeading } from '@/components/ui/section-heading'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    setTimeout(() => {
      if (formState.email && formState.name && formState.message) {
        setIsSuccess(true)
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        setError('Please fill out all required fields')
      }
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <>
      <section className="pt-32 pb-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Contact Us"
            subtitle="We're here to assist you with any questions or requests"
            center
          />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-serif mb-4">Our Hotels</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Ambassador Jerusalem</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mt-1 mr-2" />
                        Nablus Road 5, Jerusalem 19186, Israel
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-5 w-5 text-primary mr-2" />
                        +972-2-5412222
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-2" />
                        Jerusalem@ambassadorcollection.com
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Ambassador Boutique</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mt-1 mr-2" />
                        Ali Ibn Abu Taleb 5, Jerusalem 19186, Israel
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-5 w-5 text-primary mr-2" />
                        +972-2-6325000
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-2" />
                        Boutique@ambassadorcollection.com
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Ambassador City</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mt-1 mr-2" />
                        Star Street, Bethlehem
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-5 w-5 text-primary mr-2" />
                        +972-2-2756400
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-2" />
                        City@ambassadorcollection.com
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Ritz Hotel</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mt-1 mr-2" />
                        Ibn Khaldoun 8, East Jerusalem 19186, Israel
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-5 w-5 text-primary mr-2" />
                        +972-2-6269900
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-2" />
                        Ritz@ambassadorcollection.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-card rounded-lg shadow-sm p-6 md:p-8 border border-border">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">
                    Your message has been sent successfully. A member of our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-xl font-serif mb-6">Send Us a Message</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select a subject</option>
                      <option value="Booking Inquiry">Booking Inquiry</option>
                      <option value="Special Request">Special Request</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    ></textarea>
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Find Us"
            subtitle="Visit our hotels in Jerusalem and Bethlehem"
            center
            className="mb-8"
          />
          
          <div className="relative h-96 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27170.766543641!2d35.21080836921381!3d31.778122492338366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502d7d634c1fc4b%3A0xd96f623e456ee1cb!2sJerusalem!5e0!3m2!1sen!2sil!4v1618308641015!5m2!1sen!2sil" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              aria-hidden="false"
              title="Map showing our hotel locations"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  )
}