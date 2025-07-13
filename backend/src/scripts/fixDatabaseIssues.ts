import { createClient } from '@supabase/supabase-js'

async function fixDatabaseIssues() {
  try {
    console.log('🔧 Fixing database issues...')
    
    // Use your Supabase credentials directly
    const supabaseUrl = 'https://ajvdedgagiiajxbhtyzf.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdmRlZGdhZ2lpYWp4Ymh0eXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjc4ODYsImV4cCI6MjA2Nzc0Mzg4Nn0.Mp6YLHTbaIBi8dLuPxEE6qwHVJdT_70aSJlNnBNh-z8'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📋 Checking database schema...')
    
    // Check if required columns exist in events table
    const { data: eventsColumns, error: eventsColumnsError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1)
    
    if (eventsColumnsError) {
      console.log('❌ Cannot access events table:', eventsColumnsError.message)
    } else {
      console.log('✅ Events table is accessible')
    }
    
    // Try to check if is_paid column exists
    try {
      const { data: isPaidCheck, error: isPaidError } = await supabase
        .from('events')
        .select('is_paid')
        .limit(1)
      
      if (isPaidError && isPaidError.code === '42703') {
        console.log('❌ is_paid column missing in events table')
      } else {
        console.log('✅ is_paid column exists in events table')
      }
    } catch (error) {
      console.log('❌ is_paid column missing in events table')
    }
    
    // Try to check if admin_pricing column exists
    try {
      const { data: adminPricingCheck, error: adminPricingError } = await supabase
        .from('events')
        .select('admin_pricing')
        .limit(1)
      
      if (adminPricingError && adminPricingError.code === '42703') {
        console.log('❌ admin_pricing column missing in events table')
      } else {
        console.log('✅ admin_pricing column exists in events table')
      }
    } catch (error) {
      console.log('❌ admin_pricing column missing in events table')
    }
    
    // Check if event_forms table exists
    const { data: eventFormsCheck, error: eventFormsCheckError } = await supabase
      .from('event_forms')
      .select('id')
      .limit(1)
    
    if (eventFormsCheckError && eventFormsCheckError.code === '42P01') {
      console.log('❌ event_forms table does not exist')
    } else {
      console.log('✅ event_forms table exists')
    }
    
    // Check if event_form_responses table exists
    const { data: formResponsesCheck, error: formResponsesCheckError } = await supabase
      .from('event_form_responses')
      .select('id')
      .limit(1)
    
    if (formResponsesCheckError && formResponsesCheckError.code === '42P01') {
      console.log('❌ event_form_responses table does not exist')
    } else {
      console.log('✅ event_form_responses table exists')
    }
    
    // Check event_registrations table structure
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('*')
      .limit(1)
    
    if (registrationsError) {
      console.log('❌ Cannot access event_registrations table:', registrationsError.message)
    } else {
      console.log('✅ event_registrations table is accessible')
      
      // Try to check if payment_verified column exists
      try {
        const { data: paymentVerifiedCheck, error: paymentVerifiedError } = await supabase
          .from('event_registrations')
          .select('payment_verified')
          .limit(1)
        
        if (paymentVerifiedError && paymentVerifiedError.code === '42703') {
          console.log('❌ payment_verified column missing in event_registrations table')
        } else {
          console.log('✅ payment_verified column exists in event_registrations table')
        }
      } catch (error) {
        console.log('❌ payment_verified column missing in event_registrations table')
      }
    }
    
    console.log('\n🚨 CRITICAL DATABASE ISSUES DETECTED!')
    console.log('The following database schema changes are required:')
    console.log('')
    console.log('1. Add is_paid column to events table')
    console.log('2. Add admin_pricing column to events table')
    console.log('3. Create event_forms table')
    console.log('4. Create event_form_responses table')
    console.log('5. Add payment verification columns to event_registrations table')
    console.log('6. Add QR code columns to event_registrations table')
    console.log('')
    
    console.log('📋 SOLUTION:')
    console.log('Please run the following SQL script in your Supabase SQL Editor:')
    console.log('')
    console.log('--- START SQL SCRIPT ---')
    console.log(`
-- Fix All Database Schema Issues
-- Run this script in your Supabase SQL Editor

-- 1. Add missing columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_pricing JSONB DEFAULT '[]'::jsonb;

-- 2. Create event_forms table
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

-- 3. Create event_form_responses table      
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
    `)
    console.log('--- END SQL SCRIPT ---')
    console.log('')
    console.log('📍 STEPS TO EXECUTE:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project: ajvdedgagiiajxbhtyzf')
    console.log('3. Click "SQL Editor" in the left sidebar')
    console.log('4. Copy and paste the SQL script above')
    console.log('5. Click "Run" to execute')
    console.log('6. Wait for all commands to complete')
    console.log('')
    console.log('✅ After running the SQL script, run this command again to verify the fix:')
    console.log('   npm run db:fix')

  } catch (error) {
    console.error('❌ Database fix failed:', error)
  }
}

// Run the fix
fixDatabaseIssues() 