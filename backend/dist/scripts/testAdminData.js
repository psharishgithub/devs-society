"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Initialize Supabase before importing services
const supabase_1 = require("../database/supabase");
const supabase = (0, supabase_1.initializeSupabase)();
// Import services
const adminService_1 = __importDefault(require("../services/adminService"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
const testAdminData = async () => {
    try {
        console.log('🧪 Testing admin data structure...');
        // Test 1: Get all admins
        console.log('\n📋 Test 1: Getting all admins...');
        const allAdmins = await adminService_1.default.getAdminsByRole('admin');
        console.log(`Found ${allAdmins.length} admins:`);
        allAdmins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.fullName} (${admin.email})`);
            console.log(`     Role: ${admin.role}`);
            console.log(`     Assigned College: ${admin.assignedCollege ?
                (typeof admin.assignedCollege === 'object' && admin.assignedCollege !== null ?
                    `${admin.assignedCollege.name} (${admin.assignedCollege.code})` :
                    `ID: ${admin.assignedCollege}`) :
                'None'}`);
            console.log(`     Tenure Active: ${admin.tenureInfo?.isActive}`);
            console.log(`     Tenure Start: ${admin.tenureInfo?.startDate}`);
            console.log('');
        });
        // Test 2: Get REC college admin specifically
        console.log('\n📋 Test 2: Getting REC college admin...');
        const recCollege = await collegeService_1.default.findByCode('REC');
        if (recCollege) {
            const recAdmin = await adminService_1.default.getAdminByCollege(recCollege.id);
            if (recAdmin) {
                console.log(`✅ REC Admin: ${recAdmin.fullName} (${recAdmin.email})`);
                console.log(`   Assigned College: ${recAdmin.assignedCollege ?
                    (typeof recAdmin.assignedCollege === 'object' && recAdmin.assignedCollege !== null ?
                        `${recAdmin.assignedCollege.name} (${recAdmin.assignedCollege.code})` :
                        `ID: ${recAdmin.assignedCollege}`) :
                    'None'}`);
                console.log(`   Tenure Active: ${recAdmin.tenureInfo?.isActive}`);
                console.log(`   Tenure Start: ${recAdmin.tenureInfo?.startDate}`);
            }
            else {
                console.log('❌ No admin found for REC');
            }
        }
        else {
            console.log('❌ REC college not found');
        }
        // Test 3: Get all colleges with their admins
        console.log('\n📋 Test 3: Getting all colleges...');
        const allColleges = await collegeService_1.default.getAllColleges();
        console.log(`Found ${allColleges.length} colleges:`);
        for (const college of allColleges) {
            const collegeAdmin = await adminService_1.default.getAdminByCollege(college.id);
            console.log(`  ${college.name} (${college.code}) - ${college.location}`);
            if (collegeAdmin) {
                console.log(`    Admin: ${collegeAdmin.fullName} (${collegeAdmin.email})`);
                console.log(`    Tenure Active: ${collegeAdmin.tenureInfo?.isActive}`);
            }
            else {
                console.log(`    Admin: No Admin`);
            }
            console.log('');
        }
        console.log('✅ All tests completed!');
    }
    catch (error) {
        console.error('❌ Error testing admin data:', error);
    }
};
// Run the test
testAdminData()
    .then(() => {
    console.log('\n🎉 Test script completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testAdminData.js.map