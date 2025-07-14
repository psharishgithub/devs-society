const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';

// Test data
const testMemberData = {
  id: 'DEV001',
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
    },
    {
      eventId: 'test-event-2', 
      eventTitle: 'Test Event 2',
      eventDate: '2024-12-26',
      registrationStatus: 'registered',
      isPaid: false
    }
  ],
  qrType: 'member-card',
  timestamp: new Date().toISOString()
};

async function testMemberQRWithEvents() {
  console.log('🧪 Testing Member QR Code with Event Registrations\n');

  try {
    // 1. Test QR code generation with event registrations
    console.log('1️⃣ Testing QR code generation with event registrations...');
    const qrCodeData = JSON.stringify(testMemberData);
    console.log('✅ QR Code Data Generated:');
    console.log('   - Member ID:', testMemberData.id);
    console.log('   - Member Name:', testMemberData.name);
    console.log('   - Event Registrations:', testMemberData.eventRegistrations.length);
    console.log('   - QR Type:', testMemberData.qrType);
    console.log('   - Timestamp:', testMemberData.timestamp);
    console.log();

    // 2. Test QR code verification (simulating admin scanning)
    console.log('2️⃣ Testing QR code verification (admin scanning)...');
    
    // First, get admin token (you'll need to replace with actual admin credentials)
    const adminLoginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      email: 'admin@devs-society.com',
      password: 'admin123'
    });

    if (!adminLoginResponse.data.success) {
      console.log('❌ Admin login failed, skipping verification test');
      return;
    }

    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');

    // Test verification with member QR code
    const verificationResponse = await axios.post(`${BASE_URL}/qr-code/verify-member`, {
      qrCodeData: qrCodeData,
      notes: 'Test verification with event registrations'
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (verificationResponse.data.success) {
      console.log('✅ QR Code Verification Successful:');
      console.log('   - QR Type:', verificationResponse.data.qrCodeType);
      console.log('   - Member Name:', verificationResponse.data.member.fullName);
      console.log('   - Member ID:', verificationResponse.data.member.memberId);
      console.log('   - Event Registrations Found:', verificationResponse.data.eventRegistrations?.length || 0);
      console.log('   - Status:', verificationResponse.data.status);
      
      if (verificationResponse.data.eventRegistrations) {
        console.log('   - Event Details:');
        verificationResponse.data.eventRegistrations.forEach((reg, index) => {
          console.log(`     ${index + 1}. ${reg.eventTitle} (${reg.eventDate})`);
        });
      }
    } else {
      console.log('❌ QR Code Verification Failed:', verificationResponse.data.message);
    }

    // 3. Test check-in functionality
    console.log('\n3️⃣ Testing check-in functionality...');
    
    const checkInResponse = await axios.post(`${BASE_URL}/qr-code/check-in-member`, {
      qrCodeData: qrCodeData,
      eventId: 'test-event-1', // Specify which event to check in for
      notes: 'Test check-in with member QR code'
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (checkInResponse.data.success) {
      console.log('✅ Check-in Successful:');
      console.log('   - Message:', checkInResponse.data.message);
      console.log('   - Check-in Time:', checkInResponse.data.checkIn?.checkInTime);
    } else {
      console.log('❌ Check-in Failed:', checkInResponse.data.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMemberQRWithEvents(); 