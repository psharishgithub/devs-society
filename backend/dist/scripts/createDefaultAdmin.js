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
(0, supabase_1.initializeSupabase)();
// Import AdminService
const adminService_1 = __importDefault(require("../services/adminService"));
const createDefaultAdmin = async () => {
    try {
        console.log('🚀 Creating default admin account...');
        // Check if admin already exists
        const existingAdmin = await adminService_1.default.findByEmail('admin@devs-society.com');
        if (existingAdmin) {
            console.log('✅ Admin account already exists');
            return;
        }
        // Create default admin
        const adminData = {
            username: 'admin',
            email: 'admin@devs-society.com',
            password: 'DevsSociety2024!',
            fullName: 'System Administrator',
            role: 'super-admin',
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'events.read', 'events.write', 'events.delete',
                'colleges.read', 'colleges.write', 'colleges.delete',
                'admins.read', 'admins.write', 'admins.delete',
                'settings.read', 'settings.write',
                'analytics.read', 'system.admin'
            ]
        };
        const admin = await adminService_1.default.createAdmin(adminData);
        console.log('✅ Default admin created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('👤 Username:', admin.username);
        console.log('🔑 Password: DevsSociety2024!');
        console.log('🎯 Role:', admin.role);
    }
    catch (error) {
        console.error('❌ Error creating default admin:', error);
        process.exit(1);
    }
};
// Run the script
createDefaultAdmin()
    .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=createDefaultAdmin.js.map