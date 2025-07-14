import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import AdminService from '../services/adminService'
import CollegeService from '../services/collegeService'

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string
        username: string
        email: string
        role: string
        permissions?: string[]
        assignedCollege?: string | null // Keep as string for middleware compatibility
      }
    }
  }
}

// Admin authentication middleware
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any
    
    // Verify this is an admin token and get admin details
    const admin = await AdminService.findById(decoded.id)
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or admin not active' 
      })
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
      assignedCollege: admin.assignedCollege?.id || null
    }

    next()
  } catch (error) {
    console.error('Admin auth error:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
}

// Require super admin role
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.admin || req.admin.role !== 'super-admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Super admin privileges required.' 
    })
  }
  next()
}

// Require specific permissions
export const requirePermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin || !req.admin.permissions) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. No permissions found.' 
      })
    }

    const hasPermission = permissions.some(permission => 
      req.admin!.permissions!.includes(permission)
    )

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required permissions: ${permissions.join(', ')}` 
      })
    }

    next()
  }
}

// Require college access (admin must be assigned to a college)
export const requireCollegeAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.admin || (req.admin.role !== 'super-admin' && !req.admin.assignedCollege)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. No college assignment found.' 
      })
    }

    // For superadmin, skip college existence check
    if (req.admin.role === 'super-admin') {
      return next()
    }

    // Verify college exists and admin is still assigned
    if (!req.admin.assignedCollege) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. No college assignment found.' 
      })
    }
    const college = await CollegeService.findById(req.admin.assignedCollege)
    if (!college || !college.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. College not found or inactive.' 
      })
    }

    next()
  } catch (error) {
    console.error('College access check error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error during college access verification' 
    })
  }
}

// Add college filter to requests (for college-specific operations)
export const addCollegeFilter = (req: Request, res: Response, next: NextFunction) => {
  if (req.admin && req.admin.assignedCollege) {
    req.query.collegeFilter = req.admin.assignedCollege
  }
  // For superadmin, do not restrict
  next()
}

// Validate tenure head (ensure admin has active tenure)
export const validateTenureHead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.admin || req.admin.role === 'super-admin') {
      // Super admins bypass tenure validation
      return next()
    }

    const admin = await AdminService.findById(req.admin.id)
    if (!admin || !admin.tenureInfo || !admin.tenureInfo.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. No active tenure found.' 
      })
    }

    // Check if tenure is still valid (not expired)
    if (admin.tenureInfo.endDate && new Date(admin.tenureInfo.endDate) < new Date()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Tenure has expired.' 
      })
    }

    next()
  } catch (error) {
    console.error('Tenure validation error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error during tenure validation' 
    })
  }
} 