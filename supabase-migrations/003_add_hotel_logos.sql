-- Add logo_url column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update hotels with their respective logos
UPDATE hotels SET logo_url = 'https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/HotelLogos/Jerusalem%20logo.png' WHERE slug = 'ambassador-jerusalem';
UPDATE hotels SET logo_url = 'https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/HotelLogos/Boutique%20Logo.png' WHERE slug = 'ambassador-boutique';
UPDATE hotels SET logo_url = 'https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/HotelLogos/city%20logo.png' WHERE slug = 'ambassador-city';
UPDATE hotels SET logo_url = 'https://gnrnkhcavvgfdqysggaa.supabase.co/storage/v1/object/public/HotelLogos/ambassador%20comfort%20Final%20logo.png' WHERE slug = 'ambassador-comfort';