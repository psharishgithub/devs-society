"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const EventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['college-specific', 'open-to-all'],
        default: 'college-specific'
    },
    targetCollege: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'College',
        required: function () {
            return this.eventType === 'college-specific';
        }
    },
    maxAttendees: {
        type: Number,
        required: true,
        min: 1,
        max: 10000
    },
    category: {
        type: String,
        required: true,
        enum: ['workshop', 'seminar', 'hackathon', 'competition', 'meetup', 'other'],
        default: 'other'
    },
    organizer: {
        adminId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        contact: {
            type: String,
            required: true,
            trim: true
        }
    },
    registrations: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            registeredAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['confirmed', 'waitlisted', 'cancelled'],
                default: 'confirmed'
            }
        }],
    requirements: [{
            type: String,
            trim: true
        }],
    prizes: [{
            type: String,
            trim: true
        }],
    registrationDeadline: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    pricing: [{
            tenure: {
                type: String,
                required: true,
                trim: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }],
    photoUrl: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
EventSchema.index({ date: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ targetCollege: 1 });
EventSchema.index({ 'organizer.adminId': 1 });
EventSchema.index({ isActive: 1 });
// Virtual for available spots
EventSchema.virtual('availableSpots').get(function () {
    const confirmedRegistrations = this.registrations.filter((reg) => reg.status === 'confirmed').length;
    return Math.max(0, this.maxAttendees - confirmedRegistrations);
});
// Virtual for registration status
EventSchema.virtual('registrationStatus').get(function () {
    const now = new Date();
    if (now > this.registrationDeadline)
        return 'closed';
    const availableSpots = this.maxAttendees - this.registrations.filter(reg => reg.status === 'confirmed').length;
    if (availableSpots <= 0)
        return 'full';
    return 'open';
});
// Check if user can register
EventSchema.methods.canUserRegister = function (userId) {
    const now = new Date();
    // Check if registration is still open
    if (now > this.registrationDeadline)
        return { canRegister: false, reason: 'Registration deadline passed' };
    // Check if user already registered
    const existingRegistration = this.registrations.find((reg) => reg.userId.toString() === userId.toString() && reg.status !== 'cancelled');
    if (existingRegistration)
        return { canRegister: false, reason: 'Already registered' };
    // Check if spots available
    const confirmedCount = this.registrations.filter((reg) => reg.status === 'confirmed').length;
    if (confirmedCount >= this.maxAttendees) {
        return { canRegister: true, status: 'waitlisted' };
    }
    return { canRegister: true, status: 'confirmed' };
};
// Add user registration
EventSchema.methods.addRegistration = function (userId) {
    const canRegister = this.canUserRegister(userId);
    if (!canRegister.canRegister) {
        throw new Error(canRegister.reason);
    }
    this.registrations.push({
        userId,
        registeredAt: new Date(),
        status: canRegister.status || 'confirmed'
    });
    return this.save();
};
exports.default = mongoose_1.default.model('Event', EventSchema);
//# sourceMappingURL=Event.js.map