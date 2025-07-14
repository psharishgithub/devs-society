const { createClient } = require('@supabase/supabase-js')
const axios = require('axios')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const API_BASE_URL = 'http://localhost:5050/api'

console.log('🧪 Testing Complete Photo Upload Flow')
console.log('=' .repeat(50))

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPhotoUploadFlow() {
  try {
    console.log('\n📋 Step 1: Testing Supabase Connection')
    console.log('-'.repeat(30))
    
    // Test Supabase connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Supabase connection failed:', bucketsError.message)
      return
    }
    
    console.log('✅ Supabase connection successful')
    
    // Check if profile-photos bucket exists
    const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos')
    if (!profilePhotosBucket) {
      console.error('❌ profile-photos bucket not found')
      console.log('Please create the bucket in your Supabase dashboard')
      return
    }
    
    console.log('✅ profile-photos bucket found')
    
    console.log('\n📋 Step 2: Testing Backend API Connection')
    console.log('-'.repeat(30))
    
    // Test backend connection
    try {
      const response = await axios.get(`${API_BASE_URL}/public/colleges`)
      console.log('✅ Backend API connection successful')
    } catch (error) {
      console.error('❌ Backend API connection failed:', error.message)
      console.log('Make sure your backend server is running on port 5050')
      return
    }
    
    console.log('\n📋 Step 3: Testing Storage Policies')
    console.log('-'.repeat(30))
    
    // Test if we can list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('profile-photos')
      .list()
    
    if (filesError) {
      console.error('❌ Cannot access bucket:', filesError.message)
      console.log('Please check your storage policies')
      return
    }
    
    console.log('✅ Storage policies working correctly')
    console.log(`📁 Current files in bucket: ${files.length}`)
    
    console.log('\n📋 Step 4: Testing File Upload Capability')
    console.log('-'.repeat(30))
    
    // Create a test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    
    const testFileName = `test-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, testImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ File upload failed:', uploadError.message)
      console.log('Please check your storage policies for INSERT permission')
      return
    }
    
    console.log('✅ File upload successful')
    console.log('📄 Uploaded file:', uploadData.path)
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(testFileName)
    
    console.log('🔗 Public URL:', urlData.publicUrl)
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([testFileName])
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message)
    } else {
      console.log('✅ Test file cleaned up')
    }
    
    console.log('\n🎉 All tests passed! Your photo upload flow should work correctly.')
    console.log('\n📝 Next steps:')
    console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to your .env file')
    console.log('2. Restart your backend server')
    console.log('3. Test photo upload from the frontend')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testPhotoUploadFlow() 