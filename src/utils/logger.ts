/**
 * 로깅 유틸리티
 * Winston을 사용한 구조화된 로깅 시스템
 */

import winston from 'winston';
import path from 'path';

// 로그 레벨 정의
const levels = {
  error: 0,    // 에러 로그
  warn: 1,     // 경고 로그
  info: 2,     // 정보 로그
  http: 3,     // HTTP 요청 로그
  debug: 4     // 디버그 로그
};

// 로그 색상 정의
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Winston 색상 설정
winston.addColors(colors);

// 로그 포맷 정의
const format = winston.format.combine(
  // 타임스탬프 추가
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  
  // 색상 추가 (콘솔 출력용)
  winston.format.colorize({ all: true }),
  
  // 에러 스택 트레이스 포함
  winston.format.errors({ stack: true }),
  
  // JSON 형태로 구조화
  winston.format.json(),
  
  // 사람이 읽기 쉬운 형태로 포맷팅
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // 추가 데이터가 있으면 JSON으로 출력
    if (Object.keys(args).length > 0) {
      logMessage += ` ${JSON.stringify(args, null, 2)}`;
    }
    
    return logMessage;
  })
);

// 전송자(Transports) 설정
const transports = [
  // 콘솔 출력
  new winston.transports.Console(),
  
  // 에러 로그 파일
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  }),
  
  // 전체 로그 파일
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Winston 로거 생성
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
  
  // 처리되지 않은 예외 캐치
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/exceptions.log') 
    })
  ],
  
  // 처리되지 않은 Promise rejection 캐치
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/rejections.log') 
    })
  ]
});

// 로그 디렉토리가 없으면 생성하지 않고 콘솔에만 출력
// 실제 운영에서는 로그 디렉토리를 미리 생성해야 함

/**
 * HTTP 요청 로깅을 위한 미들웨어 생성 함수
 */
export const createHttpLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.http({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        contentLength: res.get('Content-Length'),
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    });
    
    next();
  };
};

/**
 * 개발 환경에서만 디버그 로그 출력
 */
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(message, data);
  }
};