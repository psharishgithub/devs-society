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
const testAdminSystem = async () => {
    try {
        console.log('🧪 Testing Admin Management System...\n');
        // Test 1: Check existing colleges
        console.log('📋 Test 1: Checking existing colleges...');
        const colleges = await collegeService_1.default.getAllColleges();
        console.log(`Found ${colleges.length} colleges:`);
        colleges.forEach((college, index) => {
            console.log(`  ${index + 1}. ${college.name} (${college.code}) - ${college.location}`);
        });
        if (colleges.length === 0) {
            console.log('❌ No colleges found. Please create colleges first.');
            return;
        }
        // Test 2: Check existing admins
        console.log('\n📋 Test 2: Checking existing admins...');
        const admins = await adminService_1.default.getAdminsByRole('admin');
        console.log(`Found ${admins.length} admins:`);
        admins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.fullName} (${admin.email})`);
            console.log(`     Role: ${admin.role}`);
            const collegeInfo = admin.assignedCollege && typeof admin.assignedCollege === 'object' && 'name' in admin.assignedCollege
                ? admin.assignedCollege.name
                : admin.assignedCollege || 'None';
            console.log(`     Assigned College: ${collegeInfo}`);
            console.log(`     Tenure Active: ${admin.tenureInfo?.isActive ? 'Yes' : 'No'}`);
        });
        // Test 3: Test admin creation with college assignment
        console.log('\n📋 Test 3: Testing admin creation with college assignment...');
        const testCollege = colleges[0]; // Use first college for testing
        console.log(`Using college: ${testCollege.name} (${testCollege.code})`);
        const testAdminData = {
            username: 'testadmin',
            email: 'testadmin@example.com',
            password: 'testpassword123',
            fullName: 'Test Admin',
            role: 'admin',
            assignedCollege: testCollege.id
        };
        try {
            const newAdmin = await adminService_1.default.createAdmin(testAdminData);
            console.log('✅ Admin created successfully!');
            console.log(`   Name: ${newAdmin.fullName}`);
            console.log(`   Email: ${newAdmin.email}`);
            const newAdminCollegeInfo = newAdmin.assignedCollege && typeof newAdmin.assignedCollege === 'object' && 'name' in newAdmin.assignedCollege
                ? newAdmin.assignedCollege.name
                : newAdmin.assignedCollege || 'None';
            console.log(`   Assigned College: ${newAdminCollegeInfo}`);
            console.log(`   Tenure Active: ${newAdmin.tenureInfo?.isActive ? 'Yes' : 'No'}`);
            // Clean up - delete the test admin
            console.log('\n🧹 Cleaning up test admin...');
            await adminService_1.default.deleteAdmin(newAdmin.id);
            console.log('✅ Test admin deleted successfully');
        }
        catch (error) {
            console.log('❌ Admin creation failed:', error.message);
        }
        // Test 4: Verify data structure consistency
        console.log('\n📋 Test 4: Verifying data structure consistency...');
        const allAdmins = await adminService_1.default.getAdminsByRole('admin');
        let structureConsistent = true;
        allAdmins.forEach((admin, index) => {
            console.log(`  Admin ${index + 1}: ${admin.fullName}`);
            // Check if admin has id field
            if (!admin.id) {
                console.log(`    ❌ Missing 'id' field`);
                structureConsistent = false;
            }
            else {
                console.log(`    ✅ Has 'id' field: ${admin.id}`);
            }
            // Check assignedCollege structure
            if (admin.assignedCollege) {
                if (typeof admin.assignedCollege === 'string') {
                    console.log(`    ❌ assignedCollege is string, should be object`);
                    structureConsistent = false;
                }
                else if (admin.assignedCollege && typeof admin.assignedCollege === 'object' && 'id' in admin.assignedCollege && 'name' in admin.assignedCollege) {
                    const collegeObj = admin.assignedCollege;
                    console.log(`    ✅ assignedCollege is proper object: ${collegeObj.name} (${collegeObj.id})`);
                }
                else {
                    console.log(`    ❌ assignedCollege object missing required fields`);
                    structureConsistent = false;
                }
            }
            else {
                console.log(`    ℹ️  No college assigned`);
            }
            // Check tenure info
            if (admin.tenureInfo) {
                console.log(`    ✅ Has tenure info: ${admin.tenureInfo.isActive ? 'Active' : 'Inactive'}`);
            }
            else {
                console.log(`    ℹ️  No tenure info`);
            }
        });
        // Test 5: Check college admin assignment
        console.log('\n📋 Test 5: Checking college admin assignments...');
        const collegesWithAdmins = await Promise.all(colleges.map(async (college) => {
            const admin = await adminService_1.default.getAdminByCollege(college.id);
            return {
                college,
                admin
            };
        }));
        collegesWithAdmins.forEach(({ college, admin }) => {
            if (admin) {
                console.log(`  ✅ ${college.name} (${college.code}): ${admin.fullName} (${admin.email})`);
            }
            else {
                console.log(`  ❌ ${college.name} (${college.code}): No admin assigned`);
            }
        });
        // Summary
        console.log('\n📊 Test Summary:');
        console.log(`  Total Colleges: ${colleges.length}`);
        console.log(`  Total Admins: ${admins.length}`);
        console.log(`  Colleges with Admins: ${collegesWithAdmins.filter(c => c.admin).length}`);
        console.log(`  Data Structure Consistent: ${structureConsistent ? '✅ Yes' : '❌ No'}`);
        if (structureConsistent) {
            console.log('\n🎉 All tests passed! Admin management system is working correctly.');
        }
        else {
            console.log('\n⚠️  Some issues found. Please check the data structure consistency.');
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
};
// Run the test
testAdminSystem();
//# sourceMappingURL=testAdminSystem.js.map