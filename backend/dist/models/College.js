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
const CollegeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        uppercase: true,
        maxlength: 10
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    tenureHeads: [{
            adminId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Admin',
                required: true
            },
            startDate: {
                type: Date,
                required: true,
                default: Date.now
            },
            endDate: {
                type: Date
            },
            isActive: {
                type: Boolean,
                default: true
            }
        }],
    contactInfo: {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        website: {
            type: String,
            trim: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Index for efficient queries
CollegeSchema.index({ code: 1 });
CollegeSchema.index({ 'tenureHeads.adminId': 1 });
CollegeSchema.index({ isActive: 1 });
// Get current tenure head
CollegeSchema.methods.getCurrentTenureHead = function () {
    const now = new Date();
    return this.tenureHeads.find((tenure) => tenure.isActive &&
        tenure.startDate <= now &&
        (!tenure.endDate || tenure.endDate >= now));
};
// Set new tenure head (automatically deactivates previous)
CollegeSchema.methods.setNewTenureHead = function (adminId, startDate) {
    // Deactivate current tenure head
    this.tenureHeads.forEach((tenure) => {
        if (tenure.isActive) {
            tenure.isActive = false;
            tenure.endDate = startDate || new Date();
        }
    });
    // Add new tenure head
    this.tenureHeads.push({
        adminId,
        startDate: startDate || new Date(),
        isActive: true
    });
};
exports.default = mongoose_1.default.model('College', CollegeSchema);
//# sourceMappingURL=College.js.map