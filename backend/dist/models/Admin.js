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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AdminSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['super-admin', 'admin'],
        default: 'admin'
    },
    assignedCollege: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'College',
        required: function () {
            return this.role === 'admin';
        }
    },
    permissions: [{
            type: String,
            enum: [
                'users.read',
                'users.write',
                'users.delete',
                'events.read',
                'events.write',
                'events.delete',
                'colleges.read',
                'colleges.write',
                'colleges.delete',
                'admins.read',
                'admins.write',
                'admins.delete',
                'settings.read',
                'settings.write',
                'analytics.read',
                'system.admin'
            ]
        }],
    tenureInfo: {
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});
// Hash password before saving
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Add tenure info and set default permissions based on role
AdminSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('role')) {
        switch (this.role) {
            case 'super-admin':
                this.permissions = [
                    'users.read', 'users.write', 'users.delete',
                    'events.read', 'events.write', 'events.delete',
                    'colleges.read', 'colleges.write', 'colleges.delete',
                    'admins.read', 'admins.write', 'admins.delete',
                    'settings.read', 'settings.write',
                    'analytics.read', 'system.admin'
                ];
                break;
            case 'admin':
                this.permissions = [
                    'users.read', 'users.write', // College-specific
                    'events.read', 'events.write', 'events.delete', // College-specific
                    'analytics.read' // College-specific
                ];
                // Set tenure info for new admin
                if (this.isNew) {
                    this.tenureInfo = {
                        startDate: new Date(),
                        isActive: true
                    };
                }
                break;
        }
    }
    next();
});
// Compare password method
AdminSchema.methods.comparePassword = async function (password) {
    return bcryptjs_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.model('Admin', AdminSchema);
//# sourceMappingURL=Admin.js.map