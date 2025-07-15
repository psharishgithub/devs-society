import mongoose, { Document } from 'mongoose';
export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    eventType: 'college-specific' | 'open-to-all';
    targetCollege?: mongoose.Types.ObjectId;
    maxAttendees: number;
    category: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other';
    organizer: {
        adminId: mongoose.Types.ObjectId;
        name: string;
        contact: string;
    };
    registrations: {
        userId: mongoose.Types.ObjectId;
        registeredAt: Date;
        status: 'confirmed' | 'waitlisted' | 'cancelled';
    }[];
    requirements?: string[];
    prizes?: string[];
    registrationDeadline: Date;
    isActive: boolean;
    isPaid: boolean;
    pricing: {
        tenure: string;
        price: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    photoUrl?: string;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}> & IEvent & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Event.d.ts.map