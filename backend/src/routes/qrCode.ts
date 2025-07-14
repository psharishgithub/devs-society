import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { adminAuth } from '../middleware/roleBasedAuth'
import auth from '../middleware/auth'
import QRCodeService from '../services/qrCodeService'
import EventService from '../services/eventService'
import { getSupabase } from '../database/supabase'

const router = express.Router()

// ============ USER ROUTES (QR Code Generation) ============

// @route   GET /api/qr-code/event/:eventId/my-qr
// @desc    Get user's QR code for event check-in
// @access  Private
router.get('/event/:eventId/my-qr', auth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const userId = req.user.id
    const supabase = getSupabase()

    // Check if user is an admin - prevent admins from getting QR codes as users
    const AdminService = require('../services/adminService').default
    const admin = await AdminService.findByEmail(req.user.email)
    if (admin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admins cannot access QR codes as users. Please use your admin account for event management.' 
      })
    }

    // Get event details to check if it's paid
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('is_paid')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // Get user's registration for this event
    const { data: registration, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .single()

    if (error || !registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found or not confirmed' 
      })
    }

    // For paid events, check if payment was completed
    if (event.is_paid) {
      // Check if payment was verified
      if (!registration.payment_verified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Payment not verified. Please complete payment to access QR code.' 
        })
      }
    }

    // Generate QR code if not already generated
    let qrCodeUrl = registration.qr_code_url
    let checkInCode = registration.check_in_code

    if (!qrCodeUrl || !checkInCode) {
      const qrData = await QRCodeService.generateEventQRCode(eventId, userId, registration.id)
      
      // Update registration with QR code data
      await supabase
        .from('event_registrations')
        .update({
          qr_code_data: qrData.qrCodeData,
          qr_code_url: qrData.qrCodeUrl,
          check_in_code: qrData.checkInCode
        })
        .eq('id', registration.id)

      qrCodeUrl = qrData.qrCodeUrl
      checkInCode = qrData.checkInCode
    }

    res.json({
      success: true,
      qrCode: {
        url: qrCodeUrl,
        checkInCode: checkInCode,
        eventId: eventId,
        registrationId: registration.id
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// ============ ADMIN ROUTES (QR Code Scanning & Check-in) ============

// @route   POST /api/qr-code/check-in
// @desc    Process check-in using QR code
// @access  Admin
router.post('/check-in', 
  adminAuth,
  [
    body('qrCodeData').notEmpty().withMessage('QR code data is required'),
    body('notes').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        })
      }

      const { qrCodeData, notes } = req.body
      const adminId = req.admin!.id
      const supabase = getSupabase()

      // Verify QR code data
      const qrData = QRCodeService.verifyQRCode(qrCodeData)
      if (!qrData) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid QR code data' 
        })
      }

      // Process check-in using database function
      const { data: checkInResult, error } = await supabase
        .rpc('process_event_check_in', {
          p_check_in_code: qrData.checkInCode,
          p_admin_id: adminId,
          p_notes: notes
        })

      if (error) {
        console.error('Check-in error:', error)
        return res.status(500).json({ 
          success: false, 
          message: 'Check-in processing failed' 
        })
      }

      const result = checkInResult[0]
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        })
      }

      res.json({
        success: true,
        message: result.message,
        checkIn: {
          userName: result.user_name,
          eventTitle: result.event_title,
          checkInTime: result.check_in_time
        }
      })
    } catch (error) {
      console.error('Error processing check-in:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      })
    }
  }
)

// @route   POST /api/qr-code/check-in-by-code
// @desc    Process check-in using check-in code directly
// @access  Admin
router.post('/check-in-by-code', 
  adminAuth,
  [
    body('checkInCode').trim().isLength({ min: 8 }).withMessage('Valid check-in code is required'),
    body('notes').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        })
      }

      const { checkInCode, notes } = req.body
      const adminId = req.admin!.id
      const supabase = getSupabase()

      // Process check-in using database function
      const { data: checkInResult, error } = await supabase
        .rpc('process_event_check_in', {
          p_check_in_code: checkInCode.toUpperCase(),
          p_admin_id: adminId,
          p_notes: notes
        })

      if (error) {
        console.error('Check-in error:', error)
        return res.status(500).json({ 
          success: false, 
          message: 'Check-in processing failed' 
        })
      }

      const result = checkInResult[0]
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        })
      }

      res.json({
        success: true,
        message: result.message,
        checkIn: {
          userName: result.user_name,
          eventTitle: result.event_title,
          checkInTime: result.check_in_time
        }
      })
    } catch (error) {
      console.error('Error processing check-in:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      })
    }
  }
)

// @route   GET /api/qr-code/event/:eventId/check-ins
// @desc    Get check-in statistics for event
// @access  Admin
router.get('/event/:eventId/check-ins', adminAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const supabase = getSupabase()

    // Get check-in statistics
    const { data: stats, error: statsError } = await supabase
      .from('event_check_in_stats')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (statsError) {
      console.error('Error getting check-in stats:', statsError)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get check-in statistics' 
      })
    }

    // Get detailed check-in list
    const { data: checkIns, error: checkInsError } = await supabase
      .from('event_check_ins')
      .select(`
        *,
        users(full_name, email, member_id),
        admins(full_name)
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })

    if (checkInsError) {
      console.error('Error getting check-ins:', checkInsError)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get check-in details' 
      })
    }

    res.json({
      success: true,
      statistics: stats,
      checkIns: checkIns || []
    })
  } catch (error) {
    console.error('Error getting event check-ins:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// @route   GET /api/qr-code/event/:eventId/scanner-qr
// @desc    Generate QR code for event scanner app
// @access  Admin
router.get('/event/:eventId/scanner-qr', adminAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params

    // Verify event exists
    const event = await EventService.findById(eventId)
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      })
    }

    // Generate scanner QR code
    const scannerQRCode = await QRCodeService.generateScannerQRCode(eventId)

    res.json({
      success: true,
      scannerQRCode,
      event: {
        id: event.id,
        title: event.title,
        date: event.date
      }
    })
  } catch (error) {
    console.error('Error generating scanner QR code:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// ============ UNIFIED QR VERIFICATION (Primary Method) ============

// @route   POST /api/qr-code/verify-member
// @desc    Verify member using QR code (supports both member card and event QR codes)
// @access  Admin
router.post('/verify-member', 
  adminAuth,
  [
    body('qrCodeData').notEmpty().withMessage('QR code data is required'),
    body('eventId').optional().isUUID().withMessage('Valid event ID is required if provided'),
    body('notes').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        })
      }

      const { qrCodeData, eventId, notes } = req.body
      const adminId = req.admin!.id
      const supabase = getSupabase()

      let memberData: any = null
      let eventRegistrationData: any = null
      let qrCodeType: 'member_card' | 'event_specific' = 'member_card'

      // Try to parse as member card QR code first (primary method)
      try {
        const parsedMemberData = JSON.parse(qrCodeData)
        
        // Check if this is a member card QR code
        if ((parsedMemberData.id || parsedMemberData.memberId) && parsedMemberData.name && parsedMemberData.email && parsedMemberData.qrType === 'member_card') {
          // This is a member card QR code
          memberData = parsedMemberData
          qrCodeType = 'member_card'
        } else if (parsedMemberData.eventId && parsedMemberData.userId) {
          // This is an event-specific QR code (fallback)
          eventRegistrationData = parsedMemberData
          qrCodeType = 'event_specific'
        } else {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid QR code format. Expected member card (with id/memberId, name, email, qrType) or event QR code.' 
          })
        }
      } catch (parseError) {
        console.error('QR code parse error:', parseError)
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid QR code data format' 
        })
      }

      let user: any = null
      let event: any = null
      let registration: any = null

      if (qrCodeType === 'member_card') {
        // Handle member card QR code
        // Find user by member ID (try both id and memberId fields)
        const memberIdToSearch = memberData.memberId || memberData.id
        if (!memberIdToSearch) {
          return res.status(400).json({
            success: false,
            message: 'QR code missing both id and memberId fields.'
          })
        }
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('member_id', memberIdToSearch)
          .single()

        if (userError || !userData) {
          return res.status(404).json({ 
            success: false, 
            message: 'Member not found. Please check if the QR code is valid.',
            qrCodeType: 'member_card',
            member: null,
            eventRegistrations: [],
            currentEvent: null,
            currentRegistration: null,
            status: 'not_registered'
          })
        }

        user = userData

        // If eventId is provided, check registration for that event
        if (eventId) {
          // Use EventService to get properly mapped event data
          const EventService = require('../services/eventService').default
          try {
            event = await EventService.findById(eventId)
            
            if (!event) {
              return res.status(404).json({ 
                success: false, 
                message: 'Event not found',
                qrCodeType: 'member_card',
                member: {
                  id: user.id,
                  memberId: user.member_id,
                  fullName: user.full_name,
                  email: user.email,
                  college: user.college,
                  batchYear: user.batch_year,
                  role: user.role,
                  createdAt: user.created_at
                },
                eventRegistrations: [],
                currentEvent: null,
                currentRegistration: null,
                status: 'not_registered'
              })
            }
          } catch (eventError) {
            console.error('Error fetching event:', eventError)
            return res.status(404).json({ 
              success: false, 
              message: 'Event not found',
              qrCodeType: 'member_card',
              member: {
                id: user.id,
                memberId: user.member_id,
                fullName: user.full_name,
                email: user.email,
                college: user.college,
                batchYear: user.batch_year,
                role: user.role,
                createdAt: user.created_at
              },
              eventRegistrations: [],
              currentEvent: null,
              currentRegistration: null,
              status: 'not_registered'
            })
          }

          // Check if user is registered for this event
          const { data: registrationData, error: registrationError } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .single()

          if (!registrationError && registrationData) {
            registration = registrationData
          }
        }

        // Get all event registrations for this member
        const { data: allRegistrations, error: registrationsError } = await supabase
          .from('event_registrations')
          .select('id, status, registered_at, payment_verified, event_id')
          .eq('user_id', user.id)
          .eq('status', 'confirmed')

        let eventRegistrations: any[] = []
        if (!registrationsError && allRegistrations && allRegistrations.length > 0) {
          // Use EventService to get properly mapped event data
          const EventService = require('../services/eventService').default
          const eventRegistrationsPromises = allRegistrations.map(async (reg) => {
            try {
              const event = await EventService.findById(reg.event_id)
              return {
                id: reg.id,
                eventId: reg.event_id,
                eventTitle: event?.title || '',
                eventDate: event?.date || '',
                eventTime: event?.time || '',
                eventLocation: event?.location || '',
                status: reg.status,
                registeredAt: reg.registered_at,
                paymentVerified: reg.payment_verified
              }
            } catch (error) {
              console.error(`Error fetching event ${reg.event_id}:`, error)
              return {
                id: reg.id,
                eventId: reg.event_id,
                eventTitle: 'Unknown Event',
                eventDate: '',
                eventTime: '',
                eventLocation: '',
                status: reg.status,
                registeredAt: reg.registered_at,
                paymentVerified: reg.payment_verified
              }
            }
          })
          
          eventRegistrations = await Promise.all(eventRegistrationsPromises)
        }

        // Return member verification result with all fields
        res.json({
          success: true,
          message: 'Member verified successfully',
          qrCodeType: 'member_card',
          member: {
            id: user.id,
            memberId: user.member_id,
            fullName: user.full_name,
            email: user.email,
            college: user.college,
            batchYear: user.batch_year,
            role: user.role,
            createdAt: user.created_at
          },
          eventRegistrations: eventRegistrations,
          currentEvent: event ? {
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location
          } : null,
          currentRegistration: registration ? {
            id: registration.id,
            status: registration.status,
            registeredAt: registration.registered_at,
            paymentVerified: registration.payment_verified
          } : null,
          status: event ? (registration ? 'registered' : 'not_registered') : 'member_only'
        })
      } else {
        // Handle event-specific QR code (fallback method)
        const qrData = QRCodeService.verifyQRCode(qrCodeData)
        if (!qrData) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid event QR code data' 
          })
        }

        // Process check-in using database function
        const { data: checkInResult, error } = await supabase
          .rpc('process_event_check_in', {
            p_check_in_code: qrData.checkInCode,
            p_admin_id: adminId,
            p_notes: notes
          })

        if (error) {
          console.error('Check-in error:', error)
          return res.status(500).json({ 
            success: false, 
            message: 'Check-in processing failed' 
          })
        }

        const result = checkInResult[0]
        
        if (!result.success) {
          return res.status(400).json({ 
            success: false, 
            message: result.message 
          })
        }

        res.json({
          success: true,
          message: result.message,
          qrCodeType: 'event_specific',
          checkIn: {
            userName: result.user_name,
            eventTitle: result.event_title,
            checkInTime: result.check_in_time
          }
        })
      }
    } catch (error) {
      console.error('Error processing QR verification:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      })
    }
  }
)

// @route   POST /api/qr-code/check-in-member
// @desc    Process check-in using member card QR code (primary method)
// @access  Admin
router.post('/check-in-member', 
  adminAuth,
  [
    body('qrCodeData').notEmpty().withMessage('QR code data is required'),
    body('eventId').isUUID().withMessage('Valid event ID is required'),
    body('notes').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        })
      }

      const { qrCodeData, eventId, notes } = req.body
      const adminId = req.admin!.id
      const supabase = getSupabase()

      // Parse member card QR code data
      let memberData: any = null
      try {
        const parsedData = JSON.parse(qrCodeData)
        if ((parsedData.id || parsedData.memberId) && parsedData.name && parsedData.email && parsedData.qrType === 'member_card') {
          memberData = parsedData
        } else {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid member card QR code format. Expected member card (with id/memberId, name, email, qrType).' 
          })
        }
      } catch (parseError) {
        console.error('QR code parse error:', parseError)
        return res.status(400).json({ 
          message: 'Invalid QR code data format' 
        })
      }

      // Find user by member ID (try both id and memberId fields)
      const memberIdToSearch = memberData.memberId || memberData.id
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('member_id', memberIdToSearch)
        .single()

      if (userError || !user) {
        console.error('User lookup error:', userError)
        console.error('Searched for member_id:', memberIdToSearch)
        console.error('QR data received:', memberData)
        return res.status(404).json({ 
          success: false, 
          message: 'Member not found. Please check if the QR code is valid.' 
        })
      }

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError || !event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        })
      }

      // Check if user is registered for this event
      const { data: registration, error: registrationError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .single()

      if (registrationError || !registration) {
        return res.status(400).json({ 
          success: false, 
          message: 'User is not registered for this event' 
        })
      }

      // Check if already checked in
      if (registration.checked_in_at) {
        return res.status(400).json({ 
          success: false, 
          message: 'User has already been checked in for this event' 
        })
      }

      // For paid events, check if payment was verified
      if (event.is_paid && !registration.payment_verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment not verified. Cannot check in without payment verification.' 
        })
      }

      // Process check-in
      const { data: checkInResult, error: checkInError } = await supabase
        .rpc('process_event_check_in', {
          p_check_in_code: registration.check_in_code,
          p_admin_id: adminId,
          p_notes: notes
        })

      if (checkInError) {
        console.error('Check-in error:', checkInError)
        return res.status(500).json({ 
          success: false, 
          message: 'Check-in processing failed' 
        })
      }

      const result = checkInResult[0]
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        })
      }

      res.json({
        success: true,
        message: result.message,
        qrCodeType: 'member_card',
        checkIn: {
          userName: result.user_name,
          eventTitle: result.event_title,
          checkInTime: result.check_in_time,
          memberId: user.member_id,
          college: user.college,
          batchYear: user.batch_year,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Error processing member check-in:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      })
    }
  }
)

export default router