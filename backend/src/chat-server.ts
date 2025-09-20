/**
 * 실시간 채팅 서버
 * Socket.IO를 사용한 실시간 채팅 기능과 REST API를 제공
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const PORT = 3001;

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 미들웨어 설정
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// 채팅 데이터 임시 저장소 (실제로는 데이터베이스 사용)
const chatRooms: { [roomId: string]: any[] } = {};
const users: { [socketId: string]: { id: string; name: string; roomId?: string } } = {};

// 1:1 채팅방 ID 생성 함수
function generateDirectMessageRoomId(userId1: string, userId2: string): string {
  // 두 사용자 ID를 정렬해서 일관된 방 ID 생성
  const sortedIds = [userId1, userId2].sort();
  return `dm_${sortedIds[0]}_${sortedIds[1]}`;
}

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 TF-Planner 백엔드 서버가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString(),
    features: ['실시간 채팅', 'REST API', '사용자 인증'],
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      tasks: '/api/tasks/*',
      chat: '/api/chat/*'
    }
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '백엔드 서버가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString(),
    connectedUsers: Object.keys(users).length,
    activeRooms: Object.keys(chatRooms).length
  });
});

// 1:1 채팅방 시작 엔드포인트
app.post('/api/chat/start-dm', (req, res) => {
  const { userId1, userId2 } = req.body;
  
  if (!userId1 || !userId2) {
    return res.status(400).json({ error: 'userId1과 userId2가 필요합니다.' });
  }
  
  const roomId = generateDirectMessageRoomId(userId1, userId2);
  
  // 채팅방이 없으면 생성
  if (!chatRooms[roomId]) {
    chatRooms[roomId] = [];
  }
  
  res.json({ 
    success: true,
    roomId: roomId,
    message: '1:1 채팅방이 준비되었습니다.',
    participants: [userId1, userId2]
  });
});

// 인증 API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@tf-planner.com' && password === 'admin') {
    res.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: '1',
        name: '김철수',
        email: 'admin@tf-planner.com',
        role: '관리자'
      }
    });
  } else if (email === 'user@tf-planner.com' && password === 'user') {
    res.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: '2',
        name: '박영희',
        email: 'user@tf-planner.com',
        role: '사용자'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.'
    });
  }
});

// 작업 목록 API
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    message: '작업 목록 조회 성공',
    tasks: [
      {
        id: '1',
        title: '실시간 채팅 구현',
        description: 'Socket.IO를 사용한 실시간 채팅 기능',
        status: 'in-progress',
        priority: 'high',
        assignee: '김철수',
        dueDate: '2024-02-15'
      },
      {
        id: '2',
        title: '백엔드 API 개발',
        description: 'REST API 엔드포인트 구현',
        status: 'completed',
        priority: 'medium',
        assignee: '박영희',
        dueDate: '2024-02-10'
      }
    ]
  });
});

// 채팅방 목록 API
app.get('/api/chat/rooms', (req, res) => {
  const rooms = Object.keys(chatRooms).map(roomId => ({
    id: roomId,
    name: `채팅방 ${roomId}`,
    messageCount: chatRooms[roomId].length,
    lastMessage: chatRooms[roomId][chatRooms[roomId].length - 1] || null
  }));

  res.json({
    success: true,
    message: '채팅방 목록 조회 성공',
    rooms
  });
});

// 특정 채팅방 메시지 조회 API
app.get('/api/chat/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const messages = chatRooms[roomId] || [];

  res.json({
    success: true,
    message: '메시지 조회 성공',
    messages
  });
});

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log(`👤 사용자 연결됨: ${socket.id}`);

  // 사용자 정보 등록
  socket.on('user-join', (userData) => {
    users[socket.id] = {
      id: userData.id,
      name: userData.name
    };
    console.log(`🔐 사용자 등록: ${userData.name} (${userData.id})`);
    
    // 연결된 사용자 수 업데이트
    io.emit('users-count', Object.keys(users).length);
  });

  // 채팅방 참가
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (users[socket.id]) {
      users[socket.id].roomId = roomId;
    }
    
    // 채팅방이 없으면 생성
    if (!chatRooms[roomId]) {
      chatRooms[roomId] = [];
    }

    console.log(`🏠 사용자 ${users[socket.id]?.name || socket.id}가 방 ${roomId}에 참가했습니다.`);
    
    // 참가 메시지 전송
    const joinMessage = {
      id: Date.now().toString(),
      content: `${users[socket.id]?.name || '사용자'}가 채팅방에 참가했습니다.`,
      senderId: 'system',
      senderName: '시스템',
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    chatRooms[roomId].push(joinMessage);
    socket.to(roomId).emit('receive-message', {
      roomId: roomId,
      message: joinMessage
    });
  });

  // 채팅방 나가기
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`🚪 사용자 ${users[socket.id]?.name || socket.id}가 방 ${roomId}에서 나갔습니다.`);
    
    // 나가기 메시지 전송
    const leaveMessage = {
      id: Date.now().toString(),
      content: `${users[socket.id]?.name || '사용자'}가 채팅방을 나갔습니다.`,
      senderId: 'system',
      senderName: '시스템',
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    if (chatRooms[roomId]) {
      chatRooms[roomId].push(leaveMessage);
    }
    socket.to(roomId).emit('receive-message', {
      roomId: roomId,
      message: leaveMessage
    });
  });

  // 메시지 전송
  socket.on('send-message', (messageData) => {
    const message = {
      id: Date.now().toString(),
      content: messageData.content,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      timestamp: new Date().toISOString(),
      type: messageData.type || 'text', // 클라이언트가 보낸 타입 사용
      fileUrl: messageData.fileUrl,     // 파일 URL 추가
      fileName: messageData.fileName    // 파일 이름 추가
    };

    // 메시지 저장
    if (chatRooms[messageData.roomId]) {
      chatRooms[messageData.roomId].push(message);
    }

    console.log(`💬 메시지 전송: ${message.senderName} -> 방 ${messageData.roomId}: ${message.content}`);
    
    // 모든 방 참가자에게 메시지 전송 (발신자 포함)
    io.to(messageData.roomId).emit('receive-message', {
      roomId: messageData.roomId,
      message: message
    });
    
    // 실시간 알림 전송 (발신자 제외)
    socket.to(messageData.roomId).emit('new-message-notification', {
      roomId: messageData.roomId,
      message: message,
      from: message.senderName
    });
  });

  // 타이핑 상태 전송
  socket.on('typing-start', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      roomId: data.roomId
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', {
      userId: data.userId,
      roomId: data.roomId
    });
  });

  // 연결 해제
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      console.log(`👋 사용자 연결 해제됨: ${user.name} (${socket.id})`);
      delete users[socket.id];
    } else {
      console.log(`👋 사용자 연결 해제됨: ${socket.id}`);
    }
    
    // 연결된 사용자 수 업데이트
    io.emit('users-count', Object.keys(users).length);
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 TF-Planner 실시간 채팅 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 프론트엔드 URL: http://localhost:5173`);
  console.log(`🔗 Socket.IO: ws://localhost:${PORT}`);
});

export default app;