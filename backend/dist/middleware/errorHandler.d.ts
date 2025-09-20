/**
 * 글로벌 에러 핸들링 미들웨어
 * 애플리케이션에서 발생하는 모든 에러를 중앙에서 처리
 */
import { Request, Response, NextFunction } from 'express';
/**
 * 에러 타입 정의
 */
interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
/**
 * 글로벌 에러 핸들러
 * Express에서 발생하는 모든 에러를 캐치하여 적절한 응답을 반환
 */
export declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 에러 핸들러
 * 존재하지 않는 라우트에 대한 처리
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * 비동기 함수 에러 캐치 래퍼
 * async/await 함수에서 발생하는 에러를 자동으로 next()로 전달
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map