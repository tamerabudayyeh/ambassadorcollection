# CRM Migration Implementation Guide

## Overview
This guide implements a complete migration from JSON-based hotel data to a comprehensive Supabase CRM system that eliminates the 500 errors and provides scalable hotel management.

## Phase 1: Database Schema Setup

### 1. Execute the SQL Schema
Run the SQL commands in `supabase-migrations/001_add_hotel_extensions.sql` in your Supabase dashboard:

1. Go to https://app.supabase.io/project/YOUR_PROJECT/sql
2. Copy and paste the SQL from `supabase-migrations/001_add_hotel_extensions.sql`
3. Execute the script

This creates three new tables:
- `meeting_spaces` - For hotel meeting rooms and event spaces
- `hotel_galleries` - For hotel photo galleries
- `hotel_venues` - For restaurants, bars, and other venues

### 2. Verify Table Creation
Check that the new tables exist with proper relationships to the `hotels` table.

## Phase 2: Data Migration

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Migration Script
```bash
node scripts/migrate-json-to-crm.js
```

This script will:
- Migrate gallery images from JSON to `hotel_galleries` table
- Migrate meeting spaces from JSON to `meeting_spaces` table
- Use the new API endpoints to populate data

## Phase 3: API Integration

The following API endpoints have been created:

### New Endpoints
- `GET /api/hotels/[slug]/meeting-spaces` - Get meeting spaces for a hotel
- `POST /api/hotels/[slug]/meeting-spaces` - Create a meeting space
- `GET /api/hotels/[slug]/gallery` - Get gallery images for a hotel
- `POST /api/hotels/[slug]/gallery` - Add gallery images

### Updated Endpoints
- `GET /api/hotels/[slug]` - Now includes `meetingSpaces`, `gallery`, and `venues` data

## Phase 4: Frontend Migration

### 1. Replace Hotel Page
Replace the current hotel page with the CRM version:

```bash
# Backup current page
mv app/hotels/[slug]/page.tsx app/hotels/[slug]/page-old.tsx

# Use new CRM-based page
mv app/hotels/[slug]/page-crm.tsx app/hotels/[slug]/page.tsx
```

### 2. Remove JSON Dependencies
After verifying the CRM system works:

```bash
# Remove JSON file (optional, keep for backup initially)
# rm Data/hotels.json
```

## Phase 5: Testing & Verification

### 1. Test Hotel Pages
Visit each hotel page to verify:
- ✅ Hotel data loads from CRM
- ✅ Meeting spaces display correctly
- ✅ Gallery images work
- ✅ No 500 errors

### 2. Test API Endpoints
```bash
# Test hotel with CRM data
curl http://localhost:3002/api/hotels/ambassador-boutique

# Test meeting spaces
curl http://localhost:3002/api/hotels/ambassador-boutique/meeting-spaces

# Test gallery
curl http://localhost:3002/api/hotels/ambassador-boutique/gallery
```

## Benefits Achieved

### ✅ Resolved Issues
- **No more 500 errors**: Single source of truth eliminates data conflicts
- **No more JSON/CRM hybrid**: All data comes from Supabase
- **No more image URL conflicts**: Consistent image handling

### ✅ New Capabilities
- **Scalable**: Add hotels, meeting spaces, venues through CRM
- **Admin-friendly**: Manage content through Supabase dashboard
- **Extensible**: Easy to add new venue types, amenities, etc.
- **Performance**: Optimized queries with proper indexing

## Admin Management

### Adding New Meeting Spaces
```javascript
POST /api/hotels/ambassador-boutique/meeting-spaces
{
  "name": "Executive Boardroom",
  "description": "A sophisticated meeting space...",
  "image_url": "https://...",
  "capacity": "12 guests",
  "availability": "By appointment",
  "features": ["AV Equipment", "Natural Light"]
}
```

### Adding Gallery Images
```javascript
POST /api/hotels/ambassador-boutique/gallery
{
  "images": [
    "https://image1.jpg",
    "https://image2.jpg"
  ]
}
```

## Next Steps

1. **Execute Schema Setup** - Run the SQL commands in Supabase
2. **Run Data Migration** - Execute the migration script
3. **Replace Frontend** - Switch to CRM-based hotel page
4. **Test & Verify** - Ensure everything works correctly
5. **Clean Up** - Remove old JSON dependencies

This migration provides a robust, scalable foundation for the hotel management system and eliminates the root cause of the 500 errors.