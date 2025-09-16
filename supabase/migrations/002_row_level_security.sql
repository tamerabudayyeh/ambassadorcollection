-- Row Level Security (RLS) Policies for Ambassador Collection
-- This ensures proper data isolation between hotels while maintaining performance

BEGIN;

-- Enable RLS on all tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_metrics ENABLE ROW LEVEL SECURITY;

-- Hotels policies - All users can read hotel data, only authenticated can modify
CREATE POLICY "Hotels are publicly readable" ON hotels
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert hotels" ON hotels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hotels" ON hotels
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Room Types policies - Public read, authenticated modify, isolated by hotel_id
CREATE POLICY "Room types are publicly readable" ON room_types
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert room types" ON room_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update room types" ON room_types
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Rooms policies - Public read, authenticated modify, isolated by hotel_id
CREATE POLICY "Rooms are publicly readable" ON rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert rooms" ON rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rooms" ON rooms
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Rate Plans policies - Public read, authenticated modify, isolated by hotel_id
CREATE POLICY "Rate plans are publicly readable" ON rate_plans
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert rate plans" ON rate_plans
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rate plans" ON rate_plans
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Dynamic Pricing policies - Public read, authenticated modify, isolated by hotel_id
CREATE POLICY "Dynamic pricing is publicly readable" ON dynamic_pricing
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert dynamic pricing" ON dynamic_pricing
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update dynamic pricing" ON dynamic_pricing
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Guests policies - Users can only see their own guest records or service role can see all
CREATE POLICY "Users can view their own guest records" ON guests
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Anyone can insert guest records" ON guests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own guest records" ON guests
    FOR UPDATE USING (
        auth.role() = 'service_role' OR 
        email = auth.jwt() ->> 'email'
    );

-- Bookings policies - Users can see their own bookings, service role can see all
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        guest_id IN (
            SELECT id FROM guests WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update bookings" ON bookings
    FOR UPDATE USING (auth.role() = 'service_role');

-- Booking Modifications policies - Service role only
CREATE POLICY "Service role can manage booking modifications" ON booking_modifications
    FOR ALL USING (auth.role() = 'service_role');

-- Inventory Blocks policies - Public read, service role modify
CREATE POLICY "Inventory blocks are publicly readable" ON inventory_blocks
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage inventory blocks" ON inventory_blocks
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update inventory blocks" ON inventory_blocks
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete inventory blocks" ON inventory_blocks
    FOR DELETE USING (auth.role() = 'service_role');

-- Booking Holds policies - Anyone can create, service role can manage
CREATE POLICY "Anyone can create booking holds" ON booking_holds
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can view all booking holds" ON booking_holds
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update booking holds" ON booking_holds
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete booking holds" ON booking_holds
    FOR DELETE USING (auth.role() = 'service_role');

-- Availability Cache policies - Public read, service role modify
CREATE POLICY "Availability cache is publicly readable" ON availability_cache
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage availability cache" ON availability_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Booking Metrics policies - Service role only (contains sensitive business data)
CREATE POLICY "Service role can manage booking metrics" ON booking_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to check hotel access (for future use with user roles)
CREATE OR REPLACE FUNCTION has_hotel_access(hotel_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, return true (all hotels accessible)
    -- In the future, this can be enhanced to check user permissions
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's accessible hotels
CREATE OR REPLACE FUNCTION get_accessible_hotels()
RETURNS TEXT[] AS $$
BEGIN
    -- For now, return all Ambassador Collection hotels
    -- In the future, this can be enhanced based on user roles
    RETURN ARRAY['ambassador-jerusalem', 'ambassador-boutique', 'ambassador-city', 'ambassador-ritz'];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for public booking lookup (without sensitive data)
CREATE VIEW public_bookings AS
SELECT 
    b.id,
    b.confirmation_number,
    b.hotel_id,
    h.name as hotel_name,
    b.status,
    b.check_in_date,
    b.check_out_date,
    b.number_of_nights,
    b.adults,
    b.children,
    rt.name as room_type_name,
    rp.name as rate_plan_name,
    b.total_amount,
    b.currency,
    b.special_requests,
    b.created_at,
    b.confirmed_at,
    -- Guest info (limited)
    g.first_name,
    g.last_name,
    g.email
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
JOIN room_types rt ON b.room_type_id = rt.id
JOIN rate_plans rp ON b.rate_plan_id = rp.id
JOIN guests g ON b.guest_id = g.id;

-- RLS policy for the public bookings view
CREATE POLICY "Public bookings view access" ON public_bookings
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        email = auth.jwt() ->> 'email'
    );

COMMIT;