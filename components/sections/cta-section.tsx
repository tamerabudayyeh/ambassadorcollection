'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface CTASectionProps {
  pageData?: any
}

export function CTASection({ pageData }: CTASectionProps) {
  // Use CMS data if available, otherwise use defaults
  const ctaTitle = pageData?.content?.[0]?.children?.[0]?.text || "Experience the Extraordinary"
  const ctaSubtitle = pageData?.content?.[1]?.children?.[0]?.text || "Discover the perfect sanctuary where ancient heritage meets contemporary luxury."
  return (
    <section className="py-32 bg-gray-900 relative overflow-hidden">
      {/* Subtle background texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm font-light tracking-widest uppercase text-amber-600 mb-6"
          >
            Your Home in the Holy Land
          </motion.p>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-serif font-light text-white mb-8 leading-tight"
          >
            Ready to Experience
            <br />
            <span className="text-amber-600">Authentic Hospitality?</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg font-light text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Whether for business, pilgrimage, or celebration — the Ambassador Collection 
            is your home in the Holy Land.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Link 
              href="/booking" 
              className="px-8 py-4 bg-amber-600 text-white font-light text-sm uppercase tracking-wider hover:bg-amber-700 transition-all duration-300"
            >
              Book Your Stay
            </Link>
            <Link 
              href="/hotels" 
              className="px-8 py-4 border border-gray-400 text-gray-300 font-light text-sm uppercase tracking-wider hover:border-amber-600 hover:text-amber-600 transition-all duration-300"
            >
              Explore Our Hotels
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-12 text-gray-400"
          >
            <div className="text-center">
              <div className="text-2xl font-serif font-light text-white mb-1">1995</div>
              <div className="text-xs font-light tracking-wide uppercase">Since</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif font-light text-white mb-1">50K+</div>
              <div className="text-xs font-light tracking-wide uppercase">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif font-light text-white mb-1">4.8★</div>
              <div className="text-xs font-light tracking-wide uppercase">Rating</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}