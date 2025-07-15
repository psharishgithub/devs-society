export interface ICollege {
    id: string;
    name: string;
    code: string;
    location: string;
    address: string;
    contactInfo: {
        email: string;
        phone: string;
        website?: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    currentTenureHeads?: Array<{
        id: string;
        adminId: string;
        adminName: string;
        adminEmail: string;
        batchYear: number;
        startDate: string;
        isActive: boolean;
    }> | null;
}
export interface CreateCollegeData {
    name: string;
    code: string;
    location: string;
    address: string;
    contactInfo: {
        email: string;
        phone: string;
        website?: string;
    };
}
export interface UpdateCollegeData {
    name?: string;
    code?: string;
    location?: string;
    address?: string;
    contactInfo?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    isActive?: boolean;
}
export interface ITenureHead {
    id: string;
    collegeId: string;
    adminId: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
declare class CollegeService {
    private supabase;
    createCollege(collegeData: CreateCollegeData): Promise<ICollege>;
    findById(id: string): Promise<ICollege | null>;
    findByCode(code: string): Promise<ICollege | null>;
    findByName(name: string): Promise<ICollege | null>;
    updateCollege(id: string, updateData: UpdateCollegeData): Promise<ICollege | null>;
    getAllColleges(activeOnly?: boolean): Promise<ICollege[]>;
    deleteCollege(id: string): Promise<boolean>;
    setTenureHead(collegeId: string, adminId: string, startDate?: string): Promise<ITenureHead>;
    getCurrentTenureHead(collegeId: string): Promise<ICollege | null>;
    endCurrentTenureHead(collegeId: string, endDate?: string): Promise<boolean>;
    getTenureHistory(collegeId: string): Promise<ITenureHead[]>;
    getCollegesByAdmin(adminId: string): Promise<ICollege[]>;
    searchColleges(searchTerm: string, activeOnly?: boolean): Promise<ICollege[]>;
    private mapDbCollegeToCollege;
    private mapDbCollegeToCollegeWithAdmin;
    private mapDbTenureHeadToTenureHead;
}
declare const _default: CollegeService;
export default _default;
//# sourceMappingURL=collegeService.d.ts.map