"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
const userService_1 = __importDefault(require("../services/userService"));
const eventService_1 = __importDefault(require("../services/eventService"));
const adminService_1 = __importDefault(require("../services/adminService"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
// Initialize Supabase
const supabase = (0, supabase_1.initializeSupabase)();
const testPricing = async () => {
    try {
        console.log('🧪 Testing Personalized Pricing System...\n');
        // 1. Get all events
        console.log('📋 Getting all events...');
        const events = await eventService_1.default.getAllEvents();
        console.log(`Found ${events.length} events`);
        // 2. Get a test user (first user in the system)
        console.log('\n👤 Getting test user...');
        const usersResponse = await userService_1.default.getAllUsers();
        if (usersResponse.users.length === 0) {
            console.log('❌ No users found in the system');
            return;
        }
        const testUser = usersResponse.users[0];
        console.log(`Test user: ${testUser.fullName} (${testUser.college}, Batch ${testUser.batchYear})`);
        // 3. Get user's college info
        console.log('\n🏫 Getting college info...');
        let userCollege = null;
        if (testUser.collegeRef) {
            userCollege = await collegeService_1.default.findById(testUser.collegeRef);
            console.log(`College: ${userCollege?.name} (${userCollege?.code})`);
        }
        else {
            console.log('⚠️  User has no college reference');
        }
        // 4. Get admins for user's college
        console.log('\n👨‍💼 Getting college admins...');
        let collegeAdmins = [];
        if (userCollege) {
            collegeAdmins = await adminService_1.default.getAdminsByCollege(userCollege.id, true);
            console.log(`Found ${collegeAdmins.length} admins for ${userCollege.name}:`);
            collegeAdmins.forEach(admin => {
                console.log(`  - ${admin.fullName} (Batch ${admin.batchYear})`);
            });
        }
        // 5. Test pricing for each event
        console.log('\n💰 Testing pricing for each event...');
        for (const event of events) {
            console.log(`\n📅 Event: ${event.title}`);
            console.log(`   Type: ${event.eventType}`);
            console.log(`   Is Paid: ${event.isPaid}`);
            console.log(`   Base Price: ₹${event.price}`);
            console.log(`   Admin Pricing: ${JSON.stringify(event.adminPricing)}`);
            if (event.isPaid) {
                if (event.eventType === 'open-to-all' && event.adminPricing && event.adminPricing.length > 0) {
                    if (userCollege) {
                        // Find admin that matches user's batch year
                        const matchingAdmin = collegeAdmins.find(admin => admin.batchYear?.toString() === testUser.batchYear);
                        if (matchingAdmin) {
                            // Find the pricing for this admin
                            const adminPricing = event.adminPricing.find(p => p.adminId === matchingAdmin.id);
                            if (adminPricing) {
                                console.log(`   ✅ Personalized Price: ₹${adminPricing.amount} (${matchingAdmin.fullName})`);
                            }
                            else {
                                console.log(`   ❌ No pricing found for admin ${matchingAdmin.fullName}`);
                            }
                        }
                        else {
                            console.log(`   ❌ No admin found for batch year ${testUser.batchYear}`);
                        }
                    }
                    else {
                        console.log(`   ❌ User has no college reference`);
                    }
                }
                else if (event.eventType === 'college-specific') {
                    if (userCollege && event.targetCollege === userCollege.id) {
                        console.log(`   ✅ College-specific price: ₹${event.price}`);
                    }
                    else {
                        console.log(`   ❌ User not from target college`);
                    }
                }
            }
            else {
                console.log(`   ✅ Free event`);
            }
        }
        console.log('\n✅ Pricing test completed!');
    }
    catch (error) {
        console.error('❌ Error testing pricing:', error);
    }
};
// Run the test
testPricing()
    .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testPricing.js.map