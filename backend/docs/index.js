"use strict";
/**
 * TF-Planner Backend Server
 * 안정적인 Socket.IO 기반 실시간 채팅 서버
 * 포트: 3001
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = 3003;
// Socket.IO 서버 설정 - 개발 단계에서 모든 origin 허용
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // 개발 단계에서는 모든 origin 허용
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"] // 안정적인 연결을 위해 polling도 허용
});
// CORS 미들웨어 설정
app.use((0, cors_1.default)({
    origin: "*", // 개발 단계에서는 모든 origin 허용
    credentials: true
}));
app.use(express_1.default.json());
// 채팅 데이터 임시 저장소
const chatRooms = {};
const users = {};
// 1:1 채팅방 ID 생성 함수
function generateDirectMessageRoomId(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort();
    return `dm_${sortedIds[0]}_${sortedIds[1]}`;
}
// 루트 엔드포인트 - 간단한 응답
app.get('/', (req, res) => {
    res.json({
        message: 'TF-Planner Backend Server',
        status: 'running'
    });
});
// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '백엔드 서버가 정상적으로 작동 중입니다.',
        timestamp: new Date().toISOString(),
        connectedUsers: Object.keys(users).length,
        activeRooms: Object.keys(chatRooms).length,
        socket_url: `ws://localhost:${PORT}`
    });
});
// 데모 사용자 계정 목록
const demoUsers = [
    {
        id: '1',
        name: '김철수',
        email: 'admin@tf-planner.com',
        password: 'admin',
        role: '관리자'
    },
    {
        id: '2',
        name: '박영희',
        email: 'user1@tf-planner.com',
        password: 'user1',
        role: '일반사용자'
    },
    {
        id: '3',
        name: '이민수',
        email: 'user2@tf-planner.com',
        password: 'user2',
        role: '일반사용자'
    },
    {
        id: '4',
        name: '최지영',
        email: 'user3@tf-planner.com',
        password: 'user3',
        role: '일반사용자'
    },
    {
        id: '5',
        name: '정수진',
        email: 'user4@tf-planner.com',
        password: 'user4',
        role: '일반사용자'
    },
    {
        id: '6',
        name: '강호동',
        email: 'user5@tf-planner.com',
        password: 'user5',
        role: '일반사용자'
    }
];
// 간단한 인증 API (데모용)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // 데모 계정에서 일치하는 사용자 찾기
    const user = demoUsers.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({
            success: true,
            message: '로그인 성공',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    else {
        res.status(401).json({
            success: false,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
    }
});
// 작업 목록 API (데모용)
app.get('/api/tasks', (req, res) => {
    res.json({
        success: true,
        message: '작업 목록 조회 성공',
        tasks: [
            {
                id: '1',
                title: '실시간 채팅 구현',
                description: 'Socket.IO를 사용한 실시간 채팅 기능',
                status: 'completed',
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
// 온라인 사용자 관리
const onlineUsers = new Map(); // socketId -> {id, name, status, lastSeen}
// Socket.IO 연결 처리
io.on('connection', (socket) => {
    console.log(`👤 사용자 연결됨: ${socket.id}`);
    // 사용자 정보 등록
    socket.on('user-join', (userData) => {
        users[socket.id] = {
            id: userData.id,
            name: userData.name
        };
        // 온라인 사용자 목록에 추가
        onlineUsers.set(socket.id, {
            id: userData.id,
            name: userData.name,
            status: 'online',
            lastSeen: new Date().toISOString()
        });
        console.log(`🔐 사용자 등록: ${userData.name} (${userData.id})`);
        // 모든 클라이언트에게 온라인 사용자 목록 전송
        io.emit('users-update', {
            onlineUsers: Array.from(onlineUsers.values()),
            totalCount: onlineUsers.size
        });
    });
    // 채팅방 참가 (시스템 메시지 없이)
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        if (users[socket.id]) {
            users[socket.id].roomId = roomId;
        }
        // 채팅방이 없으면 생성
        if (!chatRooms[roomId]) {
            chatRooms[roomId] = [];
        }
        console.log(`🏠 사용자 ${users[socket.id]?.name || socket.id}가 방 ${roomId}에 조용히 참가했습니다.`);
        // 기존 메시지 히스토리 전송
        socket.emit('room-history', {
            roomId: roomId,
            messages: chatRooms[roomId] || []
        });
    });
    // 채팅방 나가기 (시스템 메시지 없이)
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`🚪 사용자 ${users[socket.id]?.name || socket.id}가 방 ${roomId}에서 조용히 나갔습니다.`);
    });
    // 실시간 메시지 전송 처리
    const handleMessage = (messageData) => {
        const message = {
            id: Date.now().toString(),
            content: messageData.content || messageData.message || '',
            senderId: messageData.senderId || messageData.userId || 'unknown',
            senderName: messageData.senderName || messageData.username || messageData.name || '익명',
            timestamp: new Date().toISOString(),
            type: messageData.type || 'text'
        };
        const roomId = messageData.roomId || messageData.room || 'general';
        // 메시지 저장
        if (!chatRooms[roomId]) {
            chatRooms[roomId] = [];
        }
        chatRooms[roomId].push(message);
        console.log(`💬 [실시간] ${message.senderName} -> 방 ${roomId}: ${message.content}`);
        // 즉시 모든 클라이언트에게 메시지 전달 (발신자 포함)
        io.to(roomId).emit('message-received', {
            roomId: roomId,
            message: message,
            timestamp: new Date().toISOString()
        });
        // 발신자에게도 즉시 확인 전송
        socket.emit('message-sent', {
            roomId: roomId,
            message: message,
            status: 'delivered'
        });
        // 발신자가 아닌 사용자들에게 알림 전송
        socket.to(roomId).emit('new-message-alert', {
            roomId: roomId,
            message: message,
            from: message.senderName,
            timestamp: new Date().toISOString()
        });
        // 전체 브로드캐스트도 지원
        if (!messageData.roomId) {
            io.emit('chat-message', message);
        }
    };
    // 다양한 메시지 이벤트 처리
    socket.on('send-message', handleMessage);
    socket.on('chat-message', handleMessage);
    socket.on('message', handleMessage);
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
        }
        else {
            console.log(`👋 사용자 연결 해제됨: ${socket.id}`);
        }
        // 온라인 사용자 목록에서 제거
        if (onlineUsers.has(socket.id)) {
            onlineUsers.delete(socket.id);
            // 모든 클라이언트에게 업데이트된 온라인 사용자 목록 전송
            io.emit('users-update', {
                onlineUsers: Array.from(onlineUsers.values()),
                totalCount: onlineUsers.size
            });
        }
    });
});
// 서버 시작
server.listen(PORT, () => {
    console.log('🚀='.repeat(50));
    console.log(`🚀 TF-Planner 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📱 프론트엔드 연결: http://localhost:5173`);
    console.log(`🔗 Socket.IO URL: ws://localhost:${PORT}`);
    console.log(`🌐 서버 상태: http://localhost:${PORT}/api/health`);
    console.log('🚀='.repeat(50));
});
exports.default = app;
//# sourceMappingURL=index.js.map