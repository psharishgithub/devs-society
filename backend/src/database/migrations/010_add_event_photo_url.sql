-- Migration: Add photo_url column to events table
-- This migration adds the photo_url column needed for event thumbnail images

-- Add photo_url column to events table if it doesn't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN events.photo_url IS 'URL to the event thumbnail/photo image stored in Supabase storage';

-- Update existing events to have empty photo_url if they don't have one
UPDATE events 
SET photo_url = NULL 
WHERE photo_url IS NULL; 