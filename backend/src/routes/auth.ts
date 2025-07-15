import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import UserService from '../services/userService'
import CollegeService from '../services/collegeService'
import multer from 'multer'
import storageService from '../services/supabaseStorage'

const router = express.Router()

// Configure multer for file uploads (use memory storage for Supabase upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// @route   POST /api/auth/register
// @desc    Register a new user with batch year validation (photo upload is optional)
// @access  Public
router.post('/register', 
  upload.single('photo'),
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
    body('college').trim().isLength({ min: 2 }).withMessage('College name is required'),
    body('batchYear').trim().notEmpty().withMessage('Batch year is required'),
    body('role').isIn(['core-member', 'board-member', 'special-member', 'regular-member', 'other']).withMessage('Invalid role')
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

      const { fullName, email, phone, college, batchYear, role } = req.body

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email)
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        })
      }

      // Find college by ID and get college details
      let collegeRef = null
      let foundCollege = null
      try {
        const colleges = await CollegeService.getAllColleges()
        
        // Find college by ID (frontend sends college ID)
        foundCollege = colleges.find(c => c.id === college)
        if (foundCollege) {
          collegeRef = foundCollege.id
          
          // Validate batch year assignment
          const validation = await UserService.validateBatchYearAssignment(collegeRef, batchYear)
          if (!validation.valid) {
            return res.status(400).json({ 
              success: false, 
              message: validation.error || 'Invalid batch year assignment',
              field: 'batchYear',
              details: {
                college: foundCollege.name,
                collegeId: foundCollege.id,
                batchYear: batchYear,
                availableBatches: await UserService.getAvailableBatchYears(collegeRef)
              }
            })
          }
        } else {
          return res.status(400).json({ 
            success: false, 
            message: `College with ID "${college}" not found. Please select a valid college.`,
            field: 'college'
          })
        }
      } catch (error) {
        console.error('Error validating college and batch year:', error)
        return res.status(400).json({ 
          success: false, 
          message: 'Error validating college and batch year. Please try again.',
          field: 'college'
        })
      }

      // Create new user
      const userData: any = {
        fullName,
        email,
        phone,
        college: foundCollege ? foundCollege.name : college, // Store college name, not ID
        collegeRef,
        batchYear,
        role: role || 'other'
      }

      // Create user first (without photo)
      const user = await UserService.createUser(userData)

      // Handle photo upload after user creation (optional)
      if (req.file) {
        try {
          console.log('Photo upload received during registration:', req.file.originalname)
          console.log('File size:', req.file.size, 'bytes')
          console.log('File mimetype:', req.file.mimetype)
          
          // Check if Supabase service role key is configured
          if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY not configured')
            // Continue without photo
            console.log('Continuing registration without photo due to missing service role key')
          } else {
            // Upload to Supabase storage with actual user ID
            const uploadResult = await storageService.uploadProfilePhoto(
              req.file.buffer,
              req.file.originalname,
              user.id
            )

            console.log('Registration upload result:', uploadResult)

            if (uploadResult.success && uploadResult.url) {
              // Update user with photo URL
              await UserService.updateUser(user.id, { photoUrl: uploadResult.url })
              user.photoUrl = uploadResult.url
              console.log('Photo URL updated for user:', uploadResult.url)
            } else {
              console.error('Registration upload failed:', uploadResult.error)
              // Continue without photo
              console.log('Continuing registration without photo due to upload failure')
            }
          }
        } catch (uploadError) {
          console.error('Registration photo upload error:', uploadError)
          // Continue without photo
          console.log('Continuing registration without photo due to upload error')
        }
      }

      // Generate JWT token
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      )

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          memberId: user.memberId,
          college: user.college,
          batchYear: user.batchYear,
          photoUrl: user.photoUrl
        }
      })

    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('photo') || error.message.includes('upload')) {
          return res.status(400).json({ 
            success: false, 
            message: 'Photo upload failed. Please try again or register without a photo.' 
          })
        }
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error during registration' 
      })
    }
  }
)

// @route   POST /api/auth/login
// @desc    Login user (simplified - just email lookup)
// @access  Public
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please include a valid email')
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

      const { email } = req.body

      // Find user by email
      const user = await UserService.findByEmail(email)
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid credentials or user not found' 
        })
      }

      // Generate JWT token
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      )

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          memberId: user.memberId,
          college: user.college,
          batchYear: user.batchYear,
          photoUrl: user.photoUrl
        }
      })

    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Server error during login' 
      })
    }
  }
)

export default router 