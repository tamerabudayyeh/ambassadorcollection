-- Sync hotel names between Sanity CMS and Supabase database
-- This ensures the booking engine shows the same hotels as the website

-- Update hotel names to match Sanity CMS data
UPDATE hotels SET 
    name = 'Ambassador City Hotel',
    slug = 'ambassador-city',
    location = 'Bethlehem',
    description = 'Located at the entrance of historical Star Street, Ambassador City has modern rooms and a rooftop restaurant with views of Bethlehem and Jerusalem.'
WHERE slug = 'ambassador-city-bethlehem';

UPDATE hotels SET 
    name = 'Ambassador Comfort',
    slug = 'ambassador-comfort', 
    location = 'East Jerusalem',
    description = 'One of the oldest hotels in East Jerusalem, newly renovated. Located a short walk from the Old City, with balconies overlooking Mount Scopus.'
WHERE slug = 'ambassador-ritz';

-- Update room data to reflect the hotel changes
UPDATE rooms SET hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-city') 
WHERE hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-city-bethlehem');

UPDATE rooms SET hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-comfort')
WHERE hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-ritz');

-- Update room availability data
UPDATE room_availability SET room_id = (
    SELECT r.id FROM rooms r 
    JOIN hotels h ON r.hotel_id = h.id 
    WHERE h.slug = 'ambassador-city' AND r.room_type = room_availability.room_id::text
) WHERE room_id IN (
    SELECT r.id FROM rooms r 
    JOIN hotels h ON r.hotel_id = h.id 
    WHERE h.slug = 'ambassador-city-bethlehem'
);

UPDATE room_availability SET room_id = (
    SELECT r.id FROM rooms r 
    JOIN hotels h ON r.hotel_id = h.id 
    WHERE h.slug = 'ambassador-comfort' AND r.room_type = room_availability.room_id::text
) WHERE room_id IN (
    SELECT r.id FROM rooms r 
    JOIN hotels h ON r.hotel_id = h.id 
    WHERE h.slug = 'ambassador-ritz'
);

-- Verify the changes
SELECT id, name, slug, location, description FROM hotels ORDER BY name;