-- Complete Database Setup for Devs Society Portal
-- This script ensures all necessary tables and constraints are in place

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('core-member', 'board-member', 'special-member', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super-admin', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('college-specific', 'open-to-all');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('workshop', 'seminar', 'hackathon', 'competition', 'meetup', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or update events table with admin_pricing
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_type event_type NOT NULL DEFAULT 'college-specific',
    target_college_id UUID REFERENCES colleges(id),
    max_attendees INTEGER NOT NULL,
    category event_category NOT NULL DEFAULT 'other',
    organizer_admin_id UUID REFERENCES admins(id),
    organizer_name VARCHAR(255) NOT NULL,
    organizer_contact VARCHAR(255) NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    prizes TEXT[] DEFAULT '{}',
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    admin_pricing JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add admin_pricing column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE events ADD COLUMN admin_pricing JSONB DEFAULT '[]'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create or update event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status registration_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one registration per user per event
    UNIQUE(event_id, user_id)
);

-- Create or update event_forms table
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

-- Create or update event_form_responses table
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_is_paid ON events(is_paid);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_target_college ON events(target_college_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_admin ON events(organizer_admin_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_forms_is_active ON event_forms(is_active);

CREATE INDEX IF NOT EXISTS idx_event_form_responses_form_id ON event_form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_user_id ON event_form_responses(user_id);

-- Add comments to document the tables
COMMENT ON TABLE events IS 'Events table with support for admin-specific pricing';
COMMENT ON COLUMN events.admin_pricing IS 'JSON array of admin pricing objects for "Open to All" events. Format: [{"adminType": "string", "amount": "number", "adminId": "string"}]';
COMMENT ON TABLE event_registrations IS 'User registrations for events';
COMMENT ON TABLE event_forms IS 'Custom registration forms for events';
COMMENT ON TABLE event_form_responses IS 'User responses to event registration forms';

-- Update existing events to have empty admin_pricing array
UPDATE events SET admin_pricing = '[]'::jsonb WHERE admin_pricing IS NULL;

-- Verify the setup
SELECT 
    'Events' as table_name,
    COUNT(*) as record_count
FROM events
UNION ALL
SELECT 
    'Event Registrations' as table_name,
    COUNT(*) as record_count
FROM event_registrations
UNION ALL
SELECT 
    'Event Forms' as table_name,
    COUNT(*) as record_count
FROM event_forms
UNION ALL
SELECT 
    'Event Form Responses' as table_name,
    COUNT(*) as record_count
FROM event_form_responses; 