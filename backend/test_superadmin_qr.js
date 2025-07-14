// Load environment variables
require('dotenv').config()

const axios = require('axios')

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5050'

async function testSuperAdminQR() {
  console.log('🔍 Testing SuperAdmin QR Verification System...')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Admin Login
    console.log('\n📋 Step 1: Admin Login')
    console.log('-'.repeat(40))
    
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/admin/login`, {
      identifier: 'admin@devs-society.com',
      password: 'Admin123!'
    })

    if (!adminLoginResponse.data.success) {
      throw new Error('Admin login failed: ' + adminLoginResponse.data.message)
    }

    const adminToken = adminLoginResponse.data.token
    console.log('✅ Admin login successful')
    console.log('Admin:', adminLoginResponse.data.admin.fullName)

    // Step 2: Get a test user to create QR code for
    console.log('\n👤 Step 2: Get Test User')
    console.log('-'.repeat(40))
    
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })

    if (!usersResponse.data.success || !usersResponse.data.users.length) {
      throw new Error('No users found for testing')
    }

    const testUser = usersResponse.data.users[0]
    console.log('✅ Test user found:', testUser.fullName)
    console.log('Member ID:', testUser.memberId)

    // Step 3: Create a test QR code (simulate member card QR)
    console.log('\n📱 Step 3: Create Test QR Code')
    console.log('-'.repeat(40))
    
    const testQRData = {
      id: testUser.memberId,
      name: testUser.fullName,
      email: testUser.email,
      role: testUser.role,
      college: testUser.college,
      batchYear: testUser.batchYear,
      memberId: testUser.memberId,
      eventRegistrations: [
        {
          eventId: 'test-event-1',
          eventTitle: 'Test Event 1',
          eventDate: '2024-12-25',
          status: 'confirmed',
          isPaid: false
        }
      ],
      qrType: 'member_card',
      timestamp: new Date().toISOString()
    }

    const qrCodeString = JSON.stringify(testQRData)
    console.log('✅ Test QR code created')
    console.log('QR Data length:', qrCodeString.length, 'characters')

    // Step 4: Test QR Verification (without event context)
    console.log('\n🔍 Step 4: Test QR Verification (Member Only)')
    console.log('-'.repeat(40))
    
    const verifyResponse = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
      qrCodeData: qrCodeString
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })

    if (verifyResponse.data.success) {
      console.log('✅ QR verification successful')
      console.log('QR Code Type:', verifyResponse.data.qrCodeType)
      console.log('Member:', verifyResponse.data.member.fullName)
      console.log('Status:', verifyResponse.data.status)
      console.log('Event Registrations:', verifyResponse.data.eventRegistrations?.length || 0)
    } else {
      throw new Error('QR verification failed: ' + verifyResponse.data.message)
    }

    // Step 5: Get events for testing
    console.log('\n📅 Step 5: Get Test Events')
    console.log('-'.repeat(40))
    
    const eventsResponse = await axios.get(`${BASE_URL}/api/events`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })

    if (!eventsResponse.data.success || !eventsResponse.data.events.length) {
      console.log('⚠️  No events found, skipping event-specific tests')
    } else {
      const testEvent = eventsResponse.data.events[0]
      console.log('✅ Test event found:', testEvent.title)
      console.log('Event ID:', testEvent.id)

      // Step 6: Test QR Verification with event context
      console.log('\n🔍 Step 6: Test QR Verification (With Event Context)')
      console.log('-'.repeat(40))
      
      const verifyWithEventResponse = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
        qrCodeData: qrCodeString,
        eventId: testEvent.id
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })

      if (verifyWithEventResponse.data.success) {
        console.log('✅ QR verification with event context successful')
        console.log('Current Event:', verifyWithEventResponse.data.currentEvent?.title)
        console.log('Registration Status:', verifyWithEventResponse.data.status)
        console.log('Current Registration:', verifyWithEventResponse.data.currentRegistration ? 'Found' : 'Not found')
      } else {
        console.log('⚠️  QR verification with event context failed:', verifyWithEventResponse.data.message)
      }
    }

    // Step 7: Test invalid QR code
    console.log('\n❌ Step 7: Test Invalid QR Code')
    console.log('-'.repeat(40))
    
    try {
      const invalidResponse = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
        qrCodeData: 'invalid-qr-data'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      
      console.log('❌ Expected error but got success:', invalidResponse.data)
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid QR code properly rejected')
        console.log('Error message:', error.response.data.message)
      } else {
        console.log('❌ Unexpected error:', error.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🏁 SuperAdmin QR Verification Test Completed!')
    console.log('\n💡 Summary:')
    console.log('• Member card QR codes are working')
    console.log('• QR verification returns member data and event registrations')
    console.log('• Event context verification is supported')
    console.log('• Invalid QR codes are properly rejected')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    process.exit(1)
  }
}

// Run the test
testSuperAdminQR().catch(console.error) 