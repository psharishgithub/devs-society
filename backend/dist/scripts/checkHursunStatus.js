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
const checkHursunStatus = async () => {
    try {
        console.log('🔍 Comprehensive check of hursun admin status...');
        // 1. Check via findByEmail
        console.log('\n1. Via AdminService.findByEmail():');
        const adminByEmail = await adminService_1.default.findByEmail('hursun@gmail.com');
        if (adminByEmail) {
            console.log(`  Name: ${adminByEmail.fullName}`);
            console.log(`  Role: ${adminByEmail.role}`);
            console.log(`  Assigned College ID: ${adminByEmail.assignedCollege || 'None'}`);
            console.log(`  College Info: ${adminByEmail.collegeInfo ? `${adminByEmail.collegeInfo.name} (${adminByEmail.collegeInfo.code})` : 'None'}`);
            console.log(`  Tenure Active: ${adminByEmail.tenureInfo?.isActive}`);
        }
        else {
            console.log('  Not found!');
        }
        // 2. Check via getAllAdmins
        console.log('\n2. Via AdminService.getAllAdmins():');
        const allAdmins = await adminService_1.default.getAllAdmins();
        const hursunInAll = allAdmins.find(admin => admin.email === 'hursun@gmail.com');
        if (hursunInAll) {
            console.log(`  Found in getAllAdmins()`);
            console.log(`  Role: ${hursunInAll.role}`);
            console.log(`  College Info: ${hursunInAll.collegeInfo ? `${hursunInAll.collegeInfo.name} (${hursunInAll.collegeInfo.code})` : 'None'}`);
        }
        else {
            console.log('  Not found in getAllAdmins()');
        }
        // 3. Check via getAdminsByRole
        console.log('\n3. Via AdminService.getAdminsByRole("admin"):');
        const regularAdmins = await adminService_1.default.getAdminsByRole('admin');
        const hursunInRegular = regularAdmins.find(admin => admin.email === 'hursun@gmail.com');
        if (hursunInRegular) {
            console.log(`  Found in regular admins`);
            console.log(`  College Info: ${hursunInRegular.collegeInfo ? `${hursunInRegular.collegeInfo.name} (${hursunInRegular.collegeInfo.code})` : 'None'}`);
        }
        else {
            console.log('  Not found in regular admins, checking super-admins...');
            const superAdmins = await adminService_1.default.getAdminsByRole('super-admin');
            const hursunInSuper = superAdmins.find(admin => admin.email === 'hursun@gmail.com');
            if (hursunInSuper) {
                console.log(`  Found in SUPER-admins (unexpected!)`);
                console.log(`  College Info: ${hursunInSuper.collegeInfo ? `${hursunInSuper.collegeInfo.name} (${hursunInSuper.collegeInfo.code})` : 'None'}`);
            }
        }
        // 4. Raw database check
        console.log('\n4. Raw database check:');
        const { data: rawAdmin, error } = await supabase
            .from('admins')
            .select(`
        id, username, email, full_name, role, assigned_college_id, tenure_is_active,
        college_tenure_heads(
          college_id, is_active,
          colleges(name, code)
        )
      `)
            .eq('email', 'hursun@gmail.com')
            .single();
        if (error) {
            console.log(`  Database error: ${error.message}`);
        }
        else if (rawAdmin) {
            console.log(`  Database Role: ${rawAdmin.role}`);
            console.log(`  Database Assigned College ID: ${rawAdmin.assigned_college_id || 'None'}`);
            console.log(`  Database Tenure Active: ${rawAdmin.tenure_is_active}`);
            console.log(`  Tenure Records:`, rawAdmin.college_tenure_heads?.length || 0);
            if (rawAdmin.college_tenure_heads && rawAdmin.college_tenure_heads.length > 0) {
                rawAdmin.college_tenure_heads.forEach((tenure, index) => {
                    console.log(`    ${index + 1}. College: ${tenure.colleges?.name || 'Unknown'} (Active: ${tenure.is_active})`);
                });
            }
        }
        // 5. Check SuperAdmin API endpoint simulation
        console.log('\n5. Simulating SuperAdmin API call:');
        try {
            const { data: apiAdmins, error: apiError } = await supabase
                .from('admins')
                .select(`
          *,
          college_tenure_heads!left(
            college_id,
            start_date,
            end_date,
            is_active,
            colleges(
              id,
              name,
              code,
              location
            )
          )
        `)
                .eq('is_active', true);
            if (apiError) {
                console.log(`  API simulation error: ${apiError.message}`);
            }
            else {
                const hursunFromAPI = apiAdmins?.find((admin) => admin.email === 'hursun@gmail.com');
                if (hursunFromAPI) {
                    console.log(`  API Role: ${hursunFromAPI.role}`);
                    console.log(`  API College Tenure Heads:`, hursunFromAPI.college_tenure_heads?.length || 0);
                    if (hursunFromAPI.college_tenure_heads && hursunFromAPI.college_tenure_heads.length > 0) {
                        const activeTenure = hursunFromAPI.college_tenure_heads.find((t) => t.is_active);
                        if (activeTenure) {
                            console.log(`  Active tenure college: ${activeTenure.colleges?.name || 'Unknown'}`);
                        }
                        else {
                            console.log(`  No active tenure found`);
                        }
                    }
                }
            }
        }
        catch (apiErr) {
            console.log(`  API simulation failed:`, apiErr);
        }
    }
    catch (error) {
        console.error('❌ Error checking hursun status:', error);
    }
};
// Run the script
checkHursunStatus()
    .then(() => {
    console.log('\n✨ Status check completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
});
//# sourceMappingURL=checkHursunStatus.js.map