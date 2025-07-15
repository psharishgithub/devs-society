"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const testAdminLoginEndpoint = async () => {
    try {
        console.log('🔍 Testing Admin Login Endpoint...\n');
        const API_URL = 'http://localhost:5050/api/admin/login';
        // Test cases with the new password
        const testCases = [
            {
                name: 'System Administrator (super-admin)',
                data: {
                    identifier: 'admin@devs-society.com',
                    password: 'Admin123!'
                }
            },
            {
                name: 'Hursun (admin) by email',
                data: {
                    identifier: 'hursun@gmail.com',
                    password: 'Admin123!'
                }
            },
            {
                name: 'Hursun (admin) by username',
                data: {
                    identifier: 'hursun',
                    password: 'Admin123!'
                }
            },
            {
                name: 'IITD Admin by email',
                data: {
                    identifier: 'admin.iitd@devs-society.com',
                    password: 'Admin123!'
                }
            },
            {
                name: 'IITD Admin by username',
                data: {
                    identifier: 'admin_iitd',
                    password: 'Admin123!'
                }
            },
            {
                name: 'IITB Admin by email',
                data: {
                    identifier: 'admin.iitb@devs-society.com',
                    password: 'Admin123!'
                }
            },
            {
                name: 'NITK Admin by email',
                data: {
                    identifier: 'admin.nitk@devs-society.com',
                    password: 'Admin123!'
                }
            },
            {
                name: 'Gokul by email',
                data: {
                    identifier: 'gokul@gmail.com',
                    password: 'Admin123!'
                }
            }
        ];
        for (const testCase of testCases) {
            console.log(`Testing: ${testCase.name}`);
            console.log(`  Identifier: ${testCase.data.identifier}`);
            try {
                const response = await axios_1.default.post(API_URL, testCase.data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`  ✅ Success! Status: ${response.status}`);
                console.log(`  Message: ${response.data.message}`);
                console.log(`  Role: ${response.data.admin?.role}`);
                console.log(`  Token: ${response.data.token ? 'Present' : 'Missing'}`);
                console.log(`  Assigned College: ${response.data.admin?.assignedCollege || 'None'}`);
            }
            catch (error) {
                console.log(`  ❌ Failed! Status: ${error.response?.status || 'Network Error'}`);
                console.log(`  Error: ${error.response?.data?.message || error.message}`);
                if (error.response?.data?.errors) {
                    console.log(`  Validation Errors:`);
                    error.response.data.errors.forEach((err) => {
                        console.log(`    - ${err.msg}`);
                    });
                }
            }
            console.log('');
        }
        console.log('✅ Admin login endpoint test completed!');
    }
    catch (error) {
        console.error('❌ Error testing admin login endpoint:', error);
    }
};
// Run the test
testAdminLoginEndpoint();
//# sourceMappingURL=testAdminLoginEndpoint.js.map