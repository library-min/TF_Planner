const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = createServer(app);
const PORT = 3010;

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5177"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 미들웨어 설정
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5177"],
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 업로드 폴더 생성
const uploadDir = path.join(__dirname, 'uploads');
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

// 채팅 데이터 임시 저장소 (실제로는 데이터베이스 사용)
const chatRooms = {};
const users = {};

// 1:1 채팅방 ID 생성 함수
function generateDirectMessageRoomId(userId1, userId2) {
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
    features: ['실시간 채팅', 'REST API', '파일 업로드'],
    endpoints: {
      health: '/api/health',
      upload: '/api/chat/upload'
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

// 파일 업로드 API
app.post('/api/chat/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('파일 업로드 중 multer 오류:', err);

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

      console.log('파일 업로드 성공:', {
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
      console.error('파일 업로드 처리 중 오류:', error);
      res.status(500).json({
        success: false,
        message: '파일 업로드 처리 중 오류가 발생했습니다.'
      });
    }
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
  });

  // 메시지 전송
  socket.on('send-message', (messageData) => {
    const message = {
      id: Date.now().toString(),
      content: messageData.content,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      timestamp: new Date().toISOString(),
      type: messageData.type || 'text',
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName
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