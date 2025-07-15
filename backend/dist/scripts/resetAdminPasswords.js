"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
const adminService_1 = __importDefault(require("../services/adminService"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Initialize Supabase
const supabase = (0, supabase_1.initializeSupabase)();
const resetAdminPasswords = async () => {
    try {
        console.log('🔧 Resetting Admin Passwords...\n');
        // Get all admin accounts
        const allAdmins = await adminService_1.default.getAllAdmins();
        console.log(`Found ${allAdmins.length} admin accounts\n`);
        // New password for all admins
        const newPassword = 'Admin123!';
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        console.log(`Setting all admin passwords to: ${newPassword}\n`);
        // Update passwords for each admin
        for (const admin of allAdmins) {
            try {
                console.log(`Updating password for: ${admin.fullName} (${admin.email})`);
                const { error } = await supabase
                    .from('admins')
                    .update({ password_hash: hashedPassword })
                    .eq('id', admin.id);
                if (error) {
                    console.log(`  ❌ Error updating password: ${error.message}`);
                }
                else {
                    console.log(`  ✅ Password updated successfully`);
                }
            }
            catch (error) {
                console.log(`  ❌ Error updating password for ${admin.email}:`, error);
            }
        }
        console.log('\n✅ Password reset completed!');
        console.log(`📝 All admin passwords are now: ${newPassword}`);
        console.log('\nYou can now test admin login with:');
        console.log('- Email/Username: any admin email or username');
        console.log('- Password: Admin123!');
    }
    catch (error) {
        console.error('❌ Error resetting admin passwords:', error);
    }
};
// Run the script
resetAdminPasswords();
//# sourceMappingURL=resetAdminPasswords.js.map