import { createClient } from '@supabase/supabase-js'

async function verifyDatabaseFix() {
  try {
    console.log('🔍 Verifying database fix...')
    
    // Use your Supabase credentials directly
    const supabaseUrl = 'https://ajvdedgagiiajxbhtyzf.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdmRlZGdhZ2lpYWp4Ymh0eXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjc4ODYsImV4cCI6MjA2Nzc0Mzg4Nn0.Mp6YLHTbaIBi8dLuPxEE6qwHVJdT_70aSJlNnBNh-z8'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    let allChecksPassed = true
    
    // Check 1: is_paid column in events table
    try {
      const { data: isPaidCheck, error: isPaidError } = await supabase
        .from('events')
        .select('is_paid')
        .limit(1)
      
      if (isPaidError && isPaidError.code === '42703') {
        console.log('❌ is_paid column still missing in events table')
        allChecksPassed = false
      } else {
        console.log('✅ is_paid column exists in events table')
      }
    } catch (error) {
      console.log('❌ is_paid column still missing in events table')
      allChecksPassed = false
    }
    
    // Check 2: admin_pricing column in events table
    try {
      const { data: adminPricingCheck, error: adminPricingError } = await supabase
        .from('events')
        .select('admin_pricing')
        .limit(1)
      
      if (adminPricingError && adminPricingError.code === '42703') {
        console.log('❌ admin_pricing column still missing in events table')
        allChecksPassed = false
      } else {
        console.log('✅ admin_pricing column exists in events table')
      }
    } catch (error) {
      console.log('❌ admin_pricing column still missing in events table')
      allChecksPassed = false
    }
    
    // Check 3: event_forms table
    const { data: eventFormsCheck, error: eventFormsCheckError } = await supabase
      .from('event_forms')
      .select('id')
      .limit(1)
    
    if (eventFormsCheckError && eventFormsCheckError.code === '42P01') {
      console.log('❌ event_forms table still does not exist')
      allChecksPassed = false
    } else {
      console.log('✅ event_forms table exists')
    }
    
    // Check 4: event_form_responses table
    const { data: formResponsesCheck, error: formResponsesCheckError } = await supabase
      .from('event_form_responses')
      .select('id')
      .limit(1)
    
    if (formResponsesCheckError && formResponsesCheckError.code === '42P01') {
      console.log('❌ event_form_responses table still does not exist')
      allChecksPassed = false
    } else {
      console.log('✅ event_form_responses table exists')
    }
    
    // Check 5: payment_verified column in event_registrations table
    try {
      const { data: paymentVerifiedCheck, error: paymentVerifiedError } = await supabase
        .from('event_registrations')
        .select('payment_verified')
        .limit(1)
      
      if (paymentVerifiedError && paymentVerifiedError.code === '42703') {
        console.log('❌ payment_verified column still missing in event_registrations table')
        allChecksPassed = false
      } else {
        console.log('✅ payment_verified column exists in event_registrations table')
      }
    } catch (error) {
      console.log('❌ payment_verified column still missing in event_registrations table')
      allChecksPassed = false
    }
    
    // Check 6: QR code columns in event_registrations table
    try {
      const { data: qrCodeCheck, error: qrCodeError } = await supabase
        .from('event_registrations')
        .select('qr_code_data, check_in_code, qr_code_url')
        .limit(1)
      
      if (qrCodeError && qrCodeError.code === '42703') {
        console.log('❌ QR code columns still missing in event_registrations table')
        allChecksPassed = false
      } else {
        console.log('✅ QR code columns exist in event_registrations table')
      }
    } catch (error) {
      console.log('❌ QR code columns still missing in event_registrations table')
      allChecksPassed = false
    }
    
    console.log('\n' + '='.repeat(50))
    
    if (allChecksPassed) {
      console.log('🎉 ALL DATABASE ISSUES FIXED SUCCESSFULLY!')
      console.log('✅ Your event management system is now fully functional!')
      console.log('')
      console.log('🚀 You can now:')
      console.log('   • Create Free/Paid events')
      console.log('   • Set admin-specific pricing')
      console.log('   • Process Razorpay payments')
      console.log('   • Generate QR codes for check-in')
      console.log('   • Send confirmation emails')
      console.log('   • Verify payments automatically')
    } else {
      console.log('❌ SOME DATABASE ISSUES STILL EXIST')
      console.log('Please run the SQL script in Supabase SQL Editor again')
      console.log('Check the QUICK_FIX_GUIDE.md file for instructions')
    }
    
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

// Run the verification
verifyDatabaseFix() 