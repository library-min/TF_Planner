"use strict";
/**
 * 로깅 유틸리티
 * Winston을 사용한 구조화된 로깅 시스템
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLog = exports.createHttpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// 로그 레벨 정의
const levels = {
    error: 0, // 에러 로그
    warn: 1, // 경고 로그
    info: 2, // 정보 로그
    http: 3, // HTTP 요청 로그
    debug: 4 // 디버그 로그
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
winston_1.default.addColors(colors);
// 로그 포맷 정의
const format = winston_1.default.format.combine(
// 타임스탬프 추가
winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), 
// 색상 추가 (콘솔 출력용)
winston_1.default.format.colorize({ all: true }), 
// 에러 스택 트레이스 포함
winston_1.default.format.errors({ stack: true }), 
// JSON 형태로 구조화
winston_1.default.format.json(), 
// 사람이 읽기 쉬운 형태로 포맷팅
winston_1.default.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    let logMessage = `${timestamp} [${level}]: ${message}`;
    // 추가 데이터가 있으면 JSON으로 출력
    if (Object.keys(args).length > 0) {
        logMessage += ` ${JSON.stringify(args, null, 2)}`;
    }
    return logMessage;
}));
// 전송자(Transports) 설정
const transports = [
    // 콘솔 출력
    new winston_1.default.transports.Console(),
    // 에러 로그 파일
    new winston_1.default.transports.File({
        filename: path_1.default.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json())
    }),
    // 전체 로그 파일
    new winston_1.default.transports.File({
        filename: path_1.default.join(__dirname, '../../logs/combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
    })
];
// Winston 로거 생성
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    levels,
    format,
    transports,
    // 처리되지 않은 예외 캐치
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../../logs/exceptions.log')
        })
    ],
    // 처리되지 않은 Promise rejection 캐치
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../../logs/rejections.log')
        })
    ]
});
// 로그 디렉토리가 없으면 생성하지 않고 콘솔에만 출력
// 실제 운영에서는 로그 디렉토리를 미리 생성해야 함
/**
 * HTTP 요청 로깅을 위한 미들웨어 생성 함수
 */
const createHttpLogger = () => {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            exports.logger.http({
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
exports.createHttpLogger = createHttpLogger;
/**
 * 개발 환경에서만 디버그 로그 출력
 */
const debugLog = (message, data) => {
    if (process.env.NODE_ENV === 'development') {
        exports.logger.debug(message, data);
    }
};
exports.debugLog = debugLog;
//# sourceMappingURL=logger.js.map