import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/ui/section-heading'
import { NewsletterSubscription } from '@/components/hotel/newsletter-subscription'
import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/imageUrl'
import { HeroSection } from '@/components/sections/hero-section'
import { StoryTeaserSection } from '@/components/sections/story-teaser-section'
import { FeaturedHotelsSection } from '@/components/sections/featured-hotels-section'
import { BookingWidget } from '@/components/booking/booking-widget'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'

// Fetch hotels from Sanity
const fetchHotels = async () => {
  const query = `*[_type == "hotel"] | order(order asc, name asc) { 
    _id, 
    name, 
    slug, 
    location, 
    description, 
    image, 
    rating,
    featured,
    order
  }`
  return await client.fetch(query)
}

// Fetch homepage data from CMS
const fetchHomePage = async () => {
  const query = `*[_type == "page" && pageType == "home"][0] {
    title,
    hero {
      title,
      subtitle,
      image,
      cta {
        text,
        link
      }
    },
    content,
    seo
  }`
  return await client.fetch(query)
}

// Fetch testimonials from CMS
const fetchTestimonials = async () => {
  const query = `*[_type == "testimonial" && featured == true] | order(date desc)[0...6] {
    _id,
    name,
    role,
    content,
    rating,
    image,
    "hotelName": hotel->name
  }`
  return await client.fetch(query)
}

// Fetch site settings from CMS
const fetchSiteSettings = async () => {
  const query = `*[_type == "siteSettings"][0] {
    title,
    description,
    contact,
    socialMedia,
    footer,
    seo
  }`
  return await client.fetch(query)
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