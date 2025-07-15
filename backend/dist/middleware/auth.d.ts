import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}
declare const auth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default auth;
//# sourceMappingURL=auth.d.ts.map