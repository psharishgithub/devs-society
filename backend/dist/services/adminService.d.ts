export interface IAdmin {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'super-admin' | 'admin';
    assignedCollege?: {
        id: string;
        name: string;
        code: string;
        location: string;
    } | null;
    batchYear?: number;
    permissions: string[];
    tenureInfo?: {
        startDate: string;
        endDate?: string;
        isActive: boolean;
    };
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    collegeInfo?: {
        id: string;
        name: string;
        code: string;
        location: string;
    };
}
export interface CreateAdminData {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: 'super-admin' | 'admin';
    assignedCollege?: string;
    batchYear?: number;
    permissions?: string[];
}
export interface UpdateAdminData {
    username?: string;
    email?: string;
    password?: string;
    fullName?: string;
    role?: 'super-admin' | 'admin';
    assignedCollege?: string;
    batchYear?: number;
    permissions?: string[];
    tenureInfo?: {
        startDate?: string;
        endDate?: string;
        isActive?: boolean;
    };
    isActive?: boolean;
    lastLogin?: string;
}
declare class AdminService {
    private supabase;
    createAdmin(adminData: CreateAdminData): Promise<IAdmin>;
    findByEmail(email: string): Promise<IAdmin | null>;
    findByUsername(username: string): Promise<IAdmin | null>;
    findById(id: string): Promise<IAdmin | null>;
    comparePassword(admin: IAdmin, password: string): Promise<boolean>;
    verifyPassword(adminId: string, password: string): Promise<boolean>;
    updatePassword(adminId: string, newPassword: string): Promise<boolean>;
    updateAdmin(id: string, updateData: UpdateAdminData): Promise<IAdmin | null>;
    getAllAdmins(activeOnly?: boolean): Promise<IAdmin[]>;
    getAdminsByRole(role: 'super-admin' | 'admin', activeOnly?: boolean): Promise<IAdmin[]>;
    getAdminByCollege(collegeId: string): Promise<IAdmin | null>;
    endTenure(adminId: string, endDate?: string): Promise<boolean>;
    transferAdmin(adminId: string, newCollegeId: string): Promise<boolean>;
    deleteAdmin(id: string): Promise<boolean>;
    updateLastLogin(id: string): Promise<boolean>;
    assignAdminToCollege(adminId: string, collegeId: string, startDate?: string, batchYear?: number): Promise<boolean>;
    endCurrentTenure(adminId: string, endDate?: string): Promise<boolean>;
    getAdminsByCollege(collegeId: string, activeOnly?: boolean): Promise<IAdmin[]>;
    getUnassignedAdmins(): Promise<IAdmin[]>;
    getAdminsForEvents(): Promise<any>;
    private mapDbAdminToAdminWithCollege;
    private mapDbAdminToAdmin;
    private mapDbAdminWithTenure;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=adminService.d.ts.map