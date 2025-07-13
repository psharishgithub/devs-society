import { getSupabase } from '../database/supabase'
import fs from 'fs'
import path from 'path'

const supabase = getSupabase()

async function runSqlFix() {
  try {
    console.log('🔧 Running SQL fix for admin constraint...')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/fix_constraint.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 SQL content:')
    console.log(sqlContent)

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })

    if (error) {
      console.error('❌ Error executing SQL:', error)
      return
    }

    console.log('✅ SQL fix executed successfully!')
    console.log('🎉 You can now delete admins and colleges properly.')

  } catch (error) {
    console.error('❌ Error running SQL fix:', error)
  }
}

runSqlFix() 