"use strict";
/**
 * TF-Planner 백엔드 메인 서버 파일
 * Express.js 기반의 REST API 서버
 * Socket.IO를 통한 실시간 채팅 기능 제공
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 라우트 임포트
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
// 미들웨어 임포트
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
// 환경 변수 로드
dotenv_1.default.config();
// Express 앱 생성
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Socket.IO 서버 설정
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
// 포트 설정
const PORT = process.env.PORT || 3001;
// 요청 제한 설정 (DDoS 방지)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 최대 100개 요청
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});
// 미들웨어 설정
app.use((0, helmet_1.default)()); // 보안 헤더 설정
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(limiter); // 요청 제한
app.use(express_1.default.json({ limit: '10mb' })); // JSON 파싱 (파일 업로드 고려)
app.use(express_1.default.urlencoded({ extended: true }));
// 로깅 미들웨어
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
// API 라우트 설정
app.use('/api/auth', authRoutes_1.default); // 인증 관련 API
app.use('/api/chat', chatRoutes_1.default); // 채팅 관련 API
app.use('/api/tasks', taskRoutes_1.default); // 작업 관리 API
// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Socket.IO 연결 처리
io.on('connection', (socket) => {
    logger_1.logger.info(`사용자 연결됨: ${socket.id}`);
    // 채팅방 참가
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        logger_1.logger.info(`사용자 ${socket.id}가 방 ${roomId}에 참가했습니다.`);
    });
    // 채팅방 나가기
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        logger_1.logger.info(`사용자 ${socket.id}가 방 ${roomId}에서 나갔습니다.`);
    });
    // 메시지 전송
    socket.on('send-message', (data) => {
        socket.to(data.roomId).emit('receive-message', data);
        logger_1.logger.info(`메시지 전송: 방 ${data.roomId}`);
    });
    // 연결 해제
    socket.on('disconnect', () => {
        logger_1.logger.info(`사용자 연결 해제됨: ${socket.id}`);
    });
});
// 에러 핸들링 미들웨어 (마지막에 위치)
app.use(errorHandler_1.errorHandler);
// 서버 시작
server.listen(PORT, () => {
    logger_1.logger.info(`🚀 TF-Planner 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
    logger_1.logger.info(`📱 프론트엔드 URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map