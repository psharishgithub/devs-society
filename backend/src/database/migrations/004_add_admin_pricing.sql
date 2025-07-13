-- Migration: Add admin_pricing field to events table
-- This adds support for per-admin pricing for "Open to All" events

-- First, add is_paid column if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- Add admin_pricing column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_pricing JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN events.admin_pricing IS 'JSON array of admin pricing objects for "Open to All" events. Format: [{"adminType": "string", "amount": "number", "adminId": "string"}]';

-- Update existing events to have empty admin_pricing array
UPDATE events SET admin_pricing = '[]'::jsonb WHERE admin_pricing IS NULL;

-- Set default value for is_paid column
UPDATE events SET is_paid = false WHERE is_paid IS NULL;

-- Verify the update
SELECT 
  id,
  title,
  event_type,
  is_paid,
  admin_pricing
FROM events 
ORDER BY created_at DESC 
LIMIT 5; 