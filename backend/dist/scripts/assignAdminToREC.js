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
const assignAdminToREC = async () => {
    try {
        console.log('🎯 Assigning admin to Rajalakshmi Engineering College (REC)...');
        // Find REC college
        const recCollege = await collegeService_1.default.findByCode('REC');
        if (!recCollege) {
            console.log('❌ REC college not found');
            return;
        }
        console.log(`✅ Found REC college: ${recCollege.name} (${recCollege.code})`);
        // Check if REC already has an admin
        const currentAdmin = await adminService_1.default.getAdminByCollege(recCollege.id);
        if (currentAdmin) {
            console.log(`✅ REC already has an admin: ${currentAdmin.fullName} (${currentAdmin.email})`);
            return;
        }
        // Find an unassigned admin or create one
        const unassignedAdmins = await adminService_1.default.getUnassignedAdmins();
        let adminToAssign = null;
        if (unassignedAdmins.length > 0) {
            adminToAssign = unassignedAdmins[0];
            console.log(`📋 Found unassigned admin: ${adminToAssign.fullName} (${adminToAssign.email})`);
        }
        else {
            console.log('📋 No unassigned admins found, creating a new admin for REC...');
            // Create a new admin for REC
            const newAdmin = await adminService_1.default.createAdmin({
                username: 'admin_rec',
                email: 'admin.rec@devs-society.com',
                password: 'Admin123!',
                fullName: 'REC Admin',
                role: 'admin',
                assignedCollege: recCollege.id
            });
            adminToAssign = newAdmin;
            console.log(`✅ Created new admin: ${adminToAssign.fullName} (${adminToAssign.email})`);
        }
        // Assign admin to REC
        console.log('\n🔗 Assigning admin to REC...');
        const assignmentResult = await adminService_1.default.assignAdminToCollege(adminToAssign.id, recCollege.id);
        if (!assignmentResult) {
            console.log('❌ Failed to assign admin to REC');
            return;
        }
        console.log('✅ Successfully assigned admin to REC!');
        // Verify the assignment
        console.log('\n🔍 Verifying assignment...');
        const verifiedAdmin = await adminService_1.default.getAdminByCollege(recCollege.id);
        if (verifiedAdmin) {
            console.log(`✅ Verification successful: ${verifiedAdmin.fullName} is now assigned to ${recCollege.name}`);
            console.log(`   Email: ${verifiedAdmin.email}`);
            console.log(`   Tenure Start: ${verifiedAdmin.tenureInfo?.startDate}`);
            console.log(`   Tenure Active: ${verifiedAdmin.tenureInfo?.isActive}`);
        }
        else {
            console.log('❌ Verification failed: No admin found for REC');
        }
    }
    catch (error) {
        console.error('❌ Error assigning admin to REC:', error);
    }
};
// Run the script
assignAdminToREC()
    .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=assignAdminToREC.js.map