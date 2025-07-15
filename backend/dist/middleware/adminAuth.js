"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminAuth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    // Check if no token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token, admin authorization denied'
        });
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Check if token is for admin
        if (decoded.type !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin token'
            });
        }
        // Add admin to request
        req.admin = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Admin token is not valid'
        });
    }
};
exports.default = adminAuth;
//# sourceMappingURL=adminAuth.js.map