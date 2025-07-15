"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugConnection = exports.testConnection = exports.handleSupabaseError = exports.getSupabase = exports.initializeSupabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
let supabase = null;
const initializeSupabase = () => {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
        }
        console.log('🔗 Initializing Supabase connection...');
        console.log('📡 Supabase URL:', supabaseUrl);
        console.log('🔑 Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'NOT SET');
        supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false // Disable session persistence for server-side usage
            },
            global: {
                headers: {
                    'User-Agent': 'DEVS-Society-Backend/1.0'
                }
            }
        });
    }
    return supabase;
};
exports.initializeSupabase = initializeSupabase;
const getSupabase = () => {
    if (!supabase) {
        // Auto-initialize if not already done
        return (0, exports.initializeSupabase)();
    }
    return supabase;
};
exports.getSupabase = getSupabase;
// Helper function for error handling
const handleSupabaseError = (error, operation) => {
    console.error(`❌ Supabase error during ${operation}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack
    });
    // Check if it's a network error
    if (error.message?.includes('fetch failed') || error.message?.includes('network')) {
        console.error('🌐 Network connectivity issue detected. This might be due to:');
        console.error('   - Internet connection problems');
        console.error('   - Firewall blocking the connection');
        console.error('   - Supabase service being down');
        console.error('   - ngrok tunnel issues');
    }
    throw new Error(`Database operation failed: ${operation}`);
};
exports.handleSupabaseError = handleSupabaseError;
// Connection test function with retry logic
const testConnection = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔍 Testing Supabase connection (attempt ${attempt}/${retries})...`);
            const supabase = (0, exports.getSupabase)();
            const { data, error } = await supabase
                .from('colleges')
                .select('count')
                .limit(1);
            if (error) {
                console.error(`❌ Supabase connection test failed (attempt ${attempt}):`, error);
                if (attempt < retries) {
                    console.log(`⏳ Retrying in 2 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                return false;
            }
            console.log('✅ Supabase connection successful!');
            return true;
        }
        catch (error) {
            console.error(`❌ Supabase connection test error (attempt ${attempt}):`, error);
            if (attempt < retries) {
                console.log(`⏳ Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            return false;
        }
    }
    return false;
};
exports.testConnection = testConnection;
// Enhanced connection test for debugging
const debugConnection = async () => {
    console.log('🔧 Debugging Supabase connection...');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    console.log('📋 Environment check:');
    console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing required environment variables');
        return;
    }
    try {
        const isConnected = await (0, exports.testConnection)(1);
        if (isConnected) {
            console.log('✅ Connection test passed');
        }
        else {
            console.log('❌ Connection test failed');
        }
    }
    catch (error) {
        console.error('❌ Connection test error:', error);
    }
};
exports.debugConnection = debugConnection;
exports.default = exports.getSupabase;
//# sourceMappingURL=supabase.js.map