'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { urlFor } from '@/lib/imageUrl'

interface GalleryImage {
  _type?: string
  asset?: {
    _ref: string
    _type: string
  }
  alt?: string
  caption?: string
}

interface CreativeGalleryProps {
  images: (GalleryImage | string)[]
  hotelName: string
}

// Helper function to get image URL from either Sanity object or direct URL
function getImageUrl(img: GalleryImage | string): string {
  if (typeof img === 'string') {
    return img // Direct URL
  }
  if (img.asset && img.asset._ref) {
    // Check if _ref is actually a direct URL (from JSON data)
    if (typeof img.asset._ref === 'string' && img.asset._ref.startsWith('http')) {
      return img.asset._ref
    }
    // Otherwise it's a proper Sanity asset reference
    try {
      return urlFor(img).width(800).height(600).url() // Sanity object
    } catch (error) {
      console.log('urlFor failed in gallery, returning asset._ref:', error)
      return img.asset._ref || ''
    }
  }
  return ''
}

export function CreativeGallery({ images, hotelName }: CreativeGalleryProps) {
  if (!images || images.length === 0) return null

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
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

        {/* Creative Masonry Grid */}
        <div className="grid grid-cols-12 gap-4 auto-rows-[200px] max-w-7xl mx-auto">
          {images.map((img, i) => {
            // Create dynamic sizing patterns
            const patterns = [
              'lg:col-span-6 lg:row-span-2', // Large
              'lg:col-span-3 lg:row-span-1', // Small
              'lg:col-span-3 lg:row-span-1', // Small  
              'lg:col-span-4 lg:row-span-2', // Medium tall
              'lg:col-span-4 lg:row-span-1', // Medium
              'lg:col-span-4 lg:row-span-1', // Medium
              'lg:col-span-6 lg:row-span-1', // Wide
              'lg:col-span-3 lg:row-span-2', // Small tall
              'lg:col-span-3 lg:row-span-1', // Small
              'lg:col-span-8 lg:row-span-1', // Extra wide
              'lg:col-span-4 lg:row-span-1', // Medium
            ]

            const pattern = patterns[i % patterns.length]
            
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative group overflow-hidden cursor-pointer col-span-12 md:col-span-6 row-span-1 ${pattern}`}
              >
                <Image
                  src={getImageUrl(img)}
                  alt={typeof img === 'object' ? img.alt || `${hotelName} gallery image ${i + 1}` : `${hotelName} gallery image ${i + 1}`}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                
                {/* Overlay with hover effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Expand icon */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>

                {/* Image counter */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-light tracking-wide rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                  {i + 1} / {images.length}
                </div>

                {/* Caption */}
                {typeof img === 'object' && img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-sm font-light leading-relaxed">
                      {img.caption}
                    </p>
                  </div>
                )}
                
                {/* Stylish border animation */}
                <div className="absolute inset-0 border-2 border-amber-600 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
              </motion.div>
            )
          })}
        </div>

        {/* Interactive Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center items-center gap-12 mt-16 mb-8"
        >
          <div className="text-center">
            <div className="text-3xl font-serif font-light text-amber-600 mb-1">
              {images.length}
            </div>
            <div className="text-xs font-light tracking-widest uppercase text-gray-400">
              Photos
            </div>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="text-center">
            <div className="text-3xl font-serif font-light text-amber-600 mb-1">
              4K
            </div>
            <div className="text-xs font-light tracking-widest uppercase text-gray-400">
              Quality
            </div>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="text-center">
            <div className="text-3xl font-serif font-light text-amber-600 mb-1">
              360°
            </div>
            <div className="text-xs font-light tracking-widest uppercase text-gray-400">
              Views
            </div>
          </div>
        </motion.div>

        {/* View All Button */}
        <div className="text-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border border-amber-600 text-amber-600 font-light text-sm uppercase tracking-wider hover:bg-amber-600 hover:text-black transition-all duration-300 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Full Gallery
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </motion.button>
        </div>

        {/* Floating Gallery Controls */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-amber-600 text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-amber-500 transition-colors group"
            title="Slideshow Mode"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-white/30 transition-colors group"
            title="Grid View"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  )
}