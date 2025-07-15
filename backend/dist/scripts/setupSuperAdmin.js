"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const adminService_1 = __importDefault(require("../services/adminService"));
// Load environment variables
dotenv_1.default.config();
async function setupSuperAdmin() {
    try {
        console.log('🚀 Setting up predefined super admin...');
        // Predefined super admin credentials
        const superAdminData = {
            username: 'superadmin',
            email: 'superadmin@devs.society',
            password: 'DevsSociety2024!', // Secure password
            fullName: 'Super Administrator',
            role: 'super-admin'
        };
        // Check if super admin already exists
        const existingAdmin = await adminService_1.default.findByEmail(superAdminData.email);
        if (existingAdmin) {
            console.log('✅ Super admin already exists!');
            console.log('📧 Email:', existingAdmin.email);
            console.log('👤 Username:', existingAdmin.username);
            console.log('🔑 Password: DevsSociety2024!');
            console.log('🆔 ID:', existingAdmin.id);
            return;
        }
        // Create super admin
        try {
            const admin = await adminService_1.default.createAdmin(superAdminData);
            console.log('✅ Super admin created successfully!');
            console.log('📧 Email:', admin.email);
            console.log('👤 Username:', admin.username);
            console.log('🔑 Password: DevsSociety2024!');
            console.log('🆔 ID:', admin.id);
            console.log('🎭 Role:', admin.role);
            console.log('📅 Created:', admin.createdAt);
            console.log('\n🔐 Login Credentials:');
            console.log('Email: superadmin@devs.society');
            console.log('Password: DevsSociety2024!');
            console.log('\n⚠️  IMPORTANT: Change the password after first login for security!');
        }
        catch (createError) {
            console.error('❌ Error creating super admin:', createError);
            // Check if it's a constraint error
            if (createError instanceof Error && createError.message.includes('constraint')) {
                console.log('🔧 This might be a database constraint issue. Trying alternative approach...');
                // Try to create without college assignment
                const alternativeData = {
                    ...superAdminData,
                    assignedCollege: undefined,
                    batchYear: undefined
                };
                try {
                    const admin = await adminService_1.default.createAdmin(alternativeData);
                    console.log('✅ Super admin created successfully with alternative approach!');
                    console.log('📧 Email:', admin.email);
                    console.log('👤 Username:', admin.username);
                    console.log('🔑 Password: DevsSociety2024!');
                    console.log('🆔 ID:', admin.id);
                    console.log('🎭 Role:', admin.role);
                    console.log('\n🔐 Login Credentials:');
                    console.log('Email: superadmin@devs.society');
                    console.log('Password: DevsSociety2024!');
                    console.log('\n⚠️  IMPORTANT: Change the password after first login for security!');
                }
                catch (altError) {
                    console.error('❌ Alternative approach also failed:', altError);
                    throw altError;
                }
            }
            else {
                throw createError;
            }
        }
    }
    catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}
// Run the script
setupSuperAdmin()
    .then(() => {
    console.log('\n🎉 Setup completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=setupSuperAdmin.js.map