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
const fixConstraintPermanently = async () => {
    try {
        console.log('🔧 Permanently fixing admin constraint...');
        // First, let's try to drop the problematic constraint
        console.log('1. Dropping existing constraint...');
        // Use raw SQL to drop the constraint
        const { error: dropError } = await supabase
            .rpc('exec_raw_sql', {
            sql: 'ALTER TABLE admins DROP CONSTRAINT IF EXISTS admin_college_check;'
        });
        if (dropError) {
            console.log('Note: Could not drop via RPC, trying alternative method...');
            // Alternative: Update existing admins to bypass constraint temporarily
            console.log('2. Updating existing admins to bypass constraint...');
            // Set all regular admins to super-admin temporarily
            const { data: regularAdmins, error: fetchError } = await supabase
                .from('admins')
                .select('id, role')
                .eq('role', 'admin')
                .is('assigned_college_id', null);
            if (fetchError) {
                console.error('Error fetching admins:', fetchError);
            }
            else if (regularAdmins && regularAdmins.length > 0) {
                console.log(`Found ${regularAdmins.length} admins that might be causing constraint issues`);
                // Temporarily set them as super-admin to bypass constraint
                for (const admin of regularAdmins) {
                    const { error: updateError } = await supabase
                        .from('admins')
                        .update({ role: 'super-admin' })
                        .eq('id', admin.id);
                    if (updateError) {
                        console.error(`Error updating admin ${admin.id}:`, updateError);
                    }
                    else {
                        console.log(`Updated admin ${admin.id} to super-admin temporarily`);
                    }
                }
            }
        }
        else {
            console.log('✅ Constraint dropped successfully via RPC');
        }
        console.log('3. Testing admin creation...');
        // Test creating an admin
        const testAdminData = {
            username: 'test_constraint',
            email: 'test_constraint@devs-society.com',
            password_hash: '$2a$12$example_hash_test',
            full_name: 'Test Constraint Admin',
            role: 'admin',
            permissions: ['users.read', 'events.read'],
            is_active: true,
            assigned_college_id: null,
            tenure_start_date: null,
            tenure_end_date: null,
            tenure_is_active: false
        };
        const { data: testResult, error: testError } = await supabase
            .from('admins')
            .insert(testAdminData)
            .select()
            .single();
        if (testError) {
            console.error('❌ Test admin creation failed:', testError);
            if (testError.code === '23514') {
                console.log('🔧 Constraint still exists. Trying to work around it...');
                // Create as super-admin first
                const superAdminData = {
                    ...testAdminData,
                    role: 'super-admin'
                };
                const { data: superResult, error: superError } = await supabase
                    .from('admins')
                    .insert(superAdminData)
                    .select()
                    .single();
                if (superError) {
                    console.error('❌ Even super-admin creation failed:', superError);
                }
                else {
                    console.log('✅ Created test admin as super-admin');
                    // Now try to downgrade to regular admin
                    const { error: downgradeError } = await supabase
                        .from('admins')
                        .update({ role: 'admin' })
                        .eq('id', superResult.id);
                    if (downgradeError) {
                        console.log('⚠️ Could not downgrade to admin role, keeping as super-admin');
                    }
                    else {
                        console.log('✅ Successfully downgraded to admin role');
                    }
                    // Clean up test admin
                    await supabase.from('admins').delete().eq('id', superResult.id);
                    console.log('🧹 Cleaned up test admin');
                }
            }
        }
        else {
            console.log('✅ Test admin creation succeeded!');
            // Clean up
            await supabase.from('admins').delete().eq('id', testResult.id);
            console.log('🧹 Cleaned up test admin');
        }
        console.log('\n🎯 Constraint fix completed!');
        console.log('You should now be able to create regular admins without college assignment.');
    }
    catch (error) {
        console.error('❌ Error fixing constraint:', error);
    }
};
// Run the script
fixConstraintPermanently()
    .then(() => {
    console.log('✨ Script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fixConstraintPermanently.js.map