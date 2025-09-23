/**
 * 채팅 컨텍스트
 * 채팅 방, 메시지, 사용자 관리를 위한 전역 상태 관리
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// 메시지 인터페이스
export interface Message {
  id: string;                              // 메시지 고유 ID
  content: string;                         // 메시지 내용
  senderId: string;                        // 발신자 ID
  senderName: string;                      // 발신자 이름
  timestamp: string;                       // 전송 시간
  type: 'text' | 'file' | 'image' | 'system'; // 메시지 타입
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
  id: string;      // 사용자 ID
  name: string;    // 사용자 이름
}

// 채팅 컨텍스트 타입 정의
interface ChatContextType {
  chatRooms: ChatRoom[];                                    // 채팅방 목록
  activeRoomId: string | null;                              // 현재 활성 채팅방 ID
  unreadCounts: { [roomId: string]: number };               // 읽지 않은 메시지 수
  isConnected: boolean;                                     // Socket.IO 연결 상태
  
  // 채팅방 관리 함수들
  createRoom: (type: ChatRoom['type'], participants: string[], name?: string) => string;  // 채팅방 생성
  joinRoom: (roomId: string) => void;                       // 채팅방 참여
  leaveRoom: (roomId: string) => void;                      // 채팅방 나가기
  setActiveRoom: (roomId: string | null) => void;           // 활성 채팅방 설정
  
  // 메시지 관리 함수들
  sendMessage: (roomId: string, content: string, type?: Message['type'], fileUrl?: string, fileName?: string) => void;  // 메시지 전송
  markAsRead: (roomId: string) => void;                     // 메시지 읽음 처리
  
  // 참가자 관리 함수들
  updateParticipants: (roomId: string) => void;             // 참가자 목록 업데이트 요청
  joinGroupRoom: (roomId: string) => void;                  // 그룹 채팅방 입장
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

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const userMap: { [key: string]: string } = {
    '1': '김철수',
    '2': '박영희', 
    '3': '이민수',
    '4': '최지영',
    '5': '정수진',
    '6': '강호동'
  };

  // Socket.IO 연결 및 이벤트 리스너 설정
  useEffect(() => {
    // Socket.IO 서버에 연결
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('✅ Socket.IO 연결됨:', socket.id);
      setIsConnected(true);
      
      // 사용자 정보를 서버에 등록
      socket.emit('user-join', {
        id: currentUserId,
        name: currentUserName
      });
    });

    // 서버에서 채팅방 목록 로드 이벤트
    socket.on('rooms-loaded', (data: { rooms: ChatRoom[] }) => {
      console.log('📚 서버에서 채팅방 목록 로드됨:', data.rooms.length, '개');
      
      if (data.rooms && data.rooms.length > 0) {
        // DB에서 로드된 채팅방들로 상태 업데이트
        setChatRooms(data.rooms);
        
        // 각 채팅방의 참가자 정보 로그
        data.rooms.forEach(room => {
          console.log(`🏠 방: ${room.name} (${room.id})`);
          console.log(`👥 참가자 ${room.participants.length}명:`, room.participants);
          console.log(`📝 참가자 이름:`, room.participantNames);
        });
      }
    });

    // 연결 해제 이벤트
    socket.on('disconnect', () => {
      console.log('❌ Socket.IO 연결 해제됨');
      setIsConnected(false);
    });

    // 메시지 수신 이벤트
    socket.on('receive-message', (data: { roomId: string; message: any; roomInfo?: ChatRoom }) => {
      console.log('📨 메시지 수신:', data);

      // 데이터 유효성 검사
      if (!data || !data.message) {
        console.error('❌ 잘못된 메시지 데이터 수신:', data);
        return;
      }

      // 메시지를 Message 형태로 변환
      const message: Message = {
        id: data.message._id || data.message.id || Date.now().toString(),
        content: data.message.content,
        senderId: data.message.senderId,
        senderName: userMap[data.message.senderId] || 'Unknown User',
        timestamp: data.message.timestamp || new Date().toISOString(),
        type: 'text'
      };

      const roomId = data.roomId;
      
      setChatRooms(prev => {
        // 기존 방이 있는지 확인
        const existingRoom = prev.find(room => room.id === roomId);
        
        if (existingRoom) {
          console.log('📝 기존 방에 메시지 추가:', roomId);
          if (data.roomInfo) {
            console.log('🔄 방 정보 업데이트:');
            console.log('  - 기존 참가자:', existingRoom.participants);
            console.log('  - 새로운 참가자:', data.roomInfo.participants);
            console.log('  - 기존 참가자 수:', existingRoom.participants.length);
            console.log('  - 새로운 참가자 수:', data.roomInfo.participants.length);
          }
          
          // 기존 방에 메시지 추가 및 참가자 정보 업데이트 (백엔드에서 새로운 정보가 온 경우)
          return prev.map(room => 
            room.id === roomId
              ? { 
                  ...room,
                  // 백엔드에서 새로운 방 정보가 온 경우 참가자 정보 업데이트
                  ...(data.roomInfo && {
                    participants: data.roomInfo.participants,
                    participantNames: data.roomInfo.participantNames,
                    name: data.roomInfo.name,
                    type: data.roomInfo.type
                  }),
                  messages: [...room.messages, message],
                  lastMessageAt: message.timestamp
                }
              : room
          );
        } else {
          // 새 채팅방 자동 생성 (발신자가 다른 사람인 경우)
          if (data.message.senderId !== currentUserId) {
            let newRoom: ChatRoom;
            
            // 백엔드에서 방 정보를 보내줬으면 그대로 사용, 아니면 자동 생성
            if (data.roomInfo) {
              // 백엔드에서 보낸 방 정보 사용 (그룹 채팅의 경우)
              newRoom = {
                ...data.roomInfo,
                messages: [message],
                lastMessageAt: message.timestamp
              };
              console.log(`🆕 서버에서 받은 ${data.roomInfo.type === 'individual' ? '1:1' : '그룹'} 채팅방 생성:`, newRoom);
            } else {
              // roomId 패턴으로 채팅방 타입 자동 판별 (레거시)
              const isDirectMessage = roomId.startsWith('dm_');
              const senderName = userMap[data.message.senderId] || 'Unknown User';
              
              const roomType: ChatRoom['type'] = isDirectMessage ? 'individual' : 'group';
              
              let roomName: string;
              let participants: string[];
              let participantNames: string[];
              
              if (isDirectMessage) {
                // 1:1 채팅
                roomName = senderName;
                participants = [currentUserId, data.message.senderId];
                participantNames = [currentUserName, senderName];
              } else {
                // 그룹 채팅 - 기본값 사용
                roomName = `그룹 채팅`;
                participants = [currentUserId, data.message.senderId];
                participantNames = [currentUserName, senderName];
              }
              
              newRoom = {
                id: roomId,
                name: roomName,
                type: roomType,
                participants,
                participantNames,
                messages: [message],
                createdAt: message.timestamp,
                lastMessageAt: message.timestamp,
                createdBy: data.message.senderId,
                isActive: true
              };
              console.log(`🆕 자동 생성된 ${roomType === 'individual' ? '1:1' : '그룹'} 채팅방:`, newRoom);
            }
            
            return [...prev, newRoom];
          }
          
          return prev;
        }
      });

      // 읽지 않은 메시지 카운트 증가 (발신자가 아닌 경우이고, 현재 활성 방이 아닌 경우)
      if (data.message.senderId !== currentUserId && activeRoomId !== roomId) {
        setUnreadCounts(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1
        }));
      }
    });

    // 참가자 목록 업데이트 이벤트 수신
    socket.on('participants-updated', (data: {
      roomId: string;
      roomInfo: ChatRoom;
      participants: string[];
      participantNames: string[];
      participantCount: number;
      newParticipant?: { id: string; name: string };
    }) => {
      console.log('👥 참가자 목록 업데이트 수신:', data);
      console.log(`📋 방 ${data.roomId}: ${data.participantCount}명 - ${data.participantNames.join(', ')}`);
      
      setChatRooms(prev => {
        return prev.map(room => {
          if (room.id === data.roomId) {
            // 해당 방의 참가자 정보를 DB 기준으로 업데이트
            const updatedRoom = {
              ...room,
              participants: data.participants,
              participantNames: data.participantNames,
              name: data.roomInfo.name,
              type: data.roomInfo.type,
              lastMessageAt: data.roomInfo.lastMessageAt
            };
            
            console.log(`🔄 방 ${data.roomId} 참가자 정보 업데이트:`);
            console.log(`  - 이전: ${room.participants.length}명`);
            console.log(`  - 현재: ${data.participantCount}명`);
            console.log(`  - 참가자: ${data.participantNames.join(', ')}`);
            
            return updatedRoom;
          }
          return room;
        });
      });

      // 새 참가자가 추가된 경우 알림 표시
      if (data.newParticipant && data.newParticipant.id !== currentUserId) {
        console.log(`🎉 새 참가자 추가됨: ${data.newParticipant.name}`);
      }
    });

    // 채팅방 생성 이벤트 수신
    socket.on('room-created', (data: { 
      room: ChatRoom; 
      creatorId: string; 
      fullParticipantList?: string[];
      fullParticipantNames?: string[];
    }) => {
      console.log('🏠 새 채팅방 초대받음:', data);
      console.log('👥 전체 참가자 목록:', data.fullParticipantList);
      console.log('📝 전체 참가자 이름:', data.fullParticipantNames);
      
      // 모든 참가자에게 방을 추가/업데이트 (생성자 포함)
      if (data.room.participants.includes(currentUserId)) {
        setChatRooms(prev => {
          // 이미 존재하는 방인지 확인
          const existingRoomIndex = prev.findIndex(room => room.id === data.room.id);
          
          if (existingRoomIndex >= 0) {
            // 기존 방이 있으면 참가자 정보 업데이트
            const updatedRooms = [...prev];
            updatedRooms[existingRoomIndex] = {
              ...updatedRooms[existingRoomIndex],
              participants: data.fullParticipantList || data.room.participants,
              participantNames: data.fullParticipantNames || data.room.participantNames
            };
            console.log(`🔄 기존 채팅방 참가자 정보 업데이트:`, updatedRooms[existingRoomIndex]);
            return updatedRooms;
          } else {
            // 새 방 추가 (DB에서 온 완전한 참가자 정보 사용)
            const newRoom = {
              ...data.room,
              participants: data.fullParticipantList || data.room.participants,
              participantNames: data.fullParticipantNames || data.room.participantNames
            };
            console.log('✅ 새 그룹 채팅방 추가됨:', newRoom);
            console.log('👥 전체 참가자 목록:', newRoom.participants, newRoom.participantNames);
            return [...prev, newRoom];
          }
        });
      }
    });

    // 강제로 방 생성 이벤트 수신 (메시지 받을 때 방 정보가 있으면 즉시 생성)
    socket.on('force-create-room', (data: { room: ChatRoom }) => {
      console.log('🏠 강제 방 생성 수신:', data);
      console.log('📋 받은 방 정보 상세:');
      console.log('  - 방 ID:', data.room.id);
      console.log('  - 방 이름:', data.room.name);
      console.log('  - 방 타입:', data.room.type);
      console.log('  - 참가자 ID들:', data.room.participants);
      console.log('  - 참가자 이름들:', data.room.participantNames);
      console.log('  - 참가자 수:', data.room.participants.length);
      console.log('  - 현재 사용자 ID:', currentUserId);
      console.log('  - 현재 사용자 포함 여부:', data.room.participants.includes(currentUserId));
      
      setChatRooms(prev => {
        // 이미 존재하는 방인지 확인
        const existingRoom = prev.find(room => room.id === data.room.id);
        if (!existingRoom) {
          // 받은 방 정보를 그대로 사용 (백엔드에서 이미 완전한 정보를 전송함)
          let updatedRoom = { ...data.room };
          
          // 혹시나 현재 사용자가 누락되었다면 추가
          if (!updatedRoom.participants.includes(currentUserId)) {
            updatedRoom.participants = [...updatedRoom.participants, currentUserId];
            updatedRoom.participantNames = [...updatedRoom.participantNames, currentUserName];
            console.log('📝 현재 사용자를 참가자 목록에 추가:', currentUserId, currentUserName);
          }
          
          console.log('✅ 새 채팅방 강제 생성됨 (최종):', updatedRoom);
          console.log('👥 최종 참가자 목록:', updatedRoom.participants, updatedRoom.participantNames);
          console.log('🔢 최종 참가자 수:', updatedRoom.participants.length);
          
          return [...prev, updatedRoom];
        } else {
          console.log('🔄 이미 존재하는 방이므로 업데이트:', existingRoom.id);
          // 기존 방이 있으면 참가자 정보 업데이트
          return prev.map(room => 
            room.id === data.room.id 
              ? { 
                  ...room, 
                  participants: data.room.participants,
                  participantNames: data.room.participantNames
                }
              : room
          );
        }
      });
    });

    // 채팅방 초대 이벤트 수신
    socket.on('room-invited', (data: { room: ChatRoom; invitedBy: string; newParticipants: string[] }) => {
      console.log('📬 채팅방 초대받음:', data);
      
      // 새로 초대받은 사용자인지 확인
      if (data.newParticipants.includes(currentUserId)) {
        setChatRooms(prev => {
          const existingRoom = prev.find(room => room.id === data.room.id);
          if (existingRoom) {
            // 기존 방 업데이트
            console.log('🔄 기존 채팅방 업데이트됨:', data.room);
            return prev.map(room => room.id === data.room.id ? data.room : room);
          } else {
            // 새 방 추가
            console.log('✅ 새 채팅방에 초대됨:', data.room);
            return [...prev, data.room];
          }
        });
      } else {
        // 기존 참여자인 경우 방 정보만 업데이트
        setChatRooms(prev => prev.map(room => 
          room.id === data.room.id ? data.room : room
        ));
      }
    });

    // 새 메시지 알림 이벤트
    socket.on('new-message-notification', (data: { roomId: string; senderName: string; message: Message }) => {
      console.log('🔔 새 메시지 알림:', data);
      
      const room = getRoomById(data.roomId);
      if (!room) return;

      // 채팅방 타입에 따라 알림 제목을 다르게 설정
      const title = room.type === 'individual'
        ? `${data.senderName}님의 새 메시지`
        : `새 메시지: ${room.name}`;

      // 브라우저 알림 표시 (권한이 있는 경우)
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: data.message.content,
          icon: '/public/Logo(1).svg' // 아이콘 경로 수정
        });
      }
    });

    // 사용자 수 업데이트 이벤트
    socket.on('users-count', (count: number) => {
      console.log(`👥 현재 접속자 수: ${count}명`);
    });

    // 타이핑 상태 이벤트들
    socket.on('user-typing', (data: { userId: string; userName: string; roomId: string }) => {
      console.log(`⌨️ ${data.userName}님이 타이핑 중...`);
    });

    socket.on('user-stop-typing', (data: { userId: string; roomId: string }) => {
      console.log(`⌨️ 타이핑 중지`);
    });

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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
    
    // 참가자 목록 구성 (타입에 따라 다르게 처리)
    let finalParticipants: string[];
    let finalParticipantNames: string[];
    
    if (type === 'individual') {
      // 1:1 채팅: 현재 사용자 + 상대방 1명
      finalParticipants = [currentUserId, participants[0]];
      finalParticipantNames = [currentUserName, userMap[participants[0]] || 'Unknown User'];
    } else {
      // 그룹 채팅: 현재 사용자 + 초대할 모든 사용자들
      finalParticipants = [currentUserId, ...participants];
      finalParticipantNames = [currentUserName, ...participants.map(id => userMap[id] || 'Unknown User')];
    }

    console.log('🔍 채팅방 생성 - 참가자 정보:');
    console.log(`  - 타입: ${type}`);
    console.log(`  - 초대 대상: ${participants.join(', ')}`);
    console.log(`  - 최종 참가자: ${finalParticipants.join(', ')} (${finalParticipants.length}명)`);
    console.log(`  - 참가자 이름: ${finalParticipantNames.join(', ')}`);

    // 새 채팅방 객체 생성
    const newRoom: ChatRoom = {
      id: roomId,
      name: name || (type === 'individual' ? 
        finalParticipantNames.filter(name => name !== currentUserName).join(', ') : 
        `그룹 채팅 ${finalParticipants.length}명`),
      type,
      participants: finalParticipants,
      participantNames: finalParticipantNames,
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      createdBy: currentUserId,
      isActive: true
    };

    // 채팅방 목록에 추가
    setChatRooms(prev => [...prev, newRoom]);
    
    // 서버에 채팅방 생성 알림 (모든 참여자에게 방 정보 전송)
    if (socketRef.current && type === 'group') {
      console.log('📡 그룹채팅방 생성 알림 전송:');
      console.log('  - 방 정보:', newRoom);
      console.log('  - 전체 참가자:', newRoom.participants);
      console.log('  - 참가자 이름:', newRoom.participantNames);
      console.log('  - 참가자 수:', newRoom.participants.length);
      
      socketRef.current.emit('create-room', {
        room: newRoom,
        participants: newRoom.participants
      });
    }
    
    console.log('✅ 새 채팅방 생성됨:', newRoom);
    console.log('🏷️ 방 타입:', type);
    console.log('👥 최종 참가자 목록:', newRoom.participants);
    console.log('📝 최종 참가자 이름:', newRoom.participantNames);
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
    fileUrl?: string,
    fileName?: string
  ) => {
    // Socket.IO로 서버에 메시지 전송
    if (socketRef.current && isConnected) {
      const room = getRoomById(roomId); // 참여자 목록을 가져오기 위해 현재 방 정보 조회

      const messageData = {
        roomId,
        content,
        senderId: currentUserId,
        senderName: currentUserName,
        type,
        fileUrl,
        fileName,
        participants: room?.participants || [],
        roomInfo: room // 전체 방 정보 전달
      };

      socketRef.current.emit('send-message', messageData);
      console.log('📤 메시지 전송:', messageData);
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

  /**
   * 참가자 목록 업데이트 요청
   * @param roomId 채팅방 ID
   */
  const updateParticipants = (roomId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`🔄 참가자 목록 업데이트 요청: ${roomId}`);
      socketRef.current.emit('update-participants', { roomId });
    } else {
      console.error('❌ Socket.IO 연결이 없습니다. 참가자 업데이트를 요청할 수 없습니다.');
    }
  };

  /**
   * 그룹 채팅방 입장
   * @param roomId 채팅방 ID
   */
  const joinGroupRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`👋 그룹 채팅방 입장 요청: ${roomId}`);
      socketRef.current.emit('join-group-room', { 
        roomId: roomId, 
        userId: currentUserId 
      });
    } else {
      console.error('❌ Socket.IO 연결이 없습니다. 그룹 채팅방 입장을 요청할 수 없습니다.');
    }
  };

  const inviteToRoom = (roomId: string, userIds: string[]) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const newParticipants = [...new Set([...room.participants, ...userIds])];
        const newParticipantNames = [...new Set([...room.participantNames, ...userIds.map(id => userMap[id] || 'Unknown User')])];
        
        // 1:1 채팅에서 사용자를 초대하면 그룹채팅으로 자동 변환
        const newType = room.type === 'individual' && newParticipants.length > 2 ? 'group' : room.type;
        const newName = newType === 'group' && room.type === 'individual' 
          ? `그룹 채팅 ${newParticipants.length}명`
          : room.name;
        
        const updatedRoom = { 
          ...room, 
          type: newType,
          name: newName,
          participants: newParticipants,
          participantNames: newParticipantNames
        };
        
        // 새로운 참여자들에게 방 정보 전송
        if (socketRef.current) {
          socketRef.current.emit('invite-to-room', {
            room: updatedRoom,
            newParticipants: userIds,
            invitedBy: currentUserId
          });
        }
        
        return updatedRoom;
      }
      return room;
    }));
  };

  const removeFromRoom = (roomId: string, userId: string) => {

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
      createRoom,
      joinRoom,
      leaveRoom,
      setActiveRoom,
      sendMessage,
      markAsRead,
      updateParticipants,
      joinGroupRoom,
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