/**
 * 실시간 채팅 테스트 컴포넌트
 * 완전 실시간 라이브 채팅 기능 테스트
 */

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

interface LiveChatTestProps {
  currentUserId: string;
  currentUserName: string;
}

export const LiveChatTest: React.FC<LiveChatTestProps> = ({ 
  currentUserId, 
  currentUserName 
}) => {
  const { 
    chatRooms, 
    isConnected, 
    onlineUsers, 
    sendMessage, 
    joinRoom,
    activeRoomId,
    setActiveRoom 
  } = useChat();
  
  const [messageInput, setMessageInput] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatRooms]);

  // 컴포넌트 마운트 시 일반 채팅방 참가
  useEffect(() => {
    joinRoom(selectedRoomId);
    setActiveRoom(selectedRoomId);
  }, [selectedRoomId]);

  // 메시지 전송 핸들러
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && isConnected) {
      sendMessage(selectedRoomId, messageInput.trim());
      setMessageInput('');
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // 현재 채팅방의 메시지 가져오기
  const currentRoom = chatRooms.find(room => room.id === selectedRoomId);
  const messages = currentRoom?.messages || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 - 온라인 사용자 */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="font-bold text-lg mb-4">
          🟢 온라인 사용자 ({onlineUsers.length})
        </h3>
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">{user.name}</span>
              {user.id === currentUserId && <span className="text-xs text-gray-500">(나)</span>}
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h4 className="font-semibold mb-2">연결 상태</h4>
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? '연결됨' : '연결 해제됨'}</span>
          </div>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="font-bold text-xl">🚀 실시간 라이브 채팅 테스트</h2>
          <p className="text-sm text-gray-600">
            메시지를 입력하고 Enter를 누르면 즉시 모든 사용자에게 전달됩니다
          </p>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>💬 아직 메시지가 없습니다.</p>
              <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                    message.senderId === currentUserId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border'
                  }`}
                >
                  {message.senderId !== currentUserId && (
                    <p className="text-xs font-semibold mb-1 text-gray-600">
                      {message.senderName}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "메시지를 입력하세요... (Enter로 전송)" : "연결 중..."}
              disabled={!isConnected}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              📤 전송
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            ⚡ 실시간 채팅 - 메시지가 즉시 모든 사용자에게 전달됩니다
          </p>
        </div>
      </div>
    </div>
  );
};