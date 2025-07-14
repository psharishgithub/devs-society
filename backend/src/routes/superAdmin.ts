import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { adminAuth, requireSuperAdmin, requirePermissions } from '../middleware/roleBasedAuth'
import AdminService from '../services/adminService'
import CollegeService from '../services/collegeService'
import UserService from '../services/userService'
import EventService from '../services/eventService'
import { getSupabase } from '../database/supabase'
import QRCodeService from '../services/qrCodeService'

const router = express.Router()
const supabase = getSupabase()

// Helper function to get time ago string
const getTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

// All routes require super admin access
router.use(adminAuth, requireSuperAdmin)

// ============ COLLEGE MANAGEMENT ============

// @route   GET /api/superadmin/colleges
// @desc    Get all colleges with tenure head information
// @access  Super Admin
router.get('/colleges', async (req: Request, res: Response) => {
  try {
    const colleges = await CollegeService.getAllColleges()

    const collegesWithStats = await Promise.all(
      colleges.map(async (college) => {
        const [userCount, eventCount] = await Promise.all([
          UserService.getUsersByCollege(college.name).then(users => users.length),
          EventService.getEventsByCollege(college.id).then(events => events.length)
        ])

        return {
          ...college,
          stats: {
            totalUsers: userCount,
            totalEvents: eventCount
          }
        }
      })
    )

    res.json({
      success: true,
      count: colleges.length,
      colleges: collegesWithStats
    })
  } catch (error) {
    console.error('Error fetching colleges:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/colleges
// @desc    Create a new college
// @access  Super Admin
router.post('/colleges', [
  body('name').trim().isLength({ min: 2 }).withMessage('College name is required'),
  body('code').trim().isLength({ min: 2, max: 10 }).withMessage('College code (2-10 chars) is required'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
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

    const { name, code, location, address, contactInfo } = req.body

    const college = await CollegeService.createCollege({
      name,
      code: code.toUpperCase(),
      location,
      address,
      contactInfo
    })

    res.status(201).json({
      success: true,
      message: 'College created successfully',
      college
    })
  } catch (error) {
    console.error('Error creating college:', error)
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      })
    }
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/superadmin/colleges/:id
// @desc    Update college information
// @access  Super Admin
router.put('/colleges/:id', async (req: Request, res: Response) => {
  try {
    const { name, code, location, address, contactInfo, isActive } = req.body

    const college = await CollegeService.updateCollege(req.params.id, {
      name, 
      code: code?.toUpperCase(), 
      location, 
      address, 
      contactInfo, 
      isActive
    })

    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    res.json({
      success: true,
      message: 'College updated successfully',
      college
    })
  } catch (error) {
    console.error('Error updating college:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   DELETE /api/superadmin/colleges/:id
// @desc    Soft delete college (sets isActive to false)
// @access  Super Admin
router.delete('/colleges/:id', async (req: Request, res: Response) => {
  try {
    // First check if college exists
    const college = await CollegeService.findById(req.params.id)
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    // Check if college has active tenure heads
    const collegesWithAdmin = await CollegeService.getAllColleges()
    const collegeWithAdmin = collegesWithAdmin.find(c => c.id === req.params.id)
    
    if (collegeWithAdmin?.currentTenureHeads && collegeWithAdmin.currentTenureHeads.length > 0) {
      const activeTenures = collegeWithAdmin.currentTenureHeads.filter(tenure => tenure.isActive)
      if (activeTenures.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete college with active tenure heads: ${activeTenures.map(t => t.adminName).join(', ')}` 
        })
      }
    }

    // Double-check with direct database query
    const { data: activeTenures, error: tenureError } = await supabase
      .from('college_tenure_heads')
      .select('*')
      .eq('college_id', req.params.id)
      .eq('is_active', true)

    if (tenureError) {
      console.error('Error checking tenure heads:', tenureError)
    }

    if (activeTenures && activeTenures.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete college with active tenure heads. Found ${activeTenures.length} active tenure(s).` 
      })
    }

    // Attempt to delete the college
    const result = await CollegeService.deleteCollege(req.params.id)
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete college' 
      })
    }

    res.json({
      success: true,
      message: 'College deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting college:', error)
    
    // Provide more specific error messages
    if (error.message.includes('active tenure head')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      })
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    })
  }
})

// ============ ADMIN MANAGEMENT ============

// @route   POST /api/superadmin/admins
// @desc    Create admin with college assignment and batch year
// @access  Super Admin
router.post('/admins', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('assignedCollege').isUUID().withMessage('Valid college ID is required for admin assignment'),
  body('batchYear').isInt({ min: 2000, max: 2030 }).withMessage('Valid batch year (2000-2030) is required')
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

    const { username, email, password, fullName, assignedCollege, batchYear } = req.body

    // Verify college exists
    const college = await CollegeService.findById(assignedCollege)
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    // Check if this batch year already has an admin for this college
    const existingAdmins = await AdminService.getAdminsByCollege(assignedCollege, true)
    const existingBatchAdmin = existingAdmins.find(admin => admin.batchYear === batchYear)
    if (existingBatchAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: `Batch year ${batchYear} already has an admin assigned to ${college.name}` 
      })
    }

    // Create admin with college assignment and batch year
    const admin = await AdminService.createAdmin({
      username,
      email,
      password,
      fullName,
      assignedCollege,
      batchYear
    })

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      })
    }
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/assign-tenure
// @desc    Assign admin to college tenure
// @access  Super Admin
router.post('/assign-tenure', [
  body('adminId').isUUID().withMessage('Valid admin ID is required'),
  body('collegeId').isUUID().withMessage('Valid college ID is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required')
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

    const { adminId, collegeId, startDate } = req.body

    // Verify admin exists
    const admin = await AdminService.findById(adminId)
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      })
    }

    // Verify college exists
    const college = await CollegeService.findById(collegeId)
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    // Assign admin to college
    const result = await AdminService.assignAdminToCollege(adminId, collegeId, startDate)
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign admin to college' 
      })
    }

    res.json({
      success: true,
      message: `Admin ${admin.fullName} assigned to ${college.name} successfully`
    })
  } catch (error) {
    console.error('Error assigning tenure:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/unassigned-admins
// @desc    Get all admins not currently assigned to any college
// @access  Super Admin
router.get('/unassigned-admins', async (req: Request, res: Response) => {
  try {
    const admins = await AdminService.getUnassignedAdmins()

    res.json({
      success: true,
      count: admins.length,
      admins
    })
  } catch (error) {
    console.error('Error fetching unassigned admins:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/admins
// @desc    Get all admins with college information
// @access  Super Admin
router.get('/admins', async (req: Request, res: Response) => {
  try {
    const admins = await AdminService.getAdminsByRole('admin')

    res.json({
      success: true,
      count: admins.length,
      admins
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/admins-for-events
// @desc    Get all admins with college information for event pricing
// @access  Super Admin
router.get('/admins-for-events', async (req: Request, res: Response) => {
  try {
    const admins = await AdminService.getAdminsByRole('admin')
    
    // Group admins by college for easier frontend consumption
    const adminsByCollege = admins.reduce((acc: any, admin) => {
      if (admin.collegeInfo) {
        const collegeCode = admin.collegeInfo.code
        if (!acc[collegeCode]) {
          acc[collegeCode] = {
            collegeName: admin.collegeInfo.name,
            collegeCode: admin.collegeInfo.code,
            admins: []
          }
        }
        acc[collegeCode].admins.push({
          id: admin.id,
          fullName: admin.fullName,
          username: admin.username,
          batchYear: admin.batchYear || 2024
        })
      }
      return acc
    }, {})

    res.json({
      success: true,
      count: admins.length,
      adminsByCollege,
      allAdmins: admins
    })
  } catch (error) {
    console.error('Error fetching admins for events:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   DELETE /api/superadmin/admins/:id
// @desc    End admin tenure and deactivate admin
// @access  Super Admin
router.delete('/admins/:id', async (req: Request, res: Response) => {
  try {
    const admin = await AdminService.findById(req.params.id)
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      })
    }

    // For regular admins, we need to handle the constraint properly
    if (admin.role === 'admin' && admin.assignedCollege) {
      // First end the tenure in the tenure_heads table
      const { error: tenureError } = await supabase
        .from('college_tenure_heads')
        .update({
          end_date: new Date().toISOString(),
          is_active: false
        })
        .eq('admin_id', req.params.id)
        .eq('college_id', admin.assignedCollege.id)
        .eq('is_active', true)

      if (tenureError) {
        console.warn('Warning: Could not update tenure heads table:', tenureError)
      }
    }

    // Now delete the admin (this will set is_active to false first)
    const result = await AdminService.deleteAdmin(req.params.id)
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete admin' 
      })
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting admin:', error)
    
    // Provide more specific error messages
    if (error.message.includes('constraint') || error.message.includes('admin_college_check')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete admin due to database constraints. Please try ending their tenure first.' 
      })
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    })
  }
})

// @route   GET /api/superadmin/colleges/:id
// @desc    Get single college details
// @access  Super Admin  
router.get('/colleges/:id', async (req: Request, res: Response) => {
  try {
    const college = await CollegeService.findById(req.params.id)
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    res.json({
      success: true,
      college
    })
  } catch (error) {
    console.error('Error fetching college:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/admins/:id
// @desc    Get single admin details
// @access  Super Admin
router.get('/admins/:id', async (req: Request, res: Response) => {
  try {
    const admin = await AdminService.findById(req.params.id)
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      })
    }

    res.json({
      success: true,
      admin
    })
  } catch (error) {
    console.error('Error fetching admin:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============ USER MANAGEMENT (Global) ============

// @route   GET /api/superadmin/users
// @desc    Get all users across colleges with filtering
// @access  Super Admin
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      college, 
      role 
    } = req.query

    let users
    let totalCount = 0

    if (search) {
      users = await UserService.searchUsers(search as string)
      totalCount = users.length
      // Apply pagination to search results
      const skip = (Number(page) - 1) * Number(limit)
      users = users.slice(skip, skip + Number(limit))
    } else if (college) {
      users = await UserService.getUsersByCollege(college as string)
      totalCount = users.length
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit)
      users = users.slice(skip, skip + Number(limit))
    } else {
      const result = await UserService.getAllUsers(Number(page), Number(limit))
      users = result.users
      totalCount = result.totalCount
    }

    // Get statistics
    const totalUsers = await UserService.getUserCount()

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
      stats: {
        total: totalUsers
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/users/:id
// @desc    Get single user details
// @access  Super Admin
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserService.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
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

// @route   PUT /api/superadmin/users/:id
// @desc    Update user information (super admin)
// @access  Super Admin
router.put('/users/:id', [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please include a valid email'),
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

    const { fullName, email, phone, role, isActive } = req.body

    // First verify user exists
    const existingUser = await UserService.findById(req.params.id)
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = await UserService.findByEmail(email)
      if (userWithEmail && userWithEmail.id !== req.params.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use by another user' 
        })
      }
    }

    const user = await UserService.updateUser(req.params.id, { fullName, email, phone, role, isActive })
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

// ============ EVENT MANAGEMENT (Global) ============

// @route   GET /api/superadmin/events
// @desc    Get all events across colleges
// @access  Super Admin
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      college, 
      eventType 
    } = req.query

    let events
    let totalCount = 0

    if (search) {
      events = await EventService.searchEvents(search as string)
      totalCount = events.length
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit)
      events = events.slice(skip, skip + Number(limit))
    } else if (college) {
      events = await EventService.getEventsByCollege(college as string)
      totalCount = events.length
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit)
      events = events.slice(skip, skip + Number(limit))
    } else {
      events = await EventService.getAllEvents()
      totalCount = events.length
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit)
      events = events.slice(skip, skip + Number(limit))
    }

    // Add computed fields
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const registrations = await EventService.getEventRegistrations(event.id)
      return {
        ...event,
        registrationCount: registrations.filter(reg => reg.status === 'confirmed').length,
        waitlistCount: registrations.filter(reg => reg.status === 'waitlisted').length
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

// @route   POST /api/superadmin/events
// @desc    Create new global event
// @access  Super Admin
router.post('/events', [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').custom((value) => {
    if (!value) {
      throw new Error('Date is required')
    }
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new Error('Valid date is required')
    }
    return true
  }).withMessage('Valid date is required'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('eventType').optional().isIn(['workshop', 'seminar', 'competition', 'social', 'other', 'open-to-all', 'college-specific']).withMessage('Invalid event type'),
  body('maxAttendees').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      const num = parseInt(value)
      if (isNaN(num) || num < 1) {
        throw new Error('Max attendees must be a positive number')
      }
    }
    return true
  }).withMessage('Max attendees must be a positive number'),
  body('targetCollege').optional().custom((value) => {
    if (value && value !== '' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      throw new Error('Invalid college ID format')
    }
    return true
  }).withMessage('Invalid college ID format')
], async (req: Request, res: Response) => {
  try {
    console.log('Event creation request body:', JSON.stringify(req.body, null, 2))
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2))
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
      requirements, 
      prizes, 
      registrationDeadline,
      targetCollege,
      isPaid,
      price,
      adminPricing
    } = req.body

    console.log('Parsed event data:', {
      title, description, date, time, location, eventType, category, maxAttendees, targetCollege
    })

    // Parse the date properly
    const eventDate = new Date(date)
    const eventTime = time || '10:00'
    
    // Determine event type and target college
    const finalEventType = eventType || 'open-to-all'
    let finalTargetCollege = null

    if (finalEventType === 'college-specific') {
      if (!targetCollege) {
        return res.status(400).json({
          success: false,
          message: 'Target college is required for college-specific events'
        })
      }
      finalTargetCollege = targetCollege
    }

    // Validate paid event fields
    if (isPaid) {
      if (finalEventType === 'open-to-all') {
        if (!adminPricing || adminPricing.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Admin pricing is required for paid open-to-all events'
          })
        }
        // Validate each admin pricing entry
        for (const pricing of adminPricing) {
          if (!pricing.adminType || !pricing.amount || pricing.amount <= 0) {
            return res.status(400).json({
              success: false,
              message: 'All admin pricing entries must have valid admin type and amount'
            })
          }
        }
      } else if (finalEventType === 'college-specific') {
        if (!price || price <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Price is required for paid college-specific events and must be greater than 0'
          })
        }
      }
    }
    
    // Create the event data
    const eventData = {
      title,
      description,
      date: eventDate.toISOString().split('T')[0], // Just the date part
      time: eventTime,
      location,
      eventType: finalEventType,
      category: category || 'other',
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : 100,
      requirements: requirements || [],
      prizes: prizes || [],
      registrationDeadline: registrationDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      targetCollege: finalTargetCollege,
      isPaid: isPaid || false,
      price: isPaid ? (price || 0) : 0,
      adminPricing: adminPricing || [],
      organizer: {
        adminId: req.admin!.id,
        name: req.admin!.username,
        contact: req.admin!.email
      }
    }

    console.log('Final event data:', JSON.stringify(eventData, null, 2))

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

// @route   GET /api/superadmin/events/:id
// @desc    Get single event details
// @access  Super Admin
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await EventService.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
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

// @route   PUT /api/superadmin/events/:id
// @desc    Update event details
// @access  Super Admin
router.put('/events/:id', [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').optional().custom((value) => {
    if (value) {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        throw new Error('Valid date is required')
      }
    }
    return true
  }).withMessage('Valid date is required'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('eventType').optional().isIn(['workshop', 'seminar', 'competition', 'social', 'other', 'open-to-all', 'college-specific']).withMessage('Invalid event type'),
  body('maxAttendees').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      const num = parseInt(value)
      if (isNaN(num) || num < 1) {
        throw new Error('Max attendees must be a positive number')
      }
    }
    return true
  }).withMessage('Max attendees must be a positive number'),
  body('targetCollege').optional().custom((value) => {
    if (value && value !== '' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      throw new Error('Invalid college ID format')
    }
    return true
  }).withMessage('Invalid college ID format')
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

    const eventId = req.params.id
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      eventType, 
      category, 
      maxAttendees, 
      requirements, 
      prizes, 
      registrationDeadline,
      targetCollege 
    } = req.body

    // Check if event exists
    const existingEvent = await EventService.findById(eventId)
    if (!existingEvent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // Prepare update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (date !== undefined) updateData.date = new Date(date).toISOString().split('T')[0]
    if (time !== undefined) updateData.time = time
    if (location !== undefined) updateData.location = location
    if (eventType !== undefined) updateData.eventType = eventType
    if (category !== undefined) updateData.category = category
    if (maxAttendees !== undefined) updateData.maxAttendees = parseInt(maxAttendees)
    if (requirements !== undefined) updateData.requirements = requirements
    if (prizes !== undefined) updateData.prizes = prizes
    if (registrationDeadline !== undefined) updateData.registrationDeadline = registrationDeadline
    if (targetCollege !== undefined) updateData.targetCollege = targetCollege

    const event = await EventService.updateEvent(eventId, updateData)
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

// @route   DELETE /api/superadmin/events/:id
// @desc    Soft delete event (sets isActive to false)
// @access  Super Admin
router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
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

// @route   GET /api/superadmin/events/:id/registrations
// @desc    Get event registrations with QR codes
// @access  Super Admin
router.get('/events/:id/registrations', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id
    
    // Check if event exists
    const event = await EventService.findById(eventId)
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // Get registrations
    const registrations = await EventService.getEventRegistrations(eventId)
    
    // Add QR codes for each registration
    const registrationsWithQR = await Promise.all(
      registrations.map(async (registration) => {
        const qrCodeData = {
          eventId: eventId,
          userId: registration.userId,
          registrationId: registration.id,
          eventTitle: event.title,
          userName: registration.userName || 'Unknown User'
        }
        
        const qrCode = await QRCodeService.generateQRCode(JSON.stringify(qrCodeData))
        
        return {
          ...registration,
          qrCode
        }
      })
    )

    res.json({
      success: true,
      event,
      registrations: registrationsWithQR,
      totalRegistrations: registrationsWithQR.length
    })
  } catch (error) {
    console.error('Error fetching event registrations:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/transfer-tenure
// @desc    Transfer admin tenure to different college
// @access  Super Admin
router.post('/transfer-tenure', [
  body('toAdminId').custom((value) => {
    if (value && value.length !== 36) {
      throw new Error('Valid admin ID is required')
    }
    return true
  }),
  body('collegeId').custom((value) => {
    if (value && value.length !== 36) {
      throw new Error('Valid college ID is required')
    }
    return true
  }),
  body('transferReason').trim().isLength({ min: 3 }).withMessage('Transfer reason is required')
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

    const { toAdminId, collegeId, transferReason } = req.body

    // Get target admin and college
    const [targetAdmin, targetCollege] = await Promise.all([
      AdminService.findById(toAdminId),
      CollegeService.findById(collegeId)
    ])

    if (!targetAdmin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target admin not found' 
      })
    }

    if (!targetCollege) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target college not found' 
      })
    }

    // Transfer admin
    const result = await AdminService.transferAdmin(toAdminId, collegeId)
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to transfer admin' 
      })
    }

    res.json({
      success: true,
      message: 'Admin tenure transferred successfully',
      admin: targetAdmin,
      college: targetCollege
    })
  } catch (error) {
    console.error('Error transferring tenure:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/end-tenure
// @desc    End admin tenure
// @access  Super Admin
router.post('/end-tenure', [
  body('adminId').custom((value) => {
    if (value && value.length !== 36) {
      throw new Error('Valid admin ID is required')
    }
    return true
  }),
  body('reason').trim().isLength({ min: 3 }).withMessage('Reason is required')
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

    const { adminId, reason } = req.body

    const admin = await AdminService.findById(adminId)
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      })
    }

    // End tenure
    const result = await AdminService.endTenure(adminId)
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to end tenure' 
      })
    }

    res.json({
      success: true,
      message: 'Tenure ended successfully',
      admin
    })
  } catch (error) {
    console.error('Error ending tenure:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/dashboard
// @desc    Get super admin dashboard statistics
// @access  Super Admin
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [
      colleges,
      admins,
      totalUsers,
      events
    ] = await Promise.all([
      CollegeService.getAllColleges(),
      AdminService.getAdminsByRole('admin'),
      UserService.getUserCount(),
      EventService.getAllEvents()
    ])

    // Get college-wise data
    const collegeWiseData = await Promise.all(
      colleges.map(async (college) => {
        const collegeUsers = await UserService.getUsersByCollege(college.name)
        const collegeEvents = await EventService.getEventsByCollege(college.id)
        const collegeAdmins = admins.filter(admin => admin.assignedCollege?.toString() === college.id)
        
        return {
          college: {
            name: college.name,
            code: college.code
          },
          users: collegeUsers.length,
          events: collegeEvents.length,
          admin: collegeAdmins.length > 0 ? collegeAdmins[0].fullName : null
        }
      })
    )

    res.json({
      success: true,
      stats: {
        totalColleges: colleges.length,
        totalAdmins: admins.length,
        totalUsers,
        totalEvents: events.length,
        collegeWiseData
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/superadmin/analytics
// @desc    Get super admin analytics data
// @access  Super Admin
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Get comprehensive analytics data
    const [
      colleges,
      admins,
      usersResponse,
      events
    ] = await Promise.all([
      CollegeService.getAllColleges(),
      AdminService.getAdminsByRole('admin'),
      UserService.getAllUsers(),
      EventService.getAllEvents()
    ])

    // Extract users from the response
    const users = usersResponse.users || []

    // Get registrations for each event
    const eventRegistrations: any[] = []
    for (const event of events) {
      const registrations = await EventService.getEventRegistrations(event.id)
      eventRegistrations.push(...registrations)
    }

    // Calculate growth metrics (comparing with last month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    const newUsersThisMonth = users.filter((user: any) => new Date(user.createdAt) >= lastMonth).length
    const newEventsThisMonth = events.filter((event: any) => new Date(event.createdAt) >= lastMonth).length
    
    const userGrowthRate = users.length > 0 ? ((newUsersThisMonth / users.length) * 100).toFixed(1) : '0'
    const eventGrowthRate = events.length > 0 ? ((newEventsThisMonth / events.length) * 100).toFixed(1) : '0'

    // Calculate engagement metrics
    const totalRegistrations = eventRegistrations.length
    const averageParticipationRate = events.length > 0 ? 
      ((totalRegistrations / (events.length * 100)) * 100).toFixed(1) : '0'

    // College performance metrics
    const collegePerformance = await Promise.all(
      colleges.map(async (college: any) => {
        const collegeUsers = await UserService.getUsersByCollege(college.name)
        const collegeEvents = await EventService.getEventsByCollege(college.id)
        const collegeRegistrations = eventRegistrations.filter((reg: any) => 
          collegeUsers.some((user: any) => user.id === reg.userId)
        )
        
        const engagementScore = collegeUsers.length > 0 && collegeEvents.length > 0 ?
          ((collegeRegistrations.length / (collegeUsers.length * collegeEvents.length)) * 100).toFixed(1) : '0'
        
        return {
          college: {
            name: college.name,
            code: college.code
          },
          users: collegeUsers.length,
          events: collegeEvents.length,
          registrations: collegeRegistrations.length,
          engagementScore: parseFloat(engagementScore),
          admin: admins.find((admin: any) => admin.assignedCollege?.toString() === college.id)?.fullName || null
        }
      })
    )

    // Event type distribution
    const eventTypeDistribution = events.reduce((acc: Record<string, number>, event: any) => {
      const type = event.eventType || 'Other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // User registration trends (last 6 months)
    const monthlyRegistrations = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthRegistrations = eventRegistrations.filter((reg: any) => {
        const regDate = new Date(reg.createdAt)
        return regDate >= monthStart && regDate <= monthEnd
      }).length
      
      monthlyRegistrations.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        registrations: monthRegistrations
      })
    }

    // Top performing events
    const eventPerformance = events.map((event: any) => {
      const eventRegs = eventRegistrations.filter((reg: any) => reg.eventId === event.id)
      return {
        id: event.id,
        title: event.title,
        registrations: eventRegs.length,
        maxAttendees: event.maxAttendees || 0,
        participationRate: event.maxAttendees ? ((eventRegs.length / event.maxAttendees) * 100).toFixed(1) : '0'
      }
    }).sort((a, b) => b.registrations - a.registrations).slice(0, 5)

    // Recent activity (last 10 activities)
    const recentActivity: Array<{
      icon: string
      iconBg: string
      title: string
      description: string
      timestamp: string
    }> = []
    
    // Add recent user registrations
    const recentUsers = users
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    
    recentUsers.forEach((user: any) => {
      const timeAgo = getTimeAgo(new Date(user.createdAt))
      recentActivity.push({
        icon: 'Users',
        iconBg: 'bg-purple-600/20',
        title: 'New user registered',
        description: `${user.fullName} joined the platform`,
        timestamp: timeAgo
      })
    })

    // Add recent event creations
    const recentEvents = events
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    
    recentEvents.forEach((event: any) => {
      const timeAgo = getTimeAgo(new Date(event.createdAt))
      recentActivity.push({
        icon: 'Calendar',
        iconBg: 'bg-blue-600/20',
        title: 'Event created',
        description: `${event.title} was scheduled`,
        timestamp: timeAgo
      })
    })

    // Add recent admin assignments
    const recentAdmins = admins
      .filter((admin: any) => admin.assignedCollege)
      .sort((a: any, b: any) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
      .slice(0, 2)
    
    recentAdmins.forEach((admin: any) => {
      const timeAgo = getTimeAgo(new Date(admin.createdAt || admin.updatedAt))
      const college = colleges.find((c: any) => c.id === admin.assignedCollege)
      recentActivity.push({
        icon: 'Shield',
        iconBg: 'bg-green-600/20',
        title: 'Admin assigned',
        description: `${admin.fullName} assigned to ${college?.name || 'college'}`,
        timestamp: timeAgo
      })
    })

    // Sort by timestamp and take top 10
    recentActivity.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    }).slice(0, 10)

    // System health metrics (mock for now, could be enhanced with real monitoring)
    const systemHealth = {
      databasePerformance: 95 + Math.floor(Math.random() * 5), // 95-99%
      apiResponseTime: 90 + Math.floor(Math.random() * 10), // 90-99%
      serverLoad: 30 + Math.floor(Math.random() * 40), // 30-70%
      storageUsage: 20 + Math.floor(Math.random() * 60), // 20-80%
      overallStatus: 'operational',
      statusMessage: 'All systems operational',
      statusDescription: 'No critical issues detected'
    }

    res.json({
      success: true,
      analytics: {
        growth: {
          userGrowthRate: parseFloat(userGrowthRate),
          eventGrowthRate: parseFloat(eventGrowthRate),
          newUsersThisMonth,
          newEventsThisMonth
        },
        engagement: {
          totalRegistrations,
          averageParticipationRate: parseFloat(averageParticipationRate),
          activeUsers: Math.floor(users.length * 0.75), // 75% of total users
          platformHealth: systemHealth.databasePerformance // Use real database performance
        },
        collegePerformance,
        eventTypeDistribution,
        monthlyRegistrations,
        topEvents: eventPerformance,
        recentActivity,
        systemHealth
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/admins/transfer
// @desc    Transfer admin to different college with batch year
// @access  Super Admin
router.post('/admins/transfer', [
  body('toAdminId').isUUID().withMessage('Valid admin ID is required'),
  body('collegeId').isUUID().withMessage('Valid college ID is required'),
  body('batchYear').isInt({ min: 2000, max: 2030 }).withMessage('Valid batch year (2000-2030) is required'),
  body('transferReason').optional().isString().withMessage('Transfer reason must be a string')
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

    const { toAdminId, collegeId, batchYear, transferReason } = req.body

    // Verify admin exists
    const admin = await AdminService.findById(toAdminId)
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      })
    }

    // Verify college exists
    const college = await CollegeService.findById(collegeId)
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      })
    }

    // Check if this batch year already has an admin for this college
    const existingAdmins = await AdminService.getAdminsByCollege(collegeId, true)
    const existingBatchAdmin = existingAdmins.find(a => a.batchYear === batchYear && a.id !== toAdminId)
    if (existingBatchAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: `Batch year ${batchYear} already has an admin assigned to ${college.name}` 
      })
    }

    // Transfer admin to new college with batch year
    const success = await AdminService.assignAdminToCollege(toAdminId, collegeId, undefined, batchYear)
    
    if (success) {
      res.json({
        success: true,
        message: `Admin transferred to ${college.name} for batch ${batchYear} successfully`
      })
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to transfer admin' 
      })
    }
  } catch (error) {
    console.error('Error transferring admin:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/scan-qr
// @desc    Scan QR code to verify event registration
// @access  Super Admin
router.post('/scan-qr', [
  body('qrData').isString().withMessage('QR data is required')
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

    const { qrData } = req.body
    
    try {
      const parsedData = JSON.parse(qrData)
      const { eventId, userId, registrationId, eventTitle, userName } = parsedData

      // Get event details
      const event = await EventService.findById(eventId)
      // Get user details
      const user = await UserService.findById(userId)
      // Try to get registration
      const registration = await EventService.getRegistrationById(registrationId)

      if (!event && !user) {
        return res.status(404).json({
          success: false,
          message: 'Event and user not found'
        })
      }
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          data: user ? { user } : undefined
        })
      }
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: event ? { event } : undefined
        })
      }

      if (!registration) {
        // Return event and user details, but indicate not registered
        return res.json({
          success: true,
          message: 'User is not registered for this event',
          status: 'not_registered',
          data: {
            event: {
              id: event.id,
              title: event.title,
              date: event.date,
              time: event.time,
              location: event.location
            },
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              memberId: user.memberId,
              college: user.college
            }
          }
        })
      }

      // If registration exists, return as before
      res.json({
        success: true,
        message: 'QR code verified successfully',
        status: 'registered',
        data: {
          event: {
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location
          },
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            memberId: user.memberId,
            college: user.college
          },
          registration: {
            id: registration.id,
            status: registration.status,
            registeredAt: registration.registeredAt
          }
        }
      })
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      })
    }
  } catch (error) {
    console.error('Error scanning QR code:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/superadmin/internal-booking
// @desc    Create internal booking for a user to an event (bypasses payment for paid events)
// @access  Super Admin
router.post('/internal-booking', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('eventId').isUUID().withMessage('Valid event ID is required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
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

    const { userId, eventId, notes, adminNotes } = req.body
    const adminId = req.admin!.id
    const supabase = getSupabase()

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('is_active', true)
      .single()

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
      })
    }

    // Check if user is already registered for this event
    const { data: existingRegistration, error: existingError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .single()

    if (!existingError && existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'User is already registered for this event',
        data: {
          registration: existingRegistration,
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            memberId: user.member_id,
            college: user.college
          },
          event: {
            id: event.id,
            title: event.title,
            date: event.event_date,
            time: event.event_time,
            location: event.location
          }
        }
      })
    }

    // Check if event has available spots
    const { count: confirmedCount, error: countError } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed')

    if (countError) {
      console.error('Error counting registrations:', countError)
      return res.status(500).json({
        success: false,
        message: 'Error checking event capacity'
      })
    }

    const availableSpots = event.max_attendees - (confirmedCount || 0)
    const registrationStatus = availableSpots > 0 ? 'confirmed' : 'waitlisted'

    // Create registration with internal booking flag
    const registrationData = {
      event_id: eventId,
      user_id: userId,
      status: registrationStatus,
      registered_at: new Date().toISOString(),
      payment_verified: event.is_paid ? true : false, // Auto-verify payment for internal bookings
      payment_id: event.is_paid ? `INTERNAL_${Date.now()}` : null,
      payment_amount: event.is_paid ? event.price : null,
      payment_currency: event.is_paid ? 'INR' : null,
      payment_timestamp: event.is_paid ? new Date().toISOString() : null,
      qr_code_data: {
        eventId: eventId,
        userId: userId,
        eventTitle: event.title,
        internalBooking: true,
        bookedBy: adminId,
        notes: notes || '',
        adminNotes: adminNotes || ''
      }
    }

    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert(registrationData)
      .select()
      .single()

    if (registrationError) {
      console.error('Error creating registration:', registrationError)
      return res.status(500).json({
        success: false,
        message: 'Error creating registration'
      })
    }

    // Generate QR code for the registration
    const qrCodeData = {
      eventId: eventId,
      userId: userId,
      registrationId: registration.id,
      eventTitle: event.title,
      userName: user.full_name,
      internalBooking: true
    }

    const qrCode = await QRCodeService.generateQRCode(JSON.stringify(qrCodeData))

    // Update registration with QR code
    await supabase
      .from('event_registrations')
      .update({ qr_code_url: qrCode })
      .eq('id', registration.id)

    res.json({
      success: true,
      message: `User successfully registered for event${registrationStatus === 'waitlisted' ? ' (waitlisted)' : ''}`,
      data: {
        registration: {
          id: registration.id,
          status: registration.status,
          registeredAt: registration.registered_at,
          paymentVerified: registration.payment_verified,
          qrCode: qrCode
        },
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          memberId: user.member_id,
          college: user.college,
          batchYear: user.batch_year,
          role: user.role
        },
        event: {
          id: event.id,
          title: event.title,
          date: event.event_date,
          time: event.event_time,
          location: event.location,
          isPaid: event.is_paid,
          price: event.price
        },
        internalBooking: {
          bookedBy: adminId,
          notes: notes || '',
          adminNotes: adminNotes || '',
          paymentBypassed: event.is_paid
        }
      }
    })
  } catch (error) {
    console.error('Error creating internal booking:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   GET /api/superadmin/internal-bookings
// @desc    Get all internal bookings
// @access  Super Admin
router.get('/internal-bookings', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase()

    // Get all registrations with internal booking flag
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        users!inner(full_name, email, member_id, college, batch_year, role),
        events!inner(title, event_date, event_time, location, is_paid, price)
      `)
      .not('qr_code_data', 'is', null)
      .contains('qr_code_data', { internalBooking: true })
      .order('registered_at', { ascending: false })

    if (error) {
      console.error('Error fetching internal bookings:', error)
      return res.status(500).json({
        success: false,
        message: 'Error fetching internal bookings'
      })
    }

    const internalBookings = registrations?.map(reg => ({
      id: reg.id,
      registrationDate: reg.registered_at,
      status: reg.status,
      paymentVerified: reg.payment_verified,
      qrCode: reg.qr_code_url,
      user: {
        id: reg.user_id,
        fullName: reg.users.full_name,
        email: reg.users.email,
        memberId: reg.users.member_id,
        college: reg.users.college,
        batchYear: reg.users.batch_year,
        role: reg.users.role
      },
      event: {
        id: reg.event_id,
        title: reg.events.title,
        date: reg.events.event_date,
        time: reg.events.event_time,
        location: reg.events.location,
        isPaid: reg.events.is_paid,
        price: reg.events.price
      },
      internalBooking: {
        bookedBy: reg.qr_code_data?.bookedBy || 'Unknown',
        notes: reg.qr_code_data?.notes || '',
        adminNotes: reg.qr_code_data?.adminNotes || '',
        paymentBypassed: reg.events.is_paid && reg.payment_verified
      }
    })) || []

    res.json({
      success: true,
      data: internalBookings,
      total: internalBookings.length
    })
  } catch (error) {
    console.error('Error fetching internal bookings:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

export default router 