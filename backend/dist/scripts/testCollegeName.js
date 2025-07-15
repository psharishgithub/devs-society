"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../services/userService"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
async function testCollegeName() {
    try {
        console.log('🔍 Testing College Name Resolution...\n');
        // Get all users
        const { users } = await userService_1.default.getAllUsers(1, 10, false);
        console.log(`📊 Found ${users.length} users:\n`);
        for (const user of users) {
            console.log(`👤 User: ${user.fullName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   College field: "${user.college}"`);
            console.log(`   CollegeRef: "${user.collegeRef}"`);
            console.log(`   Batch Year: ${user.batchYear}`);
            console.log('');
            // If collegeRef exists, try to fetch the college name
            if (user.collegeRef) {
                try {
                    const college = await collegeService_1.default.findById(user.collegeRef);
                    if (college) {
                        console.log(`   ✅ College name from ID: "${college.name}"`);
                    }
                    else {
                        console.log(`   ❌ College not found for ID: ${user.collegeRef}`);
                    }
                }
                catch (error) {
                    console.log(`   ❌ Error fetching college: ${error}`);
                }
            }
            else {
                console.log(`   ⚠️  No collegeRef found`);
            }
            console.log('---');
        }
        // Test a specific user by email
        const testEmail = '230701091@rajalakshmi.edu.in';
        console.log(`\n🔍 Testing specific user: ${testEmail}`);
        const specificUser = await userService_1.default.findByEmail(testEmail);
        if (specificUser) {
            console.log(`   Name: ${specificUser.fullName}`);
            console.log(`   College: "${specificUser.college}"`);
            console.log(`   CollegeRef: "${specificUser.collegeRef}"`);
            if (specificUser.collegeRef) {
                const college = await collegeService_1.default.findById(specificUser.collegeRef);
                if (college) {
                    console.log(`   ✅ Resolved college name: "${college.name}"`);
                }
            }
        }
        else {
            console.log(`   ❌ User not found`);
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
// Run the test
testCollegeName()
    .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testCollegeName.js.map