import { NextRequest, NextResponse } from 'next/server'
import { supabase, getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both old format (guestDetails) and new format (guestInfo)
    const guestInfo = body.guestInfo || body.guestDetails;
    const checkInDate = body.checkIn || body.checkInDate;
    const checkOutDate = body.checkOut || body.checkOutDate;
    
    if (!body.hotelId || !body.roomId || !checkInDate || !checkOutDate || !guestInfo) {
      return NextResponse.json({
        success: false,
        error: 'Missing required booking information'
      }, { status: 400 })
    }
    
    const checkInDateParsed = new Date(checkInDate)
    const checkOutDateParsed = new Date(checkOutDate)
    const numberOfNights = Math.ceil((checkOutDateParsed.getTime() - checkInDateParsed.getTime()) / (1000 * 60 * 60 * 24))
    
    // Validate dates
    if (checkInDateParsed >= checkOutDateParsed) {
      return NextResponse.json({
        success: false,
        error: 'Check-in date must be before check-out date'
      }, { status: 400 })
    }
    
    if (checkInDateParsed < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Check-in date cannot be in the past'
      }, { status: 400 })
    }
    
    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, hotels(*)')
      .eq('id', body.roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json({
        success: false,
        error: 'Room not found'
      }, { status: 404 })
    }

    // Check availability
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_room_availability', {
        p_room_id: body.roomId,
        p_check_in: checkInDateParsed.toISOString().split('T')[0],
        p_check_out: checkOutDateParsed.toISOString().split('T')[0],
        p_quantity: 1
      })

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check availability'
      }, { status: 500 })
    }

    if (!isAvailable) {
      return NextResponse.json({
        success: false,
        error: 'Room is not available for selected dates'
      }, { status: 409 })
    }

    // Get average rate for the stay
    const { data: rateData, error: rateError } = await supabase
      .from('room_availability')
      .select('rate')
      .eq('room_id', body.roomId)
      .gte('date', checkInDateParsed.toISOString().split('T')[0])
      .lt('date', checkOutDateParsed.toISOString().split('T')[0])

    if (rateError) {
      console.error('Error getting rates:', rateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to calculate pricing'
      }, { status: 500 })
    }

    const roomTotal = rateData.reduce((sum, day) => sum + parseFloat(day.rate), 0)
    const averageRate = roomTotal / numberOfNights
    const taxes = roomTotal * 0.17 // 17% tax
    const fees = 25 * numberOfNights // $25 per night service fee
    const totalAmount = roomTotal + taxes + fees

    // Use totalAmount and depositAmount from request if provided, otherwise calculate
    const finalTotalAmount = body.totalAmount || totalAmount;
    const finalDepositAmount = body.depositAmount || totalAmount * 0.3;
    
    // Create or find guest
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('*')
      .eq('email', guestInfo.email)
      .single()

    let guestId = existingGuest?.id

    if (!existingGuest) {
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert([{
          email: guestInfo.email,
          first_name: guestInfo.firstName,
          last_name: guestInfo.lastName,
          phone: guestInfo.phone,
          country: guestInfo.country,
          city: guestInfo.city,
          address: guestInfo.address,
          postal_code: guestInfo.postalCode
        }])
        .select()
        .single()

      if (guestError) {
        console.error('Error creating guest:', guestError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create guest profile'
        }, { status: 500 })
      }

      guestId = newGuest.id
    }

    // Generate confirmation number
    const confirmationNumber = 'AMB' + Math.random().toString(36).substr(2, 6).toUpperCase()

    // Use the database function to create booking with availability update
    const serviceSupabase = getServiceSupabase()
    if (!serviceSupabase) {
      return NextResponse.json({
        success: false,
        error: 'Database configuration error'
      }, { status: 500 })
    }

    const { data: bookingId, error: bookingError } = await serviceSupabase
      .rpc('create_booking_with_availability', {
        p_confirmation_number: confirmationNumber,
        p_hotel_id: body.hotelId,
        p_room_id: body.roomId,
        p_guest_id: guestId,
        p_check_in: checkInDateParsed.toISOString().split('T')[0],
        p_check_out: checkOutDateParsed.toISOString().split('T')[0],
        p_adults: body.adults || 2,
        p_children: body.children || 0,
        p_room_rate: averageRate,
        p_subtotal: roomTotal,
        p_taxes: taxes,
        p_fees: fees,
        p_total_price: finalTotalAmount,
        p_payment_method: body.paymentMethod || 'credit_card',
        p_special_requests: guestInfo.specialRequests || null
      })

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: bookingId,
        confirmationNumber,
        hotelName: room.hotels.name,
        roomName: room.name,
        checkInDate: checkInDateParsed,
        checkOutDate: checkOutDateParsed,
        nights: numberOfNights,
        totalAmount: finalTotalAmount,
        depositAmount: finalDepositAmount,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        status: 'pending',
        paymentStatus: 'pending'
      }
    })
    
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const confirmationNumber = searchParams.get('confirmationNumber')
    const email = searchParams.get('email')
    
    if (!confirmationNumber && !email) {
      return NextResponse.json({
        success: false,
        error: 'Confirmation number or email is required'
      }, { status: 400 })
    }
    
    if (confirmationNumber) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, slug),
          rooms(name, room_type),
          guests(first_name, last_name, email)
        `)
        .eq('confirmation_number', confirmationNumber)
        .single()
      
      if (error || !booking) {
        return NextResponse.json({
          success: false,
          error: 'Booking not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        booking
      })
    }
    
    if (email) {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, slug),
          rooms(name, room_type)
        `)
        .eq('guests.email', email)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch bookings'
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        bookings: bookings || []
      })
    }
    
  } catch (error) {
    console.error('Booking retrieval error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}