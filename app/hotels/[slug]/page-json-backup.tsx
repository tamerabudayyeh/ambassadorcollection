import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/imageUrl'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { constructMetadata, generateJsonLd } from '@/components/shared/seo'
import { CreativeGallery } from '@/components/hotel/creative-gallery'
import Script from 'next/script'
import { Metadata } from 'next'
import hotelsData from '@/Data/hotels.json'
import { Calendar, Users, MapPin, Sparkles, Clock } from 'lucide-react'

type Hotel = {
  _id: string
  name: string
  slug: { current: string }
  location: string
  address?: string
  description: string
  longDescription?: any[]
  image: {
    _type: string
    asset: {
      _ref: string
      _type: string
    }
    alt?: string
  }
  gallery?: {
    _type: string
    asset: {
      _ref: string
      _type: string
    }
    alt?: string
    caption?: string
  }[]
  bookingUrl?: string
  price?: number
  amenities?: { icon?: string; title: string; description?: string }[]
  rooms?: any[]
  contact?: {
    phone?: string
    email?: string
    whatsapp?: string
  }
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    tripadvisor?: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
  rating?: number
  checkInTime?: string
  checkOutTime?: string
  policies?: { title: string; description: string }[]
  nearbyAttractions?: { name: string; distance: string; description: string }[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    ogImage?: any
  }
}

export async function generateStaticParams() {
  // Get slugs from both Sanity and JSON data
  let allSlugs: string[] = []

  // Try to get from Sanity first
  try {
    const sanitySlugs: { slug: { current: string } }[] = await client.fetch(
      `*[_type == "hotel"]{ slug }`
    )
    allSlugs = sanitySlugs.map(({ slug }) => slug.current)
  } catch (error) {
    console.log('Sanity fetch failed for generateStaticParams')
  }

  // Add JSON hotel slugs
  const jsonSlugs = hotelsData.map(hotel => hotel.slug)
  allSlugs = [...allSlugs, ...jsonSlugs]

  // Remove duplicates
  const uniqueSlugs = Array.from(new Set(allSlugs))

  return uniqueSlugs.map(slug => ({
    slug: slug,
  }))
}

// Get hotel from JSON data
function getHotelFromJSON(slug: string) {
  return hotelsData.find(hotel => hotel.slug === slug) || null
}

async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  // Check JSON data first (this contains our meetingSpaces)
  const jsonHotel = getHotelFromJSON(slug)
  if (jsonHotel) {
    console.log(`Found JSON hotel data for ${slug}:`, jsonHotel)
    // Convert JSON format to match expected Hotel type
    return {
      _id: jsonHotel.slug,
      name: jsonHotel.name,
      slug: { current: jsonHotel.slug },
      location: jsonHotel.location,
      description: jsonHotel.description,
      image: jsonHotel.image, // Keep as string URL
      gallery: jsonHotel.gallery || [], // Keep as array of strings
      // Add meeting spaces data
      meetingSpaces: (jsonHotel as any).meetingSpaces || []
    } as any
  }

  // Fallback to Sanity CMS
  try {
    const sanityHotel = await client.fetch(
      `*[_type == "hotel" && slug.current == $slug][0]`,
      { slug }
    )
    if (sanityHotel) return sanityHotel
  } catch (error) {
    console.log('Sanity fetch failed:', error)
  }

  return null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug)

  if (!hotel) return {}

  // Check if hotel is from JSON data (has string URLs) vs Sanity data
  const isFromJsonData = typeof hotel.image === 'string'

  const seoTitle = hotel.seo?.metaTitle || hotel.name
  const seoDescription = hotel.seo?.metaDescription || hotel.description
  const seoImage = hotel.seo?.ogImage
    ? getImageUrl(hotel.seo.ogImage, isFromJsonData)
    : getImageUrl(hotel.image, isFromJsonData)
  
  return constructMetadata({
    title: seoTitle,
    description: seoDescription,
    image: seoImage,
    keywords: hotel.seo?.keywords || [hotel.name, hotel.location, 'hotel', 'accommodation'],
    canonicalUrl: `/hotels/${slug}`,
    type: 'website',
  })
}

// Helper function to get image URL
function getImageUrl(imageData: any, isJsonData: boolean = false): string {
  console.log('getImageUrl called with:', { imageData: typeof imageData === 'string' ? imageData : 'object', isJsonData })

  // For JSON data, return the URL directly if it's a string
  if (isJsonData && typeof imageData === 'string') {
    console.log('Returning JSON string URL:', imageData)
    return imageData
  }

  // For JSON data objects, check if asset._ref is actually a URL
  if (isJsonData && imageData?.asset?._ref && typeof imageData.asset._ref === 'string' && imageData.asset._ref.startsWith('http')) {
    console.log('Returning JSON asset URL:', imageData.asset._ref)
    return imageData.asset._ref
  }

  // For Sanity CMS data, use urlFor function
  if (!isJsonData && imageData && typeof urlFor === 'function') {
    try {
      console.log('Using urlFor for Sanity data')
      return urlFor(imageData).url()
    } catch (error) {
      console.log('urlFor failed, returning raw data:', error)
      return imageData || ''
    }
  }

  console.log('Fallback return:', imageData || '')
  return imageData || ''
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug)

  if (!hotel) return notFound()

  // Check if this is JSON data by looking for meetingSpaces
  const isJsonData = !!(hotel as any).meetingSpaces
  const jsonHotel = isJsonData ? getHotelFromJSON(slug) : null

  console.log('Hotel data for slug:', slug)
  console.log('isJsonData:', isJsonData)
  console.log('jsonHotel:', jsonHotel)
  console.log('meetingSpaces:', jsonHotel?.meetingSpaces)

  const jsonLd = generateJsonLd('Hotel', {
    name: hotel.name,
    description: hotel.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/hotels/${slug}`,
    telephone: hotel.contact?.phone,
    email: hotel.contact?.email,
    streetAddress: hotel.address,
    city: hotel.location,
    coordinates: hotel.coordinates,
    rating: hotel.rating,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    amenities: hotel.amenities,
    images: hotel.gallery ? hotel.gallery.map((img: any) => getImageUrl(img, isJsonData)) : [getImageUrl(hotel.image, isJsonData)],
  })

  return (
    <>
      <Script
        id="hotel-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div>
        {/* Hero */}
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          <Image
            src={getImageUrl(hotel.image, isJsonData)}
            alt={hotel.image?.alt || hotel.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Content */}
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-6">
              {hotel.location}
            </p>
            <h1 className="text-5xl md:text-7xl font-serif font-light mb-8 leading-tight">
              {hotel.name}
            </h1>
            {hotel.rating && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-amber-400">{'★'.repeat(Math.floor(hotel.rating))}</span>
                <span className="text-sm font-light tracking-wide">{hotel.rating} Star Experience</span>
              </div>
            )}
            <p className="text-lg font-light text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {hotel.description}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="mb-16">
              <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-4">
                About Our Property
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
                {hotel.name}
              </h2>
              <div className="w-24 h-px bg-amber-600 mb-8"></div>
              <p className="text-lg font-light text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            {hotel.longDescription && (
              <div className="prose prose-gray max-w-none mb-8">
                {/* Render portable text content here if using Sanity's portable text */}
              </div>
            )}

            {/* Amenities */}
            {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-serif font-light text-gray-900 mb-8">Amenities & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hotel.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-serif font-light text-gray-900 mb-1">{amenity.title}</p>
                        {amenity.description && (
                          <p className="text-sm font-light text-gray-600 leading-relaxed">{amenity.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Spaces - Only show for hotels with meeting spaces */}
            {jsonHotel?.meetingSpaces && jsonHotel.meetingSpaces.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-serif font-light text-gray-900 mb-8">Meeting & Event Spaces</h3>
                {jsonHotel.meetingSpaces.map((space: any, i: number) => (
                  <div key={i} className={`${i > 0 ? 'mt-12 pt-12 border-t border-gray-200' : ''}`}>
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Image */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                          src={space.image}
                          alt={space.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xl font-serif font-light text-gray-900 mb-3">{space.name}</h4>
                          <p className="text-gray-600 font-light leading-relaxed mb-4">{space.description}</p>
                        </div>

                        {/* Capacity & Availability */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-gray-100">
                          <div className="flex items-center gap-2">
                            <Users size={18} className="text-amber-600" />
                            <span className="text-sm text-gray-900">{space.capacity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-amber-600" />
                            <span className="text-sm text-gray-900">{space.availability}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Features & Amenities</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {space.features.map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <Sparkles size={14} className="text-amber-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4">
                          <a
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors duration-300 text-sm"
                          >
                            <span>Book This Space</span>
                            <Calendar size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Check-in/out Times */}
            {(hotel.checkInTime || hotel.checkOutTime) && (
              <div className="mb-16 p-8 bg-gray-50">
                <h3 className="text-2xl font-serif font-light text-gray-900 mb-6">Arrival & Departure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hotel.checkInTime && (
                    <div>
                      <p className="text-sm font-light tracking-wider uppercase text-amber-600 mb-2">Check-in</p>
                      <p className="text-lg font-light text-gray-900">{hotel.checkInTime}</p>
                    </div>
                  )}
                  {hotel.checkOutTime && (
                    <div>
                      <p className="text-sm font-light tracking-wider uppercase text-amber-600 mb-2">Check-out</p>
                      <p className="text-lg font-light text-gray-900">{hotel.checkOutTime}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rooms Section */}
            {Array.isArray(hotel.rooms) && hotel.rooms.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-serif font-light text-gray-900 mb-8">Accommodations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hotel.rooms.map((room, i) => (
                    <div key={i} className="bg-gray-50 p-6">
                      {room.image && (
                        <div className="relative h-48 mb-4 overflow-hidden">
                          <Image
                            src={getImageUrl(room.image, isJsonData)}
                            alt={room.name || `Room ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <h4 className="text-lg font-serif font-light text-gray-900 mb-2">{room.name || `Room ${i + 1}`}</h4>
                      {room.description && (
                        <p className="text-sm font-light text-gray-600 leading-relaxed mb-4">{room.description}</p>
                      )}
                      {room.amenities && (
                        <div className="space-y-2">
                          {room.amenities.map((amenity: string, j: number) => (
                            <div key={j} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                              <span className="text-xs font-light text-gray-600">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {room.price && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-lg font-serif font-light text-gray-900">
                            ${room.price} <span className="text-sm text-gray-500">per night</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Attractions */}
            {Array.isArray(hotel.nearbyAttractions) && hotel.nearbyAttractions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Nearby Attractions</h3>
                <div className="space-y-3">
                  {hotel.nearbyAttractions.map((attraction, i) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{attraction.name}</h4>
                        <span className="text-sm text-gray-600">{attraction.distance}</span>
                      </div>
                      {attraction.description && (
                        <p className="text-sm text-gray-600 mt-1">{attraction.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            {Array.isArray(hotel.policies) && hotel.policies.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Hotel Policies</h3>
                <div className="space-y-3">
                  {hotel.policies.map((policy, i) => (
                    <div key={i}>
                      <h4 className="font-medium mb-1">{policy.title}</h4>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white p-8 shadow-lg">
              {hotel.price && (
                <div className="mb-8">
                  <h3 className="text-4xl font-serif font-light text-gray-900 mb-2">
                    ${hotel.price}
                  </h3>
                  <p className="text-sm font-light tracking-wider uppercase text-gray-500">per night</p>
                </div>
              )}
              
              <a
                href={`/booking?hotel=${encodeURIComponent(hotel.name)}`}
                className="block w-full text-center bg-amber-600 text-white py-4 px-6 font-light text-sm uppercase tracking-wider hover:bg-amber-700 transition-all duration-300 mb-6"
              >
                Reserve Your Stay
              </a>

              {/* Contact Info */}
              {hotel.contact && (
                <div className="mt-6 space-y-2 border-t pt-4">
                  {hotel.contact.phone && (
                    <a href={`tel:${hotel.contact.phone}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                      <span>📞</span> {hotel.contact.phone}
                    </a>
                  )}
                  {hotel.contact.email && (
                    <a href={`mailto:${hotel.contact.email}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                      <span>✉️</span> {hotel.contact.email}
                    </a>
                  )}
                  {hotel.contact.whatsapp && (
                    <a href={`https://wa.me/${hotel.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-green-600">
                      <span>💬</span> WhatsApp
                    </a>
                  )}
                </div>
              )}

              {/* Social Media */}
              {hotel.socialMedia && (
                <div className="mt-4 flex gap-3 justify-center border-t pt-4">
                  {hotel.socialMedia.facebook && (
                    <a href={hotel.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <span className="sr-only">Facebook</span>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                      </svg>
                    </a>
                  )}
                  {hotel.socialMedia.instagram && (
                    <a href={hotel.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                      <span className="sr-only">Instagram</span>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                      </svg>
                    </a>
                  )}
                  {hotel.socialMedia.tripadvisor && (
                    <a href={hotel.socialMedia.tripadvisor} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                      <span className="sr-only">TripAdvisor</span>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <CreativeGallery images={hotel.gallery || []} hotelName={hotel.name} />

        {/* Map Section */}
        {hotel.coordinates && (
          <div className="py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-semibold mb-6 text-center">Location</h2>
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Map integration would go here</p>
                {/* You can integrate Google Maps or another mapping service here */}
              </div>
              {hotel.address && (
                <p className="text-center mt-4 text-gray-700">
                  📍 {hotel.address}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}