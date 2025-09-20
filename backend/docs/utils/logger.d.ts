/**
 * 로깅 유틸리티
 * Winston을 사용한 구조화된 로깅 시스템
 */
import winston from 'winston';
export declare const logger: winston.Logger;
/**
 * HTTP 요청 로깅을 위한 미들웨어 생성 함수
 */
export declare const createHttpLogger: () => (req: any, res: any, next: any) => void;
/**
 * 개발 환경에서만 디버그 로그 출력
 */
export declare const debugLog: (message: string, data?: any) => void;
//# sourceMappingURL=logger.d.ts.map