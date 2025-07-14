const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...')
console.log('Supabase URL:', supabaseUrl)
console.log('Service role key configured:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    console.log('\n🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
    } else {
      console.log('✅ Database connection successful')
    }

    // Test storage bucket access
    console.log('\n🔍 Testing storage bucket access...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Storage access failed:', bucketsError.message)
    } else {
      console.log('✅ Storage access successful')
      console.log('Available buckets:', buckets.map(b => b.name))
      
      // Check if profile-photos bucket exists
      const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos')
      if (profilePhotosBucket) {
        console.log('✅ profile-photos bucket found')
        
        // Test listing files in the bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('profile-photos')
          .list()
        
        if (filesError) {
          console.error('❌ Cannot list files in bucket:', filesError.message)
        } else {
          console.log('✅ Can list files in bucket')
          console.log('Files in bucket:', files.length)
        }
      } else {
        console.log('❌ profile-photos bucket not found')
        console.log('Please create the bucket in your Supabase dashboard')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testConnection() 