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

export default router