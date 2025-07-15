export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}
export declare const storageService: {
    uploadProfilePhoto: (fileBuffer: Buffer, fileName: string, userId: string) => Promise<UploadResult>;
    deleteProfilePhoto: (photoUrl: string) => Promise<UploadResult>;
    updateProfilePhoto: (fileBuffer: Buffer, fileName: string, userId: string, oldPhotoUrl?: string) => Promise<UploadResult>;
    uploadEventPhoto: (fileBuffer: Buffer, fileName: string, eventId: string) => Promise<UploadResult>;
};
export default storageService;
//# sourceMappingURL=supabaseStorage.d.ts.map