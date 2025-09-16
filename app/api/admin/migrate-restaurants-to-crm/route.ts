import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import restaurantsData from '@/Data/restaurants.json'

// Use service role client for admin operations
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('🍽️  Starting restaurants to CRM migration...')

    const results = {
      restaurants_processed: 0,
      restaurants_migrated: 0,
      errors: [] as string[]
    }

    for (const restaurant of restaurantsData) {
      console.log(`Processing restaurant: ${restaurant.name}`)

      // Find the hotel this restaurant belongs to
      let hotelId: string | null = null

      if (restaurant.location === 'Ambassador Jerusalem') {
        const { data: hotel } = await adminSupabase
          .from('hotels')
          .select('id')
          .eq('slug', 'ambassador-jerusalem')
          .single()
        hotelId = hotel?.id
      }
      // Add other hotel mappings as needed

      if (!hotelId) {
        const error = `Could not find hotel for restaurant ${restaurant.name} (location: ${restaurant.location})`
        console.error(error)
        results.errors.push(error)
        results.restaurants_processed++
        continue
      }

      console.log(`Found hotel ID: ${hotelId}`)

      // Check if restaurant already exists to avoid duplicates
      const { data: existingRestaurant } = await adminSupabase
        .from('hotel_venues')
        .select('id')
        .eq('hotel_id', hotelId)
        .eq('name', restaurant.name)
        .eq('type', 'restaurant')

      if (existingRestaurant && existingRestaurant.length > 0) {
        console.log(`Restaurant ${restaurant.name} already exists, skipping...`)
        results.restaurants_processed++
        continue
      }

      // Create restaurant as hotel venue
      const { error: venueError } = await adminSupabase
        .from('hotel_venues')
        .insert({
          hotel_id: hotelId,
          name: restaurant.name,
          type: 'restaurant',
          description: restaurant.description,
          image_url: restaurant.image,
          features: restaurant.features || [],
          hours: restaurant.hours || {},
          status: restaurant.status || 'open',
          display_order: 0
        })

      if (venueError) {
        const error = `Restaurant migration failed for ${restaurant.name}: ${venueError.message}`
        console.error(error)
        results.errors.push(error)
      } else {
        results.restaurants_migrated++
        console.log(`✅ Restaurant migrated: ${restaurant.name}`)
      }

      results.restaurants_processed++
      console.log(`✅ ${restaurant.name} processing complete\n`)
    }

    console.log('🎉 Restaurant migration completed!')
    console.log('Results:', results)

    return NextResponse.json({
      success: true,
      message: 'Restaurants to CRM migration completed successfully',
      results
    })

  } catch (error) {
    console.error('❌ Restaurant migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Restaurant migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}