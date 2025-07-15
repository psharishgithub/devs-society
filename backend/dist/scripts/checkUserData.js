"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
async function checkUserData() {
    try {
        console.log('🔍 Checking raw user data from database...\n');
        const supabase = (0, supabase_1.getSupabase)();
        // Get raw user data
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .limit(5);
        if (error) {
            console.error('❌ Error fetching users:', error);
            return;
        }
        console.log(`📊 Found ${users?.length || 0} users:\n`);
        users?.forEach((user, index) => {
            console.log(`👤 User ${index + 1}:`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Name: ${user.full_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   College field: "${user.college}"`);
            console.log(`   College Ref ID: "${user.college_ref_id}"`);
            console.log(`   Batch Year: ${user.batch_year}`);
            console.log('---');
        });
        // Check specific user by email
        const testEmail = '230701091@rajalakshmi.edu.in';
        console.log(`\n🔍 Checking specific user: ${testEmail}`);
        const { data: specificUser, error: specificError } = await supabase
            .from('users')
            .select('*')
            .eq('email', testEmail)
            .single();
        if (specificError) {
            console.log(`   ❌ Error: ${specificError.message}`);
        }
        else if (specificUser) {
            console.log(`   Name: ${specificUser.full_name}`);
            console.log(`   College field: "${specificUser.college}"`);
            console.log(`   College Ref ID: "${specificUser.college_ref_id}"`);
            // Check if college_ref_id matches the college field
            if (specificUser.college_ref_id && specificUser.college === specificUser.college_ref_id) {
                console.log(`   ✅ College field and college_ref_id match`);
            }
            else if (specificUser.college_ref_id && specificUser.college !== specificUser.college_ref_id) {
                console.log(`   ⚠️  College field and college_ref_id don't match`);
            }
            else {
                console.log(`   ⚠️  No college_ref_id set`);
            }
        }
        else {
            console.log(`   ❌ User not found`);
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
// Run the check
checkUserData()
    .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
});
//# sourceMappingURL=checkUserData.js.map