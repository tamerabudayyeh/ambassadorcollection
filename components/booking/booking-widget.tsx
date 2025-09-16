'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BookingWidgetProps {
  hotels?: any[]
}

export function BookingWidget({ hotels = [] }: BookingWidgetProps) {
  const router = useRouter()
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [selectedHotel, setSelectedHotel] = useState('')
  
  const handleCheckAvailability = () => {
    // Build query parameters to pre-fill the booking form
    const params = new URLSearchParams()
    if (checkInDate) params.set('checkIn', checkInDate)
    if (checkOutDate) params.set('checkOut', checkOutDate)
    if (guests && guests !== '2') params.set('guests', guests)
    if (selectedHotel) params.set('hotel', selectedHotel)
    
    const queryString = params.toString()
    const url = queryString ? `/booking?${queryString}` : '/booking'
    router.push(url)
  }

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-light tracking-widest uppercase text-amber-400 mb-4">
            Book Your Stay
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-white mb-6">
            Check Availability
          </h2>
          <div className="w-24 h-px bg-amber-600 mx-auto mb-6"></div>
          <p className="text-lg font-light text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Plan your perfect getaway with our easy booking system
          </p>
        </motion.div>

        {/* Booking Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 items-end">
            
            {/* Check-in */}
            <div className="space-y-2">
              <label className="block text-white/70 text-xs uppercase tracking-wider font-medium">
                Check-In
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-amber-500 focus:bg-white/20 transition-all"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Check-out */}
            <div className="space-y-2">
              <label className="block text-white/70 text-xs uppercase tracking-wider font-medium">
                Check-Out
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-amber-500 focus:bg-white/20 transition-all"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <label className="block text-white/70 text-xs uppercase tracking-wider font-medium">
                Guests
              </label>
              <div className="relative">
                <select 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:bg-white/20 transition-all appearance-none"
                >
                  <option value="1" className="text-gray-800">1 Person</option>
                  <option value="2" className="text-gray-800">2 People</option>
                  <option value="3" className="text-gray-800">3 People</option>
                  <option value="4" className="text-gray-800">4 People</option>
                  <option value="5" className="text-gray-800">5 People</option>
                  <option value="6" className="text-gray-800">6 People</option>
                </select>
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Hotel Selection */}
            <div className="space-y-2">
              <label className="block text-white/70 text-xs uppercase tracking-wider font-medium">
                Hotel
              </label>
              <div className="relative">
                <select 
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:bg-white/20 transition-all appearance-none"
                >
                  <option value="" className="text-gray-800">All Hotels</option>
                  {hotels && hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel.name} className="text-gray-800">
                      {hotel.name}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Check Availability Button */}
            <div className="sm:col-span-2 md:col-span-1">
              <button 
                onClick={handleCheckAvailability}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-sm font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Check Availability
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}