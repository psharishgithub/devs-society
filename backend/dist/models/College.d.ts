import mongoose, { Document } from 'mongoose';
export interface ICollege extends Document {
    name: string;
    code: string;
    location: string;
    address: string;
    tenureHeads: {
        adminId: mongoose.Types.ObjectId;
        startDate: Date;
        endDate?: Date;
        isActive: boolean;
    }[];
    contactInfo: {
        email: string;
        phone: string;
        website?: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICollege, {}, {}, {}, mongoose.Document<unknown, {}, ICollege, {}> & ICollege & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=College.d.ts.map