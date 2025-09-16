import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.hotelId || !body.checkInDate || !body.checkOutDate || !body.adults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: hotelId, checkInDate, checkOutDate, adults'
      }, { status: 400 })
    }
    
    const checkInDate = new Date(body.checkInDate)
    const checkOutDate = new Date(body.checkOutDate)
    const totalGuests = body.adults + (body.children || 0)
    
    // Validate dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkInDate < today) {
      return NextResponse.json({
        success: false,
        error: 'Check-in date cannot be in the past'
      }, { status: 400 })
    }
    
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({
        success: false,
        error: 'Check-out date must be after check-in date'
      }, { status: 400 })
    }
    
    // Get hotel info - try by ID first, then by slug
    let hotel: any = null
    let hotelError: any = null

    // First try to find by UUID
    if (body.hotelId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const result = await supabase
        .from('hotels')
        .select('*')
        .eq('id', body.hotelId)
        .single()
      hotel = result.data
      hotelError = result.error
    }

    // If not found by UUID, try by slug
    if (!hotel) {
      const result = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', body.hotelId)
        .single()
      hotel = result.data
      hotelError = result.error
    }

    if (hotelError || !hotel) {
      return NextResponse.json({
        success: false,
        error: 'Hotel not found'
      }, { status: 404 })
    }

    // Use the database function to get available rooms (always use the UUID)
    const { data: availableRooms, error: availabilityError } = await supabase
      .rpc('get_available_rooms', {
        p_hotel_id: hotel.id,
        p_check_in: checkInDate.toISOString().split('T')[0],
        p_check_out: checkOutDate.toISOString().split('T')[0],
        p_guests: totalGuests
      })

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check availability'
      }, { status: 500 })
    }

    const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Import rate calculator
    const { RateCalculator } = await import('@/lib/pricing/rate-calculator')
    
    // Format the response to match AvailableRoom interface
    const formattedRooms = availableRooms.map((room: any) => {
      const basePrice = parseFloat(room.total_price) || 0;
      const averageRate = numberOfNights > 0 ? basePrice / numberOfNights : 0;
      
      // Use the centralized rate calculator for consistent pricing
      const rateCalculation = RateCalculator.calculateRate({
        baseRate: averageRate,
        numberOfNights,
        hotelId: hotel.id,
        roomTypeId: room.room_id || room.id,
        checkInDate,
        checkOutDate,
        currency: 'USD',
        exchangeRates: { USD: 1.0, EUR: 0.85, GBP: 0.75, CAD: 1.35, AUD: 1.45 },
        guests: { adults: body.adults, children: body.children || 0 }
      });
      
      return {
        roomType: {
          id: room.room_id || room.id,
          hotelId: hotel.id,
          name: room.name || 'Room',
          description: room.description || '',
          basePrice: averageRate,
          maxOccupancy: room.max_occupancy || 2,
          size: room.size || 25, // default size if not provided
          bedConfiguration: room.bed_configuration || 'King Bed',
          images: room.image_url ? [room.image_url] : ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
          amenities: Array.isArray(room.amenities) ? room.amenities : ['WiFi', 'Air Conditioning', 'Room Service'],
          totalInventory: 10, // default inventory
          status: 'active' as const
        },
        ratePlans: [], // Will be populated if needed
        availableCount: room.available_rooms || 1,
        lowestRate: rateCalculation.averageNightlyRate,
        originalRate: averageRate,
        taxes: rateCalculation.taxes.totalTaxes,
        fees: rateCalculation.fees.totalFees,
        totalPrice: rateCalculation.totalAmount,
        rateBreakdown: rateCalculation // Include full breakdown for transparency
      };
    });

    return NextResponse.json({
      success: true,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: numberOfNights,
      guests: {
        adults: body.adults,
        children: body.children || 0
      },
      availableRooms: formattedRooms,
      totalResults: formattedRooms.length
    })
    
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}