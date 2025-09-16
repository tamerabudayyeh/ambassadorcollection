-- Enable Row Level Security on all tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Hotels - Public read access
CREATE POLICY "Hotels are viewable by everyone" 
ON hotels FOR SELECT 
TO public 
USING (true);

-- Hotels - Only service role can modify
CREATE POLICY "Hotels can only be modified by service role" 
ON hotels FOR ALL 
TO service_role 
USING (true);

-- Rooms - Public read access
CREATE POLICY "Rooms are viewable by everyone" 
ON rooms FOR SELECT 
TO public 
USING (true);

-- Rooms - Only service role can modify
CREATE POLICY "Rooms can only be modified by service role" 
ON rooms FOR ALL 
TO service_role 
USING (true);

-- Room Availability - Public read access
CREATE POLICY "Room availability is viewable by everyone" 
ON room_availability FOR SELECT 
TO public 
USING (true);

-- Room Availability - Only service role can modify
CREATE POLICY "Room availability can only be modified by service role" 
ON room_availability FOR ALL 
TO service_role 
USING (true);

-- Guests - Guests can view their own profile
CREATE POLICY "Guests can view their own profile" 
ON guests FOR SELECT 
TO public 
USING (
    email = current_setting('app.current_user_email', true)
    OR auth.uid()::text = id::text
);

-- Guests - Guests can update their own profile
CREATE POLICY "Guests can update their own profile" 
ON guests FOR UPDATE 
TO public 
USING (
    email = current_setting('app.current_user_email', true)
    OR auth.uid()::text = id::text
);

-- Guests - Anyone can create a guest profile (for booking)
CREATE POLICY "Anyone can create a guest profile" 
ON guests FOR INSERT 
TO public 
WITH CHECK (true);

-- Guests - Service role has full access
CREATE POLICY "Service role has full access to guests" 
ON guests FOR ALL 
TO service_role 
USING (true);

-- Bookings - Guests can view their own bookings
CREATE POLICY "Guests can view their own bookings" 
ON bookings FOR SELECT 
TO public 
USING (
    guest_id IN (
        SELECT id FROM guests 
        WHERE email = current_setting('app.current_user_email', true)
        OR auth.uid()::text = id::text
    )
);

-- Bookings - Anyone can create a booking
CREATE POLICY "Anyone can create a booking" 
ON bookings FOR INSERT 
TO public 
WITH CHECK (true);

-- Bookings - Guests can update their own bookings (for cancellation)
CREATE POLICY "Guests can update their own bookings" 
ON bookings FOR UPDATE 
TO public 
USING (
    guest_id IN (
        SELECT id FROM guests 
        WHERE email = current_setting('app.current_user_email', true)
        OR auth.uid()::text = id::text
    )
);

-- Bookings - Service role has full access
CREATE POLICY "Service role has full access to bookings" 
ON bookings FOR ALL 
TO service_role 
USING (true);

-- Create functions for common queries

-- Function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_quantity INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM room_availability
        WHERE room_id = p_room_id
        AND date >= p_check_in
        AND date < p_check_out
        AND (available_quantity < p_quantity OR is_blocked = true)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get available rooms for a hotel
CREATE OR REPLACE FUNCTION get_available_rooms(
    p_hotel_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_guests INTEGER DEFAULT 2
)
RETURNS TABLE(
    room_id UUID,
    room_type VARCHAR,
    name VARCHAR,
    description TEXT,
    max_occupancy INTEGER,
    total_price DECIMAL,
    amenities TEXT[],
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        r.id,
        r.room_type,
        r.name,
        r.description,
        r.max_occupancy,
        SUM(ra.rate) as total_price,
        r.amenities,
        r.image_url
    FROM rooms r
    JOIN room_availability ra ON r.id = ra.room_id
    WHERE r.hotel_id = p_hotel_id
    AND r.max_occupancy >= p_guests
    AND ra.date >= p_check_in
    AND ra.date < p_check_out
    AND ra.available_quantity > 0
    AND ra.is_blocked = false
    GROUP BY r.id, r.room_type, r.name, r.description, r.max_occupancy, r.amenities, r.image_url
    HAVING COUNT(*) = (p_check_out - p_check_in)
    ORDER BY total_price ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to create a booking with availability update
CREATE OR REPLACE FUNCTION create_booking_with_availability(
    p_confirmation_number VARCHAR,
    p_hotel_id UUID,
    p_room_id UUID,
    p_guest_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_adults INTEGER,
    p_children INTEGER,
    p_room_rate DECIMAL,
    p_subtotal DECIMAL,
    p_taxes DECIMAL,
    p_fees DECIMAL,
    p_total_price DECIMAL,
    p_payment_method VARCHAR,
    p_special_requests TEXT
)
RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
BEGIN
    -- Start transaction
    -- Check availability first
    IF NOT check_room_availability(p_room_id, p_check_in, p_check_out, 1) THEN
        RAISE EXCEPTION 'Room is not available for the selected dates';
    END IF;
    
    -- Create booking
    INSERT INTO bookings (
        confirmation_number, hotel_id, room_id, guest_id,
        check_in_date, check_out_date, adults, children,
        room_rate, subtotal, taxes, fees, total_price,
        payment_method, special_requests, status, payment_status
    ) VALUES (
        p_confirmation_number, p_hotel_id, p_room_id, p_guest_id,
        p_check_in, p_check_out, p_adults, p_children,
        p_room_rate, p_subtotal, p_taxes, p_fees, p_total_price,
        p_payment_method, p_special_requests, 'confirmed', 'paid'
    ) RETURNING id INTO v_booking_id;
    
    -- Update availability
    UPDATE room_availability
    SET available_quantity = available_quantity - 1,
        booked_quantity = booked_quantity + 1
    WHERE room_id = p_room_id
    AND date >= p_check_in
    AND date < p_check_out;
    
    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON guests, bookings TO anon, authenticated;
GRANT UPDATE ON guests, bookings TO anon, authenticated;