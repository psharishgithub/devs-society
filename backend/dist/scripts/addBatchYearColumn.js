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
const addBatchYearColumn = async () => {
    try {
        console.log('🔧 Adding batch_year column to database tables...');
        // Add batch_year column to admins table
        console.log('\n📋 Adding batch_year to admins table...');
        const { error: adminsError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE admins 
        ADD COLUMN IF NOT EXISTS batch_year INTEGER;
      `
        });
        if (adminsError) {
            console.error('❌ Error adding batch_year to admins table:', adminsError);
        }
        else {
            console.log('✅ Added batch_year column to admins table');
        }
        // Add batch_year column to college_tenure_heads table
        console.log('\n📋 Adding batch_year to college_tenure_heads table...');
        const { error: tenureError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE college_tenure_heads 
        ADD COLUMN IF NOT EXISTS batch_year INTEGER;
      `
        });
        if (tenureError) {
            console.error('❌ Error adding batch_year to college_tenure_heads table:', tenureError);
        }
        else {
            console.log('✅ Added batch_year column to college_tenure_heads table');
        }
        // Update existing admins with batch years (for testing)
        console.log('\n📋 Updating existing admins with batch years...');
        // Get all admins
        const { data: admins, error: fetchError } = await supabase
            .from('admins')
            .select('id, full_name, email')
            .eq('role', 'admin')
            .is('assigned_college_id', 'not.null');
        if (fetchError) {
            console.error('❌ Error fetching admins:', fetchError);
        }
        else if (admins) {
            console.log(`Found ${admins.length} admins to update`);
            // Assign batch years based on admin names or emails
            for (const admin of admins) {
                let batchYear = 2024; // Default batch year
                // Assign different batch years based on admin info
                if (admin.email.includes('hursun')) {
                    batchYear = 2024;
                }
                else if (admin.email.includes('gokul')) {
                    batchYear = 2025;
                }
                else if (admin.full_name.includes('IITB')) {
                    batchYear = 2024;
                }
                else if (admin.full_name.includes('IITD')) {
                    batchYear = 2024;
                }
                else if (admin.full_name.includes('NITK')) {
                    batchYear = 2024;
                }
                // Update admin with batch year
                const { error: updateError } = await supabase
                    .from('admins')
                    .update({ batch_year: batchYear })
                    .eq('id', admin.id);
                if (updateError) {
                    console.error(`❌ Error updating admin ${admin.full_name}:`, updateError);
                }
                else {
                    console.log(`✅ Updated ${admin.full_name} with batch year ${batchYear}`);
                }
                // Update corresponding tenure head
                const { error: tenureUpdateError } = await supabase
                    .from('college_tenure_heads')
                    .update({ batch_year: batchYear })
                    .eq('admin_id', admin.id);
                if (tenureUpdateError) {
                    console.error(`❌ Error updating tenure for ${admin.full_name}:`, tenureUpdateError);
                }
                else {
                    console.log(`✅ Updated tenure for ${admin.full_name} with batch year ${batchYear}`);
                }
            }
        }
        console.log('\n🎉 Batch year column addition completed!');
    }
    catch (error) {
        console.error('❌ Error adding batch year column:', error);
        process.exit(1);
    }
};
// Run the script
addBatchYearColumn()
    .then(() => {
    console.log('🎉 Script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=addBatchYearColumn.js.map