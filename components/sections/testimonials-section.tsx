'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { urlFor } from '@/lib/imageUrl'

// Default testimonials for fallback
const defaultTestimonials = [
  {
    _id: '1',
    name: "Sarah Mitchell",
    role: "Returning Guest",
    content: "The Ambassador Collection is more than hotels — it feels like family. Every stay is warm, genuine, and unforgettable.",
    rating: 5,
    image: null
  },
  {
    _id: '2',
    name: "David & Maria Chen",
    role: "Anniversary Celebration",
    content: "Our anniversary stay was nothing short of magical. The staff anticipated our every need, creating an atmosphere of intimacy and luxury that made our celebration truly unforgettable.",
    rating: 5,
    image: null
  },
  {
    _id: '3',
    name: "Elena Rodriguez",
    role: "Solo Traveler",
    content: "As a solo traveler, I appreciated the perfect balance of attentive service and respectful privacy. The Ambassador Collection made me feel welcomed while allowing me to explore at my own pace.",
    rating: 5,
    image: null
  }
]

interface TestimonialsSectionProps {
  testimonials?: any[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  // Use CMS testimonials if available, otherwise use defaults
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % displayTestimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [displayTestimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % displayTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)
  }

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
            Guest Experiences
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
            Trusted by Generations
          </h2>
          <div className="w-24 h-px bg-amber-600 mx-auto"></div>
        </motion.div>

        {/* Testimonial Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white shadow-lg overflow-hidden">
            
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            {/* Testimonial Content */}
            <div className="p-12 md:p-16 text-center">
              
              {/* Stars */}
              <div className="flex justify-center mb-8">
                {[...Array(displayTestimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 mx-1" />
                ))}
              </div>

              {/* Quote */}
              <motion.blockquote 
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl font-light text-gray-700 mb-8 leading-relaxed italic"
              >
                &quot;{displayTestimonials[currentTestimonial].content}&quot;
              </motion.blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                {displayTestimonials[currentTestimonial].image && (
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={displayTestimonials[currentTestimonial].image 
                        ? urlFor(displayTestimonials[currentTestimonial].image).width(128).height(128).url()
                        : "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"}
                      alt={displayTestimonials[currentTestimonial].name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="text-left">
                  <p className="font-serif text-lg text-gray-900">
                    {displayTestimonials[currentTestimonial].name}
                  </p>
                  <p className="text-sm font-light text-gray-600 tracking-wide">
                    {displayTestimonials[currentTestimonial].role}
                    {displayTestimonials[currentTestimonial].hotelName && (
                      <span className="block text-xs text-amber-600 mt-1">
                        {displayTestimonials[currentTestimonial].hotelName}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 pb-8">
              {displayTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentTestimonial 
                      ? 'w-8 bg-amber-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}