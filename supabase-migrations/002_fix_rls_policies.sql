-- Fix RLS policies to allow admin operations
-- This allows the service role to insert data for migration

-- Allow service role to insert meeting spaces
CREATE POLICY "Service role can manage meeting spaces" ON meeting_spaces FOR ALL
TO service_role USING (true) WITH CHECK (true);

-- Allow service role to insert hotel galleries
CREATE POLICY "Service role can manage hotel galleries" ON hotel_galleries FOR ALL
TO service_role USING (true) WITH CHECK (true);

-- Allow service role to insert hotel venues
CREATE POLICY "Service role can manage hotel venues" ON hotel_venues FOR ALL
TO service_role USING (true) WITH CHECK (true);

-- Also allow authenticated users to manage (for admin interface)
CREATE POLICY "Authenticated users can manage meeting spaces" ON meeting_spaces FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage hotel galleries" ON hotel_galleries FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage hotel venues" ON hotel_venues FOR ALL
TO authenticated USING (true) WITH CHECK (true);