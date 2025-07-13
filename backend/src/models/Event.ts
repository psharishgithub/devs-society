import mongoose, { Document, Schema } from 'mongoose'

export interface IEvent extends Document {
  title: string
  description: string
  date: Date
  time: string
  location: string
  eventType: 'college-specific' | 'open-to-all'
  targetCollege?: mongoose.Types.ObjectId // Only for college-specific events
  maxAttendees: number
  category: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other'
  organizer: {
    adminId: mongoose.Types.ObjectId
    name: string
    contact: string
  }
  registrations: {
    userId: mongoose.Types.ObjectId
    registeredAt: Date
    status: 'confirmed' | 'waitlisted' | 'cancelled'
  }[]
  requirements?: string[]
  prizes?: string[]
  registrationDeadline: Date
  isActive: boolean
  isPaid: boolean
  pricing: { tenure: string, price: number }[]
  createdAt: Date
  updatedAt: Date
}

const EventSchema: Schema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'College',
    required: function(this: IEvent) {
      return this.eventType === 'college-specific'
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
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
  }]
}, {
  timestamps: true
})

// Indexes for efficient queries
EventSchema.index({ date: 1 })
EventSchema.index({ eventType: 1 })
EventSchema.index({ targetCollege: 1 })
EventSchema.index({ 'organizer.adminId': 1 })
EventSchema.index({ isActive: 1 })

// Virtual for available spots
EventSchema.virtual('availableSpots').get(function(this: IEvent) {
  const confirmedRegistrations = this.registrations.filter(
    (reg) => reg.status === 'confirmed'
  ).length
  return Math.max(0, this.maxAttendees - confirmedRegistrations)
})

// Virtual for registration status
EventSchema.virtual('registrationStatus').get(function(this: IEvent) {
  const now = new Date()
  if (now > this.registrationDeadline) return 'closed'
  const availableSpots = this.maxAttendees - this.registrations.filter(reg => reg.status === 'confirmed').length
  if (availableSpots <= 0) return 'full'
  return 'open'
})

// Check if user can register
EventSchema.methods.canUserRegister = function(this: IEvent, userId: mongoose.Types.ObjectId) {
  const now = new Date()
  
  // Check if registration is still open
  if (now > this.registrationDeadline) return { canRegister: false, reason: 'Registration deadline passed' }
  
  // Check if user already registered
  const existingRegistration = this.registrations.find(
    (reg) => reg.userId.toString() === userId.toString() && reg.status !== 'cancelled'
  )
  if (existingRegistration) return { canRegister: false, reason: 'Already registered' }
  
  // Check if spots available
  const confirmedCount = this.registrations.filter((reg) => reg.status === 'confirmed').length
  if (confirmedCount >= this.maxAttendees) {
    return { canRegister: true, status: 'waitlisted' }
  }
  
  return { canRegister: true, status: 'confirmed' }
}

// Add user registration
EventSchema.methods.addRegistration = function(userId: mongoose.Types.ObjectId) {
  const canRegister = this.canUserRegister(userId)
  if (!canRegister.canRegister) {
    throw new Error(canRegister.reason)
  }
  
  this.registrations.push({
    userId,
    registeredAt: new Date(),
    status: canRegister.status || 'confirmed'
  })
  
  return this.save()
}

export default mongoose.model<IEvent>('Event', EventSchema) 