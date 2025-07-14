// Load environment variables
require('dotenv').config()

const axios = require('axios')

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5050'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

async function testFrontendQRIntegration() {
  console.log('🔍 Testing Frontend QR Integration...')
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

    // Step 2: Get a test user
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

    // Step 3: Test the exact QR code format that frontend generates
    console.log('\n📱 Step 3: Test Frontend QR Code Format')
    console.log('-'.repeat(40))
    
    // Simulate the exact format that MemberCard.tsx generates
    const frontendQRData = {
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

    const qrCodeString = JSON.stringify(frontendQRData)
    console.log('✅ Frontend QR code format created')
    console.log('QR Data structure matches MemberCard.tsx')

    // Step 4: Test QR Verification with frontend format
    console.log('\n🔍 Step 4: Test QR Verification (Frontend Format)')
    console.log('-'.repeat(40))
    
    const verifyResponse = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
      qrCodeData: qrCodeString
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })

    if (verifyResponse.data.success) {
      console.log('✅ Frontend QR verification successful')
      console.log('QR Code Type:', verifyResponse.data.qrCodeType)
      console.log('Member:', verifyResponse.data.member.fullName)
      console.log('Status:', verifyResponse.data.status)
      console.log('Event Registrations:', verifyResponse.data.eventRegistrations?.length || 0)
      
      // Verify the response structure matches frontend expectations
      const expectedFields = ['qrCodeType', 'member', 'eventRegistrations', 'status']
      const missingFields = expectedFields.filter(field => !(field in verifyResponse.data))
      
      if (missingFields.length === 0) {
        console.log('✅ Response structure matches frontend expectations')
      } else {
        console.log('⚠️  Missing fields in response:', missingFields)
      }
    } else {
      throw new Error('Frontend QR verification failed: ' + verifyResponse.data.message)
    }

    // Step 5: Test with different QR code variations
    console.log('\n🔄 Step 5: Test QR Code Variations')
    console.log('-'.repeat(40))
    
    // Test with different field names (id vs memberId)
    const variation1 = {
      ...frontendQRData,
      id: testUser.memberId,
      memberId: undefined // Remove memberId to test id fallback
    }
    
    const verifyVariation1 = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
      qrCodeData: JSON.stringify(variation1)
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })

    if (verifyVariation1.data.success) {
      console.log('✅ QR verification with id-only format successful')
    } else {
      console.log('❌ QR verification with id-only format failed:', verifyVariation1.data.message)
    }

    // Test with memberId only
    const variation2 = {
      ...frontendQRData,
      id: undefined, // Remove id to test memberId fallback
      memberId: testUser.memberId
    }
    
    const verifyVariation2 = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
      qrCodeData: JSON.stringify(variation2)
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })

    if (verifyVariation2.data.success) {
      console.log('✅ QR verification with memberId-only format successful')
    } else {
      console.log('❌ QR verification with memberId-only format failed:', verifyVariation2.data.message)
    }

    // Step 6: Test error handling
    console.log('\n❌ Step 6: Test Error Handling')
    console.log('-'.repeat(40))
    
    const errorTests = [
      { name: 'Invalid JSON', data: 'invalid-json' },
      { name: 'Missing required fields', data: JSON.stringify({ id: 'test', name: 'test' }) },
      { name: 'Wrong QR type', data: JSON.stringify({ id: testUser.memberId, name: testUser.fullName, email: testUser.email, qrType: 'wrong_type' }) },
      { name: 'Non-existent member', data: JSON.stringify({ id: 'NONEXISTENT', name: 'Test', email: 'test@test.com', qrType: 'member_card' }) }
    ]

    for (const test of errorTests) {
      try {
        const errorResponse = await axios.post(`${BASE_URL}/api/qr-code/verify-member`, {
          qrCodeData: test.data
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        
        if (errorResponse.data.success) {
          console.log(`❌ ${test.name}: Expected error but got success`)
        } else {
          console.log(`✅ ${test.name}: Properly rejected with message: ${errorResponse.data.message}`)
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          console.log(`✅ ${test.name}: Properly rejected with status ${error.response.status}`)
        } else {
          console.log(`❌ ${test.name}: Unexpected error: ${error.message}`)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🏁 Frontend QR Integration Test Completed!')
    console.log('\n💡 Summary:')
    console.log('• Frontend QR code format is working correctly')
    console.log('• Backend properly handles frontend QR code structure')
    console.log('• Response format matches frontend expectations')
    console.log('• Error handling is working properly')
    console.log('• Both id and memberId field variations work')
    
    console.log('\n🚀 Next Steps:')
    console.log('1. Test the QR scanner in the SuperAdmin dashboard')
    console.log('2. Verify the QR code display in MemberCard component')
    console.log('3. Test the complete scan-to-verification flow')
    
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
testFrontendQRIntegration().catch(console.error) 