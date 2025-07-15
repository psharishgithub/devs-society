"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load environment variables first
dotenv_1.default.config();
// Initialize Supabase before importing services
const supabase_1 = require("../database/supabase");
const supabase = (0, supabase_1.initializeSupabase)();
const applyMigration = async () => {
    try {
        console.log('🔧 Applying admin constraint fix migration...');
        // Read the migration file
        const migrationPath = path_1.default.join(__dirname, '../database/migrations/003_fix_admin_constraint.sql');
        const migrationSQL = fs_1.default.readFileSync(migrationPath, 'utf8');
        console.log('\n📄 Migration SQL:');
        console.log(migrationSQL);
        // Split the migration into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '');
        console.log(`\n🔧 Executing ${statements.length} SQL statements...`);
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`\n${i + 1}. ${statement.substring(0, 100)}...`);
            try {
                const { error } = await supabase.rpc('exec_sql', {
                    sql: statement
                });
                if (error) {
                    console.log(`   ⚠️  Statement result: ${error.message}`);
                }
                else {
                    console.log('   ✅ Statement executed successfully');
                }
            }
            catch (statementError) {
                console.log(`   ❌ Statement failed:`, statementError);
            }
        }
        // Test admin creation after migration
        console.log('\n🧪 Testing admin creation after migration...');
        const AdminService = (await Promise.resolve().then(() => __importStar(require('../services/adminService')))).default;
        const testAdminData = {
            username: `test${Date.now().toString().slice(-6)}`,
            email: `test${Date.now().toString().slice(-6)}@test.com`,
            password: 'TestPass123!',
            fullName: 'Test Migration Admin',
            role: 'admin'
        };
        try {
            const testAdmin = await AdminService.createAdmin(testAdminData);
            console.log('✅ Post-migration admin creation successful!');
            console.log(`   Role: ${testAdmin.role}`);
            if (testAdmin.role === 'admin') {
                console.log('🎉 MIGRATION SUCCESSFUL! Admin constraint fixed.');
            }
            else {
                console.log('⚠️  Admin created but role is still incorrect');
            }
            // Clean up
            await AdminService.deleteAdmin(testAdmin.id);
            console.log('   Test admin cleaned up');
        }
        catch (testError) {
            console.log('❌ Post-migration test failed:', testError);
        }
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
};
// Run the migration
applyMigration()
    .then(() => {
    console.log('\n✨ Migration completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=applyMigration.js.map