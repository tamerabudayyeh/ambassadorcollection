import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/hotels/[slug]/gallery
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // First get the hotel ID from slug
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id')
      .eq('slug', slug)
      .single()

    if (hotelError || !hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Get gallery images for this hotel
    const { data: gallery, error } = await supabase
      .from('hotel_galleries')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching gallery:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      gallery: gallery || [],
      total: gallery?.length || 0
    })

  } catch (error) {
    console.error('Gallery fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hotels/[slug]/gallery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    // Get hotel ID
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id')
      .eq('slug', slug)
      .single()

    if (hotelError || !hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Insert gallery images (batch insert)
    const imagesToInsert = Array.isArray(body.images) ? body.images : [body]

    const { data, error } = await supabase
      .from('hotel_galleries')
      .insert(imagesToInsert.map((img: any, index: number) => ({
        hotel_id: hotel.id,
        image_url: typeof img === 'string' ? img : img.image_url,
        alt_text: typeof img === 'object' ? img.alt_text : `${slug} gallery image ${index + 1}`,
        caption: typeof img === 'object' ? img.caption : null,
        display_order: typeof img === 'object' ? img.display_order : index
      })))
      .select()

    if (error) {
      console.error('Error creating gallery images:', error)
      return NextResponse.json(
        { error: 'Failed to create gallery images' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      gallery: data,
      total: data.length
    }, { status: 201 })

  } catch (error) {
    console.error('Gallery creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}