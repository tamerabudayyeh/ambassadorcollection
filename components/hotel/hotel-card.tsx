'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HotelCardProps {
  slug: string
  name: string
  location: string
  description: string
  image: string
  logo?: string
  rating?: number
  price?: number
  featured?: boolean
  className?: string
}

export function HotelCard({
  slug,
  name,
  location,
  description,
  image,
  logo,
  rating = 4.5,
  price,
  featured = false,
  className
}: HotelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className={cn("group relative", className)}
    >
      {/* Make the entire card clickable */}
      <Link href={`/hotels/${slug}`} className="block">
        <div className="relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer">
          
          {/* Image Container */}
          <div className="relative h-80 overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Elegant Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Hotel Logo */}
            {logo && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <Image
                  src={logo}
                  alt={`${name} logo`}
                  width={60}
                  height={40}
                  className="object-contain"
                />
              </div>
            )}

            {/* Featured Badge */}
            {featured && (
              <div className={cn(
                "absolute top-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-xs font-light tracking-wider uppercase",
                logo ? "left-20" : "left-4"
              )}>
                Featured
              </div>
            )}

            {/* Price Badge */}
            {price && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 text-right">
                <p className="text-lg font-light text-gray-900">${price}</p>
                <p className="text-xs text-gray-600 font-light">per night</p>
              </div>
            )}

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-light tracking-wide">{location}</span>
                  </div>
                  <h3 className="text-xl font-serif font-light mb-2">{name}</h3>
                </div>
                {rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-light">{rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <p className="text-gray-600 font-light leading-relaxed mb-6 line-clamp-2">
              {description}
            </p>
            
            {/* Action buttons - prevent default link behavior to allow individual clicks */}
            <div className="flex flex-col sm:flex-row gap-3">
              <span 
                className="inline-flex items-center justify-center gap-2 text-sm font-light tracking-wider uppercase text-gray-900 hover:text-amber-600 transition-colors group/link"
              >
                <span className="relative">
                  View Details
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-amber-600 group-hover/link:w-full transition-all duration-300" />
                </span>
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </span>
              
              <span 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = `/booking?hotel=${encodeURIComponent(name)}`
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-light tracking-wider uppercase hover:bg-amber-700 transition-all duration-300 group/book cursor-pointer"
              >
                <span>Book Now</span>
                <svg className="w-4 h-4 group-hover/book:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}