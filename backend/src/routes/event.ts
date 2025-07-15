const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')
const { createHmac } = require('crypto') // Import only the needed function
const auth = require('../middleware/auth')
const EventService = require('../services/eventService')
const UserService = require('../services/userService')
const AdminService = require('../services/adminService')

const razorpay = new Razorpay({ 
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET 
})

// Create Razorpay order for event registration
router.post('/:id/razorpay-order', auth, async (req: any, res: any) => {
  try {
    const { adminId } = req.body
    const eventId = req.params.id
    const userId = req.user.id // Get user ID from authenticated request

    // Get event details
    const event = await EventService.findById(eventId)
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    if (!event.isPaid) {
      return res.status(400).json({ success: false, message: 'This event is free' })
    }

    let amount = 0

    // Handle different event types
    if (event.eventType === 'open-to-all' && event.adminPricing && event.adminPricing.length > 0) {
      // Find the specific admin pricing
      const adminPricing = event.adminPricing.find((p: any) => p.adminId === adminId)
      if (!adminPricing) {
        return res.status(400).json({ success: false, message: 'Invalid admin selection' })
      }
      amount = adminPricing.amount * 100 // Convert to paise
    } else if (event.eventType === 'college-specific') {
      amount = event.price * 100 // Convert to paise
    } else {
      return res.status(400).json({ success: false, message: 'Invalid event pricing configuration' })
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' })
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: `event_${eventId}_${userId}_${Date.now()}`,
      notes: {
        eventId: eventId,
        userId: userId,
        adminId: adminId,
        eventTitle: event.title
      }
    })

    res.json({ 
      success: true, 
      order,
      event: {
        id: event.id,
        title: event.title,
        amount: amount / 100
      }
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    res.status(500).json({ success: false, message: 'Failed to create payment order' })
  }
})

// Verify Razorpay payment
router.post('/:id/verify-payment', auth, async (req: any, res: any) => {
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
    const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
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
        event.adminPricing?.find((p: any) => p.adminId === adminId)?.amount || event.price : 
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
  event.adminPricing?.find((p: any) => p.adminId === adminId)?.amount || event.price : 
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

module.exports = router 