import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Users, Award, Coffee, Heart, Building, Globe } from 'lucide-react'

export const metadata = {
  title: 'Our Story – Ambassador Collection',
  description: 'The story of authentic Jerusalem hospitality—heritage, warmth, and boutique luxury across our hotels in Jerusalem and Bethlehem.',
}

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/AmbassadorBoutique/BoutiqueJuniorSuite1.webp"
            alt="Ambassador Collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-light mb-6 leading-tight">
            Hospitality with a Heart — Since the Beginning
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-200 max-w-3xl mx-auto">
            Ambassador Collection is where warmth, comfort, and tradition meet boutique luxury. Rooted in Jerusalem and Bethlehem, we welcome every guest like family.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8 text-center">Our Story</h2>
            <p className="text-lg font-light text-gray-700 leading-relaxed">
              For decades, the Ambassador name has been woven into the life of the Holy Land. What began as a single hotel in East Jerusalem grew into a collection known for genuine warmth, trusted service, and a timeless sense of home. Today, our four properties—Ambassador Jerusalem, Ambassador Boutique, Ambassador Comfort, and Ambassador City Bethlehem—carry one promise: authentic Jerusalem hospitality, delivered with care.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">Vision</h2>
            <p className="text-lg font-light text-gray-700 leading-relaxed">
              To be a boutique luxury chain recognized internationally for authentic Jerusalem hospitality—where every stay feels like home and every moment carries a sense of place.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-12 text-center">
              What Makes Us Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Heart className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light mb-3">Warmth First</h3>
                  <p className="text-gray-600 font-light">
                    Our teams remember faces, preferences, and names—hospitality that feels personal.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Building className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light mb-3">A Sense of Home</h3>
                  <p className="text-gray-600 font-light">
                    Calm, comfortable spaces with thoughtful details, designed for rest and belonging.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light mb-3">Rooted in Place</h3>
                  <p className="text-gray-600 font-light">
                    An East Jerusalem spirit you can feel—close to the Old City, close to the community.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light mb-3">Trusted by Generations</h3>
                  <p className="text-gray-600 font-light">
                    Business leaders, pilgrims, and locals return because they know what to expect: quiet excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-12 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-serif font-light mb-2">Welcoming</h3>
                <p className="text-gray-600 font-light text-sm">
                  Every arrival is met with care and kindness.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-serif font-light mb-2">Authentic</h3>
                <p className="text-gray-600 font-light text-sm">
                  True to our heritage, honest in our craft.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-serif font-light mb-2">Attentive</h3>
                <p className="text-gray-600 font-light text-sm">
                  Detail-driven service, without pretense.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-serif font-light mb-2">Refined</h3>
                <p className="text-gray-600 font-light text-sm">
                  Boutique luxury—elegant, calm, and timeless.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ambassador Welcome */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">
              The Ambassador Welcome
            </h2>
            <p className="text-xl font-light text-amber-700 mb-6">Signature Ritual</p>
            <p className="text-lg font-light text-gray-700 leading-relaxed">
              Every arrival is a celebration. From a glass of chilled Cava at Ambassador Jerusalem, to a refreshing cocktail or fresh orange juice at Ambassador Boutique, and traditional local refreshments at Comfort and City—our welcome is a small ritual with a big meaning: you are home.
            </p>
          </div>
        </div>
      </section>

      {/* Culinary */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8 text-center">
              Al-Diwan & Beyond
            </h2>
            <p className="text-lg font-light text-gray-700 leading-relaxed text-center">
              Food at Ambassador tells the story of the Holy Land. At Al-Diwan, our flagship restaurant in Ambassador Jerusalem, classic Middle Eastern flavors are prepared with refinement and heart. Seasonal menus, local produce, and cultural food events bring guests and the community together around the table.
            </p>
          </div>
        </div>
      </section>

      {/* Community & Culture */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">
              Community & Culture
            </h2>
            <p className="text-lg font-light text-gray-700 leading-relaxed">
              We are part of the neighborhoods we serve. From long-standing local partnerships to family celebrations and community gatherings, Ambassador hotels are living rooms for Jerusalem and Bethlehem—places to meet, belong, and return to.
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">
              Sustainability
            </h2>
            <p className="text-lg font-light text-gray-700 leading-relaxed">
              We believe genuine hospitality cares for people and place. Our teams continue to evolve responsible sourcing, waste reduction, energy use, and local collaborations across the Collection.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-light text-white mb-8 leading-relaxed">
              Whether you are here for business, pilgrimage, or celebration—welcome to the Ambassador Collection, your home in the heart of the Holy Land.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/hotels"
                className="px-8 py-3 bg-amber-600 text-white font-light text-sm uppercase tracking-wider hover:bg-amber-700 transition-all duration-300"
              >
                Explore Our Hotels
              </Link>
              <Link
                href="/booking"
                className="px-8 py-3 border border-white text-white font-light text-sm uppercase tracking-wider hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Book Your Stay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}