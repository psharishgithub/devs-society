-- Migration: Create event_forms table
-- This adds the missing event_forms table for custom event registration forms

-- Create event_forms table
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

-- Create event_form_responses table
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

-- Add comments to document the tables
COMMENT ON TABLE event_forms IS 'Custom registration forms for events';
COMMENT ON TABLE event_form_responses IS 'User responses to event registration forms';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_forms_is_active ON event_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_form_id ON event_form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_event_form_responses_user_id ON event_form_responses(user_id);

-- Verify the tables were created
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('event_forms', 'event_form_responses')
ORDER BY table_name, ordinal_position; 