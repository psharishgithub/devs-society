"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase = (0, supabase_1.getSupabase)();
async function runSqlFix() {
    try {
        console.log('🔧 Running SQL fix for admin constraint...');
        // Read the SQL file
        const sqlPath = path_1.default.join(__dirname, '../database/fix_constraint.sql');
        const sqlContent = fs_1.default.readFileSync(sqlPath, 'utf8');
        console.log('📄 SQL content:');
        console.log(sqlContent);
        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', {
            sql: sqlContent
        });
        if (error) {
            console.error('❌ Error executing SQL:', error);
            return;
        }
        console.log('✅ SQL fix executed successfully!');
        console.log('🎉 You can now delete admins and colleges properly.');
    }
    catch (error) {
        console.error('❌ Error running SQL fix:', error);
    }
}
runSqlFix();
//# sourceMappingURL=runSqlFix.js.map