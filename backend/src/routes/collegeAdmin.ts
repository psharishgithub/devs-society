import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { adminAuth, requireCollegeAccess, addCollegeFilter, validateTenureHead } from '../middleware/roleBasedAuth'
import AdminService from '../services/adminService'
import CollegeService from '../services/collegeService'
import UserService from '../services/userService'
import EventService from '../services/eventService'

const router = express.Router()

// All routes require admin authentication and active tenure
router.use(adminAuth, validateTenureHead, addCollegeFilter)

// ============ USER MANAGEMENT (College-Specific) ============

// @route   GET /api/college-admin/users
// @desc    Get users from admin's assigned college
// @access  College Admin
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query
    
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    // Get college info to filter by college name
    const college = await CollegeService.findById(admin.assignedCollege?.id)
    if (!college) {
      return res.status(403).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    let users
    let totalCount = 0

    if (search) {
      users = await UserService.searchUsers(search as string)
      // Filter by college
      users = users.filter(user => user.college === college.name)
      totalCount = users.length
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit)
      users = users.slice(skip, skip + Number(limit))
    } else {
      users = await UserService.getUsersByCollege(college.name)
      // Filter by role if specified
      if (role && role !== 'all') {
        users = users.filter(user => user.role === role)
      }
      totalCount = users.length
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit)
      users = users.slice(skip, skip + Number(limit))
    }

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasNext: (Number(page) - 1) * Number(limit) + users.length < totalCount,
        hasPrev: Number(page) > 1
      },
      college: {
        name: college.name,
        code: college.code,
        location: college.location
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/college-admin/users/:id
// @desc    Get single user details (college-specific)
// @access  College Admin
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    const user = await UserService.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Get college info to verify user belongs to admin's college
    const college = await CollegeService.findById(admin.assignedCollege?.id)
    if (!college || user.college !== college.name) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not in your college' 
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/college-admin/users/:id
// @desc    Update user information (college-specific)
// @access  College Admin
router.put('/users/:id', [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
  body('role').optional().isIn(['core-member', 'board-member', 'special-member', 'other']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    const { fullName, phone, role, isActive } = req.body

    // First verify user exists and belongs to admin's college
    const existingUser = await UserService.findById(req.params.id)
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    const college = await CollegeService.findById(admin.assignedCollege?.id)
    if (!college || existingUser.college !== college.name) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not in your college' 
      })
    }

    const user = await UserService.updateUser(req.params.id, { fullName, phone, role, isActive })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============ EVENT MANAGEMENT (College-Specific) ============

// @route   GET /api/college-admin/events
// @desc    Get events from admin's assigned college
// @access  College Admin
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { search, eventType, status, page = 1, limit = 20 } = req.query
    
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    let events
    let totalCount = 0

    if (search) {
      events = await EventService.searchEvents(search as string)
      // Filter by college
      events = events.filter(event => event.targetCollege === admin.assignedCollege?.id)
      totalCount = events.length
    } else {
      events = await EventService.getEventsByCollege(admin.assignedCollege?.id)
      totalCount = events.length
    }

    // Filter by event type if specified
    if (eventType && eventType !== 'all') {
      events = events.filter(event => event.eventType === eventType)
      totalCount = events.length
    }

    // Apply pagination
    const skip = (Number(page) - 1) * Number(limit)
    events = events.slice(skip, skip + Number(limit))

    // Add registration stats to each event
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const registrations = await EventService.getEventRegistrations(event.id)
      return {
        ...event,
        registrationCount: registrations.filter(reg => reg.status === 'confirmed').length,
        waitlistCount: registrations.filter(reg => reg.status === 'waitlisted').length,
        availableSpots: await EventService.getAvailableSpots(event.id)
      }
    }))

    res.json({
      success: true,
      events: eventsWithStats,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasNext: (Number(page) - 1) * Number(limit) + events.length < totalCount,
        hasPrev: Number(page) > 1
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/college-admin/events
// @desc    Create new event for college
// @access  College Admin
router.post('/events', [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('eventType').isIn(['workshop', 'seminar', 'competition', 'social', 'other']).withMessage('Invalid event type'),
  body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees must be a positive number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    const { title, description, date, time, location, eventType, category, maxAttendees, requirements, prizes, registrationDeadline, isPaid, price } = req.body

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
      eventType: eventType || 'college-specific',
      category: category || 'other',
      maxAttendees: maxAttendees || 100,
      requirements: requirements || [],
      prizes: prizes || [],
      registrationDeadline: registrationDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      targetCollege: admin.assignedCollege?.id,
      isPaid: isPaid || false,
      price: isPaid ? (price || 0) : 0,
      organizer: {
        adminId: req.admin!.id,
        name: admin.fullName || admin.username,
        contact: admin.email
      }
    }

    const event = await EventService.createEvent(eventData)

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    })
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/college-admin/events/:id
// @desc    Get single event details with registrations
// @access  College Admin
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    const event = await EventService.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // Verify event belongs to admin's college
    if (event.targetCollege !== admin.assignedCollege?.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Event not in your college' 
      })
    }

    // Get registrations
    const registrations = await EventService.getEventRegistrations(req.params.id)

    res.json({
      success: true,
      event: {
        ...event,
        registrations
      }
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/college-admin/events/:id
// @desc    Update event details
// @access  College Admin
router.put('/events/:id', [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('eventType').optional().isIn(['workshop', 'seminar', 'competition', 'social', 'other']).withMessage('Invalid event type'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be a positive number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    // First verify event exists and belongs to admin's college
    const existingEvent = await EventService.findById(req.params.id)
    if (!existingEvent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    if (existingEvent.targetCollege !== admin.assignedCollege?.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Event not in your college' 
      })
    }

    const { title, description, date, location, eventType, maxAttendees, registrationDeadline, isActive } = req.body

    const event = await EventService.updateEvent(req.params.id, {
      title,
      description,
      date,
      location,
      eventType,
      maxAttendees,
      registrationDeadline,
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
    console.error('Error updating event:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   DELETE /api/college-admin/events/:id
// @desc    Delete event (soft delete - sets isActive to false)
// @access  College Admin
router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    // First verify event exists and belongs to admin's college
    const existingEvent = await EventService.findById(req.params.id)
    if (!existingEvent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    if (existingEvent.targetCollege !== admin.assignedCollege?.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Event not in your college' 
      })
    }

    const result = await EventService.deleteEvent(req.params.id)
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============ DASHBOARD & ANALYTICS ============

// @route   GET /api/college-admin/dashboard
// @desc    Get college admin dashboard statistics
// @access  College Admin
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    const college = await CollegeService.findById(admin.assignedCollege?.id)
    if (!college) {
      return res.status(403).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    // Get statistics
    const [
      allUsers,
      allEvents,
      upcomingEvents
    ] = await Promise.all([
      UserService.getUsersByCollege(college.name),
      EventService.getEventsByCollege(admin.assignedCollege?.id),
      EventService.getUpcomingEvents()
    ])

    // Filter upcoming events for this college
    const collegeUpcomingEvents = upcomingEvents.filter(event => event.targetCollege === admin.assignedCollege?.id)

    // Calculate user statistics by role
    const usersByRole = allUsers.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    // Calculate event statistics
    const eventsByType = allEvents.reduce((acc: any, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {})

    // Get recent registrations across all college events
    const recentRegistrations = []
    for (const event of allEvents.slice(0, 5)) {
      const registrations = await EventService.getEventRegistrations(event.id)
      // Add event information and payment details to each registration
      const registrationsWithEventInfo = registrations.slice(0, 5).map(reg => ({
        ...reg,
        eventTitle: event.title,
        eventIsPaid: event.isPaid,
        paymentVerified: reg.paymentVerified,
        paymentId: reg.paymentId,
        paymentAmount: reg.paymentAmount,
        paymentCurrency: reg.paymentCurrency,
        paymentTimestamp: reg.paymentTimestamp
      }))
      recentRegistrations.push(...registrationsWithEventInfo)
    }

    res.json({
      success: true,
      college: {
        name: college.name,
        code: college.code,
        location: college.location
      },
      stats: {
        totalUsers: allUsers.length,
        totalEvents: allEvents.length,
        upcomingEvents: collegeUpcomingEvents.length,
        activeUsers: allUsers.filter(user => user.isActive).length,
        usersByRole,
        eventsByType
      },
      recentData: {
        recentUsers: allUsers.slice(0, 5),
        upcomingEvents: collegeUpcomingEvents.slice(0, 5),
        recentRegistrations: recentRegistrations.slice(0, 10)
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/college-admin/analytics
// @desc    Get detailed analytics for college admin
// @access  College Admin
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query
    
    const admin = await AdminService.findById(req.admin!.id)
    if (!admin?.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'No college assignment found' 
      })
    }

    const college = await CollegeService.findById(admin.assignedCollege?.id)
    if (!college) {
      return res.status(403).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    // Get all users and events for this college
    const [users, events] = await Promise.all([
      UserService.getUsersByCollege(college.name),
      EventService.getEventsByCollege(admin.assignedCollege?.id)
    ])

    // Calculate analytics based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Filter data by period
    const periodUsers = users.filter(user => new Date(user.createdAt) >= startDate)
    const periodEvents = events.filter(event => new Date(event.createdAt) >= startDate)

    // Get registration data for period events
    const registrationData = []
    for (const event of periodEvents) {
      const registrations = await EventService.getEventRegistrations(event.id)
      registrationData.push({
        eventId: event.id,
        eventTitle: event.title,
        totalRegistrations: registrations.length,
        confirmedRegistrations: registrations.filter(reg => reg.status === 'confirmed').length,
        waitlisted: registrations.filter(reg => reg.status === 'waitlisted').length
      })
    }

    res.json({
      success: true,
      period,
      analytics: {
        userGrowth: {
          total: users.length,
          newInPeriod: periodUsers.length,
          byRole: periodUsers.reduce((acc: any, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1
            return acc
          }, {})
        },
        eventMetrics: {
          total: events.length,
          newInPeriod: periodEvents.length,
          byType: periodEvents.reduce((acc: any, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1
            return acc
          }, {}),
          registrationData
        }
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router 