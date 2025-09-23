/**
 * TF-Planner 백엔드 메인 서버 파일
 * Express.js 기반의 REST API 서버
 * Socket.IO를 통한 실시간 채팅 기능 제공
 */

import express from 'express';
// import { connectDB } from './config/db';
import mongoose from "mongoose";
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 라우트 임포트
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import taskRoutes from './routes/taskRoutes';

// 미들웨어 임포트
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

console.log("server.ts 실행됨");

// MongoDB 연결
mongoose.connect("mongodb+srv://root:1234@tf01.d2wibc5.mongodb.net/?retryWrites=true&w=majority&appName=TF01")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err: any) => console.error(err));

  // 채팅방 스키마 & 모델
const chatRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },  // 채팅방 고유 ID
  name: { type: String, required: true },                  // 채팅방 이름
  type: { type: String, enum: ['individual', 'group', 'admin_broadcast'], required: true }, // 채팅방 타입
  participants: [{ type: String, required: true }],        // 참가자 ID 목록
  participantNames: [{ type: String, required: true }],    // 참가자 이름 목록
  createdBy: { type: String, required: true },             // 생성자 ID
  createdAt: { type: Date, default: Date.now },            // 생성 시간
  lastMessageAt: { type: Date, default: Date.now },        // 마지막 메시지 시간
  isActive: { type: Boolean, default: true }               // 활성 상태
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

  // 메시지 스키마 & 모델
const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },   // 채팅방 아이디
  sender: { type: String, required: true },   // 보낸 사람
  content: { type: String, required: true },  // 메시지 내용
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();
const server = createServer(app);



// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 포트 설정
const PORT = process.env.PORT || 3001;

// 소켓 이벤트 (이전의 불완전한 핸들러 제거됨 - 아래의 완전한 핸들러 사용)


// 요청 제한 설정 (DDoS 방지)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(limiter); // 요청 제한
app.use(express.json({ limit: '100mb' })); // JSON 파싱 (파일 업로드 고려)
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 업로드 폴더 생성
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 정적 파일 제공 (업로드된 파일)
app.use('/uploads', express.static(uploadDir));

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명에 타임스탬프 추가하여 중복 방지
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB 제한으로 증가
    files: 1 // 한 번에 하나의 파일만
  },
  fileFilter: (req, file, cb) => {
    // 모든 파일 타입 허용
    cb(null, true);
  }
});

// 로깅 미들웨어
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API 라우트 설정
app.use('/api/auth', authRoutes); // 인증 관련 API
app.use('/api/chat', chatRoutes); // 채팅 관련 API
app.use('/api/tasks', taskRoutes); // 작업 관리 API

// 파일 업로드 API
app.post('/api/chat/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      logger.error('파일 업로드 중 multer 오류:', err);

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: '파일 크기가 너무 큽니다. (최대 100MB)'
        });
      }

      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: '한 번에 하나의 파일만 업로드할 수 있습니다.'
        });
      }

      return res.status(500).json({
        success: false,
        message: '파일 업로드 중 오류가 발생했습니다: ' + err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '파일이 선택되지 않았습니다.'
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      logger.info('파일 업로드 성공:', {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      res.json({
        success: true,
        message: '파일 업로드 성공',
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      logger.error('파일 업로드 처리 중 오류:', error);
      res.status(500).json({
        success: false,
        message: '파일 업로드 처리 중 오류가 발생했습니다.'
      });
    }
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const userSocketMap: { [userId: string]: string[] } = {};

// roomId에서 참여자 ID 목록을 추출하는 헬퍼 함수
const getParticipantsFromRoomId = (roomId: string): string[] => {
  if (roomId.startsWith('dm_')) {
    return roomId.split('_').slice(1);
  }
  // TODO: 그룹 채팅방의 경우, 참여자 목록을 별도의 저장소에서 조회해야 함
  // 현재 구현에서는 1:1 채팅만 완벽하게 지원
  return [];
};

io.on('connection', (socket) => {
  logger.info(`사용자 연결됨: ${socket.id}`);

  // 1. 사용자 등록 (user-join 이벤트 처리)
  socket.on('user-join', async (data: { id: string }) => {
    const userId = data.id;
    if (!userId) return;

    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
    logger.info(`사용자 등록: ${userId} -> 소켓 ${socket.id}`);
    logger.info(`현재 접속자 맵: ${JSON.stringify(userSocketMap)}`);
    
    // 사용자가 참여한 채팅방 목록을 DB에서 로드하여 전송
    try {
      const userRooms = await ChatRoom.find({ 
        participants: userId,
        isActive: true 
      }).sort({ lastMessageAt: -1 });
      
      console.log(`📚 사용자 ${userId}의 채팅방 ${userRooms.length}개 로드됨`);
      
      // 각 채팅방의 최신 메시지도 함께 로드
      const roomsWithMessages = await Promise.all(
        userRooms.map(async (room) => {
          const messages = await Message.find({ roomId: room.roomId })
            .sort({ createdAt: 1 });
          
          return {
            id: room.roomId,
            name: room.name,
            type: room.type,
            participants: room.participants,
            participantNames: room.participantNames,
            messages: messages.map(msg => ({
              id: msg._id.toString(),
              content: msg.content,
              senderId: msg.sender,
              senderName: room.participantNames[room.participants.indexOf(msg.sender)] || 'Unknown',
              timestamp: msg.createdAt.toISOString(),
              type: 'text'
            })),
            createdAt: room.createdAt.toISOString(),
            lastMessageAt: room.lastMessageAt.toISOString(),
            createdBy: room.createdBy,
            isActive: room.isActive
          };
        })
      );
      
      // 클라이언트에게 채팅방 목록 전송
      socket.emit('rooms-loaded', { rooms: roomsWithMessages });
      console.log(`📤 사용자 ${userId}에게 채팅방 목록 전송 완료`);
      
    } catch (error) {
      console.error(`❌ 사용자 채팅방 로드 중 오류:`, error);
    }
  });

  // 채팅방 참가 (기존 로직 유지, UI상태 표시에 필요할 수 있음)
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.info(`사용자 ${socket.id}가 방 ${roomId}에 참가했습니다.`);
  });

  // 채팅방 나가기 (기존 로직 유지)
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    logger.info(`사용자 ${socket.id}가 방 ${roomId}에서 나갔습니다.`);
  });

  // 방의 기존 메시지 가져오기
  socket.on("loadMessages", async (roomId, callback) => {
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    callback(messages);
  });

  // 채팅방 생성 이벤트
  socket.on("create-room", async (data) => {
    const { room, participants } = data;
    console.log(`🏠 새 채팅방 생성:`, room.name, "참여자:", participants);
    
    try {
      // 1. 참가자 정보 검증 및 정리
      console.log(`🔍 채팅방 생성 전 참가자 검증:`);
      console.log(`  - 받은 참가자: ${room.participants.join(', ')}`);
      console.log(`  - 참가자 수: ${room.participants.length}명`);
      console.log(`  - 참가자 이름: ${room.participantNames.join(', ')}`);
      
      // 중복 제거 및 유효성 검사
      const validParticipants = [...new Set(room.participants)].filter((id: any): id is string => id && typeof id === 'string' && id.trim() !== '');
      const validParticipantNames = room.participantNames.slice(0, validParticipants.length);
      
      console.log(`✅ 검증된 참가자: ${validParticipants.join(', ')} (${validParticipants.length}명)`);
      
      // 2. DB에 채팅방 저장
      const newChatRoom = new ChatRoom({
        roomId: room.id,
        name: room.name,
        type: room.type,
        participants: validParticipants,
        participantNames: validParticipantNames,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        lastMessageAt: room.lastMessageAt || room.createdAt,
        isActive: true
      });
      
      await newChatRoom.save();
      console.log(`💾 채팅방 DB 저장 완료: ${room.id} (참가자 ${validParticipants.length}명)`);
      
      // 3. 완전한 방 정보 객체 생성
      const completeRoomInfo = {
        id: room.id,
        name: room.name,
        type: room.type,
        participants: validParticipants,
        participantNames: validParticipantNames,
        createdAt: room.createdAt,
        lastMessageAt: room.lastMessageAt || room.createdAt,
        createdBy: room.createdBy,
        isActive: true
      };
      
      // 4. 모든 참여자에게 방 생성 알림
      validParticipants.forEach((participantId: string) => {
        const userSockets = userSocketMap[participantId];
        if (userSockets && userSockets.length > 0) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("room-created", {
              room: completeRoomInfo,
              creatorId: room.createdBy,
              fullParticipantList: validParticipants,
              fullParticipantNames: validParticipantNames,
              participantCount: validParticipants.length
            });
            
            // 추가로 참가자 업데이트 이벤트도 전송 (동기화 보장)
            io.to(socketId).emit('participants-updated', {
              roomId: room.id,
              roomInfo: completeRoomInfo,
              participants: validParticipants,
              participantNames: validParticipantNames,
              participantCount: validParticipants.length
            });
          });
        }
      });
      
      console.log(`📢 방 생성 및 참가자 동기화 완료 - 대상: ${validParticipants.join(', ')} (${validParticipants.length}명)`);
    } catch (error) {
      console.error(`❌ 채팅방 생성 중 오류:`, error);
    }
  });

  // 채팅방 초대 이벤트
  socket.on("invite-to-room", (data) => {
    const { room, newParticipants, invitedBy } = data;
    console.log(`📬 채팅방 초대:`, room.name, "새 참여자:", newParticipants, "초대자:", invitedBy);
    
    // 모든 참여자에게 방 업데이트 알림
    room.participants.forEach((participantId: string) => {
      if (participantId !== invitedBy) {
        const userSockets = userSocketMap[participantId];
        if (userSockets && userSockets.length > 0) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit("room-invited", {
              room: room,
              invitedBy: invitedBy,
              newParticipants: newParticipants
            });
          });
        }
      }
    });
  });

  // 2. 메시지 전송 로직 수정
  socket.on('send-message', async (data) => {
    const message = {
      id: Date.now().toString(),
      content: data.content,
      senderId: data.senderId,
      senderName: data.senderName,
      timestamp: new Date().toISOString(),
      type: data.type || 'text',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      roomId: data.roomId
    };

    const roomId = data.roomId;
    
    try {
      // 1. 메시지를 DB에 저장
      const newMessage = new Message({ 
        roomId, 
        sender: data.senderId, 
        content: data.content 
      });
      await newMessage.save();
      console.log(`💾 메시지 DB 저장 완료: ${roomId}`);
      
      // 2. DB에서 채팅방 정보 조회 (가장 최신 참가자 목록 확보)
      const chatRoom = await ChatRoom.findOne({ roomId: roomId });
      if (!chatRoom) {
        console.error(`❌ 채팅방을 찾을 수 없음: ${roomId}`);
        return;
      }
      
      // 3. DB의 lastMessageAt 업데이트
      await ChatRoom.updateOne(
        { roomId: roomId },
        { lastMessageAt: new Date() }
      );
      
      // 4. DB에서 가져온 정확한 참가자 목록 사용
      const participants = chatRoom.participants;
      const participantNames = chatRoom.participantNames;
      
      console.log(`📤 메시지 전송 -> 방: ${roomId}, DB 참여자: ${participants.join(', ')}`);
      console.log(`📋 참여자 이름: ${participantNames.join(', ')}`);
      
      // 5. 완전한 방 정보 생성 (DB 기반)
      const completeRoomInfo = {
        id: roomId,
        name: chatRoom.name,
        type: chatRoom.type,
        participants: participants,
        participantNames: participantNames,
        createdAt: chatRoom.createdAt.toISOString(),
        lastMessageAt: new Date().toISOString(),
        createdBy: chatRoom.createdBy,
        isActive: chatRoom.isActive
      };
      
      // 6. 모든 참여자에게 메시지 전송
      participants.forEach(userId => {
        const userSockets = userSocketMap[userId];
        if (userSockets && userSockets.length > 0) {
          userSockets.forEach(socketId => {
            // 받는 사람이 방을 모를 수 있으니 방 정보를 먼저 보냄 (발신자 제외)
            if (userId !== message.senderId) {
              console.log(`🏠 강제 방 동기화 전송 -> 받는사람: ${userId}, 참가자: ${participants.length}명`);
              io.to(socketId).emit('force-create-room', {
                room: completeRoomInfo
              });
            }

            // 메시지와 완전한 방 정보를 전송
            io.to(socketId).emit('receive-message', {
              roomId: roomId,
              message: message,
              roomInfo: completeRoomInfo
            });

            // 발신자를 제외한 모든 참여자에게 알림 전송
            if (userId !== message.senderId) {
              io.to(socketId).emit('new-message-notification', {
                roomId: roomId,
                senderName: message.senderName,
                message: message
              });
            }
          });
        } else {
          console.log(`⚠️ 사용자 ${userId}의 소켓을 찾을 수 없음`);
        }
      });
      
      console.log(`✅ 메시지 전송 완료 - 대상: ${participants.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ 메시지 전송 중 오류:`, error);
    }
  });

  // 참가자 목록 업데이트 및 동기화 이벤트
  socket.on('update-participants', async (data: { roomId: string }) => {
    const { roomId } = data;
    console.log(`🔄 참가자 목록 업데이트 요청: ${roomId}`);
    
    try {
      // DB에서 최신 채팅방 정보 조회
      const chatRoom = await ChatRoom.findOne({ roomId: roomId });
      if (!chatRoom) {
        console.error(`❌ 채팅방을 찾을 수 없음: ${roomId}`);
        return;
      }
      
      // 최신 참가자 정보 생성
      const updatedRoomInfo = {
        id: roomId,
        name: chatRoom.name,
        type: chatRoom.type,
        participants: chatRoom.participants,
        participantNames: chatRoom.participantNames,
        createdAt: chatRoom.createdAt.toISOString(),
        lastMessageAt: chatRoom.lastMessageAt.toISOString(),
        createdBy: chatRoom.createdBy,
        isActive: chatRoom.isActive
      };
      
      console.log(`📤 참가자 목록 동기화 - 방: ${roomId}, 참가자: ${chatRoom.participants.length}명`);
      console.log(`👥 참가자 ID: ${chatRoom.participants.join(', ')}`);
      console.log(`📝 참가자 이름: ${chatRoom.participantNames.join(', ')}`);
      
      // 모든 참가자에게 업데이트된 참가자 목록 전송
      chatRoom.participants.forEach(userId => {
        const userSockets = userSocketMap[userId];
        if (userSockets && userSockets.length > 0) {
          userSockets.forEach(socketId => {
            io.to(socketId).emit('participants-updated', {
              roomId: roomId,
              roomInfo: updatedRoomInfo,
              participants: chatRoom.participants,
              participantNames: chatRoom.participantNames,
              participantCount: chatRoom.participants.length
            });
          });
        }
      });
      
      console.log(`✅ 참가자 목록 동기화 완료 - 대상: ${chatRoom.participants.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ 참가자 목록 업데이트 중 오류:`, error);
    }
  });

  // 새로운 참가자 입장 이벤트 (그룹 채팅 전용)
  socket.on('join-group-room', async (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    console.log(`👋 그룹 채팅방 입장: ${userId} -> ${roomId}`);
    
    try {
      // DB에서 채팅방 조회
      const chatRoom = await ChatRoom.findOne({ roomId: roomId });
      if (!chatRoom) {
        console.error(`❌ 채팅방을 찾을 수 없음: ${roomId}`);
        return;
      }
      
      // 이미 참가자인지 확인
      if (!chatRoom.participants.includes(userId)) {
        console.log(`➕ 새 참가자 추가: ${userId}`);
        
        // userMap에서 사용자 이름 조회
        const userMap: { [key: string]: string } = {
          '1': '김철수', '2': '박영희', '3': '이민수', 
          '4': '최지영', '5': '정수진', '6': '강호동'
        };
        const userName = userMap[userId] || 'Unknown User';
        
        // DB 업데이트
        await ChatRoom.updateOne(
          { roomId: roomId },
          { 
            $push: { 
              participants: userId,
              participantNames: userName
            }
          }
        );
        
        // 업데이트된 채팅방 정보 다시 조회
        const updatedChatRoom = await ChatRoom.findOne({ roomId: roomId });
        if (updatedChatRoom) {
          // 모든 기존 참가자에게 업데이트 알림
          updatedChatRoom.participants.forEach(participantId => {
            const userSockets = userSocketMap[participantId];
            if (userSockets && userSockets.length > 0) {
              userSockets.forEach(socketId => {
                io.to(socketId).emit('participants-updated', {
                  roomId: roomId,
                  roomInfo: {
                    id: roomId,
                    name: updatedChatRoom.name,
                    type: updatedChatRoom.type,
                    participants: updatedChatRoom.participants,
                    participantNames: updatedChatRoom.participantNames,
                    createdAt: updatedChatRoom.createdAt.toISOString(),
                    lastMessageAt: updatedChatRoom.lastMessageAt.toISOString(),
                    createdBy: updatedChatRoom.createdBy,
                    isActive: updatedChatRoom.isActive
                  },
                  participants: updatedChatRoom.participants,
                  participantNames: updatedChatRoom.participantNames,
                  participantCount: updatedChatRoom.participants.length,
                  newParticipant: { id: userId, name: userName }
                });
              });
            }
          });
        }
      }
      
      // Socket.IO 방 입장
      socket.join(roomId);
      console.log(`📌 소켓 방 입장 완료: ${userId} -> ${roomId}`);
      
    } catch (error) {
      console.error(`❌ 그룹 채팅방 입장 중 오류:`, error);
    }
  });

  // 3. 연결 해제 시 사용자 정보 제거
  socket.on('disconnect', () => {
    let disconnectedUserId: string | null = null;
    for (const userId in userSocketMap) {
      const socketIds = userSocketMap[userId];
      const index = socketIds.indexOf(socket.id);
      if (index !== -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          delete userSocketMap[userId];
        }
        disconnectedUserId = userId;
        break;
      }
    }
    logger.info(`사용자 연결 해제됨: ${socket.id} (ID: ${disconnectedUserId || 'N/A'})`);
    logger.info(`현재 접속자 맵: ${JSON.stringify(userSocketMap)}`);
  });
});

// 에러 핸들링 미들웨어 (마지막에 위치)
app.use(errorHandler);

// 서버 시작
server.listen(PORT, () => {
  logger.info(`🚀 TF-Planner 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
  logger.info(`📱 프론트엔드 URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});


// 간단 테스트 라우트
app.get('/', (req, res) => {
  res.send('Server is running');
});


export default app;