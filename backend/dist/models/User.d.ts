import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    fullName: string;
    email: string;
    phone: string;
    college: string;
    collegeRef?: mongoose.Types.ObjectId;
    batchYear: string;
    role: 'core-member' | 'board-member' | 'special-member' | 'other';
    photoUrl?: string;
    memberId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map