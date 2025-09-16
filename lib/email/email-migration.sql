-- Email tracking fields for bookings table
-- Run this in your Supabase dashboard

-- Add email tracking columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_failed_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pre_arrival_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS post_checkout_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmation_number VARCHAR(20);

-- Create index for confirmation number lookups
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation_number ON bookings(confirmation_number);

-- Add function to generate confirmation numbers
CREATE OR REPLACE FUNCTION generate_confirmation_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'AMB-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate confirmation numbers
CREATE OR REPLACE FUNCTION set_confirmation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_number IS NULL THEN
    NEW.confirmation_number = generate_confirmation_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to bookings table
DROP TRIGGER IF EXISTS trigger_set_confirmation_number ON bookings;
CREATE TRIGGER trigger_set_confirmation_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_confirmation_number();

-- Update existing bookings to have confirmation numbers
UPDATE bookings 
SET confirmation_number = generate_confirmation_number()
WHERE confirmation_number IS NULL;