'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

export function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    // Simulate API call
    setTimeout(() => {
      if (email.includes('@') && email.includes('.')) {
        setIsSuccess(true)
        setEmail('')
      } else {
        setError('Please enter a valid email address')
      }
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Section Header */}
          <p className="text-sm font-light tracking-widest uppercase text-amber-600 mb-4">
            Stay Connected
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
            Exclusive Updates
          </h2>
          <div className="w-24 h-px bg-amber-600 mx-auto mb-6"></div>
          <p className="text-lg font-light text-gray-600 mb-12 leading-relaxed">
            Be the first to discover special offers, new experiences, and exclusive insights 
            from the Ambassador Collection
          </p>
          
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 border border-gray-200 text-gray-800 px-6 py-4 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-amber-600" />
                <span className="font-serif text-lg">Thank you!</span>
              </div>
              <p className="text-sm font-light text-gray-600">
                We&apos;ve sent a confirmation to your email address.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 border border-gray-300 bg-white text-gray-900 font-light focus:outline-none focus:border-amber-600 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-amber-600 text-white font-light text-sm uppercase tracking-wider hover:bg-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {error && (
                <div className="mt-3 text-sm font-light text-red-600 text-center">
                  {error}
                </div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}