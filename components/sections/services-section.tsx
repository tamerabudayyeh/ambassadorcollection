'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Culinary Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-4">
            Culinary Excellence
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
            A Taste of the Holy Land
          </h2>
          <div className="w-24 h-px bg-amber-600 mx-auto mb-6"></div>
          <p className="text-lg font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Food at the Ambassador Collection tells the story of the Holy Land. 
            At our flagship restaurant, Al-Diwan, authentic Middle Eastern flavors 
            are served with refinement and heart. From cultural food festivals to 
            intimate dining experiences, every meal is crafted to bring people 
            together — locals and travelers alike.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gray-900 text-gray-900 font-light text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Discover Dining
          </Link>
        </motion.div>

        {/* Signature Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-serif font-light text-gray-900 mb-6">
              Every Arrival is a Celebration
            </h3>
            <p className="text-lg font-light text-gray-600 leading-relaxed mb-8">
              From a glass of chilled Cava at Ambassador Jerusalem, to a refreshing 
              cocktail at the Boutique, each hotel greets you with a signature welcome. 
              It is our tradition of hospitality — a gesture that says, you are home.
            </p>
            <div className="w-12 h-px bg-amber-600 mx-auto"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}