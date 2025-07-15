import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string;
                username: string;
                email: string;
                role: string;
                permissions?: string[];
                assignedCollege?: string | null;
            };
        }
    }
}
export declare const adminAuth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requirePermissions: (permissions: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireCollegeAccess: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const addCollegeFilter: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateTenureHead: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=roleBasedAuth.d.ts.map