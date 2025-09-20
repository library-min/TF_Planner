/**
 * 유효성 검증 미들웨어
 * 요청 데이터의 유효성을 검증하는 미들웨어 함수들
 */
import { Request, Response, NextFunction } from 'express';
/**
 * 인증 관련 데이터 유효성 검증
 * 이메일과 비밀번호 형식을 검증
 */
export declare const validateAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * 작업 데이터 유효성 검증
 */
export declare const validateTask: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * ID 파라미터 유효성 검증
 */
export declare const validateId: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validation.d.ts.map