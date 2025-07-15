"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collegeService_1 = __importDefault(require("../services/collegeService"));
const router = express_1.default.Router();
// ============ PUBLIC ENDPOINTS ============
// @route   GET /api/public/colleges
// @desc    Get all colleges with tenure head information for registration
// @access  Public
router.get('/colleges', async (req, res) => {
    try {
        const colleges = await collegeService_1.default.getAllColleges();
        // Return only the necessary information for registration
        const collegesForRegistration = colleges.map(college => ({
            id: college.id,
            name: college.name,
            code: college.code,
            location: college.location,
            currentTenureHeads: college.currentTenureHeads
        }));
        res.json({
            success: true,
            count: colleges.length,
            colleges: collegesForRegistration
        });
    }
    catch (error) {
        console.error('Error fetching colleges for registration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=public.js.map