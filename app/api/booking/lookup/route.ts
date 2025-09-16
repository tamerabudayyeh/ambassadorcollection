import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const confirmationNumber = searchParams.get('confirmationNumber')
    const email = searchParams.get('email')
    const lastName = searchParams.get('lastName')
    
    if (!confirmationNumber && (!email || !lastName)) {
      return NextResponse.json({
        success: false,
        error: 'Either confirmation number or email + last name is required'
      }, { status: 400 })
    }
    
    let booking = null
    
    if (confirmationNumber) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, slug, contact_phone, contact_email),
          rooms(name, room_type, amenities),
          guests(first_name, last_name, email, phone)
        `)
        .eq('confirmation_number', confirmationNumber.toUpperCase())
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error looking up booking:', error)
        return NextResponse.json({
          success: false,
          error: 'Database error occurred'
        }, { status: 500 })
      }
      
      booking = data
    } else if (email && lastName) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, slug, contact_phone, contact_email),
          rooms(name, room_type, amenities),
          guests(first_name, last_name, email, phone)
        `)
        .eq('guests.email', email)
        .eq('guests.last_name', lastName)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error looking up booking:', error)
        return NextResponse.json({
          success: false,
          error: 'Database error occurred'
        }, { status: 500 })
      }
      
      booking = data
    }
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'No booking found with the provided details'
      }, { status: 404 })
    }
    
    const checkInDate = new Date(booking.check_in_date)
    const today = new Date()
    const daysDiff = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        canModify: daysDiff > 1 && booking.status === 'confirmed',
        canCancel: daysDiff > 1 && booking.status === 'confirmed',
        daysUntilCheckIn: daysDiff
      }
    })
    
  } catch (error) {
    console.error('Booking lookup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { confirmationNumber, email, lastName } = body
    
    if (!confirmationNumber && (!email || !lastName)) {
      return NextResponse.json({
        success: false,
        error: 'Either confirmation number or email + last name is required'
      }, { status: 400 })
    }
    
    let booking = null
    
    if (confirmationNumber) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, slug, contact_phone, contact_email, cancellation_policy),
          rooms(name, room_type, amenities, description),
          guests(first_name, last_name, email, phone)
        `)
        .eq('confirmation_number', confirmationNumber.toUpperCase())
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error looking up booking:', error)
        return NextResponse.json({
          success: false,
          error: 'Database error occurred'
        }, { status: 500 })
      }
      
      booking = data
    } else if (email && lastName) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, slug, contact_phone, contact_email, cancellation_policy),
          rooms(name, room_type, amenities, description),
          guests(first_name, last_name, email, phone)
        `)
        .eq('guests.email', email)
        .eq('guests.last_name', lastName)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error looking up booking:', error)
        return NextResponse.json({
          success: false,
          error: 'Database error occurred'
        }, { status: 500 })
      }
      
      booking = data
    }
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'No booking found with the provided details'
      }, { status: 404 })
    }
    
    const checkInDate = new Date(booking.check_in_date)
    const today = new Date()
    const daysDiff = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        canModify: daysDiff > 1 && booking.status === 'confirmed',
        canCancel: daysDiff > 1 && booking.status === 'confirmed', 
        daysUntilCheckIn: daysDiff
      }
    })
    
  } catch (error) {
    console.error('Booking lookup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}