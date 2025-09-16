# Supabase Database Setup Instructions

Your Supabase database configuration is complete! You now need to run the SQL migration scripts to set up your database tables and data.

## Steps to Complete Setup

1. **Go to your Supabase Dashboard**
   - Open https://gnrnkhcavvgfdqysggaa.supabase.co
   - Navigate to the SQL Editor

2. **Run the SQL Scripts in Order**

   ### Step 1: Create Tables
   - Copy the contents of `supabase/01_create_tables.sql`
   - Paste and execute in SQL Editor

   ### Step 2: Add Seed Data
   - Copy the contents of `supabase/02_seed_data.sql`
   - Paste and execute in SQL Editor

   ### Step 3: Set Up Security
   - Copy the contents of `supabase/03_row_level_security.sql`
   - Paste and execute in SQL Editor

## What This Will Create

- **4 Hotels**: Ambassador Jerusalem, Boutique, City Bethlehem, Ritz
- **35 Rooms** across all hotels with different types and pricing
- **Room Availability** for the next 90 days with dynamic pricing
- **Sample Guest** and booking for testing
- **Security Policies** to protect your data

## Testing Your Setup

Once you've run all scripts, you can test the booking system:

1. Start the development server: `npm run dev`
2. Go to http://localhost:3000
3. Try searching for hotels and checking availability
4. The booking engine is now connected to your Supabase database!

## API Endpoints Available

- `GET /api/hotels` - List all hotels
- `POST /api/booking/availability` - Check room availability
- `POST /api/booking/create` - Create new booking
- `GET /api/booking/lookup` - Look up existing booking
- `POST /api/booking/cancel` - Cancel booking

## Environment Variables Configured

Your `.env.local` file contains:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY

All set! Your Ambassador Collection booking platform is ready for production use.