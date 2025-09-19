/**
 * TF-Planner 백엔드 메인 서버 파일
 * Express.js 기반의 REST API 서버
 * Socket.IO를 통한 실시간 채팅 기능 제공
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// 라우트 임포트
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import taskRoutes from './routes/taskRoutes';

// 미들웨어 임포트
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();
const server = createServer(app);

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// 포트 설정
const PORT = process.env.PORT || 3001;

// 요청 제한 설정 (DDoS 방지)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(limiter); // 요청 제한
app.use(express.json({ limit: '10mb' })); // JSON 파싱 (파일 업로드 고려)
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API 라우트 설정
app.use('/api/auth', authRoutes); // 인증 관련 API
app.use('/api/chat', chatRoutes); // 채팅 관련 API
app.use('/api/tasks', taskRoutes); // 작업 관리 API

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
  logger.info(`사용자 연결됨: ${socket.id}`);

  // 채팅방 참가
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.info(`사용자 ${socket.id}가 방 ${roomId}에 참가했습니다.`);
  });

  // 채팅방 나가기
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    logger.info(`사용자 ${socket.id}가 방 ${roomId}에서 나갔습니다.`);
  });

  // 메시지 전송
  socket.on('send-message', (data) => {
    socket.to(data.roomId).emit('receive-message', data);
    logger.info(`메시지 전송: 방 ${data.roomId}`);
  });

  // 연결 해제
  socket.on('disconnect', () => {
    logger.info(`사용자 연결 해제됨: ${socket.id}`);
  });
});

// 에러 핸들링 미들웨어 (마지막에 위치)
app.use(errorHandler);

// 서버 시작
server.listen(PORT, () => {
  logger.info(`🚀 TF-Planner 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
  logger.info(`📱 프론트엔드 URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

export default app;