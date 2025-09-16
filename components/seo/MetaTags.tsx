import { Metadata } from 'next'

interface MetaTagsProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'hotel' | 'restaurant'
  keywords?: string[]
}

export function generateMetadata({
  title,
  description,
  image = 'https://hotelsamb.com/og-image.jpg',
  url = 'https://hotelsamb.com',
  type = 'website',
  keywords = []
}: MetaTagsProps): Metadata {
  const fullTitle = `${title} | Ambassador Hotels Collection`

  return {
    title: fullTitle,
    description,
    keywords: [
      'Ambassador Hotels',
      'Jerusalem hotels',
      'Boutique hotels Jerusalem',
      'Israel accommodation',
      'Holy Land hotels',
      'Jerusalem tourism',
      'Luxury hotels Israel',
      ...keywords
    ].join(', '),
    authors: [{ name: 'Ambassador Hotels Collection' }],
    creator: 'Ambassador Hotels',
    publisher: 'Ambassador Hotels Collection',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://hotelsamb.com'),
    alternates: {
      canonical: url,
      languages: {
        'en-US': '/en',
        'he-IL': '/he',
        'ar-SA': '/ar',
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Ambassador Hotels Collection',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type as any,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@ambassadorhtls',
      site: '@ambassadorhtls',
    },
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
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
      ],
      other: [
        {
          rel: 'mask-icon',
          url: '/safari-pinned-tab.svg',
        },
      ],
    },
    manifest: '/site.webmanifest',
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
      yahoo: 'yahoo-site-verification-code',
    },
  }
}

export function generateHotelMetadata(hotel: any): Metadata {
  return generateMetadata({
    title: `${hotel.name} - Luxury Hotel in Jerusalem`,
    description: hotel.description || `Experience exceptional hospitality at ${hotel.name}, part of Ambassador Hotels Collection in Jerusalem. Book your stay today.`,
    image: hotel.main_image,
    url: `https://hotelsamb.com/hotels/${hotel.slug}`,
    type: 'hotel' as any,
    keywords: [
      hotel.name,
      `${hotel.name} Jerusalem`,
      'Jerusalem accommodation',
      'luxury hotel Jerusalem'
    ]
  })
}

export function generateRestaurantMetadata(restaurant: any): Metadata {
  return generateMetadata({
    title: `${restaurant.name} - Fine Dining in Jerusalem`,
    description: restaurant.description || `Discover exquisite cuisine at ${restaurant.name}, located in Ambassador Hotels Jerusalem.`,
    image: restaurant.main_image,
    url: `https://hotelsamb.com/restaurants/${restaurant.slug}`,
    type: 'restaurant' as any,
    keywords: [
      restaurant.name,
      `${restaurant.name} restaurant`,
      'Jerusalem dining',
      'kosher restaurant Jerusalem'
    ]
  })
}