import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

interface FooterProps {
  siteSettings?: any
}

export function Footer({ siteSettings }: FooterProps) {
  const currentYear = new Date().getFullYear()
  
  // Use CMS data if available, otherwise use defaults
  const contact = siteSettings?.contact || {
    phone: '+972 2 123 4567',
    email: 'info@ambassadorcollection.com',
    address: '23 Luxury Avenue, Jerusalem, Israel'
  }
  
  const socialMedia = siteSettings?.socialMedia || {}
  const copyrightText = siteSettings?.footer?.copyrightText || `© ${currentYear} Ambassador Collection. All rights reserved.`

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-light text-white mb-2">
                Ambassador
              </h2>
              <p className="text-xs font-light tracking-widest uppercase text-gray-400">
                Collection
              </p>
            </div>
            <p className="text-sm font-light text-gray-400 leading-relaxed max-w-xs">
              Luxury accommodations in the Holy Land, where ancient heritage meets contemporary elegance. 
              Creating unforgettable experiences since 1995.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialMedia.facebook && (
                <a 
                  href={socialMedia.facebook} 
                  target="_blank"
                  rel="noreferrer" 
                  aria-label="Facebook"
                  className="text-gray-500 hover:text-amber-600 transition-colors duration-300"
                >
                  <Facebook size={18} />
                </a>
              )}
              {socialMedia.instagram && (
                <a 
                  href={socialMedia.instagram} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="text-gray-500 hover:text-amber-600 transition-colors duration-300"
                >
                  <Instagram size={18} />
                </a>
              )}
              {socialMedia.twitter && (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="text-gray-500 hover:text-amber-600 transition-colors duration-300"
                >
                  <Twitter size={18} />
                </a>
              )}
              {socialMedia.linkedin && (
                <a
                  href={socialMedia.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-500 hover:text-amber-600 transition-colors duration-300"
                >
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-light tracking-widest uppercase text-white mb-6">
              Discover
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Our Collection
                </Link>
              </li>
              <li>
                <Link href="/restaurants" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Reservations
                </Link>
              </li>
              <li>
                <Link href="/manage-booking" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Manage Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional Links */}
          <div>
            <h3 className="text-sm font-light tracking-widest uppercase text-white mb-6">
              Information
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/careers" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-light tracking-widest uppercase text-white mb-6">
              Connect
            </h3>
            <div className="space-y-4">
              {contact.address && (
                <div className="flex items-start">
                  <MapPin size={16} className="mr-3 mt-1 text-gray-500" />
                  <span className="text-sm font-light text-gray-400 leading-relaxed">
                    {contact.address.split(',').map((line: string, i: number) => (
                      <span key={i}>
                        {line.trim()}
                        {i < contact.address.split(',').length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-3 text-gray-500" />
                  <a 
                    href={`tel:${contact.phone.replace(/\s/g, '')}`} 
                    className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-3 text-gray-500" />
                  <a 
                    href={`mailto:${contact.email}`} 
                    className="text-sm font-light text-gray-400 hover:text-amber-600 transition-colors duration-300"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-light text-gray-500">
              {copyrightText}
            </p>
            <div className="w-12 h-px bg-amber-600"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}