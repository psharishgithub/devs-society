import { Request, Response, NextFunction } from 'express';
declare const adminAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default adminAuth;
//# sourceMappingURL=adminAuth.d.ts.map