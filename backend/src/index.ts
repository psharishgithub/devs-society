// Load environment variables FIRST
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { initializeSupabase, testConnection } from './database/supabase'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import eventRoutes from './routes/events'
import adminRoutes from './routes/admin'
import superAdminRoutes from './routes/superAdmin'
import collegeAdminRoutes from './routes/collegeAdmin'
import publicRoutes from './routes/public'
import eventFormRoutes from './routes/eventforms'
import qrCodeRoutes from './routes/qrCode'

const app = express()
const PORT = process.env.PORT || 5050

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// })

// Middleware
app.use(helmet())
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}))
// app.use(limiter) // Disabled for development
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/college-admin', collegeAdminRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/event-forms', eventFormRoutes)
app.use('/api/qr-code', qrCodeRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Devs Portal API is running' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

// Database connection
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to Supabase database...')
    
    // Initialize Supabase client
    initializeSupabase()
    console.log('✅ Supabase client initialized')
    
    // Test the connection with retries
    console.log('🔍 Testing database connection...')
    const isConnected = await testConnection(3)
    
    if (!isConnected) {
      console.error('❌ Database connection failed after retries')
      console.log('\n🔧 Troubleshooting steps:')
      console.log('1. Check your internet connection')
      console.log('2. Verify Supabase environment variables')
      console.log('3. Check if Supabase service is running')
      console.log('4. If using ngrok, try restarting the tunnel')
      console.log('5. Check firewall settings')
      
      // Don't exit immediately, give it another try
      console.log('\n⏳ Retrying connection in 5 seconds...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const retryConnected = await testConnection(2)
      if (!retryConnected) {
        throw new Error('Supabase connection failed after all retries')
      }
    }
    
    console.log('✅ Supabase connection verified and ready!')
  } catch (error) {
    console.error('❌ Database connection error:', error)
    console.log('\n💡 If you\'re using ngrok, try these solutions:')
    console.log('1. Restart your ngrok tunnel')
    console.log('2. Check if your Supabase project is active')
    console.log('3. Verify your environment variables')
    console.log('4. Try running: node test_supabase_connection.js')
    
    // For development, don't exit immediately
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      console.log('⚠️  Continuing in development mode despite database issues...')
    }
  }
}

// Start server
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌐 API available at http://localhost:${PORT}/api`)
    console.log(`💾 Database: Supabase (PostgreSQL)`)
  })
}

startServer().catch(console.error) 