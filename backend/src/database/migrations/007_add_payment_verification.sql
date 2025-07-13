-- Add Payment Verification Fields to Event Registrations
-- This migration adds fields to track payment verification for paid events

-- Add payment verification fields to event_registrations table
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP WITH TIME ZONE;

-- Add index for payment verification
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_verified ON event_registrations(payment_verified);

-- Add comment to document the new fields
COMMENT ON COLUMN event_registrations.payment_verified IS 'Indicates if payment was verified for paid events';
COMMENT ON COLUMN event_registrations.payment_id IS 'Razorpay payment ID for paid events';
COMMENT ON COLUMN event_registrations.payment_amount IS 'Amount paid for the event registration';
COMMENT ON COLUMN event_registrations.payment_currency IS 'Currency of the payment (default: INR)';
COMMENT ON COLUMN event_registrations.payment_timestamp IS 'Timestamp when payment was verified';

-- Update existing registrations for free events to have payment_verified = true
UPDATE event_registrations 
SET payment_verified = true 
WHERE event_id IN (SELECT id FROM events WHERE is_paid = false);

-- Update existing registrations for paid events to have payment_verified = false
-- (These will need to be re-verified through the payment flow)
UPDATE event_registrations 
SET payment_verified = false 
WHERE event_id IN (SELECT id FROM events WHERE is_paid = true); 