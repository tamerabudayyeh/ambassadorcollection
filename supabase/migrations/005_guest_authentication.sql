-- =============================================
-- Guest Authentication & Profile System
-- =============================================

-- Guest profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS guest_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    date_of_birth DATE,
    preferred_currency TEXT DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    marketing_opt_in BOOLEAN DEFAULT false,
    profile_image_url TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    dietary_restrictions TEXT[], -- Array of dietary restrictions
    accessibility_needs TEXT,
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest sessions table (for tracking user sessions)
CREATE TABLE IF NOT EXISTS guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guest_profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest preferences table
CREATE TABLE IF NOT EXISTS guest_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guest_profiles(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL, -- e.g., 'notification', 'privacy', 'accessibility'
    preference_key TEXT NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guest_id, preference_type, preference_key)
);

-- Guest activity log table (for security and tracking)
CREATE TABLE IF NOT EXISTS guest_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guest_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'profile_update', 'booking_created', etc.
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest verification tokens table (for email/phone verification)
CREATE TABLE IF NOT EXISTS guest_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guest_profiles(id) ON DELETE CASCADE,
    token_type TEXT NOT NULL, -- 'email_verification', 'phone_verification', 'password_reset'
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX(token_hash, token_type)
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_guest_profiles_email ON guest_profiles(email);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_phone ON guest_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_country ON guest_profiles(country);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_updated_at ON guest_profiles(updated_at);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_guest_id ON guest_sessions(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON guest_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_session_token ON guest_sessions(session_token);

CREATE INDEX IF NOT EXISTS idx_guest_preferences_guest_id ON guest_preferences(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_preferences_type_key ON guest_preferences(preference_type, preference_key);

CREATE INDEX IF NOT EXISTS idx_guest_activity_log_guest_id ON guest_activity_log(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_activity_log_created_at ON guest_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_guest_activity_log_activity_type ON guest_activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_guest_verification_tokens_guest_id ON guest_verification_tokens(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_verification_tokens_expires_at ON guest_verification_tokens(expires_at);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Guest profiles policies
CREATE POLICY "Users can view their own profile" ON guest_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON guest_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON guest_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Guest sessions policies
CREATE POLICY "Users can view their own sessions" ON guest_sessions
    FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Users can insert their own sessions" ON guest_sessions
    FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Users can update their own sessions" ON guest_sessions
    FOR UPDATE USING (auth.uid() = guest_id);

CREATE POLICY "Users can delete their own sessions" ON guest_sessions
    FOR DELETE USING (auth.uid() = guest_id);

-- Guest preferences policies
CREATE POLICY "Users can manage their own preferences" ON guest_preferences
    FOR ALL USING (auth.uid() = guest_id);

-- Guest activity log policies (read-only for users)
CREATE POLICY "Users can view their own activity log" ON guest_activity_log
    FOR SELECT USING (auth.uid() = guest_id);

-- Admin can view all activity logs
CREATE POLICY "Service role can manage activity logs" ON guest_activity_log
    FOR ALL USING (auth.role() = 'service_role');

-- Guest verification tokens policies
CREATE POLICY "Users can view their own verification tokens" ON guest_verification_tokens
    FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Service role can manage verification tokens" ON guest_verification_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- Triggers and Functions
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_guest_profiles_updated_at
    BEFORE UPDATE ON guest_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_preferences_updated_at
    BEFORE UPDATE ON guest_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create guest profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO guest_profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        country,
        marketing_opt_in
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', ''),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'country',
        COALESCE((NEW.raw_user_meta_data->>'marketingOptIn')::boolean, false)
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create guest profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_guest_activity(
    guest_id_param UUID,
    activity_type_param TEXT,
    description_param TEXT DEFAULT NULL,
    metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO guest_activity_log (
        guest_id,
        activity_type,
        description,
        metadata,
        ip_address,
        user_agent
    )
    VALUES (
        guest_id_param,
        activity_type_param,
        description_param,
        metadata_param,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ language 'plpgsql';

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM guest_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM guest_verification_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- =============================================
-- Views for Common Queries
-- =============================================

-- Guest profile with latest activity
CREATE OR REPLACE VIEW guest_profiles_with_activity AS
SELECT 
    gp.*,
    gal.last_activity,
    gal.activity_count
FROM guest_profiles gp
LEFT JOIN (
    SELECT 
        guest_id,
        MAX(created_at) as last_activity,
        COUNT(*) as activity_count
    FROM guest_activity_log 
    GROUP BY guest_id
) gal ON gp.id = gal.guest_id;

-- Active guest sessions
CREATE OR REPLACE VIEW active_guest_sessions AS
SELECT 
    gs.*,
    gp.first_name,
    gp.last_name,
    gp.email
FROM guest_sessions gs
JOIN guest_profiles gp ON gs.guest_id = gp.id
WHERE gs.expires_at > NOW();

-- =============================================
-- Default Guest Preferences
-- =============================================

-- Function to create default preferences for new guests
CREATE OR REPLACE FUNCTION create_default_guest_preferences(guest_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Notification preferences
    INSERT INTO guest_preferences (guest_id, preference_type, preference_key, preference_value)
    VALUES 
        (guest_id_param, 'notification', 'booking_confirmations', '"true"'::jsonb),
        (guest_id_param, 'notification', 'payment_confirmations', '"true"'::jsonb),
        (guest_id_param, 'notification', 'pre_arrival_reminders', '"true"'::jsonb),
        (guest_id_param, 'notification', 'promotional_emails', '"false"'::jsonb),
        (guest_id_param, 'notification', 'sms_notifications', '"false"'::jsonb),
    
    -- Privacy preferences
        (guest_id_param, 'privacy', 'profile_visibility', '"private"'::jsonb),
        (guest_id_param, 'privacy', 'share_analytics', '"false"'::jsonb),
    
    -- Accessibility preferences
        (guest_id_param, 'accessibility', 'high_contrast', '"false"'::jsonb),
        (guest_id_param, 'accessibility', 'large_text', '"false"'::jsonb),
        (guest_id_param, 'accessibility', 'screen_reader', '"false"'::jsonb)
    ON CONFLICT (guest_id, preference_type, preference_key) DO NOTHING;
END;
$$ language 'plpgsql';

-- Trigger to create default preferences when profile is created
CREATE OR REPLACE FUNCTION handle_new_guest_profile()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_guest_preferences(NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_guest_profile_created
    AFTER INSERT ON guest_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_guest_profile();

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE guest_profiles IS 'Extended profile information for authenticated guests';
COMMENT ON TABLE guest_sessions IS 'Active user sessions for security tracking';
COMMENT ON TABLE guest_preferences IS 'User preferences for notifications, privacy, and accessibility';
COMMENT ON TABLE guest_activity_log IS 'Audit log of guest activities for security and analytics';
COMMENT ON TABLE guest_verification_tokens IS 'Tokens for email/phone verification and password reset';

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates guest profile when auth user signs up';
COMMENT ON FUNCTION log_guest_activity(UUID, TEXT, TEXT, JSONB) IS 'Logs guest activity for audit trail';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Removes expired guest sessions';
COMMENT ON FUNCTION cleanup_expired_tokens() IS 'Removes expired verification tokens';