-- Enhanced Database Schema for Ambassador Collection Booking Engine
-- This schema extends the existing structure for comprehensive reservations management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Additional enums for enhanced functionality
CREATE TYPE guest_title AS ENUM ('mr', 'mrs', 'ms', 'dr', 'prof', 'other');
CREATE TYPE communication_type AS ENUM ('email', 'sms', 'call', 'in_person', 'whatsapp');
CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'syncing');
CREATE TYPE channel_type AS ENUM ('direct', 'ota', 'gds', 'corporate', 'group');

-- Enhanced guest profiles with comprehensive information
ALTER TABLE guests ADD COLUMN IF NOT EXISTS title guest_title DEFAULT 'mr';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS company VARCHAR(200);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS loyalty_number VARCHAR(50);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(50);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
ALTER TABLE guests ADD COLUMN IF NOT EXISTS accessibility_needs TEXT[];
ALTER TABLE guests ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS last_stay_date DATE;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS next_birthday DATE;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS gdpr_consent BOOLEAN DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for guest table
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_loyalty ON guests(loyalty_number);
CREATE INDEX IF NOT EXISTS idx_guests_company ON guests(company);

-- Guest communication history
CREATE TABLE IF NOT EXISTS guest_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    staff_user_id UUID, -- Reference to staff member
    communication_type communication_type NOT NULL,
    direction communication_direction NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'sent',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_communications_guest ON guest_communications(guest_id);
CREATE INDEX idx_guest_communications_booking ON guest_communications(booking_id);
CREATE INDEX idx_guest_communications_date ON guest_communications(sent_at);

-- Booking workflow and tasks
CREATE TABLE IF NOT EXISTS booking_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority priority_level DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    assigned_to UUID, -- Staff member ID
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_booking_tasks_booking ON booking_tasks(booking_id);
CREATE INDEX idx_booking_tasks_status ON booking_tasks(status);
CREATE INDEX idx_booking_tasks_assigned ON booking_tasks(assigned_to);
CREATE INDEX idx_booking_tasks_due ON booking_tasks(due_date);

-- Room assignment preferences and history
CREATE TABLE IF NOT EXISTS room_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id),
    guest_id UUID NOT NULL REFERENCES guests(id),
    assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID, -- Staff member ID
    assignment_reason TEXT,
    guest_preferences JSONB DEFAULT '{}',
    special_requests TEXT,
    room_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_room_assignments_booking ON room_assignments(booking_id);
CREATE INDEX idx_room_assignments_room ON room_assignments(room_id);
CREATE INDEX idx_room_assignments_guest ON room_assignments(guest_id);

-- Group bookings management
CREATE TABLE IF NOT EXISTS group_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(255) NOT NULL,
    group_type VARCHAR(100) DEFAULT 'leisure', -- leisure, corporate, wedding, conference
    primary_contact_id UUID NOT NULL REFERENCES guests(id),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    event_date DATE,
    event_end_date DATE,
    total_rooms_blocked INTEGER DEFAULT 0,
    rooms_picked_up INTEGER DEFAULT 0,
    block_rate DECIMAL(10,2),
    cutoff_date DATE,
    contract_signed BOOLEAN DEFAULT false,
    contract_url TEXT,
    rooming_list_deadline DATE,
    special_rates JSONB DEFAULT '{}',
    group_amenities JSONB DEFAULT '{}',
    catering_requirements TEXT,
    av_requirements TEXT,
    transportation_needed BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'inquiry',
    total_value DECIMAL(12,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link individual bookings to group bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_booking_id UUID REFERENCES group_bookings(id);
CREATE INDEX IF NOT EXISTS idx_bookings_group ON bookings(group_booking_id);

-- Corporate rates and contracts
CREATE TABLE IF NOT EXISTS corporate_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contract_number VARCHAR(100),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_type_id UUID REFERENCES room_types(id),
    rate_amount DECIMAL(10,2) NOT NULL,
    rate_type VARCHAR(50) DEFAULT 'fixed', -- fixed, percentage_off, best_available
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    minimum_nights INTEGER DEFAULT 1,
    booking_window_days INTEGER DEFAULT 0,
    cancellation_terms TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    authorized_bookers TEXT[],
    credit_limit DECIMAL(12,2),
    payment_terms VARCHAR(100) DEFAULT 'net_30',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_corporate_rates_company ON corporate_rates(company_name);
CREATE INDEX idx_corporate_rates_hotel ON corporate_rates(hotel_id);

-- Revenue management and yield optimization
CREATE TABLE IF NOT EXISTS yield_management_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_type_id UUID REFERENCES room_types(id),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(100) NOT NULL, -- occupancy_based, lead_time, day_of_week, seasonal
    trigger_conditions JSONB NOT NULL,
    price_adjustments JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotional codes and packages
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    promo_name VARCHAR(255) NOT NULL,
    description TEXT,
    promo_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_nights, package
    discount_value DECIMAL(10,2),
    minimum_nights INTEGER DEFAULT 1,
    maximum_nights INTEGER,
    minimum_amount DECIMAL(10,2),
    applicable_room_types UUID[],
    blackout_dates DATE[],
    max_uses INTEGER,
    uses_per_guest INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    advance_booking_required INTEGER DEFAULT 0,
    combinable_with_other_offers BOOLEAN DEFAULT false,
    terms_and_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package deals and add-ons
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) DEFAULT 'experience', -- experience, dining, spa, romance, business
    description TEXT,
    includes JSONB DEFAULT '{}',
    base_price DECIMAL(10,2),
    per_person_supplement DECIMAL(10,2) DEFAULT 0,
    per_night_price BOOLEAN DEFAULT false,
    applicable_room_types UUID[],
    minimum_nights INTEGER DEFAULT 1,
    advance_booking_required INTEGER DEFAULT 0,
    capacity_limited BOOLEAN DEFAULT false,
    max_capacity INTEGER,
    current_bookings INTEGER DEFAULT 0,
    valid_from DATE,
    valid_to DATE,
    days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking add-ons and extras
CREATE TABLE IF NOT EXISTS booking_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    addon_type VARCHAR(100) NOT NULL,
    addon_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    date_required DATE,
    time_required TIME,
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_booking_addons_booking ON booking_addons(booking_id);

-- Channel manager integration tracking
CREATE TABLE IF NOT EXISTS channel_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    channel_name VARCHAR(100) NOT NULL,
    channel_type channel_type NOT NULL,
    integration_status integration_status DEFAULT 'inactive',
    api_endpoint TEXT,
    credentials_encrypted TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(50),
    sync_frequency_minutes INTEGER DEFAULT 60,
    error_count INTEGER DEFAULT 0,
    last_error_message TEXT,
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync logs for channel manager updates
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES channel_integrations(id),
    sync_type VARCHAR(100) NOT NULL, -- rates, availability, bookings, inventory
    direction VARCHAR(20) NOT NULL, -- push, pull, both
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    sync_duration_ms INTEGER,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Housekeeping and maintenance integration
CREATE TABLE IF NOT EXISTS housekeeping_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'clean', -- dirty, clean, inspected, maintenance, out_of_order
    housekeeper_id UUID,
    inspector_id UUID,
    cleaned_at TIMESTAMP WITH TIME ZONE,
    inspected_at TIMESTAMP WITH TIME ZONE,
    maintenance_required BOOLEAN DEFAULT false,
    maintenance_notes TEXT,
    guest_checkout_condition TEXT,
    amenities_restocked BOOLEAN DEFAULT false,
    special_cleaning_required BOOLEAN DEFAULT false,
    estimated_cleaning_time INTEGER, -- minutes
    actual_cleaning_time INTEGER, -- minutes
    priority priority_level DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- Guest preferences and loyalty tracking
CREATE TABLE IF NOT EXISTS guest_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    preference_type VARCHAR(100) NOT NULL,
    preference_value TEXT NOT NULL,
    preference_category VARCHAR(50) DEFAULT 'general',
    importance INTEGER DEFAULT 3, -- 1-5 scale
    last_requested_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_preferences_guest ON guest_preferences(guest_id);
CREATE INDEX idx_guest_preferences_type ON guest_preferences(preference_type);

-- Stay history and guest journey tracking
CREATE TABLE IF NOT EXISTS guest_stay_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_id UUID REFERENCES rooms(id),
    check_in_experience_rating INTEGER CHECK (check_in_experience_rating >= 1 AND check_in_experience_rating <= 5),
    room_satisfaction_rating INTEGER CHECK (room_satisfaction_rating >= 1 AND room_satisfaction_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    would_recommend BOOLEAN,
    review_text TEXT,
    complaints_resolved BOOLEAN DEFAULT true,
    compensation_provided DECIMAL(10,2) DEFAULT 0,
    return_likelihood VARCHAR(20), -- very_likely, likely, neutral, unlikely, very_unlikely
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue reporting and analytics views
CREATE OR REPLACE VIEW booking_analytics AS
SELECT 
    b.hotel_id,
    h.name as hotel_name,
    DATE_TRUNC('month', b.check_in_date) as month_year,
    COUNT(*) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount) as average_booking_value,
    SUM(b.number_of_nights) as total_room_nights,
    AVG(b.number_of_nights) as average_length_of_stay,
    COUNT(CASE WHEN b.booking_source = 'website' THEN 1 END) as direct_bookings,
    COUNT(CASE WHEN b.booking_source = 'ota' THEN 1 END) as ota_bookings,
    AVG(EXTRACT(DAY FROM (b.created_at - b.check_in_date))) as average_lead_time
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY b.hotel_id, h.name, DATE_TRUNC('month', b.check_in_date);

-- Enhanced RLS policies for multi-tenant security
ALTER TABLE guest_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_management_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_stay_history ENABLE ROW LEVEL SECURITY;

-- RLS policies to ensure hotel_id isolation
CREATE POLICY guest_communications_hotel_isolation ON guest_communications
    USING (EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.id = guest_communications.booking_id 
        AND has_hotel_access(b.hotel_id)
    ));

CREATE POLICY booking_tasks_hotel_isolation ON booking_tasks
    USING (EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.id = booking_tasks.booking_id 
        AND has_hotel_access(b.hotel_id)
    ));

CREATE POLICY group_bookings_hotel_isolation ON group_bookings
    USING (has_hotel_access(hotel_id));

CREATE POLICY corporate_rates_hotel_isolation ON corporate_rates
    USING (has_hotel_access(hotel_id));

-- Database functions for enhanced functionality
CREATE OR REPLACE FUNCTION calculate_dynamic_rate(
    p_room_type_id UUID,
    p_date DATE,
    p_base_rate DECIMAL,
    p_occupancy_rate DECIMAL DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
    final_rate DECIMAL := p_base_rate;
    pricing_rule RECORD;
    occupancy_multiplier DECIMAL := 1.0;
BEGIN
    -- Apply yield management rules
    FOR pricing_rule IN 
        SELECT * FROM yield_management_rules 
        WHERE hotel_id IN (SELECT hotel_id FROM room_types WHERE id = p_room_type_id)
        AND (room_type_id IS NULL OR room_type_id = p_room_type_id)
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= p_date)
        AND (valid_to IS NULL OR valid_to >= p_date)
        ORDER BY priority DESC
    LOOP
        -- Apply rule-based pricing adjustments
        CASE pricing_rule.rule_type
            WHEN 'occupancy_based' THEN
                IF p_occupancy_rate IS NOT NULL THEN
                    -- Apply occupancy-based multiplier
                    occupancy_multiplier := 
                        CASE 
                            WHEN p_occupancy_rate >= 0.9 THEN 1.3
                            WHEN p_occupancy_rate >= 0.8 THEN 1.2
                            WHEN p_occupancy_rate >= 0.7 THEN 1.1
                            WHEN p_occupancy_rate <= 0.3 THEN 0.8
                            ELSE 1.0
                        END;
                    final_rate := final_rate * occupancy_multiplier;
                END IF;
            WHEN 'day_of_week' THEN
                -- Apply day-of-week pricing
                final_rate := final_rate * COALESCE(
                    (pricing_rule.price_adjustments->>(EXTRACT(DOW FROM p_date)::text))::DECIMAL,
                    1.0
                );
        END CASE;
    END LOOP;

    -- Apply dynamic pricing overrides
    SELECT 
        CASE 
            WHEN minimum_rate IS NOT NULL AND final_rate < minimum_rate THEN minimum_rate
            WHEN maximum_rate IS NOT NULL AND final_rate > maximum_rate THEN maximum_rate
            ELSE final_rate * base_rate_multiplier
        END INTO final_rate
    FROM dynamic_pricing 
    WHERE room_type_id = p_room_type_id 
    AND date = p_date 
    AND close_out = false;

    RETURN COALESCE(final_rate, p_base_rate);
END;
$$ LANGUAGE plpgsql;

-- Function to check real-time availability with holds
CREATE OR REPLACE FUNCTION check_availability_with_holds(
    p_hotel_id UUID,
    p_room_type_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_room_count INTEGER DEFAULT 1
) RETURNS TABLE (
    available_rooms INTEGER,
    max_rate DECIMAL,
    min_rate DECIMAL,
    avg_rate DECIMAL
) AS $$
DECLARE
    total_inventory INTEGER;
    booked_count INTEGER;
    held_count INTEGER;
    blocked_count INTEGER;
    available_count INTEGER;
    rate_info RECORD;
BEGIN
    -- Get total inventory for room type
    SELECT total_inventory INTO total_inventory
    FROM room_types
    WHERE id = p_room_type_id AND hotel_id = p_hotel_id;

    -- Count existing bookings for the date range
    SELECT COUNT(*) INTO booked_count
    FROM bookings b
    WHERE b.room_type_id = p_room_type_id
    AND b.hotel_id = p_hotel_id
    AND b.status IN ('confirmed', 'checked_in')
    AND NOT (b.check_out_date <= p_check_in OR b.check_in_date >= p_check_out);

    -- Count active holds
    SELECT COALESCE(SUM(room_count), 0) INTO held_count
    FROM booking_holds
    WHERE room_type_id = p_room_type_id
    AND hotel_id = p_hotel_id
    AND status = 'active'
    AND expires_at > NOW()
    AND NOT (check_out_date <= p_check_in OR check_in_date >= p_check_out);

    -- Count blocked inventory
    SELECT COALESCE(SUM(rooms_blocked), 0) INTO blocked_count
    FROM inventory_blocks
    WHERE room_type_id = p_room_type_id
    AND hotel_id = p_hotel_id
    AND NOT (end_date <= p_check_in OR start_date >= p_check_out);

    available_count := total_inventory - booked_count - held_count - blocked_count;

    -- Get rate information for the stay period
    SELECT 
        MAX(rate) as max_rate,
        MIN(rate) as min_rate,
        AVG(rate) as avg_rate
    INTO rate_info
    FROM (
        SELECT calculate_dynamic_rate(p_room_type_id, date_series, 
               (SELECT base_price FROM room_types WHERE id = p_room_type_id)) as rate
        FROM generate_series(p_check_in, p_check_out - INTERVAL '1 day', INTERVAL '1 day') as date_series
    ) rates;

    RETURN QUERY SELECT 
        GREATEST(0, available_count),
        COALESCE(rate_info.max_rate, 0::DECIMAL),
        COALESCE(rate_info.min_rate, 0::DECIMAL),
        COALESCE(rate_info.avg_rate, 0::DECIMAL);
END;
$$ LANGUAGE plpgsql;

-- Function to create booking hold with inventory management
CREATE OR REPLACE FUNCTION create_booking_hold(
    p_session_id TEXT,
    p_hotel_id UUID,
    p_room_type_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_room_count INTEGER DEFAULT 1,
    p_hold_minutes INTEGER DEFAULT 15
) RETURNS UUID AS $$
DECLARE
    hold_id UUID;
    available_rooms INTEGER;
BEGIN
    -- Check availability
    SELECT available_rooms INTO available_rooms
    FROM check_availability_with_holds(p_hotel_id, p_room_type_id, p_check_in, p_check_out, p_room_count);

    IF available_rooms < p_room_count THEN
        RAISE EXCEPTION 'Insufficient availability: % rooms requested, % available', p_room_count, available_rooms;
    END IF;

    -- Create the hold
    INSERT INTO booking_holds (
        session_id, hotel_id, room_type_id, check_in_date, check_out_date,
        room_count, expires_at, status
    ) VALUES (
        p_session_id, p_hotel_id, p_room_type_id, p_check_in, p_check_out,
        p_room_count, NOW() + (p_hold_minutes || ' minutes')::INTERVAL, 'active'
    ) RETURNING id INTO hold_id;

    RETURN hold_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update guest statistics
CREATE OR REPLACE FUNCTION update_guest_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update guest booking statistics when booking is confirmed
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE guests SET
            total_bookings = total_bookings + 1,
            total_spent = total_spent + NEW.total_amount,
            last_stay_date = GREATEST(COALESCE(last_stay_date, NEW.check_out_date), NEW.check_out_date),
            updated_at = NOW()
        WHERE id = NEW.guest_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_stats_trigger
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_guest_statistics();

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings USING GIST (
    daterange(check_in_date, check_out_date, '[)')
);

CREATE INDEX IF NOT EXISTS idx_availability_cache_composite ON availability_cache(
    hotel_id, room_type_id, date
);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_composite ON dynamic_pricing(
    hotel_id, room_type_id, date
);

CREATE INDEX IF NOT EXISTS idx_booking_holds_expiry ON booking_holds(expires_at) 
WHERE status = 'active';

-- Comments for documentation
COMMENT ON TABLE guest_communications IS 'Tracks all communication with guests including emails, calls, and messages';
COMMENT ON TABLE booking_tasks IS 'Workflow tasks associated with bookings for staff management';
COMMENT ON TABLE group_bookings IS 'Management of group reservations and block bookings';
COMMENT ON TABLE corporate_rates IS 'Corporate contract rates and negotiated pricing';
COMMENT ON TABLE yield_management_rules IS 'Dynamic pricing rules based on occupancy and demand';
COMMENT ON TABLE promotions IS 'Promotional codes and special offers management';
COMMENT ON TABLE packages IS 'Hotel packages and experience offerings';
COMMENT ON TABLE channel_integrations IS 'Integration settings for OTAs and channel managers';
COMMENT ON TABLE housekeeping_status IS 'Real-time room status for housekeeping operations';
COMMENT ON FUNCTION calculate_dynamic_rate IS 'Calculates dynamic pricing based on yield management rules';
COMMENT ON FUNCTION check_availability_with_holds IS 'Real-time availability check including active holds';