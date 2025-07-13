import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminConstraint() {
  try {
    console.log('🔧 Fixing admin constraint to allow deletion...')

    // Drop the existing constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE admins DROP CONSTRAINT IF EXISTS admin_college_check;'
    })

    if (dropError) {
      console.error('❌ Error dropping constraint:', dropError)
      return
    }

    console.log('✅ Dropped existing admin_college_check constraint')

    // Create new constraint that allows deactivated admins to not have college assignments
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE admins ADD CONSTRAINT admin_college_check CHECK (
          (role = 'super-admin' AND assigned_college_id IS NULL) OR 
          (role = 'admin' AND (assigned_college_id IS NOT NULL OR is_active = false))
        );
      `
    })

    if (addError) {
      console.error('❌ Error adding new constraint:', addError)
      return
    }

    console.log('✅ Added new admin_college_check constraint')
    console.log('🎉 Admin constraint fixed successfully!')
    console.log('📝 Now you can:')
    console.log('   - Delete admins (they will be deactivated)')
    console.log('   - Delete colleges (after ending admin tenure)')
    console.log('   - End admin tenure without constraint violations')

  } catch (error) {
    console.error('❌ Error fixing admin constraint:', error)
  }
}

// Run the fix
fixAdminConstraint() 