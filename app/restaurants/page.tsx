import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, ChefHat, Wine, Star } from 'lucide-react'
import { constructMetadata } from '@/components/shared/seo'
import { Metadata } from 'next'

// Force dynamic rendering during build
export const dynamic = 'force-dynamic'

interface Restaurant {
  id: string
  slug: string
  name: string
  location: string
  cuisine: string
  description: string
  image: string
  hours: {
    availability?: string
    breakfast?: string
    lunch?: string
    dinner?: string
  }
  features: string[]
  status: string
  hotel: {
    id: string
    name: string
    slug: string
    location: string
  }
}

async function getRestaurants(): Promise<Restaurant[]> {
  // Always use direct Supabase calls to avoid API circular dependency issues
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        hotel:hotels(
          id,
          name,
          slug,
          location
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching restaurants:', error)
      return []
    }
    return restaurants || []
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

export const metadata: Metadata = constructMetadata({
  title: 'Restaurants | Culinary Excellence at Ambassador Collection',
  description: 'Discover exceptional dining at Al-Diwan Restaurant. Experience authentic Middle Eastern cuisine and traditional Palestinian flavors in the heart of the Holy Land.',
  keywords: [
    'Al-Diwan Restaurant Jerusalem',
    'Bistecca Steakhouse',
    'Jerusalem restaurants',
    'Middle Eastern cuisine',
    'Palestinian food Jerusalem',
    'luxury dining Holy Land',
    'halal restaurants Jerusalem',
    'kosher restaurants Jerusalem'
  ],
  canonicalUrl: '/restaurants',
})

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://cdn.sanity.io/images/qr7oyxid/production/96162c2a7d1761f1d877e7ad11df394c1bb83bec-1024x683.jpg"
            alt="Ambassador Collection Restaurants"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-light mb-6 leading-tight">
            Culinary Excellence
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-200 max-w-3xl mx-auto">
            Experience the authentic flavors of traditional Palestinian and Middle Eastern cuisine at Al-Diwan Restaurant, where every meal is a journey through local heritage.
          </p>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {restaurants.map((restaurant, index) => (
              <div key={restaurant.slug} className={`${index > 0 ? 'mt-32' : ''}`}>
                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? '' : ''}`}>
                  {/* Image Section */}
                  <div className={`relative ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Status Badge */}
                      {restaurant.status === 'coming_soon' && (
                        <div className="absolute top-6 left-6 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-light tracking-wider">
                          Coming Soon
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className={`space-y-6 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">
                        {restaurant.name}
                      </h2>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span className="text-sm">{restaurant.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChefHat size={16} />
                          <span className="text-sm">{restaurant.cuisine}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 font-light leading-relaxed">
                        {restaurant.description}
                      </p>
                    </div>

                    {/* Hours */}
                    {restaurant.hours && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Clock size={18} />
                          {restaurant.hours.availability ? 'Availability' : 'Opening Hours'}
                        </h3>
                        <div className="space-y-2">
                          {restaurant.hours.availability && (
                            <div className="text-sm text-gray-900">{restaurant.hours.availability}</div>
                          )}
                          {restaurant.hours.breakfast && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Breakfast</span>
                              <span className="text-gray-900">{restaurant.hours.breakfast}</span>
                            </div>
                          )}
                          {restaurant.hours.lunch && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Lunch</span>
                              <span className="text-gray-900">{restaurant.hours.lunch}</span>
                            </div>
                          )}
                          {restaurant.hours.dinner && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Dinner</span>
                              <span className="text-gray-900">{restaurant.hours.dinner}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {restaurant.features && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Highlights</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {restaurant.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <Star size={14} className="text-amber-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    {restaurant.status === 'open' ? (
                      <div className="pt-4">
                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors duration-300"
                        >
                          <span>Reserve a Table</span>
                          <Wine size={18} />
                        </Link>
                      </div>
                    ) : (
                      <div className="pt-4">
                        <button
                          disabled
                          className="inline-flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-full cursor-not-allowed"
                        >
                          <span>Opening Soon</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining Experience Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">
              An Unforgettable Dining Experience
            </h2>
            <p className="text-lg font-light text-gray-700 leading-relaxed mb-12">
              Our restaurants are more than just dining venues—they are culinary destinations where every meal becomes a memorable journey. From the authentic flavors of the Middle East to contemporary international cuisine, we welcome you to experience the ultimate in hospitality and gastronomy.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <ChefHat className="text-amber-600" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Master Chefs</h3>
                <p className="text-sm text-gray-600 font-light">
                  Expert culinary teams dedicated to creating exceptional dishes
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="text-amber-600" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-sm text-gray-600 font-light">
                  Only the finest ingredients sourced locally and internationally
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <Wine className="text-amber-600" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Curated Selection</h3>
                <p className="text-sm text-gray-600 font-light">
                  Extensive wine lists and beverage offerings to complement every meal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}