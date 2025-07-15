"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables FIRST
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const supabase_1 = require("./database/supabase");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const events_1 = __importDefault(require("./routes/events"));
const admin_1 = __importDefault(require("./routes/admin"));
const superAdmin_1 = __importDefault(require("./routes/superAdmin"));
const collegeAdmin_1 = __importDefault(require("./routes/collegeAdmin"));
const public_1 = __importDefault(require("./routes/public"));
const eventforms_1 = __importDefault(require("./routes/eventforms"));
const qrCode_1 = __importDefault(require("./routes/qrCode"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5050;
// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// })
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// app.use(limiter) // Disabled for development
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/events', events_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/super-admin', superAdmin_1.default);
app.use('/api/college-admin', collegeAdmin_1.default);
app.use('/api/public', public_1.default);
app.use('/api/event-forms', eventforms_1.default);
app.use('/api/qr-code', qrCode_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Devs Portal API is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});
// Database connection
const connectDB = async () => {
    try {
        console.log('🔗 Connecting to Supabase database...');
        // Initialize Supabase client
        (0, supabase_1.initializeSupabase)();
        console.log('✅ Supabase client initialized');
        // Test the connection with retries
        console.log('🔍 Testing database connection...');
        const isConnected = await (0, supabase_1.testConnection)(3);
        if (!isConnected) {
            console.error('❌ Database connection failed after retries');
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Check your internet connection');
            console.log('2. Verify Supabase environment variables');
            console.log('3. Check if Supabase service is running');
            console.log('4. If using ngrok, try restarting the tunnel');
            console.log('5. Check firewall settings');
            // Don't exit immediately, give it another try
            console.log('\n⏳ Retrying connection in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            const retryConnected = await (0, supabase_1.testConnection)(2);
            if (!retryConnected) {
                throw new Error('Supabase connection failed after all retries');
            }
        }
        console.log('✅ Supabase connection verified and ready!');
    }
    catch (error) {
        console.error('❌ Database connection error:', error);
        console.log('\n💡 If you\'re using ngrok, try these solutions:');
        console.log('1. Restart your ngrok tunnel');
        console.log('2. Check if your Supabase project is active');
        console.log('3. Verify your environment variables');
        console.log('4. Try running: node test_supabase_connection.js');
        // For development, don't exit immediately
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        else {
            console.log('⚠️  Continuing in development mode despite database issues...');
        }
    }
};
// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 API available at http://localhost:${PORT}/api`);
        console.log(`💾 Database: Supabase (PostgreSQL)`);
    });
};
startServer().catch(console.error);
//# sourceMappingURL=index.js.map