/**
 * 인증 컨트롤러
 * 사용자 인증 관련 비즈니스 로직을 처리
 */
import { Request, Response } from 'express';
export declare const authController: {
    register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    logout: (req: Request, res: Response) => void;
    verifyToken: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    refreshToken: (req: Request, res: Response) => void;
};
//# sourceMappingURL=authController.d.ts.map