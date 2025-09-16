-- =====================================================
-- Hotel Extensions Migration
-- Adds support for meeting spaces, galleries, and venues
-- =====================================================

-- Add meeting spaces table
CREATE TABLE IF NOT EXISTS meeting_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  capacity TEXT,
  availability TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add hotel galleries table
CREATE TABLE IF NOT EXISTS hotel_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add hotel venues table (restaurants, bars, etc.)
CREATE TABLE IF NOT EXISTS hotel_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'restaurant', 'bar', 'meeting_room', 'spa', etc.
  description TEXT,
  image_url TEXT,
  capacity TEXT,
  availability TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  hours JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'open', -- 'open', 'coming_soon', 'closed'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meeting_spaces_hotel_id ON meeting_spaces(hotel_id);
CREATE INDEX IF NOT EXISTS idx_meeting_spaces_active ON meeting_spaces(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_hotel_galleries_hotel_id ON hotel_galleries(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_galleries_active ON hotel_galleries(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_hotel_venues_hotel_id ON hotel_venues(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_venues_type ON hotel_venues(type);
CREATE INDEX IF NOT EXISTS idx_hotel_venues_active ON hotel_venues(is_active, display_order);

-- Add RLS policies for security
ALTER TABLE meeting_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_venues ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view meeting spaces" ON meeting_spaces FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view hotel galleries" ON hotel_galleries FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view hotel venues" ON hotel_venues FOR SELECT USING (is_active = true);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meeting_spaces_updated_at BEFORE UPDATE ON meeting_spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_venues_updated_at BEFORE UPDATE ON hotel_venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();