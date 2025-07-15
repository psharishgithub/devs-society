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
const fixHursunTenure = async () => {
    try {
        console.log('🔧 Checking and fixing hursun tenure status...');
        // First, check hursun's current status
        const hursunAdmin = await adminService_1.default.findByEmail('hursun@gmail.com');
        if (!hursunAdmin) {
            console.error('❌ hursun admin not found');
            return;
        }
        console.log('\n📋 Current hursun status:');
        console.log(`   Name: ${hursunAdmin.fullName}`);
        console.log(`   Role: ${hursunAdmin.role}`);
        console.log(`   Assigned College ID: ${hursunAdmin.assignedCollege || 'None'}`);
        console.log(`   College Info: ${hursunAdmin.collegeInfo ? `${hursunAdmin.collegeInfo.name} (${hursunAdmin.collegeInfo.code})` : 'None'}`);
        console.log(`   Tenure Active: ${hursunAdmin.tenureInfo?.isActive || false}`);
        console.log(`   Tenure Start: ${hursunAdmin.tenureInfo?.startDate || 'None'}`);
        // Check raw database tenure data
        console.log('\n🔍 Checking raw database tenure data...');
        const { data: tenureData, error } = await supabase
            .from('college_tenure_heads')
            .select(`
        *,
        colleges(
          id,
          name,
          code,
          location
        )
      `)
            .eq('admin_id', hursunAdmin.id);
        if (error) {
            console.error('❌ Error fetching tenure data:', error);
            return;
        }
        console.log(`   Found ${tenureData?.length || 0} tenure records:`);
        tenureData?.forEach((tenure, index) => {
            console.log(`   ${index + 1}. College: ${tenure.colleges?.name || 'Unknown'}`);
            console.log(`      Active: ${tenure.is_active}`);
            console.log(`      Start: ${tenure.start_date}`);
            console.log(`      End: ${tenure.end_date || 'None'}`);
        });
        // Find the REC college ID
        console.log('\n🏫 Finding REC college...');
        const { data: recCollege, error: recError } = await supabase
            .from('colleges')
            .select('*')
            .eq('code', 'REC')
            .single();
        if (recError || !recCollege) {
            console.error('❌ REC college not found:', recError?.message);
            return;
        }
        console.log(`   REC College ID: ${recCollege.id}`);
        console.log(`   REC College Name: ${recCollege.name}`);
        // Check if there's an inactive tenure for REC
        const inactiveTenure = tenureData?.find((tenure) => tenure.college_id === recCollege.id && !tenure.is_active);
        if (inactiveTenure) {
            console.log('\n🔄 Reactivating tenure for REC...');
            // Reactivate the tenure
            const { error: activateError } = await supabase
                .from('college_tenure_heads')
                .update({
                is_active: true,
                end_date: null
            })
                .eq('id', inactiveTenure.id);
            if (activateError) {
                console.error('❌ Error reactivating tenure:', activateError);
                return;
            }
            console.log('✅ Tenure reactivated successfully');
        }
        else {
            console.log('\n➕ Creating new active tenure for REC...');
            // Create new active tenure
            const { error: createError } = await supabase
                .from('college_tenure_heads')
                .insert({
                admin_id: hursunAdmin.id,
                college_id: recCollege.id,
                start_date: new Date().toISOString(),
                is_active: true
            });
            if (createError) {
                console.error('❌ Error creating tenure:', createError);
                return;
            }
            console.log('✅ New tenure created successfully');
        }
        // Update admin record to reflect active tenure
        console.log('\n🔄 Updating admin record...');
        const { error: adminUpdateError } = await supabase
            .from('admins')
            .update({
            assigned_college_id: recCollege.id,
            tenure_start_date: new Date().toISOString(),
            tenure_is_active: true
        })
            .eq('id', hursunAdmin.id);
        if (adminUpdateError) {
            console.error('❌ Error updating admin record:', adminUpdateError);
            return;
        }
        console.log('✅ Admin record updated successfully');
        // Verify the fix
        console.log('\n✅ Verifying fix...');
        const fixedHursun = await adminService_1.default.findByEmail('hursun@gmail.com');
        if (fixedHursun) {
            console.log(`   Name: ${fixedHursun.fullName}`);
            console.log(`   Role: ${fixedHursun.role}`);
            console.log(`   College Info: ${fixedHursun.collegeInfo ? `${fixedHursun.collegeInfo.name} (${fixedHursun.collegeInfo.code})` : 'None'}`);
            console.log(`   Tenure Active: ${fixedHursun.tenureInfo?.isActive || false}`);
            console.log(`   Tenure Start: ${fixedHursun.tenureInfo?.startDate || 'None'}`);
            if (fixedHursun.collegeInfo && fixedHursun.tenureInfo?.isActive) {
                console.log('🎉 HURSUN TENURE FIXED! Should now show college correctly.');
            }
            else {
                console.log('⚠️  Fix may not be complete');
            }
        }
    }
    catch (error) {
        console.error('❌ Error fixing hursun tenure:', error);
    }
};
// Run the fix
fixHursunTenure()
    .then(() => {
    console.log('\n✨ Hursun tenure fix completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fixHursunTenure.js.map