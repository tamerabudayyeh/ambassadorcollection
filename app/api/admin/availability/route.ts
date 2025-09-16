import { NextRequest, NextResponse } from 'next/server';
import { BookingApiResponse } from '@/lib/booking-types';
import { availabilityQueries, hotelQueries } from '@/lib/supabase/queries';
import { addDays, format } from 'date-fns';

// Admin endpoint for availability management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!hotelId || !startDate) {
      return NextResponse.json<BookingApiResponse>({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Hotel ID and start date are required'
        }
      }, { status: 400 });
    }
    
    // Verify hotel exists
    const hotel = await hotelQueries.getById(hotelId);
    if (!hotel) {
      return NextResponse.json<BookingApiResponse>({
        success: false,
        error: {
          code: 'HOTEL_NOT_FOUND',
          message: 'Hotel not found'
        }
      }, { status: 404 });
    }
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : addDays(start, 30); // Default to 30 days
    
    // Get availability data
    const availabilityData = await availabilityQueries.getAvailabilityRange(
      hotelId,
      start,
      end
    );
    
    // Group by room type for easier consumption
    const availabilityByRoomType: Record<string, any[]> = {};
    
    availabilityData.forEach(item => {
      if (!availabilityByRoomType[item.room_type_id]) {
        availabilityByRoomType[item.room_type_id] = [];
      }
      availabilityByRoomType[item.room_type_id].push({
        date: item.date,
        totalRooms: item.total_rooms,
        bookedRooms: item.booked_rooms,
        blockedRooms: item.blocked_rooms,
        heldRooms: item.held_rooms,
        availableRooms: item.available_rooms,
        occupancyRate: (item.booked_rooms / item.total_rooms) * 100
      });
    });
    
    return NextResponse.json<BookingApiResponse>({
      success: true,
      data: {
        hotel: {
          id: hotel.id,
          name: hotel.name
        },
        startDate: start,
        endDate: end,
        availabilityByRoomType
      },
      metadata: {
        timestamp: new Date(),
        requestId: `req_${Date.now()}`
      }
    });
    
  } catch (error) {
    console.error('Admin availability fetch error:', error);
    return NextResponse.json<BookingApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching availability data'
      }
    }, { status: 500 });
  }
}

// Update availability (for blocking/unblocking rooms)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.hotelId || !body.roomTypeId || !body.date) {
      return NextResponse.json<BookingApiResponse>({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Hotel ID, room type ID, and date are required'
        }
      }, { status: 400 });
    }
    
    // Update availability cache
    await availabilityQueries.updateAvailabilityCache(
      body.hotelId,
      body.roomTypeId,
      new Date(body.date),
      body.bookedRoomsChange || 0,
      body.blockedRoomsChange || 0,
      body.heldRoomsChange || 0
    );
    
    return NextResponse.json<BookingApiResponse>({
      success: true,
      data: {
        message: 'Availability updated successfully'
      },
      metadata: {
        timestamp: new Date(),
        requestId: `req_${Date.now()}`
      }
    });
    
  } catch (error) {
    console.error('Admin availability update error:', error);
    return NextResponse.json<BookingApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating availability'
      }
    }, { status: 500 });
  }
}