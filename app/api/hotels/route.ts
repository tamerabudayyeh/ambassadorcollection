import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRooms = searchParams.get('includeRooms') === 'true'
    
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching hotels:', error)
      return NextResponse.json(
        { error: 'Failed to fetch hotels' },
        { status: 500 }
      )
    }

    let enrichedHotels = hotels
    
    if (includeRooms) {
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .in('hotel_id', hotels.map(h => h.id))

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError)
        return NextResponse.json(
          { error: 'Failed to fetch hotel rooms' },
          { status: 500 }
        )
      }

      enrichedHotels = hotels.map(hotel => ({
        ...hotel,
        rooms: rooms.filter(room => room.hotel_id === hotel.id)
      }))
    }

    return NextResponse.json({
      success: true,
      hotels: enrichedHotels,
      total: enrichedHotels.length
    })
    
  } catch (error) {
    console.error('Hotels fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}