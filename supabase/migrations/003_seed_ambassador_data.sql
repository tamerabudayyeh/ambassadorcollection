-- Seed Ambassador Collection Hotel Data
-- This migration populates the database with Ambassador Collection's four hotels

BEGIN;

-- Insert Ambassador Collection Hotels
INSERT INTO hotels (id, name, slug, description, address, city, country, postal_code, phone, email, website, amenities, policies) VALUES 
('ambassador-jerusalem', 'Ambassador Hotel Jerusalem', 'ambassador-jerusalem', 
 'Elegant hotel in the heart of Jerusalem offering luxurious accommodations with stunning city views and world-class amenities.',
 'Nablus Road, Sheikh Jarrah', 'Jerusalem', 'Palestine', '97200',
 '+970-2-541-2222', 'info@ambassador-jerusalem.com', 'https://ambassador-jerusalem.com',
 '["Free WiFi", "24-hour Front Desk", "Restaurant", "Bar", "Fitness Center", "Business Center", "Meeting Rooms", "Concierge Service", "Laundry Service", "Airport Shuttle", "Valet Parking", "Room Service"]',
 '{"check_in": "15:00", "check_out": "11:00", "cancellation": "24 hours before arrival", "pets": "Not allowed", "smoking": "Non-smoking hotel", "children": "Children of all ages welcome"}'
),
('ambassador-boutique', 'Ambassador Boutique Hotel', 'ambassador-boutique',
 'Intimate boutique hotel featuring unique design, personalized service, and local art in every room.',
 'Al-Zahra Street', 'Ramallah', 'Palestine', '97300',
 '+970-2-298-7777', 'info@ambassador-boutique.com', 'https://ambassador-boutique.com',
 '["Free WiFi", "24-hour Front Desk", "Artisan Restaurant", "Rooftop Terrace", "Art Gallery", "Library", "Yoga Studio", "Spa Services", "Local Tours", "Cultural Experiences"]',
 '{"check_in": "15:00", "check_out": "11:00", "cancellation": "24 hours before arrival", "pets": "Small pets allowed with fee", "smoking": "Designated smoking areas", "children": "Children over 12 welcome"}'
),
('ambassador-city', 'Ambassador City Hotel Bethlehem', 'ambassador-city',
 'Modern city hotel in historic Bethlehem, perfectly positioned for exploring religious and cultural sites.',
 'Manger Street', 'Bethlehem', 'Palestine', '97500',
 '+970-2-276-6666', 'info@ambassador-city.com', 'https://ambassador-city.com',
 '["Free WiFi", "24-hour Front Desk", "Restaurant", "Coffee Shop", "Business Center", "Tour Desk", "Car Rental", "Currency Exchange", "Luggage Storage", "Historical Tours"]',
 '{"check_in": "15:00", "check_out": "11:00", "cancellation": "24 hours before arrival", "pets": "Not allowed", "smoking": "Non-smoking hotel", "children": "Children of all ages welcome"}'
),
('ambassador-ritz', 'Ambassador Ritz Hotel', 'ambassador-ritz',
 'Luxury flagship hotel offering unparalleled elegance, fine dining, and premium amenities for discerning travelers.',
 'King Hussein Street', 'Amman', 'Jordan', '11183',
 '+962-6-464-1234', 'info@ambassador-ritz.com', 'https://ambassador-ritz.com',
 '["Free WiFi", "24-hour Front Desk", "Fine Dining Restaurant", "Champagne Bar", "Luxury Spa", "Indoor Pool", "Fitness Center", "Business Center", "Meeting Rooms", "Ballroom", "Butler Service", "Limousine Service", "Helicopter Pad"]',
 '{"check_in": "15:00", "check_out": "12:00", "cancellation": "48 hours before arrival", "pets": "Pets allowed with premium fee", "smoking": "Designated smoking lounges", "children": "Children of all ages welcome with premium services"}'
);

-- Insert Room Types for Ambassador Jerusalem
INSERT INTO room_types (id, hotel_id, name, slug, description, base_price, max_occupancy, max_adults, max_children, size_sqm, bed_configuration, images, amenities, total_inventory, sort_order) VALUES 
('rm-aje-01', 'ambassador-jerusalem', 'Classic King Room', 'classic-king',
 'Elegant room with king-size bed, city views, and modern amenities', 280.00, 2, 2, 1, 32, '1 King Bed',
 '["https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg", "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Bar", "Safe", "Flat-screen TV", "Coffee/Tea Maker", "Bathroom with Shower", "Hairdryer", "Iron & Ironing Board", "Work Desk"]',
 15, 1),
('rm-aje-02', 'ambassador-jerusalem', 'Deluxe Twin Room', 'deluxe-twin',
 'Spacious room with two twin beds, perfect for friends or colleagues', 300.00, 2, 2, 0, 35, '2 Twin Beds',
 '["https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Bar", "Safe", "Flat-screen TV", "Coffee/Tea Maker", "Bathroom with Bathtub", "Bathrobes & Slippers", "Premium Toiletries", "Work Desk", "Seating Area"]',
 12, 2),
('rm-aje-03', 'ambassador-jerusalem', 'Executive Suite', 'executive-suite',
 'Luxurious suite with separate living area and panoramic city views', 480.00, 4, 3, 2, 65, '1 King Bed + Sofa Bed',
 '["https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Bar", "In-room Safe", "55inch Flat-screen TV", "Nespresso Machine", "Separate Living Room", "Dining Area", "Marble Bathroom with Separate Shower and Bathtub", "Luxury Bath Amenities", "Bathrobes & Slippers", "Work Desk with Ergonomic Chair", "Complimentary Fruit Basket", "Evening Turndown Service"]',
 5, 3),
('rm-aje-04', 'ambassador-jerusalem', 'Family Room', 'family-room',
 'Comfortable room designed for families with children', 350.00, 4, 2, 2, 42, '1 King Bed + 2 Single Beds',
 '["https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Fridge", "Safe", "Two Flat-screen TVs", "Coffee/Tea Maker", "Spacious Bathroom", "Kids Amenities", "Baby Crib (on request)", "Game Console", "Board Games"]',
 8, 4);

-- Insert Room Types for Ambassador Boutique
INSERT INTO room_types (id, hotel_id, name, slug, description, base_price, max_occupancy, max_adults, max_children, size_sqm, bed_configuration, images, amenities, total_inventory, sort_order) VALUES 
('rm-abo-01', 'ambassador-boutique', 'Boutique Room', 'boutique-room',
 'Intimate and stylish room with unique design elements', 220.00, 2, 2, 0, 28, '1 Queen Bed',
 '["https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg"]',
 '["Free WiFi", "Climate Control", "Mini Bar", "Safe", "Smart TV", "Locally Sourced Toiletries", "Rain Shower", "Original Artwork", "Vintage Furniture"]',
 10, 1),
('rm-abo-02', 'ambassador-boutique', 'Artist Suite', 'artist-suite',
 'Creative space featuring local art and designer furnishings', 380.00, 3, 2, 1, 48, '1 King Bed',
 '["https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg"]',
 '["Free WiFi", "Climate Control", "Curated Mini Bar", "Safe", "Smart TV with Art Mode", "Record Player with Vinyl Collection", "Designer Bathroom", "Luxury Organic Toiletries", "Private Balcony", "Art Library", "Yoga Mat", "Meditation Cushions"]',
 4, 2);

-- Insert Room Types for Ambassador City Bethlehem  
INSERT INTO room_types (id, hotel_id, name, slug, description, base_price, max_occupancy, max_adults, max_children, size_sqm, bed_configuration, images, amenities, total_inventory, sort_order) VALUES 
('rm-acb-01', 'ambassador-city', 'Standard Double Room', 'standard-double',
 'Comfortable room with modern amenities and city views', 180.00, 2, 2, 1, 25, '1 Double Bed',
 '["https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Fridge", "Safe", "Flat-screen TV", "Coffee/Tea Maker", "Private Bathroom", "Hairdryer", "Work Desk"]',
 20, 1),
('rm-acb-02', 'ambassador-city', 'Superior King Room', 'superior-king',
 'Spacious room with king bed and enhanced amenities', 220.00, 2, 2, 1, 30, '1 King Bed',
 '["https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Bar", "Safe", "Flat-screen TV", "Coffee/Tea Maker", "Bathroom with Shower", "Bathrobes", "Premium Toiletries", "Seating Area", "Work Desk"]',
 15, 2),
('rm-acb-03', 'ambassador-city', 'Family Suite', 'family-suite',
 'Two-room suite perfect for families visiting Bethlehem', 320.00, 6, 4, 2, 55, '1 King Bed + 2 Twin Beds',
 '["https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg"]',
 '["Free WiFi", "Air Conditioning", "Mini Bar", "Safe", "Two Flat-screen TVs", "Coffee/Tea Maker", "Two Bathrooms", "Kids Welcome Kit", "Baby Crib (on request)", "Connecting Rooms", "Family Board Games"]',
 6, 3);

-- Insert Room Types for Ambassador Ritz
INSERT INTO room_types (id, hotel_id, name, slug, description, base_price, max_occupancy, max_adults, max_children, size_sqm, bed_configuration, images, amenities, total_inventory, sort_order) VALUES 
('rm-ar-01', 'ambassador-ritz', 'Deluxe King Room', 'deluxe-king',
 'Luxurious room with premium amenities and elegant furnishings', 450.00, 2, 2, 1, 40, '1 King Bed',
 '["https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg"]',
 '["Free WiFi", "Climate Control", "Premium Mini Bar", "In-room Safe", "55inch Smart TV", "Nespresso Machine", "Marble Bathroom", "Rain Shower", "Luxury Toiletries", "Bathrobes & Slippers", "Egyptian Cotton Linens", "24-hour Room Service"]',
 20, 1),
('rm-ar-02', 'ambassador-ritz', 'Executive Suite', 'executive-suite',
 'Sophisticated suite with separate living area and premium services', 650.00, 4, 3, 2, 75, '1 King Bed + Sofa Bed',
 '["https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg"]',
 '["Free WiFi", "Climate Control", "Premium Mini Bar", "In-room Safe", "Two 55inch Smart TVs", "Nespresso Machine", "Separate Living Room", "Dining Area", "Executive Lounge Access", "Butler Service", "Marble Bathroom with Jacuzzi", "Premium Spa Products", "Concierge Service", "Complimentary Breakfast"]',
 8, 2),
('rm-ar-03', 'ambassador-ritz', 'Presidential Suite', 'presidential-suite',
 'Ultimate luxury suite with panoramic views and exclusive services', 1200.00, 6, 4, 2, 120, '1 King Bed + 1 Queen Bed',
 '["https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg"]',
 '["Free WiFi", "Climate Control", "Full Bar", "In-room Safe", "Three 65inch Smart TVs", "Full Kitchen", "Separate Living Room", "Formal Dining Room", "Private Balcony", "Butler Service", "Chauffeur Service", "Two Marble Bathrooms", "Jacuzzi & Steam Shower", "Premium Spa Products", "Personal Concierge", "Private Chef Available", "Helicopter Transfer"]',
 2, 3);

-- Create individual room inventory
INSERT INTO rooms (id, hotel_id, room_type_id, room_number, floor) 
SELECT 
    concat(rt.id, '-', LPAD(generate_series::text, 3, '0')),
    rt.hotel_id,
    rt.id,
    CASE rt.hotel_id
        WHEN 'ambassador-jerusalem' THEN LPAD((100 + generate_series)::text, 3, '0')
        WHEN 'ambassador-boutique' THEN LPAD((200 + generate_series)::text, 3, '0') 
        WHEN 'ambassador-city' THEN LPAD((300 + generate_series)::text, 3, '0')
        WHEN 'ambassador-ritz' THEN LPAD((400 + generate_series)::text, 3, '0')
    END,
    CASE 
        WHEN generate_series <= 10 THEN 1
        WHEN generate_series <= 20 THEN 2
        WHEN generate_series <= 30 THEN 3
        ELSE 4
    END
FROM room_types rt
CROSS JOIN generate_series(1, rt.total_inventory);

-- Insert Rate Plans for all room types
INSERT INTO rate_plans (id, hotel_id, room_type_id, name, description, rate_type, base_rate_modifier, includes_breakfast, includes_taxes, valid_from, valid_to, sort_order) 
SELECT 
    concat(rt.id, '-flexible'),
    rt.hotel_id,
    rt.id,
    'Flexible Rate',
    'Best available rate with free cancellation up to 24 hours before arrival',
    'flexible',
    1.0000,
    true,
    false,
    '2024-01-01'::date,
    '2025-12-31'::date,
    1
FROM room_types rt;

INSERT INTO rate_plans (id, hotel_id, room_type_id, name, description, rate_type, base_rate_modifier, includes_breakfast, includes_taxes, cancellation_type, cancellation_deadline_hours, cancellation_penalty_amount, cancellation_penalty_type, payment_terms, valid_from, valid_to, sort_order)
SELECT 
    concat(rt.id, '-saver'),
    rt.hotel_id,
    rt.id,
    'Non-Refundable Saver',
    'Save 15% with non-refundable booking',
    'non_refundable',
    0.8500,
    true,
    false,
    'non_refundable',
    0,
    100,
    'percentage',
    'pay_now',
    '2024-01-01'::date,
    '2025-12-31'::date,
    2
FROM room_types rt;

INSERT INTO rate_plans (id, hotel_id, room_type_id, name, description, rate_type, base_rate_modifier, includes_breakfast, includes_taxes, cancellation_type, cancellation_deadline_hours, cancellation_penalty_amount, cancellation_penalty_type, payment_terms, deposit_amount, deposit_type, advance_booking_days, valid_from, valid_to, sort_order)
SELECT 
    concat(rt.id, '-advance21'),
    rt.hotel_id,
    rt.id,
    'Advance Purchase - 21 Days',
    'Book 21 days in advance and save 20%',
    'advance_purchase',
    0.8000,
    true,
    false,
    'strict',
    168, -- 7 days
    1,
    'nights',
    'deposit',
    50,
    'percentage',
    21,
    '2024-01-01'::date,
    '2025-12-31'::date,
    3
FROM room_types rt;

-- Initialize availability cache for the next 365 days
INSERT INTO availability_cache (hotel_id, room_type_id, date, total_rooms, booked_rooms, blocked_rooms, held_rooms)
SELECT 
    rt.hotel_id,
    rt.id,
    current_date + generate_series,
    rt.total_inventory,
    0, -- No bookings initially
    0, -- No blocks initially  
    0  -- No holds initially
FROM room_types rt
CROSS JOIN generate_series(0, 364);

COMMIT;