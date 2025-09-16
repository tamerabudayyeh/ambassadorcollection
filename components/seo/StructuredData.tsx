import Script from 'next/script'

interface StructuredDataProps {
  data: any
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function generateHotelSchema(hotel: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    'name': hotel.name,
    'description': hotel.description,
    'image': hotel.main_image,
    'logo': hotel.logo_url,
    'url': `https://hotelsamb.com/hotels/${hotel.slug}`,
    'telephone': hotel.contact?.phone || '+972-2-6281999',
    'email': hotel.contact?.email || 'info@hotelsamb.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': hotel.location?.address || 'Jerusalem',
      'addressLocality': hotel.location?.city || 'Jerusalem',
      'addressCountry': 'IL'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': hotel.location?.coordinates?.[0] || 31.7683,
      'longitude': hotel.location?.coordinates?.[1] || 35.2137
    },
    'amenitiesFeature': hotel.amenities?.map((amenity: string) => ({
      '@type': 'LocationFeatureSpecification',
      'name': amenity,
      'value': true
    })) || [],
    'starRating': {
      '@type': 'Rating',
      'ratingValue': hotel.rating || '4.5',
      'bestRating': '5'
    },
    'priceRange': '$$-$$$',
    'hasMap': `https://maps.google.com/?q=${hotel.name},Jerusalem`,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': hotel.rating || '4.5',
      'reviewCount': hotel.review_count || '150'
    }
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Ambassador Hotels Collection',
    'url': 'https://hotelsamb.com',
    'logo': 'https://hotelsamb.com/images/logo.png',
    'sameAs': [
      'https://www.facebook.com/ambassadorhotels',
      'https://www.instagram.com/ambassadorhotels',
      'https://twitter.com/ambassadorhtls'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+972-2-6281999',
      'contactType': 'reservations',
      'areaServed': 'IL',
      'availableLanguage': ['en', 'he', 'ar']
    }
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  }
}

export function generateLocalBusinessSchema(restaurant: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': restaurant.name,
    'description': restaurant.description,
    'image': restaurant.main_image,
    'url': `https://hotelsamb.com/restaurants/${restaurant.slug}`,
    'telephone': '+972-2-6281999',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': restaurant.location || 'Jerusalem',
      'addressLocality': 'Jerusalem',
      'addressCountry': 'IL'
    },
    'servesCuisine': restaurant.cuisine || 'International',
    'priceRange': '$$-$$$',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '07:00',
        'closes': '23:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Saturday', 'Sunday'],
        'opens': '07:00',
        'closes': '23:00'
      }
    ]
  }
}