-- Insert Ambassador Collection Hotels
INSERT INTO hotels (id, name, slug, location, description, image_url, rating, amenities, contact_phone, contact_email, address, city, cancellation_policy) VALUES
('a1111111-1111-1111-1111-111111111111', 
 'Ambassador Jerusalem', 
 'ambassador-jerusalem', 
 'Jerusalem, Israel',
 'A luxury hotel in the heart of Jerusalem, offering stunning city views and world-class amenities. Experience the perfect blend of ancient history and modern comfort.',
 '/images/hotels/ambassador-jerusalem/exterior.jpg',
 5.0,
 ARRAY['Spa', 'Pool', 'Fitness Center', 'Restaurant', 'Bar', 'Business Center', 'WiFi', 'Parking', 'Concierge', 'Room Service'],
 '+972-2-541-1111',
 'jerusalem@ambassadorcollection.com',
 '14 David HaMelech Street',
 'Jerusalem',
 'Free cancellation up to 24 hours before check-in. Late cancellations or no-shows will be charged the first night rate.'),

('a2222222-2222-2222-2222-222222222222',
 'Ambassador Boutique',
 'ambassador-boutique',
 'Jerusalem, Israel',
 'An intimate boutique hotel offering personalized luxury and exceptional service in a charming setting.',
 '/images/hotels/ambassador-boutique/exterior.jpg',
 5.0,
 ARRAY['Restaurant', 'Bar', 'WiFi', 'Concierge', 'Room Service', 'Terrace', 'Garden', 'Library'],
 '+972-2-541-2222',
 'boutique@ambassadorcollection.com',
 '7 Emek Refaim Street',
 'Jerusalem',
 'Free cancellation up to 24 hours before check-in. Late cancellations or no-shows will be charged the first night rate.'),

('a3333333-3333-3333-3333-333333333333',
 'Ambassador City Bethlehem',
 'ambassador-city-bethlehem',
 'Bethlehem, Palestine',
 'Modern comfort meets ancient heritage in the birthplace of Christianity. Perfect for pilgrims and tourists alike.',
 '/images/hotels/ambassador-city/exterior.jpg',
 4.5,
 ARRAY['Restaurant', 'WiFi', 'Parking', 'Prayer Room', 'Tour Desk', 'Shuttle Service', 'Conference Room'],
 '+972-2-274-3333',
 'bethlehem@ambassadorcollection.com',
 '21 Manger Square',
 'Bethlehem',
 'Free cancellation up to 48 hours before check-in. Late cancellations will be charged 50% of the total stay.'),

('a4444444-4444-4444-4444-444444444444',
 'Ambassador Ritz',
 'ambassador-ritz',
 'Jerusalem, Israel',
 'Ultra-luxury accommodation with panoramic views of the Old City. The pinnacle of elegance and sophistication.',
 '/images/hotels/ambassador-ritz/exterior.jpg',
 5.0,
 ARRAY['Michelin Restaurant', 'Rooftop Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Helipad', 'Private Beach Club Access'],
 '+972-2-541-4444',
 'ritz@ambassadorcollection.com',
 '1 King David Boulevard',
 'Jerusalem',
 'Flexible cancellation policy. Free cancellation up to 7 days before arrival. 50% charge for cancellations within 7 days.');

-- Insert Rooms for Ambassador Jerusalem
INSERT INTO rooms (hotel_id, room_type, name, description, max_occupancy, base_price, amenities, image_url, quantity, size_sqm, bed_configuration, view_type) VALUES
('a1111111-1111-1111-1111-111111111111', 'deluxe', 'Deluxe King Room', 'Spacious room with king bed and city views', 2, 350, ARRAY['King Bed', 'City View', 'Mini Bar', 'Safe', 'Bathrobe', 'Slippers'], '/images/rooms/deluxe-king.jpg', 15, 35, '1 King Bed', 'City View'),
('a1111111-1111-1111-1111-111111111111', 'deluxe', 'Deluxe Twin Room', 'Comfortable room with two twin beds', 2, 350, ARRAY['Twin Beds', 'City View', 'Mini Bar', 'Safe', 'Bathrobe', 'Slippers'], '/images/rooms/deluxe-twin.jpg', 10, 35, '2 Twin Beds', 'City View'),
('a1111111-1111-1111-1111-111111111111', 'suite', 'Executive Suite', 'Luxurious suite with separate living area', 3, 650, ARRAY['King Bed', 'Living Room', 'City View', 'Mini Bar', 'Coffee Machine', 'Bathtub'], '/images/rooms/executive-suite.jpg', 8, 65, '1 King Bed', 'Panoramic City View'),
('a1111111-1111-1111-1111-111111111111', 'suite', 'Presidential Suite', 'Top floor suite with panoramic views', 4, 1200, ARRAY['King Bed', 'Living Room', 'Dining Area', 'Kitchen', 'Jacuzzi', 'Terrace'], '/images/rooms/presidential-suite.jpg', 2, 120, '1 King Bed + Sofa Bed', 'Panoramic View');

-- Insert Rooms for Ambassador Boutique
INSERT INTO rooms (hotel_id, room_type, name, description, max_occupancy, base_price, amenities, image_url, quantity, size_sqm, bed_configuration, view_type) VALUES
('a2222222-2222-2222-2222-222222222222', 'deluxe', 'Boutique Deluxe', 'Elegantly designed room with artistic touches', 2, 400, ARRAY['Queen Bed', 'Garden View', 'Espresso Machine', 'Luxury Toiletries'], '/images/rooms/boutique-deluxe.jpg', 8, 30, '1 Queen Bed', 'Garden View'),
('a2222222-2222-2222-2222-222222222222', 'suite', 'Artist Suite', 'Unique suite featuring local artwork', 2, 750, ARRAY['King Bed', 'Art Collection', 'Terrace', 'Wine Cooler', 'Record Player'], '/images/rooms/artist-suite.jpg', 4, 55, '1 King Bed', 'Garden Terrace');

-- Insert Rooms for Ambassador City Bethlehem
INSERT INTO rooms (hotel_id, room_type, name, description, max_occupancy, base_price, amenities, image_url, quantity, size_sqm, bed_configuration, view_type) VALUES
('a3333333-3333-3333-3333-333333333333', 'standard', 'Standard Room', 'Comfortable room with modern amenities', 2, 180, ARRAY['Double Bed', 'WiFi', 'TV', 'Desk', 'Shower'], '/images/rooms/standard.jpg', 20, 25, '1 Double Bed', 'Street View'),
('a3333333-3333-3333-3333-333333333333', 'deluxe', 'Deluxe Room', 'Upgraded room with extra space', 3, 250, ARRAY['Queen Bed', 'Sofa', 'WiFi', 'Mini Fridge', 'Coffee Maker'], '/images/rooms/city-deluxe.jpg', 15, 32, '1 Queen Bed', 'City View'),
('a3333333-3333-3333-3333-333333333333', 'family', 'Family Room', 'Large room perfect for families', 4, 320, ARRAY['2 Double Beds', 'WiFi', 'Kitchenette', 'Dining Area'], '/images/rooms/family.jpg', 8, 45, '2 Double Beds', 'Courtyard View');

-- Insert Rooms for Ambassador Ritz
INSERT INTO rooms (hotel_id, room_type, name, description, max_occupancy, base_price, amenities, image_url, quantity, size_sqm, bed_configuration, view_type) VALUES
('a4444444-4444-4444-4444-444444444444', 'grand-deluxe', 'Grand Deluxe Room', 'Opulent room with premium amenities', 2, 550, ARRAY['King Bed', 'Marble Bathroom', 'Walk-in Closet', 'Nespresso Machine', 'Smart TV'], '/images/rooms/grand-deluxe.jpg', 12, 45, '1 King Bed', 'Old City View'),
('a4444444-4444-4444-4444-444444444444', 'junior-suite', 'Junior Suite', 'Sophisticated suite with separate seating area', 3, 850, ARRAY['King Bed', 'Living Area', 'Work Desk', 'Wet Bar', 'Panoramic Windows'], '/images/rooms/junior-suite.jpg', 8, 65, '1 King Bed', 'Old City View'),
('a4444444-4444-4444-4444-444444444444', 'penthouse', 'Penthouse Suite', 'Ultimate luxury with private terrace', 4, 2500, ARRAY['Master Bedroom', 'Guest Bedroom', 'Living Room', 'Private Terrace', 'Hot Tub', 'Butler Service'], '/images/rooms/penthouse.jpg', 2, 200, '1 King + 1 Queen Bed', '360° View');

-- Generate availability for the next 90 days for all rooms
INSERT INTO room_availability (room_id, date, available_quantity, rate)
SELECT 
    r.id,
    d.date_series::date,
    r.quantity,
    CASE 
        -- Weekend rates (Friday-Saturday) are 20% higher
        WHEN EXTRACT(DOW FROM d.date_series) IN (5, 6) 
        THEN r.base_price * 1.2
        -- Peak season (April-May, September-October) are 30% higher
        WHEN EXTRACT(MONTH FROM d.date_series) IN (4, 5, 9, 10)
        THEN r.base_price * 1.3
        ELSE r.base_price
    END
FROM rooms r
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', INTERVAL '1 day') AS d(date_series);

-- Insert a sample guest
INSERT INTO guests (email, first_name, last_name, phone, country, city, marketing_opt_in) VALUES
('john.doe@example.com', 'John', 'Doe', '+1-555-0123', 'United States', 'New York', true);

-- Insert a sample booking
INSERT INTO bookings (
    confirmation_number, hotel_id, room_id, guest_id, 
    check_in_date, check_out_date, adults, children,
    room_rate, subtotal, taxes, fees, total_price,
    status, payment_status, payment_method, special_requests
) 
SELECT 
    'AMB' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'),
    'a1111111-1111-1111-1111-111111111111',
    (SELECT id FROM rooms WHERE hotel_id = 'a1111111-1111-1111-1111-111111111111' AND room_type = 'deluxe' LIMIT 1),
    (SELECT id FROM guests WHERE email = 'john.doe@example.com'),
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '10 days',
    2, 0,
    350, 1050, 178.50, 25, 1253.50,
    'confirmed', 'paid', 'credit_card',
    'Late check-in requested around 10 PM';

-- Update room availability for the sample booking
UPDATE room_availability 
SET booked_quantity = booked_quantity + 1,
    available_quantity = available_quantity - 1
WHERE room_id = (SELECT room_id FROM bookings LIMIT 1)
  AND date >= (SELECT check_in_date FROM bookings LIMIT 1)
  AND date < (SELECT check_out_date FROM bookings LIMIT 1);