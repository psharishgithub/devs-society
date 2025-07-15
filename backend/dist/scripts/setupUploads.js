"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function setupUploads() {
    try {
        console.log('📁 Setting up uploads directory...');
        const uploadsDir = path_1.default.join(__dirname, '../../uploads');
        const photosDir = path_1.default.join(uploadsDir, 'photos');
        // Create uploads directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            console.log('✅ Created uploads directory');
        }
        else {
            console.log('✅ Uploads directory already exists');
        }
        // Create photos subdirectory if it doesn't exist
        if (!fs_1.default.existsSync(photosDir)) {
            fs_1.default.mkdirSync(photosDir, { recursive: true });
            console.log('✅ Created photos directory');
        }
        else {
            console.log('✅ Photos directory already exists');
        }
        console.log('🎉 Uploads directory setup completed!');
        console.log('📂 Path:', photosDir);
    }
    catch (error) {
        console.error('❌ Error setting up uploads directory:', error);
        process.exit(1);
    }
}
// Run the script
setupUploads()
    .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=setupUploads.js.map