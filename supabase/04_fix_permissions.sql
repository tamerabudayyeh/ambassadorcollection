-- Fix RLS and permissions for booking functionality

-- First, let's disable RLS temporarily on guests and bookings to check if that's the issue
-- You can re-enable it after testing

-- Drop and recreate the guest insertion policy with more permissive settings
DROP POLICY IF EXISTS "Anyone can create a guest profile" ON guests;

-- Create a more permissive policy for guest creation
CREATE POLICY "Allow guest creation for bookings"
ON guests FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Ensure proper permissions are granted
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON guests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON bookings TO anon, authenticated;
GRANT SELECT ON hotels, rooms, room_availability TO anon, authenticated;

-- Grant sequence permissions (needed for ID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Alternative: If RLS is still causing issues, you can temporarily disable it for testing
-- Uncomment these lines if needed:
-- ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Add a simpler booking insertion policy
DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;
CREATE POLICY "Allow booking creation"
ON bookings FOR INSERT 
TO anon, authenticated
WITH CHECK (true);