import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { constructMetadata, generateJsonLd } from '@/components/shared/seo'
import Script from 'next/script'
import { Calendar, Users, MapPin, Sparkles, Clock } from 'lucide-react'
import { StructuredData, generateHotelSchema } from '@/components/seo/StructuredData'
import { generateHotelMetadata } from '@/components/seo/MetaTags'

// Use ISR (Incremental Static Regeneration) for hotel pages
export const revalidate = 3600 // Revalidate every hour

// CRM-based Hotel type
type Hotel = {
  id: string
  name: string
  slug: string
  location: string
  description: string
  image_url: string
  logo_url?: string
  rating?: number
  amenities?: string[]
  contact_phone?: string
  contact_email?: string
  address?: string
  meetingSpaces?: MeetingSpace[]
  gallery?: GalleryImage[]
  venues?: Venue[]
}

type MeetingSpace = {
  id: string
  name: string
  description: string
  image_url: string
  capacity: string
  availability: string
  features: string[]
}

type GalleryImage = {
  id: string
  image_url: string
  alt_text?: string
  caption?: string
}

type Venue = {
  id: string
  name: string
  type: string
  description: string
  image_url?: string
  status: string
}

// Get hotel data from CRM API
async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  // Always use direct Supabase calls to avoid API circular dependency issues
  try {
    const { supabase } = await import('@/lib/supabase')

    // Fetch hotel with related data
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('slug', slug)
      .single()

    if (hotelError || !hotel) {
      console.error('Error fetching hotel from database:', hotelError)
      return null
    }

    // Fetch gallery
    const { data: gallery } = await supabase
      .from('hotel_galleries')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('display_order')

    // Fetch meeting spaces
    const { data: meetingSpaces } = await supabase
      .from('meeting_spaces')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('is_active', true)
      .order('display_order')

    // Combine all data
    return {
      ...hotel,
      gallery: gallery || [],
      meetingSpaces: meetingSpaces || []
    }
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return null
  }
}

export async function generateStaticParams() {
  // For now, return static params for known hotels
  // This avoids build-time API calls that can fail
  return [
    { slug: 'ambassador-jerusalem' },
    { slug: 'ambassador-boutique' },
    { slug: 'ambassador-city' },
    { slug: 'ambassador-comfort' }
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)

  if (!hotel) return {}

  return constructMetadata({
    title: `${hotel.name} | Ambassador Collection`,
    description: hotel.description,
    image: hotel.image_url,
    keywords: [hotel.name, hotel.location, 'hotel', 'accommodation'],
    canonicalUrl: `/hotels/${slug}`,
    type: 'website',
  })
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)

  if (!hotel) return notFound()

  const jsonLd = generateJsonLd('Hotel', {
    name: hotel.name,
    description: hotel.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/hotels/${slug}`,
    telephone: hotel.contact_phone,
    email: hotel.contact_email,
    streetAddress: hotel.address,
    city: hotel.location,
    rating: hotel.rating,
    amenities: hotel.amenities,
    images: hotel.gallery?.map(img => img.image_url) || [hotel.image_url],
  })

  // Generate structured data for SEO
  const hotelSchema = generateHotelSchema({
    ...hotel,
    main_image: hotel.image_url,
    contact: {
      phone: hotel.contact_phone,
      email: hotel.contact_email
    },
    location: {
      address: hotel.address,
      city: hotel.location
    }
  })

  return (
    <>
      <Script
        id="hotel-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StructuredData data={hotelSchema} />

      <div>
        {/* Hero Section */}
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          <Image
            src={hotel.image_url}
            alt={hotel.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Hotel Logo */}
          {hotel.logo_url && (
            <div className="absolute top-8 right-8 z-20">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                <Image
                  src={hotel.logo_url}
                  alt={`${hotel.name} logo`}
                  width={120}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
          )}

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-6">
              {hotel.location}
            </p>
            <h1 className="text-5xl md:text-7xl font-serif font-light mb-8 leading-tight">
              {hotel.name}
            </h1>
            <p className="text-lg font-light text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {hotel.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="mb-16">
              <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-4">
                About Our Property
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
                {hotel.name}
              </h2>
              <div className="w-24 h-px bg-amber-600 mb-8"></div>
              <p className="text-lg font-light text-gray-600 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* Meeting Spaces Section */}
            {hotel.meetingSpaces && hotel.meetingSpaces.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-serif font-light text-gray-900 mb-8">
                  Meeting & Event Spaces
                </h3>
                <div className="space-y-12">
                  {hotel.meetingSpaces.map((space) => (
                    <div key={space.id} className="grid lg:grid-cols-2 gap-8 items-center">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                          src={space.image_url}
                          alt={space.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xl font-serif font-light text-gray-900 mb-3">
                            {space.name}
                          </h4>
                          <p className="text-gray-600 font-light leading-relaxed mb-4">
                            {space.description}
                          </p>
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
                          <h5 className="text-sm font-medium text-gray-900 mb-3">
                            Features & Amenities
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {space.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <Sparkles size={14} className="text-amber-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Book Button */}
                        <div className="pt-4">
                          <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors duration-300 text-sm"
                          >
                            <span>Book This Space</span>
                            <Calendar size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white p-8 shadow-lg">
              <Link
                href={`/booking?hotel=${encodeURIComponent(hotel.name)}`}
                className="block w-full text-center bg-amber-600 text-white py-4 px-6 font-light text-sm uppercase tracking-wider hover:bg-amber-700 transition-all duration-300 mb-6"
              >
                Reserve Your Stay
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        {hotel.gallery && hotel.gallery.length > 0 && (
          <section className="py-20 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-20">
                <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-6">
                  Visual Journey
                </p>
                <h2 className="text-4xl md:text-6xl font-serif font-light text-white mb-8">
                  Immerse Yourself
                </h2>
                <div className="w-24 h-px bg-amber-600 mx-auto mb-8"></div>
                <p className="text-lg font-light text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Step inside and discover the luxury that awaits you
                </p>
              </div>

              {/* Simple Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                {hotel.gallery.map((image, i) => (
                  <div key={image.id} className="relative aspect-[4/3] group overflow-hidden cursor-pointer">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || `${hotel.name} gallery image ${i + 1}`}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}