import './globals.css'
import { Metadata } from 'next'
import { Cormorant_Garamond, Lato } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { constructMetadata, getViewport, generateJsonLd } from '@/components/shared/seo'
import { AuthProvider } from '@/contexts/AuthContext'
import { BookingProvider } from '@/contexts/BookingContext'

// Load fonts
const heading = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap'
})

const body = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-body',
  display: 'swap'
})

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'Ambassador Collection – Boutique Luxury Hotels in the Holy Land',
    description: 'Experience authentic Jerusalem hospitality at the Ambassador Collection—Ambassador Jerusalem, Boutique, Comfort, and City Bethlehem. Warmth, comfort, and tradition meet boutique luxury.',
  }),
  manifest: '/site.webmanifest',
}

export const viewport = getViewport()

// Default site settings
const defaultSiteSettings = {
  title: 'Ambassador Collection',
  description: 'Luxury hotels in Jerusalem and Bethlehem',
  contact: {
    email: 'info@ambassadorcollection.com',
    phone: '+972-2-123-4567',
    address: 'Jerusalem & Bethlehem, Holy Land',
    whatsapp: '+972-50-123-4567'
  },
  socialMedia: {
    facebook: 'https://facebook.com/ambassadorcollection',
    instagram: 'https://instagram.com/ambassadorcollection',
    twitter: 'https://twitter.com/ambassadorhotels',
    linkedin: 'https://linkedin.com/company/ambassadorcollection'
  },
  footer: {
    copyrightText: '© 2024 Ambassador Collection. All rights reserved.',
    footerLinks: []
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = defaultSiteSettings
  
  // Generate organization structured data
  const organizationSchema = generateJsonLd('Organization', {
    name: 'Ambassador Collection',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ambassadorcollection.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ambassadorcollection.com'}/logo.png`,
    description: 'Family-owned luxury hotel collection in Jerusalem and Bethlehem',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jerusalem',
      addressCountry: 'IL'
    },
    telephone: siteSettings.contact.phone,
    email: siteSettings.contact.email,
    sameAs: [
      siteSettings.socialMedia.facebook,
      siteSettings.socialMedia.instagram,
      siteSettings.socialMedia.twitter,
      siteSettings.socialMedia.linkedin
    ]
  })
  
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <BookingProvider>
            <Navbar siteSettings={siteSettings} />
            <main>
              {children}
            </main>
            <Footer siteSettings={siteSettings} />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}