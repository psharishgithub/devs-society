"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Load environment variables first
dotenv_1.default.config();
// Initialize Supabase before importing services
const supabase_1 = require("../database/supabase");
const supabase = (0, supabase_1.initializeSupabase)();
// Import services
const adminService_1 = __importDefault(require("../services/adminService"));
const testSuperAdminAPI = async () => {
    try {
        console.log('🔍 Testing Super Admin API admin creation...');
        // Get a real super-admin for authentication
        const superAdmin = await adminService_1.default.findByEmail('admin@devs-society.com');
        if (!superAdmin) {
            console.error('❌ Default super-admin not found');
            return;
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            id: superAdmin.id,
            username: superAdmin.username,
            email: superAdmin.email,
            role: superAdmin.role,
            permissions: superAdmin.permissions || [],
            assignedCollege: superAdmin.assignedCollege
        }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1h' });
        // Test admin creation via API
        const newAdminData = {
            username: `api${Date.now().toString().slice(-6)}`,
            email: `api${Date.now().toString().slice(-6)}@test.com`,
            password: 'APITestPassword123!',
            fullName: 'API Test Admin'
        };
        console.log(`\n📝 Creating admin via API: ${newAdminData.fullName}`);
        console.log(`   Username: ${newAdminData.username}`);
        console.log(`   Email: ${newAdminData.email}`);
        const response = await axios_1.default.post('http://localhost:5050/api/super-admin/admins', newAdminData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('\n✅ API Response:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${response.data.success}`);
        console.log(`   Message: ${response.data.message}`);
        if (response.data.admin) {
            const createdAdmin = response.data.admin;
            console.log('\n📋 Created Admin Details:');
            console.log(`   ID: ${createdAdmin.id}`);
            console.log(`   Name: ${createdAdmin.fullName}`);
            console.log(`   Email: ${createdAdmin.email}`);
            console.log(`   Role: ${createdAdmin.role}`);
            console.log(`   Assigned College: ${createdAdmin.assignedCollege || 'None'}`);
            console.log(`   Active: ${createdAdmin.isActive}`);
            // Verify the role
            if (createdAdmin.role === 'admin') {
                console.log('✅ API admin creation successful: correct role assigned');
            }
            else {
                console.log(`❌ API admin creation issue: expected 'admin' but got '${createdAdmin.role}'`);
            }
            // Verify the admin appears in the admin list
            console.log('\n🔍 Checking if admin appears in API admin list...');
            const listResponse = await axios_1.default.get('http://localhost:5050/api/super-admin/admins', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const adminInList = listResponse.data.admins?.find((admin) => admin.email === newAdminData.email);
            if (adminInList) {
                console.log('✅ Admin appears in API admin list');
                console.log(`   List Role: ${adminInList.role}`);
                console.log(`   List College: ${adminInList.collegeInfo ? `${adminInList.collegeInfo.name} (${adminInList.collegeInfo.code})` : 'No college assigned'}`);
            }
            else {
                console.log('❌ Admin does not appear in API admin list');
            }
            // Clean up
            console.log('\n🗑️  Cleaning up API test admin...');
            await adminService_1.default.deleteAdmin(createdAdmin.id);
            console.log('✅ API test admin deleted');
        }
        else {
            console.log('❌ No admin data returned from API');
        }
    }
    catch (error) {
        console.error('❌ API test error:', error.response?.data || error.message);
    }
};
// Run the test
testSuperAdminAPI()
    .then(() => {
    console.log('\n✨ Super Admin API test completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 API test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testSuperAdminAPI.js.map