import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'admin_broadcast';
  participants: string[]; // User IDs
  participantNames: string[]; // User names for display
  messages: Message[];
  createdAt: string;
  lastMessageAt: string;
  createdBy: string;
  isActive: boolean;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  activeRoomId: string | null;
  unreadCounts: { [roomId: string]: number };
  
  // Room management
  createRoom: (type: ChatRoom['type'], participants: string[], name?: string) => string;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  
  // Message management
  sendMessage: (roomId: string, content: string, type?: Message['type'], fileData?: { url: string; name: string }) => void;
  markAsRead: (roomId: string) => void;
  
  // User management
  inviteToRoom: (roomId: string, userIds: string[]) => void;
  removeFromRoom: (roomId: string, userId: string) => void;
  
  // Admin functions
  createAdminBroadcast: (message: string) => void;
  
  // Utility functions
  getRoomById: (roomId: string) => ChatRoom | undefined;
  getUserRooms: (userId: string) => ChatRoom[];
  getDirectMessageRoom: (user1Id: string, user2Id: string) => ChatRoom | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  currentUserId, 
  currentUserName, 
  isAdmin 
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: '전체 공지사항',
      type: 'admin_broadcast',
      participants: ['1', '2', '3', '4'], // All users
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
  
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [roomId: string]: number }>({});

  const createRoom = (type: ChatRoom['type'], participants: string[], name?: string): string => {
    const roomId = Date.now().toString();
    const participantNames = participants.map(id => {
      // You would typically get this from your user context or API
      const userMap: { [key: string]: string } = {
        '1': '김철수',
        '2': '박영희', 
        '3': '이민수',
        '4': '최지영'
      };
      return userMap[id] || 'Unknown User';
    });

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

    // Update unread counts for other participants
    const room = chatRooms.find(r => r.id === roomId);
    if (room) {
      room.participants.forEach(participantId => {
        if (participantId !== currentUserId) {
          setUnreadCounts(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1
          }));
        }
      });
    }
  };

  const markAsRead = (roomId: string) => {
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