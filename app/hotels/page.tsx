import Image from 'next/image'
import Link from 'next/link'
import { constructMetadata, generateJsonLd } from '@/components/shared/seo'
import { Metadata } from 'next'
import hotelsData from '@/Data/hotels.json'

type Hotel = {
  slug: string
  name: string
  location: string
  description: string
  image: string
  rating?: number
  featured?: boolean
  order?: number
  character?: string
  heritage?: string
}

export const metadata: Metadata = constructMetadata({
  title: 'Our Collection | Luxury Hotels in the Heart of the Holy Land',
  description: 'Experience authentic Jerusalem hospitality at the Ambassador Collection. Four distinctive properties where ancient heritage meets modern luxury in Jerusalem and Bethlehem.',
  keywords: [
    'Ambassador Collection hotels',
    'Jerusalem hotels',
    'Bethlehem hotels',
    'luxury hotels Holy Land',
    'boutique hotels Jerusalem',
    'authentic Jerusalem hospitality',
    'hotels near Old City',
    'pilgrimage accommodation',
    'heritage hotels Palestine'
  ],
  canonicalUrl: '/hotels',
})

const getHotels = (): Hotel[] => {
  // Enhanced hotel data with unique characteristics
  const hotelCharacteristics = [
    {
      character: "Classic Elegance",
      heritage: "Nestled in the diplomatic quarter, where history whispers through olive-lined streets"
    },
    {
      character: "Intimate Luxury",
      heritage: "A sophisticated retreat in the heart of the new city, steps from ancient walls"
    },
    {
      character: "Sacred Journey",
      heritage: "Where the Star of Bethlehem guides pilgrims on their spiritual odyssey"
    },
    {
      character: "Timeless Heritage",
      heritage: "A century of hospitality overlooking the sacred Mount of Olives"
    }
  ]

  return hotelsData.map((hotel, index) => ({
    ...hotel,
    rating: [4.5, 4.3, 4.4, 4.2][index],
    featured: index < 2,
    order: index + 1,
    character: hotelCharacteristics[index]?.character,
    heritage: hotelCharacteristics[index]?.heritage
  }))
}

function HotelShowcase({ hotel, index }: { hotel: Hotel; index: number }) {
  const isEven = index % 2 === 0
  
  return (
    <div className="mb-32 last:mb-0">
      <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:grid-cols-2'}`}>
        {/* Image Section */}
        <div className={`relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="relative aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src={hotel.image || 'https://cdn.sanity.io/images/qr7oyxid/production/8da3cd1a1e4d887be72e7d9182b58d10c80a3024-1024x636.jpg?rect=88,0,848,636&w=800&h=600'}
              alt={hotel.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            {/* Character Badge */}
            {hotel.character && (
              <div className="absolute top-6 left-6 glass-morphism-dark text-white px-4 py-2 rounded-full text-sm font-light tracking-wider">
                {hotel.character}
              </div>
            )}
            
            {/* Rating */}
            {hotel.rating && (
              <div className="absolute top-6 right-6 glass-morphism text-stone-900 px-3 py-2 rounded-full">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  <span className="text-sm font-medium">{hotel.rating}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className={`absolute -z-10 w-72 h-72 rounded-full blur-3xl opacity-20 ${
            index === 0 ? 'bg-gradient-to-br from-amber-300 to-orange-300 -top-16 -right-16' :
            index === 1 ? 'bg-gradient-to-br from-rose-300 to-pink-300 -bottom-16 -left-16' :
            index === 2 ? 'bg-gradient-to-br from-emerald-300 to-teal-300 -top-16 -left-16' :
            'bg-gradient-to-br from-violet-300 to-purple-300 -bottom-16 -right-16'
          }`} />
        </div>
        
        {/* Content Section */}
        <div className={`space-y-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-stone-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-light tracking-wide font-body">{hotel.location}</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-heading font-light text-stone-900 leading-tight">
              {hotel.name}
            </h3>
            
            {hotel.heritage && (
              <p className="text-lg text-amber-700 font-light italic leading-relaxed font-body">
                "{hotel.heritage}"
              </p>
            )}
            
            <p className="text-lg text-stone-600 font-light leading-relaxed font-body">
              {hotel.description}
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-900 mb-1 font-body">Prime Location</p>
                <p className="text-sm text-stone-600 font-light leading-relaxed font-body">
                  Minutes from sacred sites and cultural landmarks
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-rose-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-900 mb-1 font-body">Personal Service</p>
                <p className="text-sm text-stone-600 font-light leading-relaxed font-body">
                  Dedicated concierge for authentic local experiences
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-900 mb-1 font-body">Modern Comfort</p>
                <p className="text-sm text-stone-600 font-light leading-relaxed font-body">
                  Contemporary amenities with traditional warmth
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-violet-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-900 mb-1 font-body">Cultural Connection</p>
                <p className="text-sm text-stone-600 font-light leading-relaxed font-body">
                  Immersive local experiences and storytelling
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link 
              href={`/hotels/${hotel.slug}`}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white font-medium text-sm uppercase tracking-wider hover:from-stone-800 hover:to-stone-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl font-body"
            >
              <span>Discover More</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              href={`/booking?hotel=${encodeURIComponent(hotel.name)}`}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-medium text-sm uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl font-body"
            >
              <span>Reserve Now</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HotelsPage() {
  const hotels = getHotels()
  const featuredHotels = hotels.filter(h => h.featured)

  // Generate structured data for all hotels
  const hotelSchemas = hotels.map(hotel => generateJsonLd('Hotel', {
    name: hotel.name,
    description: hotel.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ambassadorcollection.com'}/hotels/${hotel.slug}`,
    image: hotel.image,
    telephone: '+972-2-123-4567',
    email: 'info@ambassadorcollection.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.location,
      addressCountry: hotel.location.includes('Bethlehem') ? 'PS' : 'IL'
    },
    priceRange: '$$-$$$',
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.rating || 4,
      bestRating: 5
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: '24/7 Front Desk', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Concierge Service', value: true }
    ]
  }))

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hotelSchemas),
        }}
      />
      
      <div className="min-h-screen bg-stone-50">
        {/* Hero Section - Your Home in the Heart of the Holy Land */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background with Jerusalem imagery */}
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              <Image
                src="https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/AmbassadorComfort/ComfortRooftop.webp"
                alt="Jerusalem Old City at sunset"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-800/40 to-stone-900/70" />
            </div>
          </div>

          {/* Floating elements for depth */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 w-2 h-2 bg-amber-200/30 rounded-full animate-float" />
            <div className="absolute top-1/3 right-20 w-3 h-3 bg-rose-200/20 rounded-full animate-float-delayed" />
            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-stone-200/40 rounded-full animate-pulse" />
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-6 md:px-8">
            <div className="animate-fade-up">
              <p className="text-sm md:text-base font-light tracking-[0.3em] uppercase text-amber-200/90 mb-8 font-body">
                Ambassador Collection
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-light mb-10 leading-[1.1]">
                Your Home in the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300">
                  Heart of the Holy Land
                </span>
              </h1>
              <p className="text-lg md:text-xl font-light text-stone-200 max-w-3xl mx-auto leading-relaxed mb-12 font-body">
                Four distinctive properties where authentic Jerusalem hospitality embraces every guest. 
                Where ancient stones tell stories and modern comfort creates memories.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="flex items-center gap-4 text-stone-300">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
                  <span className="text-sm font-light tracking-wider font-body">Established Heritage</span>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 font-body">
                    Our Story
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-stone-900 leading-tight">
                    Where Every Stay
                    <br />
                    <span className="text-amber-700">Becomes a Memory</span>
                  </h2>
                  <p className="text-lg font-light text-stone-600 leading-relaxed font-body">
                    For generations, our family has welcomed pilgrims, travelers, and dreamers to the Holy Land. 
                    Each Ambassador Collection property embodies our commitment to authentic hospitality, 
                    where ancient traditions meet modern luxury.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-heading font-medium text-stone-900">Heritage & Tradition</h3>
                    </div>
                    <p className="text-stone-600 font-light leading-relaxed font-body">
                      Deep roots in Jerusalem hospitality spanning decades of welcoming guests from around the world.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-rose-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                      </div>
                      <h3 className="font-heading font-medium text-stone-900">Personal Touch</h3>
                    </div>
                    <p className="text-stone-600 font-light leading-relaxed font-body">
                      Every detail crafted with care, from personalized service to locally-inspired comfort.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/AmbassadorBoutique/RedVelvetBoutique2.webp"
                    alt="Traditional Jerusalem architecture"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-8 -left-8 w-24 h-24 border border-amber-200/30 rounded-full animate-pulse-slow" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-rose-100/50 to-amber-100/50 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Hotel Showcase - Each hotel gets unique treatment */}
        <section className="py-20 lg:py-32 bg-stone-50">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center mb-20">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 mb-6 font-body">
                Our Collection
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-stone-900 mb-8 leading-tight">
                Four Distinctive Properties
                <br />
                <span className="text-amber-700">One Unforgettable Experience</span>
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto" />
            </div>
            
            {hotels.map((hotel, index) => (
              <HotelShowcase key={hotel.slug} hotel={hotel} index={index} />
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 mb-6 font-body">
                The Ambassador Experience
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-light text-stone-900 mb-8">
                Beyond Accommodation
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-medium text-stone-900">Prime Locations</h3>
                <p className="text-stone-600 font-light leading-relaxed font-body">
                  Strategic positions in Jerusalem and Bethlehem, placing sacred sites and cultural treasures at your doorstep.
                </p>
              </div>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-medium text-stone-900">Personalized Service</h3>
                <p className="text-stone-600 font-light leading-relaxed font-body">
                  Our dedicated team anticipates your needs, creating bespoke experiences that transform stays into cherished memories.
                </p>
              </div>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-medium text-stone-900">Cultural Immersion</h3>
                <p className="text-stone-600 font-light leading-relaxed font-body">
                  Authentic connections to local traditions, cuisine, and stories that reveal the true spirit of the Holy Land.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
          <div className="max-w-4xl mx-auto text-center px-6 md:px-8">
            <div className="space-y-8">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-200/90 font-body">
                Begin Your Journey
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white leading-tight">
                Let Us Welcome You
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-200">
                  Home
                </span>
              </h2>
              <p className="text-lg font-light text-stone-200 max-w-2xl mx-auto leading-relaxed font-body">
                Our hospitality experts are here to guide you to the perfect sanctuary for your Holy Land pilgrimage or cultural exploration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <Link 
                  href="/contact" 
                  className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium text-sm uppercase tracking-wider hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl font-body"
                >
                  <span className="flex items-center gap-2">
                    Start Your Journey
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
                
                <div className="flex items-center gap-4 text-stone-300">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent" />
                  <span className="text-sm font-light">or</span>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent" />
                </div>
                
                <a 
                  href="tel:+972-2-123-4567" 
                  className="group px-8 py-4 border border-stone-400/50 text-stone-200 font-medium text-sm uppercase tracking-wider hover:border-amber-400 hover:text-amber-200 transition-all duration-300 transform hover:-translate-y-1 font-body"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call +972-2-123-4567
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}