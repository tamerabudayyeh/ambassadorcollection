import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all restaurant venues from hotel_venues table
    const { data: restaurants, error } = await supabase
      .from('hotel_venues')
      .select(`
        *,
        hotels:hotel_id (
          id,
          name,
          slug,
          location
        )
      `)
      .eq('type', 'restaurant')
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching restaurants:', error)
      return NextResponse.json(
        { error: 'Failed to fetch restaurants' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected restaurant format
    const transformedRestaurants = restaurants?.map(restaurant => ({
      id: restaurant.id,
      slug: restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: restaurant.name,
      location: restaurant.hotels?.name || restaurant.hotels?.location,
      cuisine: restaurant.type === 'restaurant' ? 'Authentic Middle Eastern' : restaurant.type,
      description: restaurant.description,
      image: restaurant.image_url,
      hours: restaurant.hours || {},
      features: restaurant.features || [],
      status: restaurant.status || 'open',
      hotel: {
        id: restaurant.hotels?.id,
        name: restaurant.hotels?.name,
        slug: restaurant.hotels?.slug,
        location: restaurant.hotels?.location
      }
    })) || []

    return NextResponse.json({
      success: true,
      restaurants: transformedRestaurants,
      total: transformedRestaurants.length
    })

  } catch (error) {
    console.error('Restaurants fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST endpoint to create restaurants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // First, find the hotel by name or slug
    let hotelId = body.hotel_id

    if (!hotelId && body.hotel_name) {
      const { data: hotel } = await supabase
        .from('hotels')
        .select('id')
        .or(`name.ilike.%${body.hotel_name}%,slug.eq.${body.hotel_name}`)
        .single()

      hotelId = hotel?.id
    }

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Create restaurant as a hotel venue
    const { data, error } = await supabase
      .from('hotel_venues')
      .insert([{
        hotel_id: hotelId,
        name: body.name,
        type: 'restaurant',
        description: body.description,
        image_url: body.image_url,
        features: body.features || [],
        hours: body.hours || {},
        status: body.status || 'open',
        display_order: body.display_order || 0
      }])
      .select()

    if (error) {
      console.error('Error creating restaurant:', error)
      return NextResponse.json(
        { error: 'Failed to create restaurant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      restaurant: data[0]
    }, { status: 201 })

  } catch (error) {
    console.error('Restaurant creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}