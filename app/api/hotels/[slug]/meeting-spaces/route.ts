import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/hotels/[slug]/meeting-spaces
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

    // Get meeting spaces for this hotel
    const { data: meetingSpaces, error } = await supabase
      .from('meeting_spaces')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching meeting spaces:', error)
      return NextResponse.json(
        { error: 'Failed to fetch meeting spaces' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      meetingSpaces: meetingSpaces || [],
      total: meetingSpaces?.length || 0
    })

  } catch (error) {
    console.error('Meeting spaces fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hotels/[slug]/meeting-spaces
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

    // Insert meeting space
    const { data, error } = await supabase
      .from('meeting_spaces')
      .insert([{
        hotel_id: hotel.id,
        name: body.name,
        description: body.description,
        image_url: body.image_url,
        capacity: body.capacity,
        availability: body.availability,
        features: body.features || [],
        display_order: body.display_order || 0
      }])
      .select()

    if (error) {
      console.error('Error creating meeting space:', error)
      return NextResponse.json(
        { error: 'Failed to create meeting space' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      meetingSpace: data[0]
    }, { status: 201 })

  } catch (error) {
    console.error('Meeting space creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}