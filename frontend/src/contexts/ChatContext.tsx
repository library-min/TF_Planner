/**
 * 채팅 컨텍스트
 * 채팅 방, 메시지, 사용자 관리를 위한 전역 상태 관리
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../utils/socket';

// 메시지 인터페이스
export interface Message {
  id: string;                              // 메시지 고유 ID
  content: string;                         // 메시지 내용
  senderId: string;                        // 발신자 ID
  senderName: string;                      // 발신자 이름
  timestamp: string;                       // 전송 시간
  type: 'text' | 'file' | 'image';        // 메시지 타입
  fileUrl?: string;                        // 파일 URL (파일 메시지인 경우)
  fileName?: string;                       // 파일 이름 (파일 메시지인 경우)
}

// 채팅방 인터페이스
export interface ChatRoom {
  id: string;                                           // 채팅방 고유 ID
  name: string;                                         // 채팅방 이름
  type: 'individual' | 'group' | 'admin_broadcast';    // 채팅방 타입 (개인/그룹/관리자 공지)
  participants: string[];                               // 참여자 ID 목록
  participantNames: string[];                           // 참여자 이름 목록 (화면 표시용)
  messages: Message[];                                  // 메시지 목록
  createdAt: string;                                    // 채팅방 생성 시간
  lastMessageAt: string;                                // 마지막 메시지 시간
  createdBy: string;                                    // 채팅방 생성자 ID
  isActive: boolean;                                    // 활성 상태
}

// 온라인 사용자 인터페이스
export interface OnlineUser {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

// 채팅 컨텍스트 타입 정의
interface ChatContextType {
  chatRooms: ChatRoom[];                                    // 채팅방 목록
  activeRoomId: string | null;                              // 현재 활성 채팅방 ID
  unreadCounts: { [roomId: string]: number };               // 읽지 않은 메시지 수
  isConnected: boolean;                                     // Socket.IO 연결 상태
  onlineUsers: OnlineUser[];                                // 온라인 사용자 목록
  
  // 채팅방 관리 함수들
  createRoom: (type: ChatRoom['type'], participants: string[], name?: string) => string;  // 채팅방 생성
  joinRoom: (roomId: string) => void;                       // 채팅방 참여
  leaveRoom: (roomId: string) => void;                      // 채팅방 나가기
  setActiveRoom: (roomId: string | null) => void;           // 활성 채팅방 설정
  
  // 메시지 관리 함수들
  sendMessage: (roomId: string, content: string, type?: Message['type'], fileData?: { url: string; name: string }) => void;  // 메시지 전송
  markAsRead: (roomId: string) => void;                     // 메시지 읽음 처리
  
  // 사용자 관리 함수들
  inviteToRoom: (roomId: string, userIds: string[]) => void;     // 채팅방에 사용자 초대
  removeFromRoom: (roomId: string, userId: string) => void;      // 채팅방에서 사용자 제거
  
  // 관리자 기능
  createAdminBroadcast: (message: string) => void;          // 관리자 공지 생성
  
  // 유틸리티 함수들
  getRoomById: (roomId: string) => ChatRoom | undefined;    // ID로 채팅방 조회
  getUserRooms: (userId: string) => ChatRoom[];             // 사용자가 참여한 채팅방 목록
  getDirectMessageRoom: (user1Id: string, user2Id: string) => ChatRoom | undefined;  // 1:1 채팅방 조회
}

// 채팅 컨텍스트 생성
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * 채팅 컨텍스트 훅
 * 컴포넌트에서 채팅 관련 상태와 함수들을 사용하기 위한 훅
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// ChatProvider 컴포넌트의 props 타입
interface ChatProviderProps {
  children: ReactNode;       // 자식 컴포넌트들
  currentUserId: string;     // 현재 로그인된 사용자 ID
  currentUserName: string;   // 현재 로그인된 사용자 이름
  isAdmin: boolean;          // 관리자 권한 여부
}

/**
 * 채팅 컨텍스트 제공자 컴포넌트
 * 애플리케이션 전체에 채팅 관련 상태와 기능을 제공
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  currentUserId, 
  currentUserName, 
  isAdmin 
}) => {
  // Socket.IO 연결 관리
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 채팅방 목록 초기 상태 (기본 공지방 포함)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: '전체 공지사항',
      type: 'admin_broadcast',
      participants: ['1', '2', '3', '4'], // 모든 사용자
      participantNames: ['김철수', '박영희', '이민수', '최지영'],
      messages: [
        {
          id: '1',
          content: '안녕하세요. 새로운 프로젝트가 시작되었습니다.',
          senderId: '1',
          senderName: '김철수',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      createdBy: '1',
      isActive: true
    }
  ]);
  
  // 현재 활성화된 채팅방 ID
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  // 각 채팅방별 읽지 않은 메시지 수
  const [unreadCounts, setUnreadCounts] = useState<{ [roomId: string]: number }>({});
  // 온라인 사용자 목록
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Socket.IO 연결 및 이벤트 리스너 설정
  useEffect(() => {
    // 환경변수 기반 Socket.IO 연결 사용
    socketRef.current = socket;

    const socketInstance = socketRef.current;

    // 연결 이벤트
    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO 연결됨:', socketInstance.id);
      setIsConnected(true);
      
      // 사용자 정보를 서버에 등록
      socketInstance.emit('user-join', {
        id: currentUserId,
        name: currentUserName
      });
    });

    // 연결 해제 이벤트
    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO 연결 해제됨');
      setIsConnected(false);
    });

    // 실시간 메시지 수신 이벤트 - 즉시 표시
    socketInstance.on('message-received', (data: { roomId: string; message: Message; timestamp: string }) => {
      console.log('📨 [실시간] 메시지 수신:', data);
      
      // 즉시 화면에 메시지 추가 (지연 없음)
      setChatRooms(prev => {
        const existingRoom = prev.find(room => room.id === data.roomId);
        
        if (existingRoom) {
          // 기존 방에 메시지 즉시 추가
          return prev.map(room => 
            room.id === data.roomId
              ? { 
                  ...room, 
                  messages: [...room.messages, data.message],
                  lastMessageAt: data.message.timestamp
                }
              : room
          );
        } else {
          // 새 1:1 채팅방 자동 생성
          if (data.message.senderId !== currentUserId) {
            const userMap: { [key: string]: string } = {
              '1': '김철수',
              '2': '박영희', 
              '3': '이민수',
              '4': '최지영',
              '5': '정수진',
              '6': '강호동'
            };
            
            const senderName = userMap[data.message.senderId] || data.message.senderName;
            const newRoom: ChatRoom = {
              id: data.roomId,
              name: senderName,
              type: 'individual',
              participants: [currentUserId, data.message.senderId],
              participantNames: [currentUserName, senderName],
              messages: [data.message],
              createdAt: data.message.timestamp,
              lastMessageAt: data.message.timestamp,
              createdBy: data.message.senderId,
              isActive: true
            };
            
            console.log('🆕 [실시간] 새 채팅방 자동 생성:', newRoom);
            return [...prev, newRoom];
          }
          
          return prev;
        }
      });

      // 읽지 않은 메시지 카운트 (발신자가 아니고 현재 활성 방이 아닌 경우)
      if (data.message.senderId !== currentUserId && activeRoomId !== data.roomId) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.roomId]: (prev[data.roomId] || 0) + 1
        }));
      }
    });

    // 메시지 전송 확인 이벤트 - 내가 보낸 메시지 즉시 표시
    socketInstance.on('message-sent', (data: { roomId: string; message: Message; status: string }) => {
      console.log('📤 [확인] 메시지 전송 완료:', data);
      // 이미 UI에 표시되었으므로 추가 처리 없음
    });

    // 실시간 알림 이벤트 - 상대방이 메시지를 보냈을 때
    socketInstance.on('new-message-alert', (data: { roomId: string; message: Message; from: string; timestamp: string }) => {
      console.log('🔔 [실시간] 새 메시지 알림:', data);
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted') {
        new Notification(`💬 ${data.from}님의 새 메시지`, {
          body: data.message.content,
          icon: '/Logo(1).svg',
          badge: '/Logo(1).svg',
          tag: `chat-${data.roomId}`,
          requireInteraction: false,
          silent: false
        });
      }
      
      // 앱 내 알림 표시 (선택적으로 구현 가능)
      console.log(`🔔 앱 내 알림: ${data.from}님이 메시지를 보냈습니다.`);
    });

    // 온라인 사용자 목록 업데이트 이벤트
    socketInstance.on('users-update', (data: { onlineUsers: OnlineUser[]; totalCount: number }) => {
      console.log(`👥 온라인 사용자 업데이트:`, data);
      setOnlineUsers(data.onlineUsers);
    });

    // 타이핑 상태 이벤트들
    socketInstance.on('user-typing', (data: { userId: string; userName: string; roomId: string }) => {
      console.log(`⌨️ ${data.userName}님이 타이핑 중...`);
    });

    socketInstance.on('user-stop-typing', (data: { userId: string; roomId: string }) => {
      console.log(`⌨️ 타이핑 중지`);
    });

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('receive-message');
      socketInstance.off('new-message-notification');
      socketInstance.off('users-count');
      socketInstance.off('user-typing');
      socketInstance.off('user-stop-typing');
    };
  }, [currentUserId, currentUserName]);

  /**
   * 1:1 채팅방 ID 생성 함수 (백엔드와 동일한 로직)
   */
  const generateDirectMessageRoomId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `dm_${sortedIds[0]}_${sortedIds[1]}`;
  };

  /**
   * 새 채팅방 생성
   * @param type 채팅방 타입
   * @param participants 참여자 ID 목록
   * @param name 채팅방 이름 (선택사항)
   * @returns 생성된 채팅방 ID
   */
  const createRoom = (type: ChatRoom['type'], participants: string[], name?: string): string => {
    // 1:1 채팅인 경우 일관된 방 ID 사용
    const roomId = type === 'individual' && participants.length === 1 
      ? generateDirectMessageRoomId(currentUserId, participants[0])
      : Date.now().toString();
      
    // 참여자 ID를 이름으로 변환 (실제로는 사용자 컨텍스트나 API에서 가져와야 함)
    const participantNames = participants.map(id => {
      const userMap: { [key: string]: string } = {
        '1': '김철수',
        '2': '박영희', 
        '3': '이민수',
        '4': '최지영',
        '5': '정수진',
        '6': '강호동'
      };
      return userMap[id] || 'Unknown User';
    });

    // 새 채팅방 객체 생성
    const newRoom: ChatRoom = {
      id: roomId,
      name: name || (type === 'individual' ? 
        participantNames.filter(name => name !== currentUserName).join(', ') : 
        `그룹 채팅 ${participantNames.length}명`),
      type,
      participants: [...participants, currentUserId],
      participantNames: [...participantNames, currentUserName],
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      createdBy: currentUserId,
      isActive: true
    };

    // 채팅방 목록에 추가
    setChatRooms(prev => [...prev, newRoom]);
    return roomId;
  };

  const joinRoom = (roomId: string) => {
    // 이전 방에서 나가기
    if (activeRoomId && socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', activeRoomId);
    }
    
    setActiveRoomId(roomId);
    markAsRead(roomId);
    
    // Socket.IO로 서버에 채팅방 참가 알림
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', roomId);
      console.log('🏠 채팅방 참가:', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    // Socket.IO로 서버에 채팅방 나가기 알림
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', roomId);
    }

    setChatRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            participants: room.participants.filter(id => id !== currentUserId),
            participantNames: room.participantNames.filter(name => name !== currentUserName)
          }
        : room
    ));
    
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const setActiveRoom = (roomId: string | null) => {
    setActiveRoomId(roomId);
    if (roomId) {
      // 채팅방 입장 시 즉시 읽음 처리
      markAsRead(roomId);
    }
  };

  const sendMessage = (
    roomId: string, 
    content: string, 
    type: Message['type'] = 'text',
    fileData?: { url: string; name: string }
  ) => {
    if (!content.trim()) return; // 빈 메시지 방지
    
    const message: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date().toISOString(),
      type,
      fileUrl: fileData?.url,
      fileName: fileData?.name
    };

    // 즉시 내 화면에 메시지 표시 (지연 없음)
    setChatRooms(prev => prev.map(room => 
      room.id === roomId
        ? { 
            ...room, 
            messages: [...room.messages, message],
            lastMessageAt: message.timestamp
          }
        : room
    ));

    // Socket.IO로 서버에 메시지 전송
    if (socketRef.current && isConnected) {
      const messageData = {
        roomId,
        content: content.trim(),
        senderId: currentUserId,
        senderName: currentUserName,
        type,
        fileUrl: fileData?.url,
        fileName: fileData?.name
      };

      socketRef.current.emit('send-message', messageData);
      console.log('📤 [즉시] 메시지 전송:', messageData);
    } else {
      console.error('❌ Socket.IO 연결이 없습니다. 메시지를 전송할 수 없습니다.');
    }
  };

  const markAsRead = (roomId: string) => {
    // 현재 사용자가 해당 방을 읽음 처리
    setUnreadCounts(prev => ({
      ...prev,
      [roomId]: 0
    }));
  };

  const inviteToRoom = (roomId: string, userIds: string[]) => {
    const userMap: { [key: string]: string } = {
      '1': '김철수',
      '2': '박영희', 
      '3': '이민수',
      '4': '최지영',
      '5': '정수진',
      '6': '강호동'
    };

    setChatRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            participants: [...new Set([...room.participants, ...userIds])],
            participantNames: [...new Set([...room.participantNames, ...userIds.map(id => userMap[id] || 'Unknown User')])]
          }
        : room
    ));
  };

  const removeFromRoom = (roomId: string, userId: string) => {
    const userMap: { [key: string]: string } = {
      '1': '김철수',
      '2': '박영희', 
      '3': '이민수',
      '4': '최지영',
      '5': '정수진',
      '6': '강호동'
    };

    setChatRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            participants: room.participants.filter(id => id !== userId),
            participantNames: room.participantNames.filter(name => name !== userMap[userId])
          }
        : room
    ));
  };

  const createAdminBroadcast = (message: string) => {
    if (!isAdmin) return;
    
    const broadcastRoom = chatRooms.find(room => room.type === 'admin_broadcast');
    if (broadcastRoom) {
      sendMessage(broadcastRoom.id, message);
    }
  };

  const getRoomById = (roomId: string): ChatRoom | undefined => {
    return chatRooms.find(room => room.id === roomId);
  };

  const getUserRooms = (userId: string): ChatRoom[] => {
    return chatRooms.filter(room => room.participants.includes(userId));
  };

  const getDirectMessageRoom = (user1Id: string, user2Id: string): ChatRoom | undefined => {
    return chatRooms.find(room => 
      room.type === 'individual' && 
      room.participants.includes(user1Id) && 
      room.participants.includes(user2Id) &&
      room.participants.length === 2
    );
  };

  return (
    <ChatContext.Provider value={{
      chatRooms,
      activeRoomId,
      unreadCounts,
      isConnected,
      onlineUsers,
      createRoom,
      joinRoom,
      leaveRoom,
      setActiveRoom,
      sendMessage,
      markAsRead,
      inviteToRoom,
      removeFromRoom,
      createAdminBroadcast,
      getRoomById,
      getUserRooms,
      getDirectMessageRoom
    }}>
      {children}
    </ChatContext.Provider>
  );
};