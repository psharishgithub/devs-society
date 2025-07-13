import express from 'express'
import { body, validationResult } from 'express-validator'
import EventService from '../services/eventService'
import UserService from '../services/userService'
import auth from '../middleware/auth'
import CollegeService from '../services/collegeService'
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const router = express.Router()

const razorpay = new Razorpay({ 
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RVKFS8WX756Anx', 
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'kpUZ6zd9t5q7VRM2c76xnqdo'
})

// @route   GET /api/events
// @desc    Get all active events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search, eventType, college } = req.query
    
    let events
    if (search) {
      events = await EventService.searchEvents(search as string)
    } else if (college) {
      events = await EventService.getEventsByCollege(college as string)
    } else {
      events = await EventService.getAllEvents()
    }

    res.json({
      success: true,
      count: events.length,
      events
    })
  } catch (error) {
    console.error('Events fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   GET /api/events/upcoming
// @desc    Get upcoming events only
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const events = await EventService.getUpcomingEvents()

    res.json({
      success: true,
      count: events.length,
      events
    })
  } catch (error) {
    console.error('Upcoming events fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   GET /api/events/with-pricing
// @desc    Get events with personalized pricing based on user's college and batch year
// @access  Private
router.get('/with-pricing', auth, async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get user details to determine college and batch year
    const user = await UserService.findById(userId)
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Get all events
    const events = await EventService.getAllEvents()
    
    // Get user's college info
    let userCollege = null
    if (user.collegeRef) {
      userCollege = await CollegeService.findById(user.collegeRef)
    }

    // Process events to add personalized pricing
    const eventsWithPricing = await Promise.all(
      events.map(async (event) => {
        let personalizedPrice = event.price || 0
        let priceInfo: {
          isPaid: boolean
          price: number
          adminName: string | null
          collegeName: string | null
          batchYear: string | null
        } = {
          isPaid: event.isPaid,
          price: personalizedPrice,
          adminName: null,
          collegeName: null,
          batchYear: null
        }

        if (event.isPaid) {
          if (event.eventType === 'open-to-all' && event.adminPricing && event.adminPricing.length > 0) {
            // For open-to-all events, find the admin that matches user's college and batch year
            if (userCollege) {
              // Get admins for user's college
              const AdminService = require('../services/adminService').default
              const collegeAdmins = await AdminService.getAdminsByCollege(userCollege.id, true)
              
              // Find admin that matches user's batch year
              const matchingAdmin = collegeAdmins.find((admin: any) => 
                admin.batchYear?.toString() === user.batchYear
              )
              
              if (matchingAdmin) {
                // Find the pricing for this admin
                const adminPricing = event.adminPricing.find(p => p.adminId === matchingAdmin.id)
                if (adminPricing) {
                  personalizedPrice = adminPricing.amount
                  priceInfo = {
                    isPaid: true,
                    price: personalizedPrice,
                    adminName: matchingAdmin.fullName,
                    collegeName: userCollege.name,
                    batchYear: user.batchYear
                  }
                }
              }
            }
          } else if (event.eventType === 'college-specific') {
            // For college-specific events, check if user's college matches
            if (userCollege && event.targetCollege === userCollege.id) {
              priceInfo = {
                isPaid: true,
                price: event.price || 0,
                adminName: null,
                collegeName: userCollege.name,
                batchYear: null
              }
            } else {
              // User is not from the target college, so event is not available
              priceInfo = {
                isPaid: false,
                price: 0,
                adminName: null,
                collegeName: null,
                batchYear: null
              }
            }
          }
        }

        return {
          ...event,
          price: personalizedPrice,
          priceInfo
        }
      })
    )

    res.json({
      success: true,
      events: eventsWithPricing,
      userInfo: {
        college: user.college,
        batchYear: user.batchYear,
        collegeRef: user.collegeRef
      }
    })
  } catch (error) {
    console.error('Error fetching events with pricing:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   GET /api/events/test-admins
// @desc    Test endpoint to check admin data
// @access  Private
router.get('/test-admins', async (req, res) => {
  try {
    console.log('Testing admin data...');
    
    // Simple test - just return success for now
    res.json({ 
      success: true, 
      message: 'Test endpoint working - UPDATED VERSION',
      timestamp: new Date().toISOString(),
      allAdminsCount: 0,
      adminRoleCount: 0,
      sampleAdmin: null
    });
  } catch (error: any) {
    console.error('Error testing admins:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/events/admins-for-events
// @desc    Get all admins for open-to-all events (user-facing)
// @access  Private
router.get('/admins-for-events', async (req, res) => {
  try {
    console.log('Getting admins for events...');
    
    // Get real admin data from database
    const AdminService = require('../services/adminService').default;
    const adminsByCollege = await AdminService.getAdminsForEvents();
    
    console.log('Admins by college result:', adminsByCollege);
    res.json({ 
      success: true, 
      adminsByCollege,
      timestamp: new Date().toISOString(),
      message: 'Real-time admin data from database'
    });
  } catch (error: any) {
    console.error('Error fetching admins for events:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event with registrations
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await EventService.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // Get registrations for this event
    const registrations = await EventService.getEventRegistrations(req.params.id)

    res.json({
      success: true,
      event: {
        ...event,
        registrations
      }
    })
  } catch (error) {
    console.error('Event fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   POST /api/events
// @desc    Create a new event (admin only)
// @access  Private
router.post('/',
  auth,
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
    body('eventType').isIn(['workshop', 'seminar', 'competition', 'social', 'other']).withMessage('Invalid event type'),
    body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be a positive number')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        })
      }

      const { 
        title, 
        description, 
        date, 
        time,
        location, 
        eventType, 
        category,
        maxAttendees, 
        targetCollege,
        requirements,
        prizes,
        registrationDeadline,
        isPaid,
        price
      } = req.body

      // Validate payment fields
      if (isPaid && (!price || price <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Price is required for paid events and must be greater than 0' 
        })
      }

      const eventData = {
        title,
        description,
        date,
        time: time || '10:00',
        location,
        eventType: eventType || 'open-to-all',
        category: category || 'other',
        maxAttendees: maxAttendees || 100,
        targetCollege,
        organizer: {
          adminId: req.user.id,
          name: 'Admin',
          contact: req.user.email
        },
        requirements: requirements || [],
        prizes: prizes || [],
        registrationDeadline: registrationDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        isPaid: isPaid || false,
        price: isPaid ? (price || 0) : 0
      }

      const event = await EventService.createEvent(eventData)

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event
      })
    } catch (error) {
      console.error('Event creation error:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      })
    }
  }
)

// @route   PUT /api/events/:id
// @desc    Update event details
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, location, eventType, maxAttendees, isActive } = req.body

    const event = await EventService.updateEvent(req.params.id, {
      title,
      description,
      date,
      location,
      eventType,
      maxAttendees,
      isActive
    })

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    })
  } catch (error) {
    console.error('Event update error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = req.user.id

    // Get event details to check if it's paid
    const event = await EventService.findById(eventId)
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // For paid events, registration should only happen through payment verification
    if (event.isPaid) {
      return res.status(400).json({ 
        success: false, 
        message: 'This is a paid event. Please complete payment to register.' 
      })
    }

    // Check if event exists and if user can register
    const canRegister = await EventService.canUserRegister(eventId, userId)
    if (!canRegister.canRegister) {
      return res.status(400).json({ 
        success: false, 
        message: canRegister.reason 
      })
    }

    // Register user for event
    const registration = await EventService.registerForEvent(eventId, userId)

    res.json({
      success: true,
      message: 'Successfully registered for event',
      registration
    })
  } catch (error) {
    console.error('Event registration error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})



// @route   GET /api/events/:id/registration-status
// @desc    Check user's registration status for an event
// @access  Private
router.get('/:id/registration-status', auth, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = req.user.id

    // Get user's registrations for this event
    const registrations = await EventService.getUserRegistrations(userId)
    const userRegistration = registrations.find(reg => reg.eventId === eventId)

    if (!userRegistration) {
      return res.json({
        success: true,
        isRegistered: false
      })
    }

    res.json({
      success: true,
      isRegistered: true,
      status: userRegistration.status
    })
  } catch (error) {
    console.error('Registration status check error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// Test Razorpay configuration
router.get('/test-razorpay', auth, async (req, res) => {
  try {
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 rupee
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        test: 'true'
      }
    })
    res.json({ 
      success: true, 
      message: 'Razorpay is working correctly',
      order: testOrder
    })
  } catch (error: any) {
    console.error('Razorpay test error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Razorpay configuration error',
      error: error?.message || 'Unknown error'
    })
  }
})

// Create Razorpay order for event registration
router.post('/:id/razorpay-order', auth, async (req, res) => {
  // Block admin users from accessing this endpoint
  if (req.user.role === 'core-member' || req.user.role === 'board-member') {
    return res.status(403).json({ success: false, message: 'Admins cannot register for events as users.' });
  }
  try {
    const { adminId } = req.body
    const eventId = req.params.id
    const userId = req.user.id // Get user ID from authenticated request

    // Get event details
    console.log('Looking for event with ID:', eventId)
    const event = await EventService.findById(eventId)
    console.log('Event found:', event ? 'Yes' : 'No')
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    
    console.log('Event details:', {
      id: event.id,
      title: event.title,
      isPaid: event.isPaid,
      eventType: event.eventType,
      price: event.price,
      adminPricing: event.adminPricing
    })

    if (!event.isPaid) {
      return res.status(400).json({ success: false, message: 'This event is free' })
    }

    let amount = 0

    // Handle different event types
    console.log('Processing event type:', event.eventType)
    console.log('Admin ID from request:', adminId)
    console.log('Event admin pricing:', event.adminPricing)
    
    if (event.eventType === 'open-to-all' && event.adminPricing && event.adminPricing.length > 0) {
      // Find the specific admin pricing
      console.log('Looking for admin ID:', adminId, 'in adminPricing:', event.adminPricing)
      const adminPricing = event.adminPricing.find(p => p.adminId === adminId)
      console.log('Found admin pricing:', adminPricing)
      if (!adminPricing) {
        console.log('Available admin pricing entries:', event.adminPricing.map(p => ({ adminId: p.adminId, amount: p.amount })))
        return res.status(400).json({ success: false, message: 'Invalid admin selection' })
      }
      amount = adminPricing.amount * 100 // Convert to paise
    } else if (event.eventType === 'college-specific') {
      amount = event.price * 100 // Convert to paise
    } else {
      return res.status(400).json({ success: false, message: 'Invalid event pricing configuration' })
    }
    
    console.log('Calculated amount:', amount)

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' })
    }

    // Create Razorpay order
    console.log('Creating Razorpay order with amount:', Math.round(amount))
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: `evt_${eventId.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        eventId: eventId,
        userId: userId,
        adminId: adminId,
        eventTitle: event.title
      }
    })
    console.log('Razorpay order created successfully:', order.id)

    res.json({ 
      success: true, 
      order,
      event: {
        id: event.id,
        title: event.title,
        amount: amount / 100
      }
    })
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    console.error('Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      eventId: req.params.id,
      userId: req.user?.id,
      adminId: req.body?.adminId
    })
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error?.message || 'Unknown error'
    })
  }
})

// Verify Razorpay payment
router.post('/:id/verify-payment', auth, async (req, res) => {
  // Block admin users from accessing this endpoint
  if (req.user.role === 'core-member' || req.user.role === 'board-member') {
    return res.status(403).json({ success: false, message: 'Admins cannot register for events as users.' });
  }
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      adminId 
    } = req.body

    const eventId = req.params.id
    const userId = req.user.id // Get user ID from authenticated request

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'kpUZ6zd9t5q7VRM2c76xnqdo')
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' })
    }

    // Get event and user details
    const [event, user] = await Promise.all([
      EventService.findById(eventId),
      UserService.findById(userId)
    ])

    if (!event || !user) {
      return res.status(404).json({ success: false, message: 'Event or user not found' })
    }

    // Register user for event with payment verification
    const registration = await EventService.registerForEventWithPayment(eventId, userId, {
      paymentId: razorpay_payment_id,
      amount: event.isPaid ? (event.eventType === 'open-to-all' ? 
        event.adminPricing?.find(p => p.adminId === adminId)?.amount || event.price : 
        event.price) : 0,
      currency: 'INR',
      verified: true
    })

    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS 
        }
      })

      let adminInfo = ''
      if (event.eventType === 'open-to-all' && adminId) {
        const AdminService = require('../services/adminService').default
        const admin = await AdminService.findById(adminId)
        if (admin) {
          adminInfo = `\nAdmin: ${admin.fullName} (${admin.collegeInfo?.name || 'Unknown College'})`
        }
      }

      const emailContent = `
Hi ${user.fullName},

Your registration for "${event.title}" has been confirmed!

Event Details:
- Title: ${event.title}
- Date: ${event.date}
- Time: ${event.time}
- Location: ${event.location}${adminInfo}

Payment Details:
- Payment ID: ${razorpay_payment_id}
- Amount: ₹${event.isPaid ? (event.eventType === 'open-to-all' ? 
  event.adminPricing?.find(p => p.adminId === adminId)?.amount || event.price : 
  event.price) : 0}

Registration Status: ${registration.status}

Thank you for registering!

Best regards,
Devs Society Team
      `.trim()

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Registration Confirmed: ${event.title}`,
        text: emailContent,
        html: emailContent.replace(/\n/g, '<br>')
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the payment verification if email fails
    }

    res.json({ 
      success: true, 
      message: 'Payment verified and registration confirmed',
      registration: {
        id: registration.id,
        status: registration.status
      }
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ success: false, message: 'Payment verification failed' })
  }
})

export default router 