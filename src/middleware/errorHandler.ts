/**
 * 글로벌 에러 핸들링 미들웨어
 * 애플리케이션에서 발생하는 모든 에러를 중앙에서 처리
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

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
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 에러 로깅
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 기본 에러 상태 코드 설정
  let statusCode = err.statusCode || 500;
  let message = err.message || '서버 내부 오류가 발생했습니다.';

  // 개발 환경에서는 상세한 에러 정보 제공
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 특정 에러 타입별 처리
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '입력 데이터가 올바르지 않습니다.';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '인증이 필요합니다.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '토큰이 만료되었습니다.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = '잘못된 ID 형식입니다.';
  }

  // 에러 응답 구성
  const errorResponse: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.url
  };

  // 개발 환경에서만 스택 트레이스 포함
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  // 클라이언트에 에러 응답 전송
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 에러 핸들러
 * 존재하지 않는 라우트에 대한 처리
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const message = `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`;
  
  logger.warn({
    message,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * 비동기 함수 에러 캐치 래퍼
 * async/await 함수에서 발생하는 에러를 자동으로 next()로 전달
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};