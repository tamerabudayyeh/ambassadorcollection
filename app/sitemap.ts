import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = 'https://hotelsamb.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Fetch all hotels
    const { data: hotels } = await supabase
      .from('hotels')
      .select('slug, updated_at')
      .eq('is_active', true)

    const hotelPages: MetadataRoute.Sitemap = hotels?.map(hotel => ({
      url: `${baseUrl}/hotels/${hotel.slug}`,
      lastModified: hotel.updated_at ? new Date(hotel.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })) || []

    // Fetch all restaurants
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('slug, updated_at')

    const restaurantPages: MetadataRoute.Sitemap = restaurants?.map(restaurant => ({
      url: `${baseUrl}/restaurants/${restaurant.slug}`,
      lastModified: restaurant.updated_at ? new Date(restaurant.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) || []

    return [...staticPages, ...hotelPages, ...restaurantPages]
  } catch (error) {
    // Return static pages if database fetch fails
    console.error('Error fetching dynamic sitemap data:', error)
    return staticPages
  }
}