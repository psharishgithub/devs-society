"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTenureHead = exports.addCollegeFilter = exports.requireCollegeAccess = exports.requirePermissions = exports.requireSuperAdmin = exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminService_1 = __importDefault(require("../services/adminService"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Verify this is an admin token and get admin details
        const admin = await adminService_1.default.findById(decoded.id);
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or admin not active'
            });
        }
        req.admin = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions || [],
            assignedCollege: admin.assignedCollege?.id || null
        };
        next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
exports.adminAuth = adminAuth;
// Require super admin role
const requireSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== 'super-admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin privileges required.'
        });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
// Require specific permissions
const requirePermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.admin || !req.admin.permissions) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No permissions found.'
            });
        }
        const hasPermission = permissions.some(permission => req.admin.permissions.includes(permission));
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required permissions: ${permissions.join(', ')}`
            });
        }
        next();
    };
};
exports.requirePermissions = requirePermissions;
// Require college access (admin must be assigned to a college)
const requireCollegeAccess = async (req, res, next) => {
    try {
        if (!req.admin || (req.admin.role !== 'super-admin' && !req.admin.assignedCollege)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No college assignment found.'
            });
        }
        // For superadmin, skip college existence check
        if (req.admin.role === 'super-admin') {
            return next();
        }
        // Verify college exists and admin is still assigned
        if (!req.admin.assignedCollege) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No college assignment found.'
            });
        }
        const college = await collegeService_1.default.findById(req.admin.assignedCollege);
        if (!college || !college.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. College not found or inactive.'
            });
        }
        next();
    }
    catch (error) {
        console.error('College access check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during college access verification'
        });
    }
};
exports.requireCollegeAccess = requireCollegeAccess;
// Add college filter to requests (for college-specific operations)
const addCollegeFilter = (req, res, next) => {
    if (req.admin && req.admin.assignedCollege) {
        req.query.collegeFilter = req.admin.assignedCollege;
    }
    // For superadmin, do not restrict
    next();
};
exports.addCollegeFilter = addCollegeFilter;
// Validate tenure head (ensure admin has active tenure)
const validateTenureHead = async (req, res, next) => {
    try {
        if (!req.admin || req.admin.role === 'super-admin') {
            // Super admins bypass tenure validation
            return next();
        }
        const admin = await adminService_1.default.findById(req.admin.id);
        if (!admin || !admin.tenureInfo || !admin.tenureInfo.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No active tenure found.'
            });
        }
        // Check if tenure is still valid (not expired)
        if (admin.tenureInfo.endDate && new Date(admin.tenureInfo.endDate) < new Date()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Tenure has expired.'
            });
        }
        next();
    }
    catch (error) {
        console.error('Tenure validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during tenure validation'
        });
    }
};
exports.validateTenureHead = validateTenureHead;
//# sourceMappingURL=roleBasedAuth.js.map