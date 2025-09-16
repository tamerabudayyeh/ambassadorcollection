-- Update image URLs to use working placeholder images

-- Update hotel images to use high-quality hotel placeholder images
UPDATE hotels SET image_url = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE slug = 'ambassador-jerusalem';

UPDATE hotels SET image_url = 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE slug = 'ambassador-boutique';

UPDATE hotels SET image_url = 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE slug = 'ambassador-city-bethlehem';

UPDATE hotels SET image_url = 'https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE slug = 'ambassador-ritz';

-- Update room images to use working placeholder images
UPDATE rooms SET image_url = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'deluxe' AND name LIKE '%King%';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'deluxe' AND name LIKE '%Twin%';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'suite';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'penthouse';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'standard';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'family';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'grand-deluxe';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/2029670/pexels-photo-2029670.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE room_type = 'junior-suite';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' 
WHERE name LIKE '%Boutique%' OR name LIKE '%Artist%';