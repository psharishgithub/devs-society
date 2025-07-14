const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEventDates() {
  try {
    console.log('🔍 Checking event dates in database...')
    
    // Get all events with their dates
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, date, time, location, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return
    }

    console.log(`\n📅 Found ${events.length} events:`)
    console.log('='.repeat(80))
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`)
      console.log(`   ID: ${event.id}`)
      console.log(`   Date: ${event.date || 'NULL/EMPTY'}`)
      console.log(`   Time: ${event.time || 'NULL/EMPTY'}`)
      console.log(`   Location: ${event.location || 'NULL/EMPTY'}`)
      console.log(`   Created: ${event.created_at}`)
      
      // Check if date is valid
      if (event.date) {
        const dateObj = new Date(event.date)
        if (isNaN(dateObj.getTime())) {
          console.log(`   ⚠️  WARNING: Invalid date format: "${event.date}"`)
        } else {
          console.log(`   ✅ Valid date: ${dateObj.toLocaleDateString()}`)
        }
      } else {
        console.log(`   ⚠️  WARNING: No date set`)
      }
      console.log('')
    })

    // Check event registrations
    console.log('\n📋 Checking event registrations...')
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        id, 
        event_id, 
        user_id, 
        status, 
        registered_at,
        events(id, title, date)
      `)
      .eq('status', 'confirmed')
      .limit(10)

    if (regError) {
      console.error('Error fetching registrations:', regError)
      return
    }

    console.log(`\n📝 Sample registrations (${registrations.length}):`)
    console.log('='.repeat(80))
    
    registrations.forEach((reg, index) => {
      console.log(`${index + 1}. Registration ID: ${reg.id}`)
      console.log(`   Event: ${reg.events?.title || 'Unknown'}`)
      console.log(`   Event Date: ${reg.events?.date || 'NULL/EMPTY'}`)
      console.log(`   User ID: ${reg.user_id}`)
      console.log(`   Status: ${reg.status}`)
      console.log(`   Registered: ${reg.registered_at}`)
      console.log('')
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkEventDates() 