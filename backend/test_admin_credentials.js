const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5050';

async function testAdminCredentials() {
  console.log('🔍 Testing Admin Credentials...\n');

  // Test different credential combinations
  const testCredentials = [
    { identifier: 'superadmin@devs.society', password: 'DevsSociety2024!' },
    { identifier: 'hursun@devs-society.com', password: 'password' },
    { identifier: 'admin@devs-society.com', password: 'admin123' },
    { identifier: 'admin@devs-society.com', password: 'password' },
    { identifier: 'superadmin@devs-society.com', password: 'admin123' },
    { identifier: 'superadmin@devs-society.com', password: 'password' },
    { identifier: 'hursun', password: 'admin123' },
    { identifier: 'admin', password: 'admin123' },
    { identifier: 'superadmin', password: 'admin123' }
  ];

  for (let i = 0; i < testCredentials.length; i++) {
    const creds = testCredentials[i];
    console.log(`Testing ${i + 1}/${testCredentials.length}: ${creds.identifier}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/login`, creds);
      
      if (response.data.success) {
        console.log(`✅ SUCCESS with: ${creds.identifier} / ${creds.password}`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        console.log(`   Admin: ${response.data.admin?.fullName || 'Unknown'}`);
        console.log(`   Role: ${response.data.admin?.role || 'Unknown'}`);
        return creds;
      } else {
        console.log(`❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n❌ No working credentials found');
  return null;
}

// Also test the admin creation script
async function testAdminCreation() {
  console.log('\n🔧 Testing Admin Creation...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/register`, {
      username: 'testadmin',
      email: 'testadmin@devs-society.com',
      password: 'testpass123',
      fullName: 'Test Admin',
      role: 'admin'
    });
    
    if (response.data.success) {
      console.log('✅ Admin created successfully');
      return {
        identifier: 'testadmin@devs-society.com',
        password: 'testpass123'
      };
    } else {
      console.log(`❌ Admin creation failed: ${response.data.message}`);
    }
  } catch (error) {
    console.log(`❌ Admin creation error: ${error.response?.data?.message || error.message}`);
  }
  
  return null;
}

async function main() {
  console.log('🚀 Starting Admin Credential Tests...\n');
  
  // First try existing credentials
  let workingCreds = await testAdminCredentials();
  
  // If no working credentials, try creating a new admin
  if (!workingCreds) {
    console.log('\n📝 No existing credentials work, trying to create new admin...');
    workingCreds = await testAdminCreation();
  }
  
  if (workingCreds) {
    console.log('\n✅ Working credentials found:');
    console.log(`   Identifier: ${workingCreds.identifier}`);
    console.log(`   Password: ${workingCreds.password}`);
    
    // Update the debug script with working credentials
    console.log('\n📝 Update debug_qr_scanner.js with these credentials:');
    console.log(`   const TEST_EMAIL = '${workingCreds.identifier}';`);
    console.log(`   const TEST_PASSWORD = '${workingCreds.password}';`);
  } else {
    console.log('\n❌ No working credentials could be established');
  }
}

main().catch(console.error); 