import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import hotelsData from '@/Data/hotels.json'

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
    console.log('🏨 Starting JSON to CRM migration...')

    const results = {
      hotels_processed: 0,
      galleries_migrated: 0,
      meeting_spaces_migrated: 0,
      errors: [] as string[]
    }

    for (const hotel of hotelsData) {
      console.log(`Processing hotel: ${hotel.name}`)

      // First, get the hotel ID from the hotels table
      const { data: hotelRecord, error: hotelError } = await adminSupabase
        .from('hotels')
        .select('id')
        .eq('slug', hotel.slug)
        .single()

      if (hotelError || !hotelRecord) {
        const error = `Hotel ${hotel.slug} not found in CRM`
        console.error(error)
        results.errors.push(error)
        continue
      }

      const hotelId = hotelRecord.id
      console.log(`Found hotel ID: ${hotelId}`)

      // Migrate gallery images
      if (hotel.gallery && hotel.gallery.length > 0) {
        console.log(`Migrating ${hotel.gallery.length} gallery images...`)

        // Check if galleries already exist to avoid duplicates
        const { data: existingGallery } = await adminSupabase
          .from('hotel_galleries')
          .select('id')
          .eq('hotel_id', hotelId)

        if (!existingGallery || existingGallery.length === 0) {
          const galleryData = hotel.gallery.map((imageUrl, index) => ({
            hotel_id: hotelId,
            image_url: imageUrl,
            alt_text: `${hotel.name} gallery image ${index + 1}`,
            display_order: index
          }))

          const { error: galleryError } = await adminSupabase
            .from('hotel_galleries')
            .insert(galleryData)

          if (galleryError) {
            const error = `Gallery migration failed for ${hotel.slug}: ${galleryError.message}`
            console.error(error)
            results.errors.push(error)
          } else {
            results.galleries_migrated += hotel.gallery.length
            console.log(`✅ Gallery migrated: ${hotel.gallery.length} images`)
          }
        } else {
          console.log(`Gallery already exists for ${hotel.slug}, skipping...`)
        }
      }

      // Migrate meeting spaces
      if ((hotel as any).meetingSpaces && (hotel as any).meetingSpaces.length > 0) {
        console.log(`Migrating ${(hotel as any).meetingSpaces.length} meeting spaces...`)

        // Check if meeting spaces already exist
        const { data: existingSpaces } = await adminSupabase
          .from('meeting_spaces')
          .select('id')
          .eq('hotel_id', hotelId)

        if (!existingSpaces || existingSpaces.length === 0) {
          for (const space of (hotel as any).meetingSpaces) {
            const { error: spaceError } = await adminSupabase
              .from('meeting_spaces')
              .insert({
                hotel_id: hotelId,
                name: space.name,
                description: space.description,
                image_url: space.image,
                capacity: space.capacity,
                availability: space.availability,
                features: space.features || []
              })

            if (spaceError) {
              const error = `Meeting space migration failed for ${space.name}: ${spaceError.message}`
              console.error(error)
              results.errors.push(error)
            } else {
              results.meeting_spaces_migrated++
              console.log(`✅ Meeting space migrated: ${space.name}`)
            }
          }
        } else {
          console.log(`Meeting spaces already exist for ${hotel.slug}, skipping...`)
        }
      }

      results.hotels_processed++
      console.log(`✅ ${hotel.name} processing complete\n`)
    }

    console.log('🎉 Migration completed!')
    console.log('Results:', results)

    return NextResponse.json({
      success: true,
      message: 'JSON to CRM migration completed successfully',
      results
    })

  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}