/**
 * Socket.IO 연결 유틸리티
 * 환경변수 기반 안정적인 Socket.IO 클라이언트 연결 관리
 */

import { io, Socket } from 'socket.io-client';

// 환경변수에서 Socket.IO 서버 URL 가져오기
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

console.log('🔗 Socket.IO 서버 URL:', SOCKET_URL);

/**
 * Socket.IO 클라이언트 인스턴스 생성
 * 안정적인 연결을 위한 옵션 설정
 */
export const socket: Socket = io(SOCKET_URL, {
  // WebSocket 전송 우선, 필요시 polling으로 폴백
  transports: ['websocket', 'polling'],
  
  // 자동 연결 활성화
  autoConnect: true,
  
  // 재연결 설정
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  
  // 연결 시간 초과 설정
  timeout: 20000,
  
  // CORS 설정
  withCredentials: false,
  
  // 포크매터 설정
  forceNew: false
});

/**
 * Socket.IO 연결 상태 모니터링
 */
socket.on('connect', () => {
  console.log('✅ Socket.IO 연결 성공:', socket.id);
  console.log('🔗 서버 URL:', SOCKET_URL);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket.IO 연결 해제:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🔥 Socket.IO 연결 오류:', error);
  console.log('🔧 연결 시도 URL:', SOCKET_URL);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket.IO 재연결 성공 (시도 횟수:', attemptNumber, ')');
});

socket.on('reconnect_error', (error) => {
  console.error('🔄 Socket.IO 재연결 오류:', error);
});

socket.on('reconnect_failed', () => {
  console.error('💥 Socket.IO 재연결 실패 - 최대 시도 횟수 초과');
});

/**
 * Socket.IO 연결 강제 시작
 */
export const connectSocket = (): void => {
  if (!socket.connected) {
    console.log('🔌 Socket.IO 수동 연결 시작...');
    socket.connect();
  }
};

/**
 * Socket.IO 연결 해제
 */
export const disconnectSocket = (): void => {
  if (socket.connected) {
    console.log('🔌 Socket.IO 연결 해제...');
    socket.disconnect();
  }
};

/**
 * 메시지 전송 유틸리티 함수
 */
export const sendMessage = (event: string, data: any): void => {
  if (socket.connected) {
    socket.emit(event, data);
    console.log(`📤 메시지 전송 [${event}]:`, data);
  } else {
    console.error('❌ Socket.IO 연결되지 않음 - 메시지를 전송할 수 없습니다.');
  }
};

/**
 * 이벤트 리스너 등록 유틸리티 함수
 */
export const onMessage = (event: string, callback: (data: any) => void): void => {
  socket.on(event, callback);
  console.log(`📥 이벤트 리스너 등록: ${event}`);
};

/**
 * 이벤트 리스너 제거 유틸리티 함수
 */
export const offMessage = (event: string, callback?: (data: any) => void): void => {
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
  console.log(`📥 이벤트 리스너 제거: ${event}`);
};

/**
 * 현재 연결 상태 확인
 */
export const isConnected = (): boolean => {
  return socket.connected;
};

/**
 * Socket ID 가져오기
 */
export const getSocketId = (): string | undefined => {
  return socket.id;
};

/**
 * 환경 정보 출력
 */
export const logSocketInfo = (): void => {
  console.log('🔍 Socket.IO 환경 정보:');
  console.log('  - 서버 URL:', SOCKET_URL);
  console.log('  - 연결 상태:', socket.connected);
  console.log('  - Socket ID:', socket.id || 'N/A');
  console.log('  - 전송 방식:', socket.io.engine?.transport?.name || 'N/A');
};

// 개발 환경에서 전역 접근 가능하도록 설정
if (import.meta.env.VITE_NODE_ENV === 'development') {
  (window as any).socket = socket;
  (window as any).logSocketInfo = logSocketInfo;
}