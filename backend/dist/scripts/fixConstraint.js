"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
const supabase = (0, supabase_1.getSupabase)();
async function fixConstraint() {
    try {
        console.log('🔧 Fixing admin constraint...');
        // Drop the existing constraint
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE admins DROP CONSTRAINT IF EXISTS admin_college_check;'
        });
        if (dropError) {
            console.error('❌ Error dropping constraint:', dropError);
            return;
        }
        console.log('✅ Dropped existing constraint');
        // Add new constraint
        const { error: addError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE admins ADD CONSTRAINT admin_college_check CHECK (
          (role = 'super-admin' AND assigned_college_id IS NULL) OR 
          (role = 'admin' AND (assigned_college_id IS NOT NULL OR is_active = false))
        );
      `
        });
        if (addError) {
            console.error('❌ Error adding constraint:', addError);
            return;
        }
        console.log('✅ Added new constraint');
        console.log('🎉 Constraint fix completed!');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
fixConstraint();
//# sourceMappingURL=fixConstraint.js.map