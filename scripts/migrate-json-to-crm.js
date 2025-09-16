#!/usr/bin/env node

/**
 * Data Migration Script: JSON to CRM
 * Migrates hotel data from local JSON files to Supabase CRM tables
 */

const hotelsData = require('../Data/hotels.json');

async function migrateData() {
  console.log('🏨 Ambassador Collection - Data Migration');
  console.log('========================================');
  console.log('📊 Migrating JSON data to CRM tables...\n');

  const baseUrl = 'http://localhost:3002';

  try {
    for (const hotel of hotelsData) {
      console.log(`🏨 Processing hotel: ${hotel.name}`);

      // 1. Migrate gallery images
      if (hotel.gallery && hotel.gallery.length > 0) {
        console.log(`📸 Migrating ${hotel.gallery.length} gallery images...`);

        try {
          const response = await fetch(`${baseUrl}/api/hotels/${hotel.slug}/gallery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              images: hotel.gallery
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Gallery migrated: ${result.total} images`);
          } else {
            const error = await response.text();
            console.log(`⚠️  Gallery migration failed: ${response.status} - ${error}`);
          }
        } catch (error) {
          console.log(`❌ Gallery migration error: ${error.message}`);
        }
      }

      // 2. Migrate meeting spaces
      if (hotel.meetingSpaces && hotel.meetingSpaces.length > 0) {
        console.log(`🏢 Migrating ${hotel.meetingSpaces.length} meeting spaces...`);

        for (const meetingSpace of hotel.meetingSpaces) {
          try {
            const response = await fetch(`${baseUrl}/api/hotels/${hotel.slug}/meeting-spaces`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: meetingSpace.name,
                description: meetingSpace.description,
                image_url: meetingSpace.image,
                capacity: meetingSpace.capacity,
                availability: meetingSpace.availability,
                features: meetingSpace.features || []
              })
            });

            if (response.ok) {
              const result = await response.json();
              console.log(`✅ Meeting space migrated: ${result.meetingSpace.name}`);
            } else {
              const error = await response.text();
              console.log(`⚠️  Meeting space migration failed: ${response.status} - ${error}`);
            }
          } catch (error) {
            console.log(`❌ Meeting space migration error: ${error.message}`);
          }
        }
      }

      console.log(`✅ ${hotel.name} processing complete\n`);
    }

    console.log('🎉 Data migration completed!');
    console.log('\n📋 Summary:');
    console.log('   - Hotel gallery images migrated to hotel_galleries table');
    console.log('   - Meeting spaces migrated to meeting_spaces table');
    console.log('\n🔄 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Update API endpoints to use CRM data');
    console.log('   3. Remove JSON file dependencies');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if we're running the script directly
if (require.main === module) {
  // Check if server is running
  fetch('http://localhost:3002/api/hotels')
    .then(response => {
      if (response.ok) {
        console.log('✅ Server is running on port 3002\n');
        migrateData();
      } else {
        console.error('❌ Server is not responding correctly');
        console.log('🔧 Please make sure the development server is running:');
        console.log('   npm run dev');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Could not connect to server');
      console.log('🔧 Please make sure the development server is running:');
      console.log('   npm run dev');
      process.exit(1);
    });
}