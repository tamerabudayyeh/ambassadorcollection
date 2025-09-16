'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  pageData?: any
  hotels?: any[]
}

export function HeroSection({ pageData, hotels = [] }: HeroSectionProps) {
  
  // Use CMS data if available, otherwise fallback to defaults
  const heroTitle = pageData?.hero?.title || "Your Home in the Heart of the Holy Land"
  const heroSubtitle = pageData?.hero?.subtitle || "Experience authentic Jerusalem hospitality"
  const heroImage = pageData?.hero?.image || "https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/AmbassadorJerusalem/JerusalemLobbyWine.webp"
  const ctaText = pageData?.hero?.cta?.text || "Explore Our Hotels"
  const ctaLink = pageData?.hero?.cta?.link || "/hotels"
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Ambassador Collection Hotel"
          fill
          className="object-cover"
          priority
        />
        {/* Elegant Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-200 max-w-2xl mx-auto mb-8">
            {heroSubtitle} — where warmth, comfort, and tradition meet boutique luxury.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link 
            href={ctaLink} 
            className="px-8 py-3 bg-amber-600/90 backdrop-blur-sm text-white rounded-sm font-medium text-sm uppercase tracking-wider hover:bg-amber-600 transition-all duration-300 border border-amber-600/50"
          >
            {ctaText}
          </Link>
          <Link 
            href="/about" 
            className="px-8 py-3 bg-transparent border border-white/50 text-white rounded-sm font-medium text-sm uppercase tracking-wider hover:bg-white/10 transition-all duration-300"
          >
            Our Story
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  )
}