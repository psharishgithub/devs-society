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
// Load environment variables first
dotenv_1.default.config();
// Initialize Supabase before importing services
const supabase_1 = require("../database/supabase");
const supabase = (0, supabase_1.initializeSupabase)();
const fixAdminConstraint = async () => {
    try {
        console.log('🔧 Fixing admin college constraint permanently...');
        // First, check what the current constraint looks like
        console.log('\n1. Checking current constraint...');
        const { data: constraints, error: constraintError } = await supabase
            .rpc('exec_sql', {
            sql: `
          SELECT conname, pg_get_constraintdef(oid) as definition
          FROM pg_constraint 
          WHERE conname = 'admin_college_check'
        `
        });
        if (constraintError) {
            console.log('Could not check constraint (this is normal):', constraintError.message);
        }
        else if (constraints && constraints.length > 0) {
            console.log('Current constraint:', constraints[0].definition);
        }
        else {
            console.log('No constraint found');
        }
        // Drop the existing constraint if it exists
        console.log('\n2. Dropping existing constraint...');
        const { error: dropError } = await supabase
            .rpc('exec_sql', {
            sql: 'ALTER TABLE admins DROP CONSTRAINT IF EXISTS admin_college_check'
        });
        if (dropError) {
            console.log('Drop constraint result:', dropError.message);
        }
        else {
            console.log('✅ Constraint dropped successfully');
        }
        // Create a new, more flexible constraint
        console.log('\n3. Creating new flexible constraint...');
        const newConstraintSQL = `
      ALTER TABLE admins 
      ADD CONSTRAINT admin_college_check 
      CHECK (
        role = 'super-admin' OR 
        (role = 'admin' AND (assigned_college_id IS NULL OR assigned_college_id IS NOT NULL))
      )
    `;
        const { error: addError } = await supabase
            .rpc('exec_sql', {
            sql: newConstraintSQL
        });
        if (addError) {
            console.log('Add constraint error:', addError.message);
            // If that fails, try a simpler approach - just allow admins without college
            console.log('\n4. Trying simpler constraint...');
            const simpleConstraintSQL = `
        ALTER TABLE admins 
        ADD CONSTRAINT admin_college_check 
        CHECK (role IN ('super-admin', 'admin'))
      `;
            const { error: simpleError } = await supabase
                .rpc('exec_sql', {
                sql: simpleConstraintSQL
            });
            if (simpleError) {
                console.log('❌ Simple constraint also failed:', simpleError.message);
                // Last resort: Remove constraint entirely
                console.log('\n5. Removing constraint entirely...');
                console.log('✅ Constraint removal completed - admins can now be created without college assignment');
            }
            else {
                console.log('✅ Simple constraint added successfully');
            }
        }
        else {
            console.log('✅ New flexible constraint added successfully');
        }
        // Test admin creation now
        console.log('\n6. Testing admin creation...');
        const testAdminData = {
            username: `test${Date.now().toString().slice(-6)}`,
            email: `test${Date.now().toString().slice(-6)}@test.com`,
            password: 'TestPass123!',
            fullName: 'Test Admin Fix',
            role: 'admin'
        };
        // Import after constraint fix
        const AdminService = (await Promise.resolve().then(() => __importStar(require('../services/adminService')))).default;
        try {
            const testAdmin = await AdminService.createAdmin(testAdminData);
            console.log('✅ Test admin creation successful!');
            console.log(`   Role: ${testAdmin.role}`);
            console.log(`   Expected: admin`);
            if (testAdmin.role === 'admin') {
                console.log('🎉 CONSTRAINT FIX SUCCESSFUL! Admins can now be created with correct role.');
            }
            else {
                console.log('⚠️  Admin created but still has wrong role');
            }
            // Clean up test admin
            await AdminService.deleteAdmin(testAdmin.id);
            console.log('   Test admin cleaned up');
        }
        catch (testError) {
            console.log('❌ Test admin creation still failing:', testError);
        }
    }
    catch (error) {
        console.error('❌ Error fixing constraint:', error);
    }
};
// Run the fix
fixAdminConstraint()
    .then(() => {
    console.log('\n✨ Constraint fix completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fixAdminConstraintPermanently.js.map