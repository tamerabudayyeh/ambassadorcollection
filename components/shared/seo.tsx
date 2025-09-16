import { Metadata } from 'next'

interface SeoProps {
  title: string
  description: string
  image?: string
  type?: string
  keywords?: string[]
  author?: string
  canonicalUrl?: string
  locale?: string
  alternates?: {
    canonical?: string
    languages?: Record<string, string>
  }
}

const DEFAULT_KEYWORDS = [
  'Ambassador Collection',
  'Jerusalem hotels',
  'Bethlehem hotels',
  'Holy Land accommodation',
  'luxury hotels Jerusalem',
  'boutique hotels',
  'Israel hotels',
  'Palestine hotels',
  'Old City Jerusalem hotels',
  'pilgrimage hotels',
  'business hotels Jerusalem',
  'family hotels Jerusalem'
]

export function constructMetadata({
  title,
  description,
  image = "https://hotelsamb.com/og-image.jpg",
  type = "website",
  keywords = DEFAULT_KEYWORDS,
  author = "Ambassador Collection Hotels",
  canonicalUrl,
  locale = "en_US",
  alternates,
}: SeoProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ambassadorcollection.com'
  const fullTitle = title === 'Ambassador Collection' ? title : `${title} | Ambassador Collection`
  
  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: 'Ambassador Collection',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: alternates || {
      canonical: canonicalUrl || '/',
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl || siteUrl,
      siteName: "Ambassador Collection",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - Ambassador Collection Hotels`,
        },
      ],
      locale,
      type: type as any,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@AmbassadorHotels",
      site: "@AmbassadorHotels",
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
        { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
      ],
      other: [
        {
          rel: 'mask-icon',
          url: '/safari-pinned-tab.svg',
        },
      ],
    },
    manifest: '/site.webmanifest',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
    category: 'travel',
  }
}

export function getViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  }
}

export function generateJsonLd(type: 'Organization' | 'Hotel' | 'LocalBusiness', data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  if (type === 'Organization') {
    return {
      ...baseData,
      name: 'Ambassador Collection',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ambassadorcollection.com',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: data.telephone || '+972-2-123-4567',
        contactType: 'reservations',
        areaServed: ['IL', 'PS'],
        availableLanguage: ['English', 'Hebrew', 'Arabic'],
      },
      sameAs: [
        data.facebook || 'https://facebook.com/ambassadorcollection',
        data.instagram || 'https://instagram.com/ambassadorcollection',
        data.twitter || 'https://twitter.com/ambassadorhotels',
      ],
      ...data,
    }
  }

  if (type === 'Hotel') {
    return {
      ...baseData,
      '@type': 'Hotel',
      name: data.name,
      description: data.description,
      url: data.url,
      telephone: data.telephone,
      email: data.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.streetAddress,
        addressLocality: data.city,
        addressRegion: data.region,
        postalCode: data.postalCode,
        addressCountry: data.country || 'IL',
      },
      geo: data.coordinates ? {
        '@type': 'GeoCoordinates',
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng,
      } : undefined,
      image: data.images || [],
      priceRange: data.priceRange || '$$-$$$',
      starRating: {
        '@type': 'Rating',
        ratingValue: data.rating || 4,
        bestRating: 5,
      },
      amenityFeature: data.amenities?.map((amenity: any) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity.title,
        value: true,
      })) || [],
      checkinTime: data.checkInTime || '15:00',
      checkoutTime: data.checkOutTime || '11:00',
      ...data,
    }
  }

  return { ...baseData, ...data }
}