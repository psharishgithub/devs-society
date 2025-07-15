"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
const adminService_1 = __importDefault(require("../services/adminService"));
// Initialize Supabase
const supabase = (0, supabase_1.initializeSupabase)();
const testAdminLogin = async () => {
    try {
        console.log('🔍 Testing Admin Login Functionality...\n');
        // 1. Check all admins in database
        console.log('1. Checking all admins in database:');
        const allAdmins = await adminService_1.default.getAllAdmins();
        console.log(`   Total admins found: ${allAdmins.length}`);
        allAdmins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.fullName} (${admin.email})`);
            console.log(`      Username: ${admin.username}`);
            console.log(`      Role: ${admin.role}`);
            console.log(`      Active: ${admin.isActive}`);
            console.log(`      Assigned College: ${admin.assignedCollege || 'None'}`);
            console.log('');
        });
        // 2. Test finding admin by email
        console.log('2. Testing findByEmail:');
        const testEmails = ['admin@devs-society.com', 'superadmin@devs.society', 'hursun@gmail.com'];
        for (const email of testEmails) {
            const admin = await adminService_1.default.findByEmail(email);
            if (admin) {
                console.log(`   ✅ Found admin by email "${email}": ${admin.fullName}`);
                console.log(`      Role: ${admin.role}, Active: ${admin.isActive}`);
            }
            else {
                console.log(`   ❌ No admin found by email "${email}"`);
            }
        }
        // 3. Test finding admin by username
        console.log('\n3. Testing findByUsername:');
        const testUsernames = ['admin', 'superadmin', 'hursun'];
        for (const username of testUsernames) {
            const admin = await adminService_1.default.findByUsername(username);
            if (admin) {
                console.log(`   ✅ Found admin by username "${username}": ${admin.fullName}`);
                console.log(`      Role: ${admin.role}, Active: ${admin.isActive}`);
            }
            else {
                console.log(`   ❌ No admin found by username "${username}"`);
            }
        }
        // 4. Test password comparison
        console.log('\n4. Testing password comparison:');
        const testAdmin = allAdmins[0];
        if (testAdmin) {
            console.log(`   Testing with admin: ${testAdmin.fullName}`);
            // Test with correct password (we don't know the actual password, so this will likely fail)
            const isValidPassword = await adminService_1.default.comparePassword(testAdmin, 'testpassword');
            console.log(`   Password comparison result: ${isValidPassword}`);
        }
        // 5. Check admin roles
        console.log('\n5. Checking admin roles:');
        const superAdmins = await adminService_1.default.getAdminsByRole('super-admin');
        const regularAdmins = await adminService_1.default.getAdminsByRole('admin');
        console.log(`   Super Admins: ${superAdmins.length}`);
        superAdmins.forEach(admin => {
            console.log(`      - ${admin.fullName} (${admin.email})`);
        });
        console.log(`   Regular Admins: ${regularAdmins.length}`);
        regularAdmins.forEach(admin => {
            console.log(`      - ${admin.fullName} (${admin.email})`);
        });
        console.log('\n✅ Admin login test completed!');
    }
    catch (error) {
        console.error('❌ Error testing admin login:', error);
    }
};
// Run the test
testAdminLogin();
//# sourceMappingURL=testAdminLogin.js.map