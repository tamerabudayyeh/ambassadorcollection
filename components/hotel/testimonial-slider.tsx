'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  content: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Traveler",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&dpr=1",
    content: "The Ambassador Jerusalem exceeded all my expectations. The staff went above and beyond to make my stay memorable, and the views of the Old City from my room were breathtaking. Truly a five-star experience!"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Family Vacation",
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&dpr=1",
    content: "Staying at the Ambassador Bethlehem with my family was incredible. The children's activities, the pool, and the proximity to historical sites made it perfect. We'll definitely be returning soon."
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Honeymoon Stay",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&dpr=1",
    content: "Our honeymoon at the Ambassador Collection was magical. The private dinner on our balcony overlooking the Mediterranean was unforgettable. Every detail was thoughtfully curated for romance and luxury."
  }
]

export function TestimonialSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const nextSlide = useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [isAnimating])
  
  const prevSlide = useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [isAnimating])
  
  useEffect(() => {
    // Auto advance slides
    timerRef.current = setInterval(() => {
      nextSlide()
    }, 6000)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [nextSlide])

  return (
    <div className="relative px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="relative min-h-[300px] md:min-h-[280px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "absolute top-0 left-0 w-full transition-all duration-500 ease-in-out",
                index === activeIndex 
                  ? "opacity-100 translate-x-0" 
                  : index < activeIndex || (activeIndex === 0 && index === testimonials.length - 1)
                    ? "opacity-0 -translate-x-full" 
                    : "opacity-0 translate-x-full"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 mb-4 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <blockquote className="mb-4 italic text-lg">
                  &quot;{testimonial.content}&quot;
                </blockquote>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  index === activeIndex 
                    ? "bg-primary" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}