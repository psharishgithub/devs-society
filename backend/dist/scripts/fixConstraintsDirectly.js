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
const fixConstraints = async () => {
    try {
        console.log('🔧 Attempting to fix admin constraints...');
        // First, let's check what constraints exist
        const { data: constraints, error: checkError } = await supabase
            .from('information_schema.table_constraints')
            .select('*')
            .eq('table_name', 'admins')
            .eq('constraint_type', 'CHECK');
        if (checkError) {
            console.log('Could not check constraints:', checkError.message);
        }
        else {
            console.log('Current constraints:', constraints);
        }
        // Create a new admin record directly with minimal validation
        console.log('🧪 Testing direct admin creation...');
        const testAdmin = {
            username: 'test_admin',
            email: 'test@devs-society.com',
            password_hash: '$2a$12$example_hash_here',
            full_name: 'Test Admin',
            role: 'admin',
            permissions: ['users.read', 'events.read'],
            is_active: true,
            assigned_college_id: null,
            tenure_start_date: null,
            tenure_end_date: null,
            tenure_is_active: false
        };
        const { data: insertResult, error: insertError } = await supabase
            .from('admins')
            .insert(testAdmin)
            .select()
            .single();
        if (insertError) {
            console.error('❌ Insert failed:', insertError);
            // If it's a constraint error, let's try to understand what the constraint expects
            if (insertError.code === '23514') {
                console.log('🔍 Constraint violation detected. Let\'s check the constraint definition...');
                // Try different combinations to understand what works
                console.log('🧪 Testing super-admin creation...');
                const superAdminTest = {
                    username: 'test_super',
                    email: 'super@devs-society.com',
                    password_hash: '$2a$12$example_hash_here',
                    full_name: 'Test Super Admin',
                    role: 'super-admin',
                    permissions: ['system.admin'],
                    is_active: true,
                    assigned_college_id: null,
                    tenure_start_date: null,
                    tenure_end_date: null,
                    tenure_is_active: false
                };
                const { data: superResult, error: superError } = await supabase
                    .from('admins')
                    .insert(superAdminTest)
                    .select()
                    .single();
                if (superError) {
                    console.error('❌ Super admin creation also failed:', superError);
                }
                else {
                    console.log('✅ Super admin creation succeeded!');
                    // Clean up
                    await supabase.from('admins').delete().eq('id', superResult.id);
                }
            }
        }
        else {
            console.log('✅ Test admin creation succeeded!');
            // Clean up
            await supabase.from('admins').delete().eq('id', insertResult.id);
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
};
// Run the script
fixConstraints()
    .then(() => {
    console.log('🎉 Analysis completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fixConstraintsDirectly.js.map