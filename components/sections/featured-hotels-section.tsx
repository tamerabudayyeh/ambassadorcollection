'use client'

import { motion } from 'framer-motion'
import { HotelCard } from '@/components/hotel/hotel-card'
import { urlFor } from '@/lib/imageUrl'

interface Hotel {
  _id: string
  name: string
  slug: { current: string }
  location: string
  description: string
  image: any
  rating?: number
  featured?: boolean
  order?: number
}

interface FeaturedHotelsSectionProps {
  hotels: Hotel[]
}

export function FeaturedHotelsSection({ hotels }: FeaturedHotelsSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-4">
            Our Hotels
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
            Four Distinctive Properties
          </h2>
          <div className="w-24 h-px bg-amber-600 mx-auto mb-6"></div>
          <p className="text-lg font-light text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Each hotel in the Ambassador Collection has its own character and story, 
            united by our commitment to warmth, comfort, and genuine hospitality
          </p>
        </motion.div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <motion.div
              key={hotel._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <HotelCard
                slug={hotel.slug.current}
                name={hotel.name}
                location={hotel.location}
                description={hotel.description}
                image={urlFor(hotel.image).width(800).height(600).url()}
                rating={hotel.rating}
                featured={hotel.featured}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="/hotels"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gray-900 text-gray-900 font-light text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            View All Properties
          </a>
        </motion.div>
      </div>
    </section>
  )
}