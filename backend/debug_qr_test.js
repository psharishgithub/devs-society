const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';

// Test with actual member data structure
const testMemberData = {
  id: 'DEV001', // This should match member_id in database
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'regular-member',
  college: 'Test College',
  batch: '2024',
  portal: 'https://portal.devs-society.com',
  eventRegistrations: [
    {
      eventId: 'test-event-1',
      eventTitle: 'Test Event 1',
      eventDate: '2024-12-25',
      registrationStatus: 'registered',
      isPaid: true
    }
  ],
  qrType: 'member-card',
  timestamp: new Date().toISOString()
};

async function debugQRVerification() {
  console.log('🔍 Debugging QR Code Verification\n');

  try {
    // 1. Test QR code data format
    console.log('1️⃣ Testing QR code data format...');
    const qrCodeData = JSON.stringify(testMemberData);
    console.log('✅ QR Code Data Generated:');
    console.log('   - Data length:', qrCodeData.length);
    console.log('   - Member ID:', testMemberData.id);
    console.log('   - Member Name:', testMemberData.name);
    console.log('   - Has required fields:', {
      id: !!testMemberData.id,
      name: !!testMemberData.name,
      email: !!testMemberData.email
    });
    console.log();

    // 2. Test admin login
    console.log('2️⃣ Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      identifier: 'admin@devs-society.com',
      password: 'Admin123!'
    });

    if (!adminLoginResponse.data.success) {
      console.log('❌ Admin login failed:', adminLoginResponse.data.message);
      return;
    }

    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log();

    // 3. Test QR verification with detailed error handling
    console.log('3️⃣ Testing QR verification...');
    try {
      const verificationResponse = await axios.post(`${BASE_URL}/qr-code/verify-member`, {
        qrCodeData: qrCodeData,
        notes: 'Debug test'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ QR Verification Response:');
      console.log('   - Success:', verificationResponse.data.success);
      console.log('   - Message:', verificationResponse.data.message);
      console.log('   - QR Type:', verificationResponse.data.qrCodeType);
      
      if (verificationResponse.data.member) {
        console.log('   - Member Found:', {
          id: verificationResponse.data.member.id,
          memberId: verificationResponse.data.member.memberId,
          fullName: verificationResponse.data.member.fullName
        });
      }
      
      if (verificationResponse.data.eventRegistrations) {
        console.log('   - Event Registrations:', verificationResponse.data.eventRegistrations.length);
      }

    } catch (verificationError) {
      console.log('❌ QR Verification Failed:');
      console.log('   - Status:', verificationError.response?.status);
      console.log('   - Message:', verificationError.response?.data?.message);
      console.log('   - Error:', verificationError.response?.data);
      
      // Try to parse the QR data to see if it's valid JSON
      try {
        const parsedData = JSON.parse(qrCodeData);
        console.log('   - QR Data is valid JSON');
        console.log('   - Parsed data keys:', Object.keys(parsedData));
      } catch (parseError) {
        console.log('   - QR Data is NOT valid JSON');
      }
    }

    // 4. Test with a simpler QR code format
    console.log('\n4️⃣ Testing with simpler QR code format...');
    const simpleMemberData = {
      id: 'DEV001',
      name: 'John Doe',
      email: 'john.doe@example.com'
    };
    
    const simpleQRData = JSON.stringify(simpleMemberData);
    
    try {
      const simpleVerificationResponse = await axios.post(`${BASE_URL}/qr-code/verify-member`, {
        qrCodeData: simpleQRData,
        notes: 'Simple format test'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Simple QR Verification Response:');
      console.log('   - Success:', simpleVerificationResponse.data.success);
      console.log('   - Message:', simpleVerificationResponse.data.message);

    } catch (simpleError) {
      console.log('❌ Simple QR Verification Failed:');
      console.log('   - Status:', simpleError.response?.status);
      console.log('   - Message:', simpleError.response?.data?.message);
    }

    console.log('\n🎯 Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugQRVerification(); 