-- Fix All Database Issues
-- Run this script in your Supabase SQL editor to fix all missing tables and constraints

-- 1. Create event_forms table
CREATE TABLE IF NOT EXISTS event_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create event_form_responses table
CREATE TABLE IF NOT EXISTS event_form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES event_forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one response per user per form
  UNIQUE(form_id, user_id)
);

-- 3. Add payment verification fields to event_registrations
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP WITH TIME ZONE;

-- 4. Add QR code fields to event_registrations
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS qr_code_data JSONB,
ADD COLUMN IF NOT EXISTS check_in_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES admins(id);

-- 5. Add unique constraint to event_registrations (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'event_registrations_event_id_user_id_key'
    ) THEN
        ALTER TABLE event_registrations 
        ADD CONSTRAINT event_registrations_event_id_user_id_key 
        UNIQUE(event_id, user_id);
    END IF;
END $$;

-- 6. Add admin_pricing column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_pricing JSONB DEFAULT '[]'::jsonb;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_verified ON event_registrations(payment_verified);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_forms_is_active ON event_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_form_id ON event_form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_user_id ON event_form_responses(user_id);

-- 8. Update existing registrations for free events to have payment_verified = true
UPDATE event_registrations 
SET payment_verified = true 
WHERE event_id IN (SELECT id FROM events WHERE is_paid = false);

-- 9. Update existing registrations for paid events to have payment_verified = false
UPDATE event_registrations 
SET payment_verified = false 
WHERE event_id IN (SELECT id FROM events WHERE is_paid = true);

-- 10. Update existing events to have empty admin_pricing array
UPDATE events SET admin_pricing = '[]'::jsonb WHERE admin_pricing IS NULL;

-- 11. Add comments to document the new fields
COMMENT ON COLUMN event_registrations.payment_verified IS 'Indicates if payment was verified for paid events';
COMMENT ON COLUMN event_registrations.payment_id IS 'Razorpay payment ID for paid events';
COMMENT ON COLUMN event_registrations.payment_amount IS 'Amount paid for the event registration';
COMMENT ON COLUMN event_registrations.payment_currency IS 'Currency of the payment (default: INR)';
COMMENT ON COLUMN event_registrations.payment_timestamp IS 'Timestamp when payment was verified';
COMMENT ON COLUMN events.admin_pricing IS 'JSON array of admin pricing objects for "Open to All" events. Format: [{"adminType": "string", "amount": "number", "adminId": "string"}]';

-- 12. Verify the setup
SELECT 
  'event_forms' as table_name,
  COUNT(*) as record_count
FROM event_forms
UNION ALL
SELECT 
  'event_form_responses' as table_name,
  COUNT(*) as record_count
FROM event_form_responses
UNION ALL
SELECT 
  'event_registrations' as table_name,
  COUNT(*) as record_count
FROM event_registrations; 