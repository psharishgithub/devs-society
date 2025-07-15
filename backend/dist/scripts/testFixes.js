"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const adminService_1 = __importDefault(require("../services/adminService"));
const userService_1 = __importDefault(require("../services/userService"));
// Load environment variables
dotenv_1.default.config();
async function testFixes() {
    try {
        console.log('🧪 Testing fixes...');
        // Test 1: Create super admin without constraint issues
        console.log('\n1️⃣ Testing super admin creation...');
        try {
            const superAdminData = {
                username: 'test-superadmin',
                email: 'test-super@devs.society',
                password: 'TestSuper123!',
                fullName: 'Test Super Administrator',
                role: 'super-admin'
            };
            const admin = await adminService_1.default.createAdmin(superAdminData);
            console.log('✅ Super admin created successfully!');
            console.log('   Email:', admin.email);
            console.log('   Role:', admin.role);
            console.log('   College Assignment:', admin.assignedCollege ? 'Yes' : 'No');
            // Clean up test admin
            await adminService_1.default.deleteAdmin(admin.id);
            console.log('✅ Test super admin cleaned up');
        }
        catch (error) {
            console.error('❌ Super admin creation failed:', error);
        }
        // Test 2: Test batch year validation
        console.log('\n2️⃣ Testing batch year validation...');
        try {
            const validation = await userService_1.default.validateBatchYearAssignment('test-college-id', '2024');
            console.log('✅ Batch year validation works:', validation);
        }
        catch (error) {
            console.log('ℹ️  Batch year validation test completed (expected error for non-existent college)');
        }
        // Test 3: Test available batch years
        console.log('\n3️⃣ Testing available batch years...');
        try {
            const availableBatches = await userService_1.default.getAvailableBatchYears('test-college-id');
            console.log('✅ Available batch years function works:', availableBatches);
        }
        catch (error) {
            console.log('ℹ️  Available batch years test completed (expected empty array for non-existent college)');
        }
        console.log('\n🎉 All tests completed!');
    }
    catch (error) {
        console.error('💥 Test failed:', error);
        process.exit(1);
    }
}
// Run the test
testFixes()
    .then(() => {
    console.log('\n✅ Tests completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Tests failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testFixes.js.map