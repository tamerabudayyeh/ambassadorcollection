'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Phone, Mail } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/booking', label: 'Book Now' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

interface NavbarProps {
  siteSettings?: any
}

export function Navbar({ siteSettings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => pathname === href

  // Pages with white/light backgrounds that need dark navbar
  const lightBackgroundPages = ['/about', '/contact', '/hotels', '/restaurants', '/booking']
  const hasLightBackground = lightBackgroundPages.some(page => pathname.startsWith(page))
  
  // Force navbar to be visible on light background pages
  const shouldShowBackground = scrolled || hasLightBackground
  
  // Use CMS data if available
  const phone = siteSettings?.contact?.phone || '+972-2-123-4567'

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      shouldShowBackground
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group">
            <div className="flex flex-col">
              <span className={`text-xl font-serif font-light transition-colors ${
                shouldShowBackground ? 'text-gray-900' : 'text-white'
              }`}>
                Ambassador
              </span>
              <span className={`text-xs font-light tracking-widest uppercase transition-colors ${
                shouldShowBackground ? 'text-gray-500' : 'text-white/70'
              }`}>
                Collection
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-light tracking-wider uppercase transition-all duration-200 ${
                  isActive(item.href)
                    ? shouldShowBackground 
                      ? 'text-amber-600' 
                      : 'text-white'
                    : shouldShowBackground
                      ? 'text-gray-700 hover:text-amber-600'
                      : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute -bottom-1 left-0 right-0 h-px ${
                      shouldShowBackground ? 'bg-amber-600' : 'bg-white'
                    }`}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-6">
            <a 
              href={`tel:${phone.replace(/\s/g, '')}`} 
              className={`flex items-center gap-2 text-sm font-light transition-colors ${
                shouldShowBackground 
                  ? 'text-gray-600 hover:text-amber-600' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">{phone}</span>
            </a>
            <Link
              href="/booking"
              className={`px-6 py-2 border font-light text-sm uppercase tracking-wider transition-all duration-300 ${
                shouldShowBackground
                  ? 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-gray-900'
              }`}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 transition-all ${
              shouldShowBackground ? 'text-gray-600 hover:text-amber-600' : 'text-white hover:text-white/80'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-100 mb-4"
          >
            <nav className="p-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm font-light tracking-wider uppercase transition-all ${
                    isActive(item.href)
                      ? 'text-amber-600'
                      : 'text-gray-700 hover:text-amber-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Contact */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-gray-700 hover:text-amber-600 text-sm font-light"
                >
                  <Phone className="w-4 h-4" />
                  <span>{phone}</span>
                </a>
                <Link
                  href="/booking"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center border border-amber-600 text-amber-600 px-4 py-2 font-light text-sm uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all"
                >
                  Book Your Stay
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}