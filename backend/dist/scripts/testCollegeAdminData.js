"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
// Initialize Supabase before importing services
const supabase_1 = require("../database/supabase");
const supabase = (0, supabase_1.initializeSupabase)();
// Import services
const collegeService_1 = __importDefault(require("../services/collegeService"));
const adminService_1 = __importDefault(require("../services/adminService"));
const testCollegeAdminData = async () => {
    try {
        console.log('🧪 Testing College Admin Data...');
        // Test 1: Get all colleges with admin information
        console.log('\n📋 Test 1: Getting all colleges with admin information...');
        const colleges = await collegeService_1.default.getAllColleges();
        const admins = await adminService_1.default.getAllAdmins();
        console.log(`Found ${colleges.length} colleges:`);
        colleges.forEach((college, index) => {
            console.log(`\n  ${index + 1}. ${college.name} (${college.code})`);
            console.log(`     Location: ${college.location}`);
            if (college.currentTenureHeads && college.currentTenureHeads.length > 0) {
                console.log(`     Active Admins: ${college.currentTenureHeads.length}`);
                college.currentTenureHeads.forEach((tenure, tenureIndex) => {
                    console.log(`       ${tenureIndex + 1}. ${tenure.adminName} (${tenure.adminEmail})`);
                });
                console.log(`     Admin Active: ${college.currentTenureHeads.some(t => t.isActive) ? 'Yes' : 'No'}`);
            }
            else {
                console.log(`     Active Admins: None`);
            }
        });
        // Test 2: Check specific colleges
        console.log('\n📋 Test 2: Checking specific colleges...');
        const recCollege = colleges.find(c => c.code === 'REC');
        if (recCollege) {
            console.log(`  REC College:`);
            console.log(`    Current Admin: ${recCollege.currentTenureHeads && recCollege.currentTenureHeads.length > 0 ?
                recCollege.currentTenureHeads.map(t => t.adminName).join(', ') : 'No Admin'}`);
        }
        const nitkCollege = colleges.find(c => c.code === 'NITK');
        if (nitkCollege) {
            console.log(`  NITK College:`);
            console.log(`    Current Admin: ${nitkCollege.currentTenureHeads && nitkCollege.currentTenureHeads.length > 0 ?
                nitkCollege.currentTenureHeads.map(t => t.adminName).join(', ') : 'No Admin'}`);
        }
        // Test 3: Verify data consistency
        console.log('\n📋 Test 3: Verifying data consistency...');
        colleges.forEach(college => {
            if (college.currentTenureHeads && college.currentTenureHeads.length > 0) {
                college.currentTenureHeads.forEach(tenure => {
                    if (tenure.adminName && tenure.adminEmail) {
                        console.log(`    ✅ ${college.name}: Admin data is complete`);
                    }
                    else {
                        console.log(`    ❌ ${college.name}: Admin data is incomplete`);
                    }
                });
            }
        });
        // Test 4: Cross-reference with admin list
        console.log('\n📋 Test 4: Cross-referencing with admin list...');
        colleges.forEach(college => {
            if (college.currentTenureHeads && college.currentTenureHeads.length > 0) {
                college.currentTenureHeads.forEach(tenure => {
                    const admin = admins.find((a) => a.id === tenure.adminId);
                    if (admin) {
                        console.log(`    ✅ ${college.name}: Admin ${tenure.adminName} found in admin list`);
                    }
                    else {
                        console.log(`    ❌ ${college.name}: Admin ID ${tenure.adminId} not found in admin list`);
                    }
                });
            }
        });
        // Summary
        console.log('\n📊 Summary:');
        console.log(`  Total Colleges: ${colleges.length}`);
        console.log(`  Colleges with Admins: ${colleges.filter(c => c.currentTenureHeads && c.currentTenureHeads.length > 0).length}`);
        console.log(`  Colleges without Admins: ${colleges.filter(c => !c.currentTenureHeads || c.currentTenureHeads.length === 0).length}`);
        console.log('\n🎉 College admin data test completed successfully!');
    }
    catch (error) {
        console.error('❌ Error testing college admin data:', error);
        process.exit(1);
    }
};
// Run the script
testCollegeAdminData()
    .then(() => {
    console.log('🎉 Test completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testCollegeAdminData.js.map