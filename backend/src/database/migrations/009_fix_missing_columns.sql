-- Migration: Fix all missing database columns and tables
-- This migration adds all the missing columns and tables needed for the event management system

-- 1. Add missing columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_pricing JSONB DEFAULT '[]'::jsonb;

-- 2. Create event_forms table if it doesn't exist
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

-- 3. Create event_form_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES event_forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, user_id)
);

-- 4. Add payment verification fields to event_registrations
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP WITH TIME ZONE;

-- 5. Add QR code fields to event_registrations
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS qr_code_data JSONB, 
ADD COLUMN IF NOT EXISTS check_in_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,   
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES admins(id);

-- 6. Add unique constraint to event_registrations (if it doesn't exist)
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

-- 7. Create indexes for better performance  
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_verified ON event_registrations(payment_verified);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status); 
CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_forms_is_active ON event_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_form_id ON event_form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_user_id ON event_form_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_events_is_paid ON events(is_paid);

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

-- 11. Set default values for existing events
UPDATE events SET is_paid = false WHERE is_paid IS NULL;

-- 12. Verify the migration
SELECT '✅ MIGRATION COMPLETED SUCCESSFULLY!' as status;

-- Check events table columns
SELECT 'Events table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('is_paid', 'admin_pricing')
ORDER BY column_name;

-- Check event_registrations table columns
SELECT 'Event registrations table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('payment_verified', 'payment_id', 'payment_amount', 'qr_code_data')
ORDER BY column_name;

-- Check if new tables were created
SELECT 'Tables created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('event_forms', 'event_form_responses')
ORDER BY table_name; 