import { NextRequest, NextResponse } from 'next/server';
import { BookingApiResponse } from '@/lib/booking-types';
import { hotelQueries, roomTypeQueries } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get hotel by slug
    const hotel = await hotelQueries.getBySlug(slug);
    
    if (!hotel) {
      return NextResponse.json<BookingApiResponse>({
        success: false,
        error: {
          code: 'HOTEL_NOT_FOUND',
          message: 'Hotel not found'
        }
      }, { status: 404 });
    }
    
    // TODO: Add room types when table is created
    const roomTypes: any[] = [];

    // Get CRM extensions: meeting spaces, galleries, and venues
    const [meetingSpaces, gallery, venues] = await Promise.all([
      supabase
        .from('meeting_spaces')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('display_order')
        .then(({ data }) => data || []),

      supabase
        .from('hotel_galleries')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('display_order')
        .then(({ data }) => data || []),

      supabase
        .from('hotel_venues')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('display_order')
        .then(({ data }) => data || [])
    ]);

    return NextResponse.json<BookingApiResponse>({
      success: true,
      data: {
        hotel: {
          ...hotel,
          roomTypes,
          meetingSpaces,
          gallery,
          venues
        }
      },
      metadata: {
        timestamp: new Date(),
        requestId: `req_${Date.now()}`
      }
    });
    
  } catch (error) {
    console.error('Hotel fetch error:', error);
    return NextResponse.json<BookingApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching hotel details'
      }
    }, { status: 500 });
  }
}