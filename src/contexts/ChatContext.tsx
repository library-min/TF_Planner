/**
 * 채팅 컨텍스트
 * 채팅 방, 메시지, 사용자 관리를 위한 전역 상태 관리
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

// 채팅 컨텍스트 타입 정의
interface ChatContextType {
  chatRooms: ChatRoom[];                                    // 채팅방 목록
  activeRoomId: string | null;                              // 현재 활성 채팅방 ID
  unreadCounts: { [roomId: string]: number };               // 읽지 않은 메시지 수
  
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

  /**
   * 새 채팅방 생성
   * @param type 채팅방 타입
   * @param participants 참여자 ID 목록
   * @param name 채팅방 이름 (선택사항)
   * @returns 생성된 채팅방 ID
   */
  const createRoom = (type: ChatRoom['type'], participants: string[], name?: string): string => {
    const roomId = Date.now().toString();
    // 참여자 ID를 이름으로 변환 (실제로는 사용자 컨텍스트나 API에서 가져와야 함)
    const participantNames = participants.map(id => {
      const userMap: { [key: string]: string } = {
        '1': '김철수',
        '2': '박영희', 
        '3': '이민수',
        '4': '최지영'
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
    setActiveRoomId(roomId);
    markAsRead(roomId);
  };

  const leaveRoom = (roomId: string) => {
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
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date().toISOString(),
      type,
      fileUrl: fileData?.url,
      fileName: fileData?.name
    };

    setChatRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            messages: [...room.messages, newMessage],
            lastMessageAt: new Date().toISOString()
          }
        : room
    ));

    // 보낸 사람에게는 읽지 않음 표시를 하지 않음
    // 실제로는 각 사용자별로 읽지 않음 상태를 관리해야 하지만
    // 현재는 간단히 보낸 사람에게는 카운트를 증가시키지 않음
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
      '4': '최지영'
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
      '4': '최지영'
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