"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const roleBasedAuth_1 = require("../middleware/roleBasedAuth");
const auth_1 = __importDefault(require("../middleware/auth"));
const eventFormService_1 = __importDefault(require("../services/eventFormService"));
const eventService_1 = __importDefault(require("../services/eventService"));
const router = express_1.default.Router();
// ============ ADMIN ROUTES (Form Management) ============
// @route   POST /api/event-forms/:eventId
// @desc    Create custom form for event
// @access  Admin
router.post('/:eventId', roleBasedAuth_1.adminAuth, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 3 }).withMessage('Form title must be at least 3 characters'),
    (0, express_validator_1.body)('fields').isArray({ min: 1 }).withMessage('At least one form field is required'),
    (0, express_validator_1.body)('fields.*.type').isIn(['text', 'email', 'phone', 'select', 'checkbox', 'textarea', 'number', 'date']).withMessage('Invalid field type'),
    (0, express_validator_1.body)('fields.*.label').trim().isLength({ min: 1 }).withMessage('Field label is required'),
    (0, express_validator_1.body)('fields.*.required').isBoolean().withMessage('Required field must be boolean')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { eventId } = req.params;
        const { title, description, fields } = req.body;
        // Verify event exists and admin has access
        const event = await eventService_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        // Create the form
        const form = await eventFormService_1.default.createEventForm(eventId, {
            title,
            description,
            fields: fields.map((field, index) => ({
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required,
                options: field.options,
                validation: field.validation,
                order: field.order || index
            }))
        });
        res.status(201).json({
            success: true,
            message: 'Event form created successfully',
            form
        });
    }
    catch (error) {
        console.error('Error creating event form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   GET /api/event-forms/:eventId
// @desc    Get form for event
// @access  Public (for registration)
router.get('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const form = await eventFormService_1.default.getEventForm(eventId);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'No form found for this event'
            });
        }
        res.json({
            success: true,
            form
        });
    }
    catch (error) {
        console.error('Error getting event form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   PUT /api/event-forms/form/:formId
// @desc    Update event form
// @access  Admin
router.put('/form/:formId', roleBasedAuth_1.adminAuth, [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 3 }).withMessage('Form title must be at least 3 characters'),
    (0, express_validator_1.body)('fields').optional().isArray({ min: 1 }).withMessage('At least one form field is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { formId } = req.params;
        const { title, description, fields } = req.body;
        const form = await eventFormService_1.default.updateEventForm(formId, {
            title,
            description,
            fields
        });
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }
        res.json({
            success: true,
            message: 'Form updated successfully',
            form
        });
    }
    catch (error) {
        console.error('Error updating event form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   DELETE /api/event-forms/form/:formId
// @desc    Delete event form
// @access  Admin
router.delete('/form/:formId', roleBasedAuth_1.adminAuth, async (req, res) => {
    try {
        const { formId } = req.params;
        const success = await eventFormService_1.default.deleteEventForm(formId);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }
        res.json({
            success: true,
            message: 'Form deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting event form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// ============ USER ROUTES (Form Submission) ============
// @route   POST /api/event-forms/:eventId/submit
// @desc    Submit form response for event
// @access  Private
router.post('/:eventId/submit', auth_1.default, [
    (0, express_validator_1.body)('responses').isObject().withMessage('Form responses are required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { eventId } = req.params;
        const { responses } = req.body;
        const userId = req.user.id;
        // Get the form to validate responses
        const form = await eventFormService_1.default.getEventForm(eventId);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'No form found for this event'
            });
        }
        // Validate required fields
        const missingFields = form.fields
            .filter(field => field.required && !responses[field.id])
            .map(field => field.label);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        // Check if user already submitted
        const existingSubmission = await eventFormService_1.default.getUserFormSubmission(eventId, userId);
        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this form'
            });
        }
        // Submit the form
        const submission = await eventFormService_1.default.submitFormResponse(eventId, userId, form.id, responses);
        res.status(201).json({
            success: true,
            message: 'Form submitted successfully',
            submission
        });
    }
    catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   GET /api/event-forms/:eventId/my-submission
// @desc    Get user's form submission for event
// @access  Private
router.get('/:eventId/my-submission', auth_1.default, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const submission = await eventFormService_1.default.getUserFormSubmission(eventId, userId);
        res.json({
            success: true,
            submission
        });
    }
    catch (error) {
        console.error('Error getting form submission:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// ============ ADMIN ROUTES (Form Submissions Management) ============
// @route   GET /api/event-forms/:eventId/submissions
// @desc    Get all form submissions for event
// @access  Admin
router.get('/:eventId/submissions', roleBasedAuth_1.adminAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const submissions = await eventFormService_1.default.getEventFormSubmissions(eventId);
        res.json({
            success: true,
            count: submissions.length,
            submissions
        });
    }
    catch (error) {
        console.error('Error getting form submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=eventforms.js.map