-- Ambassador Collection Booking System Database Schema
-- This migration creates the complete database structure for a multi-property hotel booking system

-- Enable Row Level Security globally
BEGIN;

-- Create custom types for better data integrity
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'cash', 'bank_transfer', 'other');
CREATE TYPE booking_source AS ENUM ('website', 'phone', 'email', 'walk_in', 'ota');
CREATE TYPE rate_type AS ENUM ('flexible', 'non_refundable', 'advance_purchase', 'package');
CREATE TYPE cancellation_type AS ENUM ('flexible', 'moderate', 'strict', 'non_refundable');
CREATE TYPE payment_terms_type AS ENUM ('pay_now', 'pay_later', 'deposit');
CREATE TYPE room_status AS ENUM ('active', 'inactive', 'maintenance', 'out_of_order');
CREATE TYPE block_reason AS ENUM ('maintenance', 'group', 'event', 'other');
CREATE TYPE modification_type AS ENUM ('date_change', 'room_change', 'guest_change', 'cancellation');

-- Hotels table - Core hotel information
CREATE TABLE hotels (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    check_in_time TIME DEFAULT '15:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    currency VARCHAR(3) DEFAULT 'USD',
    time_zone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
    tax_rate DECIMAL(4,2) DEFAULT 17.00, -- 17% VAT
    service_fee DECIMAL(8,2) DEFAULT 25.00, -- Service fee per night
    amenities JSONB DEFAULT '[]',
    policies JSONB DEFAULT '{}',
    coordinates POINT,
    status room_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Types table - Categories of rooms
CREATE TABLE room_types (
    id TEXT PRIMARY KEY,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    max_occupancy INTEGER NOT NULL DEFAULT 2,
    max_adults INTEGER NOT NULL DEFAULT 2,
    max_children INTEGER NOT NULL DEFAULT 2,
    size_sqm INTEGER,
    bed_configuration VARCHAR(100),
    images JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    total_inventory INTEGER NOT NULL DEFAULT 1,
    status room_status DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, slug)
);

-- Individual Rooms table - Physical room inventory
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id TEXT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor INTEGER,
    building VARCHAR(50),
    status room_status DEFAULT 'active',
    notes TEXT,
    last_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, room_number)
);

-- Rate Plans table - Pricing strategies and conditions
CREATE TABLE rate_plans (
    id TEXT PRIMARY KEY,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id TEXT REFERENCES room_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rate_type rate_type NOT NULL DEFAULT 'flexible',
    base_rate_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    includes_breakfast BOOLEAN DEFAULT false,
    includes_taxes BOOLEAN DEFAULT false,
    minimum_stay INTEGER,
    maximum_stay INTEGER,
    advance_booking_days INTEGER,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday, 6=Saturday
    blackout_dates DATE[],
    -- Cancellation Policy
    cancellation_type cancellation_type DEFAULT 'flexible',
    cancellation_deadline_hours INTEGER DEFAULT 24,
    cancellation_penalty_amount DECIMAL(8,2),
    cancellation_penalty_type VARCHAR(20), -- 'fixed', 'percentage', 'nights'
    cancellation_description TEXT,
    -- Payment Terms
    payment_terms payment_terms_type DEFAULT 'pay_later',
    deposit_amount DECIMAL(8,2),
    deposit_type VARCHAR(20), -- 'fixed', 'percentage'
    payment_due_date VARCHAR(20) DEFAULT 'arrival', -- 'booking', 'arrival', 'days_before'
    payment_days_before INTEGER,
    status room_status DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic Pricing table - Date-specific pricing rules
CREATE TABLE dynamic_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id TEXT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    rate_plan_id TEXT REFERENCES rate_plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    base_rate_multiplier DECIMAL(5,4) DEFAULT 1.0000,
    minimum_rate DECIMAL(10,2),
    maximum_rate DECIMAL(10,2),
    close_out BOOLEAN DEFAULT false,
    minimum_stay INTEGER,
    maximum_stay INTEGER,
    closed_to_arrival BOOLEAN DEFAULT false,
    closed_to_departure BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, room_type_id, rate_plan_id, date)
);

-- Guests table - Guest profiles and contact information
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    marketing_opt_in BOOLEAN DEFAULT false,
    vip_status BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for fast guest lookup
CREATE INDEX idx_guests_email ON guests(email);

-- Bookings table - Core booking information
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_number VARCHAR(20) UNIQUE NOT NULL,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    status booking_status DEFAULT 'pending',
    
    -- Stay Details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
    adults INTEGER NOT NULL DEFAULT 2,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    
    -- Room Assignment
    room_type_id TEXT NOT NULL REFERENCES room_types(id),
    room_id TEXT REFERENCES rooms(id),
    rate_plan_id TEXT NOT NULL REFERENCES rate_plans(id),
    
    -- Pricing
    room_rate DECIMAL(10,2) NOT NULL, -- Average nightly rate
    room_total DECIMAL(10,2) NOT NULL, -- Total room cost before taxes/fees
    taxes DECIMAL(10,2) NOT NULL DEFAULT 0,
    fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Payment Information
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    payment_intent_id VARCHAR(255), -- Stripe or other payment processor reference
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT false,
    deposit_due_date DATE,
    balance_due_date DATE,
    
    -- Guest Requests and Notes
    special_requests TEXT,
    internal_notes TEXT,
    tags TEXT[],
    
    -- Source and Channel
    booking_source booking_source DEFAULT 'website',
    booking_channel VARCHAR(100),
    referral_code VARCHAR(50),
    promo_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CHECK (check_out_date > check_in_date),
    CHECK (adults > 0),
    CHECK (children >= 0),
    CHECK (infants >= 0),
    CHECK (total_amount >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_bookings_confirmation_number ON bookings(confirmation_number);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(hotel_id, check_in_date, check_out_date);

-- Booking Modifications table - Track changes to bookings
CREATE TABLE booking_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    modification_type modification_type NOT NULL,
    previous_values JSONB,
    new_values JSONB,
    reason TEXT,
    modified_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Blocks table - Block rooms for maintenance, groups, etc.
CREATE TABLE inventory_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id TEXT REFERENCES room_types(id) ON DELETE CASCADE,
    room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
    block_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rooms_blocked INTEGER DEFAULT 1,
    reason block_reason DEFAULT 'other',
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (end_date >= start_date),
    CHECK (rooms_blocked > 0)
);

-- Booking Holds table - Temporary inventory holds during booking process
CREATE TABLE booking_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id TEXT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    room_count INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'converted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (check_out_date > check_in_date),
    CHECK (room_count > 0)
);

-- Create index for hold cleanup
CREATE INDEX idx_booking_holds_expires_at ON booking_holds(expires_at);
CREATE INDEX idx_booking_holds_session ON booking_holds(session_id);

-- Availability Cache table - Pre-calculated availability for performance
CREATE TABLE availability_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id TEXT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_rooms INTEGER NOT NULL,
    booked_rooms INTEGER NOT NULL DEFAULT 0,
    blocked_rooms INTEGER NOT NULL DEFAULT 0,
    held_rooms INTEGER NOT NULL DEFAULT 0,
    available_rooms INTEGER GENERATED ALWAYS AS (total_rooms - booked_rooms - blocked_rooms - held_rooms) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(hotel_id, room_type_id, date)
);

-- Create indexes for availability queries
CREATE INDEX idx_availability_cache_date ON availability_cache(hotel_id, room_type_id, date);
CREATE INDEX idx_availability_cache_range ON availability_cache(hotel_id, room_type_id, date, available_rooms);

-- Booking Analytics table - Daily metrics and reporting
CREATE TABLE booking_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_rooms_sold INTEGER DEFAULT 0,
    average_daily_rate DECIMAL(10,2) DEFAULT 0,
    occupancy_rate DECIMAL(5,4) DEFAULT 0,
    rev_par DECIMAL(10,2) DEFAULT 0, -- Revenue per available room
    cancellation_count INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    average_lead_time DECIMAL(5,2) DEFAULT 0,
    average_length_of_stay DECIMAL(5,2) DEFAULT 0,
    booking_source_breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(hotel_id, date)
);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON room_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_plans_updated_at BEFORE UPDATE ON rate_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_blocks_updated_at BEFORE UPDATE ON inventory_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_metrics_updated_at BEFORE UPDATE ON booking_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate confirmation numbers
CREATE OR REPLACE FUNCTION generate_confirmation_number()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'AMB';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set confirmation number
CREATE OR REPLACE FUNCTION set_confirmation_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.confirmation_number IS NULL OR NEW.confirmation_number = '' THEN
        LOOP
            NEW.confirmation_number := generate_confirmation_number();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE confirmation_number = NEW.confirmation_number);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_confirmation_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_confirmation_number();

-- Function to clean up expired holds
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM booking_holds 
    WHERE expires_at < NOW() AND status = 'active';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    UPDATE booking_holds 
    SET status = 'expired' 
    WHERE expires_at < NOW() AND status = 'active';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;