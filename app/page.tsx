import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/ui/section-heading'
import { NewsletterSubscription } from '@/components/hotel/newsletter-subscription'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/sections/hero-section'
import { StoryTeaserSection } from '@/components/sections/story-teaser-section'
import { FeaturedHotelsSection } from '@/components/sections/featured-hotels-section'
import { BookingWidget } from '@/components/booking/booking-widget'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'

// Fetch hotels from Supabase CRM
const fetchHotels = async () => {
  const supabase = createClient()
  const { data: hotels } = await supabase
    .from('hotels')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return hotels || []
}

// Fetch homepage data - using static content now
const fetchHomePage = async () => {
  return {
    title: "Ambassador Hotels Collection - Jerusalem",
    hero: {
      title: "Your Home in the Heart of the Holy Land",
      subtitle: "Experience authentic Jerusalem hospitality",
      image: "https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/AmbassadorJerusalem/JerusalemLobbyWine.webp",
      cta: {
        text: "Explore Our Hotels",
        link: "/hotels"
      }
    }
  }
}

// Fetch testimonials - using static content for now
const fetchTestimonials = async () => {
  return [
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
      content: "Our anniversary stay was nothing short of magical. The staff anticipated our every need.",
      rating: 5,
      image: null
    }
  ]
}

// Fetch site settings - using static content for now
const fetchSiteSettings = async () => {
  return {
    title: "Ambassador Hotels Collection",
    description: "Luxury hotels in Jerusalem",
    contact: {
      email: "info@hotelsamb.com",
      phone: "+972-2-6281999"
    }
  }
}

export default async function Home() {
  const [hotels, pageData, testimonials, siteSettings] = await Promise.all([
    fetchHotels(),
    fetchHomePage(),
    fetchTestimonials(),
    fetchSiteSettings()
  ])
  
  const featuredHotels = hotels.filter((h: any) => h.featured).slice(0, 3)
  
  // If no featured hotels, use first 3
  const displayHotels = featuredHotels.length > 0 ? featuredHotels : hotels.slice(0, 3)

  return (
    <div className="overflow-x-hidden">
      <HeroSection pageData={pageData} hotels={hotels} />
      <StoryTeaserSection />
      <FeaturedHotelsSection hotels={displayHotels} />
      <BookingWidget hotels={hotels} />
      <ServicesSection />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection pageData={pageData} />
      <NewsletterSubscription />
    </div>
  )
}