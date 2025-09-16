import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Sparkles } from 'lucide-react'
import upcomingHotelsData from '@/Data/upcoming-hotels.json'

export function UpcomingHotelsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-amber-600" size={24} />
            <span className="text-sm font-light tracking-widest uppercase text-amber-600">
              Coming Soon
            </span>
            <Sparkles className="text-amber-600" size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-4">
            Expanding Our Collection
          </h2>
          <p className="text-lg font-light text-gray-600 max-w-3xl mx-auto">
            The Ambassador Collection continues to grow, bringing our signature warmth and hospitality to new destinations across the Holy Land and beyond.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {upcomingHotelsData.map((hotel) => (
            <div key={hotel.slug} className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Expected Opening Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar size={12} className="text-amber-600" />
                      <span className="font-medium text-gray-900">{hotel.expectedOpening}</span>
                    </div>
                  </div>

                  {/* Hotel Name & Location */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-serif font-light text-white mb-1">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/90">
                      <MapPin size={14} />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                  <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">
                    {hotel.description}
                  </p>

                  {/* Features Preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-900 uppercase tracking-wider">Highlights:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {hotel.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-sm font-light text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <span>Get Updates</span>
                      <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 font-light mb-4">
            Be the first to know when our new properties open
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors duration-300"
          >
            <span>Join Our Mailing List</span>
            <Sparkles size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}