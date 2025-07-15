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
const adminService_1 = __importDefault(require("../services/adminService"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
const testMultiTenureSystem = async () => {
    try {
        console.log('🧪 Testing Multi-Tenure System...');
        // Test 1: Check current college admin assignments
        console.log('\n📋 Test 1: Current college admin assignments...');
        const colleges = await collegeService_1.default.getAllColleges();
        colleges.forEach((college, index) => {
            console.log(`\n  ${index + 1}. ${college.name} (${college.code})`);
            console.log(`     Location: ${college.location}`);
            if (college.currentTenureHeads && college.currentTenureHeads.length > 0) {
                console.log(`     Active Admins: ${college.currentTenureHeads.length}`);
                college.currentTenureHeads.forEach((tenure, tenureIndex) => {
                    console.log(`       ${tenureIndex + 1}. ${tenure.adminName} (Batch ${tenure.batchYear})`);
                });
            }
            else {
                console.log(`     Active Admins: None`);
            }
        });
        // Test 2: Test creating a new admin for REC with batch year 2025
        console.log('\n📋 Test 2: Testing admin creation with batch year...');
        const recCollege = colleges.find(c => c.code === 'REC');
        if (!recCollege) {
            console.log('❌ REC college not found');
            return;
        }
        // Check if batch 2025 already has an admin
        const existingBatch2025 = recCollege.currentTenureHeads?.find(t => t.batchYear === 2025);
        if (existingBatch2025) {
            console.log(`✅ Batch 2025 already has admin: ${existingBatch2025.adminName}`);
        }
        else {
            console.log('ℹ️  No admin for batch 2025 yet');
        }
        // Test 3: Verify admin data structure
        console.log('\n📋 Test 3: Verifying admin data structure...');
        const admins = await adminService_1.default.getAllAdmins();
        admins.forEach((admin, index) => {
            console.log(`\n  Admin ${index + 1}: ${admin.fullName}`);
            console.log(`    Role: ${admin.role}`);
            console.log(`    Batch Year: ${admin.batchYear || 'N/A'}`);
            console.log(`    Assigned College: ${admin.assignedCollege ? admin.assignedCollege.name : 'None'}`);
            console.log(`    Tenure Active: ${admin.tenureInfo?.isActive ? 'Yes' : 'No'}`);
        });
        // Test 4: Test multiple active admins per college
        console.log('\n📋 Test 4: Testing multiple active admins per college...');
        const collegesWithMultipleAdmins = colleges.filter(c => c.currentTenureHeads && c.currentTenureHeads.length > 1);
        if (collegesWithMultipleAdmins.length > 0) {
            console.log('✅ Found colleges with multiple active admins:');
            collegesWithMultipleAdmins.forEach(college => {
                console.log(`    ${college.name}:`);
                college.currentTenureHeads.forEach(tenure => {
                    console.log(`      - ${tenure.adminName} (Batch ${tenure.batchYear})`);
                });
            });
        }
        else {
            console.log('ℹ️  No colleges have multiple active admins yet');
        }
        // Test 5: Verify batch year uniqueness per college
        console.log('\n📋 Test 5: Verifying batch year uniqueness per college...');
        colleges.forEach(college => {
            if (college.currentTenureHeads && college.currentTenureHeads.length > 1) {
                const batchYears = college.currentTenureHeads.map(t => t.batchYear);
                const uniqueBatchYears = [...new Set(batchYears)];
                if (batchYears.length === uniqueBatchYears.length) {
                    console.log(`    ✅ ${college.name}: All batch years are unique`);
                }
                else {
                    console.log(`    ❌ ${college.name}: Duplicate batch years found`);
                }
            }
        });
        console.log('\n🎉 Multi-tenure system test completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`  Total Colleges: ${colleges.length}`);
        console.log(`  Colleges with Multiple Admins: ${collegesWithMultipleAdmins.length}`);
        console.log(`  Total Active Admins: ${colleges.reduce((sum, c) => sum + (c.currentTenureHeads?.length || 0), 0)}`);
    }
    catch (error) {
        console.error('❌ Error testing multi-tenure system:', error);
        process.exit(1);
    }
};
// Run the script
testMultiTenureSystem()
    .then(() => {
    console.log('🎉 Test completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testMultiTenureSystem.js.map