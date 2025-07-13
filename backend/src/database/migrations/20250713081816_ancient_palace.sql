-- Event Forms and QR Code System Schema
-- This adds support for customizable event registration forms and QR code check-ins

-- EVENT_FORMS table for customizable registration forms
CREATE TABLE IF NOT EXISTS event_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active form per event
    UNIQUE(event_id, is_active) WHERE is_active = true
);

-- FORM_SUBMISSIONS table for storing form responses
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one submission per user per event
    UNIQUE(event_id, user_id)
);

-- Add QR code fields to event_registrations table
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS qr_code_data JSONB,
ADD COLUMN IF NOT EXISTS check_in_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES admins(id);

-- EVENT_CHECK_INS table for tracking check-in history
CREATE TABLE IF NOT EXISTS event_check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    check_in_code VARCHAR(50) NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_by UUID REFERENCES admins(id),
    check_in_method VARCHAR(50) DEFAULT 'qr_code', -- 'qr_code', 'manual', 'bulk'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate check-ins
    UNIQUE(registration_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_forms_event ON event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_forms_active ON event_forms(is_active);

CREATE INDEX IF NOT EXISTS idx_form_submissions_event ON form_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON form_submissions(form_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_check_in_code ON event_registrations(check_in_code);
CREATE INDEX IF NOT EXISTS idx_event_registrations_checked_in ON event_registrations(checked_in_at);

CREATE INDEX IF NOT EXISTS idx_event_check_ins_event ON event_check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_check_ins_user ON event_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_event_check_ins_code ON event_check_ins(check_in_code);
CREATE INDEX IF NOT EXISTS idx_event_check_ins_time ON event_check_ins(checked_in_at);

-- Add triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_event_forms_updated_at 
    BEFORE UPDATE ON event_forms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate QR code data when user registers for event
CREATE OR REPLACE FUNCTION generate_qr_code_for_registration()
RETURNS TRIGGER AS $$
DECLARE
    qr_data JSONB;
    check_in_code VARCHAR(50);
BEGIN
    -- Generate unique check-in code
    check_in_code := UPPER(SUBSTRING(MD5(NEW.id::text || NEW.event_id::text || NEW.user_id::text || NOW()::text) FROM 1 FOR 16));
    
    -- Create QR code data
    qr_data := jsonb_build_object(
        'eventId', NEW.event_id,
        'userId', NEW.user_id,
        'registrationId', NEW.id,
        'timestamp', NOW(),
        'checkInCode', check_in_code
    );
    
    -- Update the registration with QR code data
    NEW.qr_code_data := qr_data;
    NEW.check_in_code := check_in_code;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for QR code generation
CREATE TRIGGER IF NOT EXISTS generate_qr_code_trigger 
    BEFORE INSERT ON event_registrations 
    FOR EACH ROW EXECUTE FUNCTION generate_qr_code_for_registration();

-- Function to handle check-in process
CREATE OR REPLACE FUNCTION process_event_check_in(
    p_check_in_code VARCHAR(50),
    p_admin_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_name TEXT,
    event_title TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_registration event_registrations%ROWTYPE;
    v_user users%ROWTYPE;
    v_event events%ROWTYPE;
    v_existing_check_in event_check_ins%ROWTYPE;
BEGIN
    -- Find the registration by check-in code
    SELECT * INTO v_registration 
    FROM event_registrations 
    WHERE check_in_code = p_check_in_code AND status = 'confirmed';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Invalid check-in code or registration not confirmed', NULL::TEXT, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE;
        RETURN;
    END IF;
    
    -- Check if already checked in
    SELECT * INTO v_existing_check_in 
    FROM event_check_ins 
    WHERE registration_id = v_registration.id;
    
    IF FOUND THEN
        RETURN QUERY SELECT false, 'Already checked in at ' || v_existing_check_in.checked_in_at::TEXT, NULL::TEXT, NULL::TEXT, v_existing_check_in.checked_in_at;
        RETURN;
    END IF;
    
    -- Get user and event details
    SELECT * INTO v_user FROM users WHERE id = v_registration.user_id;
    SELECT * INTO v_event FROM events WHERE id = v_registration.event_id;
    
    -- Process check-in
    INSERT INTO event_check_ins (
        event_id, user_id, registration_id, check_in_code, 
        checked_in_by, notes, check_in_method
    ) VALUES (
        v_registration.event_id, v_registration.user_id, v_registration.id, 
        p_check_in_code, p_admin_id, p_notes, 'qr_code'
    );
    
    -- Update registration record
    UPDATE event_registrations 
    SET checked_in_at = NOW(), checked_in_by = p_admin_id
    WHERE id = v_registration.id;
    
    RETURN QUERY SELECT true, 'Check-in successful', v_user.full_name, v_event.title, NOW();
END;
$$ language 'plpgsql';

-- Create view for event check-in statistics
CREATE OR REPLACE VIEW event_check_in_stats AS
SELECT 
    e.id as event_id,
    e.title as event_title,
    e.event_date,
    COUNT(er.id) as total_registrations,
    COUNT(ec.id) as total_check_ins,
    COUNT(er.id) - COUNT(ec.id) as pending_check_ins,
    ROUND((COUNT(ec.id)::DECIMAL / NULLIF(COUNT(er.id), 0)) * 100, 2) as check_in_percentage
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'confirmed'
LEFT JOIN event_check_ins ec ON er.id = ec.registration_id
WHERE e.is_active = true
GROUP BY e.id, e.title, e.event_date
ORDER BY e.event_date DESC;

-- Add comments for documentation
COMMENT ON TABLE event_forms IS 'Customizable registration forms for events';
COMMENT ON TABLE form_submissions IS 'User responses to event registration forms';
COMMENT ON TABLE event_check_ins IS 'Event check-in tracking with QR codes';
COMMENT ON COLUMN event_registrations.qr_code_data IS 'JSON data for QR code generation';
COMMENT ON COLUMN event_registrations.check_in_code IS 'Unique code for event check-in';
COMMENT ON FUNCTION process_event_check_in IS 'Processes event check-in using QR code';