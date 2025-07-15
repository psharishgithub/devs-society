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
const fixAdminCollegeMapping = async () => {
    try {
        console.log('🔍 Checking admin-college mapping...');
        // Check the specific admin mentioned
        const admin = await adminService_1.default.findByEmail('admin.nitk@devs-society.com');
        if (!admin) {
            console.log('❌ Admin not found');
            return;
        }
        console.log('👤 Admin Details:');
        console.log(`  ID: ${admin.id}`);
        console.log(`  Name: ${admin.fullName}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Assigned College: ${admin.assignedCollege ?
            (typeof admin.assignedCollege === 'object' ?
                `${admin.assignedCollege.name} (${admin.assignedCollege.id})` :
                `ID: ${admin.assignedCollege}`) :
            'NULL'}`);
        console.log(`  Tenure Active: ${admin.tenureInfo?.isActive || false}`);
        // Check college tenure heads table
        const { data: tenureHeads, error: tenureError } = await supabase
            .from('college_tenure_heads')
            .select(`
        *,
        colleges(name, code)
      `)
            .eq('admin_id', admin.id);
        if (tenureError) {
            console.error('❌ Error fetching tenure heads:', tenureError);
            return;
        }
        console.log('\n📋 Tenure Records:');
        if (!tenureHeads || tenureHeads.length === 0) {
            console.log('  No tenure records found');
        }
        else {
            tenureHeads.forEach((tenure, index) => {
                console.log(`  ${index + 1}. College: ${tenure.colleges?.name} (${tenure.colleges?.code})`);
                console.log(`     Start: ${tenure.start_date}`);
                console.log(`     End: ${tenure.end_date || 'Active'}`);
                console.log(`     Active: ${tenure.is_active}`);
            });
        }
        // Check all colleges to find NITK
        const colleges = await collegeService_1.default.getAllColleges();
        const nitkCollege = colleges.find(c => c.code === 'NITK');
        if (!nitkCollege) {
            console.log('❌ NITK college not found');
            return;
        }
        console.log('\n🏫 NITK College Details:');
        console.log(`  ID: ${nitkCollege.id}`);
        console.log(`  Name: ${nitkCollege.name}`);
        console.log(`  Code: ${nitkCollege.code}`);
        // Fix the mapping if needed
        if (!admin.assignedCollege ||
            (typeof admin.assignedCollege === 'object' ? admin.assignedCollege.id : admin.assignedCollege) !== nitkCollege.id) {
            console.log('\n🔧 Fixing admin-college mapping...');
            // Update admin record
            const { error: updateError } = await supabase
                .from('admins')
                .update({
                assigned_college_id: nitkCollege.id,
                tenure_start_date: new Date().toISOString(),
                tenure_is_active: true
            })
                .eq('id', admin.id);
            if (updateError) {
                console.error('❌ Error updating admin:', updateError);
            }
            else {
                console.log('✅ Admin record updated');
            }
            // Create or update tenure head record
            const existingTenure = tenureHeads && tenureHeads.find(t => t.college_id === nitkCollege.id && t.is_active);
            if (!existingTenure) {
                const { error: tenureInsertError } = await supabase
                    .from('college_tenure_heads')
                    .insert({
                    admin_id: admin.id,
                    college_id: nitkCollege.id,
                    start_date: new Date().toISOString(),
                    is_active: true
                });
                if (tenureInsertError) {
                    console.error('❌ Error creating tenure record:', tenureInsertError);
                }
                else {
                    console.log('✅ Tenure record created');
                }
            }
            else {
                console.log('✅ Active tenure record already exists');
            }
        }
        else {
            console.log('✅ Admin-college mapping is correct');
        }
        // Verify the fix
        console.log('\n🔍 Verifying fix...');
        const updatedAdmin = await adminService_1.default.findByEmail('admin.nitk@devs-society.com');
        if (updatedAdmin) {
            console.log('✅ Updated Admin Details:');
            console.log(`  Assigned College: ${updatedAdmin.assignedCollege ?
                (typeof updatedAdmin.assignedCollege === 'object' ?
                    `${updatedAdmin.assignedCollege.name} (${updatedAdmin.assignedCollege.id})` :
                    `ID: ${updatedAdmin.assignedCollege}`) :
                'NULL'}`);
            console.log(`  Tenure Active: ${updatedAdmin.tenureInfo?.isActive || false}`);
            if (updatedAdmin.assignedCollege) {
                const assignedCollege = await collegeService_1.default.findById(typeof updatedAdmin.assignedCollege === 'object' ?
                    updatedAdmin.assignedCollege.id :
                    updatedAdmin.assignedCollege);
                if (assignedCollege) {
                    console.log(`  College Name: ${assignedCollege.name} (${assignedCollege.code})`);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Error fixing admin-college mapping:', error);
        process.exit(1);
    }
};
// Run the script
fixAdminCollegeMapping()
    .then(() => {
    console.log('🎉 Mapping check/fix completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fixAdminCollegeMapping.js.map