import dotenv from 'dotenv'
import { getSupabase } from '../database/supabase'

// Load environment variables
dotenv.config()

async function addRegularMemberRole() {
  try {
    console.log('🔄 Adding regular-member role to user_role enum...')
    
    const supabase = getSupabase()
    
    // Execute the ALTER TYPE command
    const { error } = await supabase.rpc('exec_sql', {
      sql: "ALTER TYPE user_role ADD VALUE 'regular-member';"
    })
    
    if (error) {
      // If the role already exists, that's fine
      if (error.message?.includes('already exists')) {
        console.log('✅ regular-member role already exists in the enum')
        return
      }
      throw error
    }
    
    console.log('✅ Successfully added regular-member role to user_role enum')
  } catch (error) {
    console.error('❌ Error adding regular-member role:', error)
    
    // Alternative approach: try to insert a test user with regular-member role
    console.log('🔄 Trying alternative approach...')
    try {
      const supabase = getSupabase()
      
      // Test if the role is already supported by trying to insert a test record
      const { error: testError } = await supabase
        .from('users')
        .insert({
          full_name: 'TEST_USER_REGULAR_MEMBER',
          email: 'test-regular-member@test.com',
          phone: '1234567890',
          college: 'Test College',
          batch_year: '2024',
          role: 'regular-member',
          member_id: 'TEST001',
          is_active: false // Set to false so it doesn't interfere with real data
        })
      
      if (testError) {
        if (testError.message?.includes('invalid input value for enum user_role')) {
          console.error('❌ The regular-member role is not yet supported in the database')
          console.error('Please run the migration manually in your Supabase dashboard:')
          console.error("ALTER TYPE user_role ADD VALUE 'regular-member';")
        } else {
          console.error('❌ Test insert failed:', testError)
        }
      } else {
        console.log('✅ regular-member role is supported! Cleaning up test data...')
        
        // Clean up the test record
        await supabase
          .from('users')
          .delete()
          .eq('email', 'test-regular-member@test.com')
        
        console.log('✅ Test data cleaned up')
      }
    } catch (testError) {
      console.error('❌ Alternative approach failed:', testError)
    }
  }
}

// Run the migration
addRegularMemberRole()
  .then(() => {
    console.log('🎉 Role migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Role migration failed:', error)
    process.exit(1)
  }) 