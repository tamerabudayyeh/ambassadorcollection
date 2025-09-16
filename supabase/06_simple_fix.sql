-- Simple fix for RLS permissions - temporarily disable RLS for testing

-- Temporarily disable RLS on guests and bookings tables for testing
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions
GRANT ALL ON guests TO anon, authenticated;
GRANT ALL ON bookings TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Optional: Re-enable RLS later with simpler policies
-- ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations on guests" ON guests FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL TO public USING (true) WITH CHECK (true);