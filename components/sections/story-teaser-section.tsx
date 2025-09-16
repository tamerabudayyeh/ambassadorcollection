'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function StoryTeaserSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-lg md:text-xl font-light text-gray-700 leading-relaxed mb-8">
            For decades, the Ambassador Collection has been more than a place to stay. 
            Our hotels are woven into the story of Jerusalem and Bethlehem — trusted by 
            business travelers, cherished by pilgrims, and loved by the local community. 
            Each stay is defined by warmth, care, and a feeling of belonging.
          </p>
          
          <Link 
            href="/about" 
            className="inline-block px-8 py-3 border border-gray-900 text-gray-900 font-light text-sm uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  )
}