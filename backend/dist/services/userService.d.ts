export interface IUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    college: string;
    collegeRef?: string;
    batchYear: string;
    role: 'core-member' | 'board-member' | 'special-member' | 'other';
    photoUrl?: string;
    memberId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateUserData {
    fullName: string;
    email: string;
    phone: string;
    college: string;
    collegeRef?: string;
    batchYear: string;
    role?: 'core-member' | 'board-member' | 'special-member' | 'other';
    photoUrl?: string;
}
export interface UpdateUserData {
    fullName?: string;
    email?: string;
    phone?: string;
    college?: string;
    collegeRef?: string;
    batchYear?: string;
    role?: 'core-member' | 'board-member' | 'special-member' | 'other';
    photoUrl?: string;
    isActive?: boolean;
}
declare class UserService {
    private get supabase();
    private generateMemberId;
    validateBatchYearAssignment(collegeId: string, batchYear: string): Promise<{
        valid: boolean;
        adminName?: string;
        error?: string;
    }>;
    getAvailableBatchYears(collegeId: string): Promise<Array<{
        year: string;
        adminName: string;
    }>>;
    createUser(userData: CreateUserData): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    findByMemberId(memberId: string): Promise<IUser | null>;
    updateUser(id: string, updateData: UpdateUserData): Promise<IUser | null>;
    getAllUsers(page?: number, limit?: number, activeOnly?: boolean): Promise<{
        users: IUser[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
    }>;
    getUsersByCollege(collegeName: string, activeOnly?: boolean): Promise<IUser[]>;
    getUsersByBatch(batchYear: string, activeOnly?: boolean): Promise<IUser[]>;
    deleteUser(id: string): Promise<boolean>;
    getUserCount(activeOnly?: boolean): Promise<number>;
    searchUsers(searchTerm: string, activeOnly?: boolean): Promise<IUser[]>;
    private mapDbUserToUser;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=userService.d.ts.map