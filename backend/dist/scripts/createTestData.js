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
// Import services
const adminService_1 = __importDefault(require("../services/adminService"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
const createTestData = async () => {
    try {
        console.log('🏗️  Creating test data...');
        // Create test colleges
        const colleges = [
            {
                name: 'Indian Institute of Technology, Delhi',
                code: 'IITD',
                location: 'New Delhi',
                address: 'Hauz Khas, New Delhi-110016',
                contactInfo: {
                    email: 'info@iitd.ac.in',
                    phone: '+91-11-2659-1785',
                    website: 'https://home.iitd.ac.in/'
                }
            },
            {
                name: 'Indian Institute of Technology, Bombay',
                code: 'IITB',
                location: 'Mumbai',
                address: 'Powai, Mumbai-400076',
                contactInfo: {
                    email: 'info@iitb.ac.in',
                    phone: '+91-22-2572-2545',
                    website: 'https://www.iitb.ac.in/'
                }
            },
            {
                name: 'National Institute of Technology, Karnataka',
                code: 'NITK',
                location: 'Surathkal',
                address: 'Surathkal, Mangalore-575025',
                contactInfo: {
                    email: 'info@nitk.edu.in',
                    phone: '+91-824-247-3000',
                    website: 'https://www.nitk.ac.in/'
                }
            }
        ];
        console.log('📚 Creating colleges...');
        const createdColleges = [];
        for (const collegeData of colleges) {
            try {
                const college = await collegeService_1.default.createCollege(collegeData);
                createdColleges.push(college);
                console.log(`  ✅ Created: ${college.name}`);
            }
            catch (error) {
                if (error instanceof Error && error.message.includes('already exists')) {
                    console.log(`  ℹ️  College ${collegeData.name} already exists`);
                    const existing = await collegeService_1.default.findByCode(collegeData.code);
                    if (existing)
                        createdColleges.push(existing);
                }
                else {
                    console.log(`  ❌ Error creating ${collegeData.name}:`, error);
                }
            }
        }
        // Create test admins
        const admins = [
            {
                username: 'admin_iitd',
                email: 'admin.iitd@devs-society.com',
                password: 'Admin123!',
                fullName: 'Rahul Sharma - IITD Admin',
                role: 'admin'
            },
            {
                username: 'admin_iitb',
                email: 'admin.iitb@devs-society.com',
                password: 'Admin123!',
                fullName: 'Priya Patel - IITB Admin',
                role: 'admin'
            },
            {
                username: 'admin_nitk',
                email: 'admin.nitk@devs-society.com',
                password: 'Admin123!',
                fullName: 'Arun Kumar - NITK Admin',
                role: 'admin'
            },
            {
                username: 'junior_admin',
                email: 'junior@devs-society.com',
                password: 'Junior123!',
                fullName: 'Sneha Reddy - Unassigned Admin',
                role: 'admin'
            }
        ];
        console.log('👤 Creating admins...');
        const createdAdmins = [];
        for (const adminData of admins) {
            try {
                const admin = await adminService_1.default.createAdmin(adminData);
                createdAdmins.push(admin);
                console.log(`  ✅ Created: ${admin.fullName} (${admin.email})`);
            }
            catch (error) {
                if (error instanceof Error && error.message.includes('already exists')) {
                    console.log(`  ℹ️  Admin ${adminData.email} already exists`);
                }
                else {
                    console.log(`  ❌ Error creating ${adminData.fullName}:`, error);
                }
            }
        }
        // Assign admins to colleges (demonstrate tenure system)
        console.log('🎯 Assigning admins to colleges...');
        if (createdColleges.length >= 3 && createdAdmins.length >= 3) {
            try {
                await adminService_1.default.assignAdminToCollege(createdAdmins[0].id, createdColleges[0].id);
                console.log(`  ✅ Assigned ${createdAdmins[0].fullName} to ${createdColleges[0].name}`);
                await adminService_1.default.assignAdminToCollege(createdAdmins[1].id, createdColleges[1].id);
                console.log(`  ✅ Assigned ${createdAdmins[1].fullName} to ${createdColleges[1].name}`);
                await adminService_1.default.assignAdminToCollege(createdAdmins[2].id, createdColleges[2].id);
                console.log(`  ✅ Assigned ${createdAdmins[2].fullName} to ${createdColleges[2].name}`);
                console.log(`  ℹ️  Left ${createdAdmins[3]?.fullName || 'one admin'} unassigned for testing`);
            }
            catch (error) {
                console.log('  ⚠️  Some tenure assignments may have failed:', error);
            }
        }
        console.log('\n🎉 Test data creation completed!');
        console.log('\n📋 Summary:');
        console.log(`  🏫 Colleges: ${createdColleges.length}`);
        console.log(`  👤 Admins: ${createdAdmins.length}`);
        console.log('\n🔐 Admin Login Credentials:');
        console.log('  📧 admin.iitd@devs-society.com / Admin123!');
        console.log('  📧 admin.iitb@devs-society.com / Admin123!');
        console.log('  📧 admin.nitk@devs-society.com / Admin123!');
        console.log('  📧 junior@devs-society.com / Junior123!');
    }
    catch (error) {
        console.error('❌ Error creating test data:', error);
        process.exit(1);
    }
};
// Run the script
createTestData()
    .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=createTestData.js.map