// Simple test script to verify event creation works
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ajvdedgagiiajxbhtyzf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdmRlZGdhZ2lpYWp4Ymh0eXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjc4ODYsImV4cCI6MjA2Nzc0Mzg4Nn0.Mp6YLHTbaIBi8dLuPxEE6qwHVJdT_70aSJlNnBNh-z8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEventCreation() {
  try {
    console.log('🧪 Testing event creation...')
    
    const testEvent = {
      title: 'Test Event',
      description: 'This is a test event to verify creation works',
      event_date: '2024-12-25',
      event_time: '10:00',
      location: 'Test Location',
      event_type: 'college-specific',
      target_college_id: null,
      max_attendees: 50,
      category: 'other',
      organizer_admin_id: 'test-admin-id',
      organizer_name: 'Test Admin',
      organizer_contact: 'test@example.com',
      requirements: [],
      prizes: [],
      registration_deadline: '2024-12-20',
      is_active: true
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Event creation failed:', error)
      return false
    }
    
    console.log('✅ Event created successfully:', data.id)
    
    // Clean up - delete the test event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', data.id)
    
    if (deleteError) {
      console.error('⚠️ Failed to delete test event:', deleteError)
    } else {
      console.log('✅ Test event cleaned up')
    }
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run the test
testEventCreation()
  .then(success => {
    if (success) {
      console.log('\n🎉 Event creation is working!')
      console.log('You can now create events in your application.')
    } else {
      console.log('\n❌ Event creation is still broken.')
      console.log('Please run the database migration first.')
    }
  })
  .catch(error => {
    console.error('❌ Test error:', error)
  }) 