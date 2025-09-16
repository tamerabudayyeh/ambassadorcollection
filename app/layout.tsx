import './globals.css'
import { Metadata } from 'next'
import { Cormorant_Garamond, Lato } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { constructMetadata, getViewport, generateJsonLd } from '@/components/shared/seo'
import { AuthProvider } from '@/contexts/AuthContext'
import { BookingProvider } from '@/contexts/BookingContext'
import { generateMetadata as generateRootMetadata } from '@/components/seo/MetaTags'
import { generateOrganizationSchema } from '@/components/seo/StructuredData'
import Script from 'next/script'

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

export const metadata: Metadata = generateRootMetadata({
  title: 'Ambassador Hotels Collection - Luxury Hotels in Jerusalem',
  description: 'Experience exceptional hospitality at Ambassador Hotels Collection. Four distinctive properties in the heart of Jerusalem offering luxury accommodations, fine dining, and authentic Israeli hospitality.',
  keywords: [
    'Ambassador Hotels Jerusalem',
    'luxury hotels Jerusalem',
    'boutique hotels Israel',
    'Jerusalem accommodation',
    'Holy Land hotels',
    'business hotels Jerusalem'
  ]
})

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
  
  const newOrganizationSchema = generateOrganizationSchema()

  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="organization-schema-new"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newOrganizationSchema) }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
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