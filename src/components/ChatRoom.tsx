import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Settings, Plus, Smile, Paperclip, MoreHorizontal, X, UserPlus, UserMinus, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat, ChatRoom as ChatRoomType, Message } from '../contexts/ChatContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatRoomProps {
  room: ChatRoomType;
  onClose: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ room, onClose }) => {
  const { sendMessage, inviteToRoom, removeFromRoom, leaveRoom, markAsRead } = useChat();
  const { users } = useData();
  const { user, isAdmin } = useAuth();
  const { isDarkMode } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // 채팅방에 들어오면 자동으로 읽음 처리
    markAsRead(room.id);
  }, [room.messages, room.id, markAsRead]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // 메시지 전송 즉시 UI 업데이트
      const messageText = newMessage.trim();
      setNewMessage(''); // 입력창 즉시 초기화
      sendMessage(room.id, messageText);
      
      // 전송 후 자동 스크롤
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const availableUsers = users.filter(u => 
    !room.participants.includes(u.id) && u.id !== user?.id
  );

  const handleInviteUser = (userId: string) => {
    inviteToRoom(room.id, [userId]);
    setShowInviteModal(false);
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('이 사용자를 채팅방에서 내보내시겠습니까?')) {
      removeFromRoom(room.id, userId);
    }
  };

  const canManageRoom = isAdmin || room.createdBy === user?.id;
  const canLeaveRoom = room.type !== 'admin_broadcast' && room.participants.length > 1;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Simple Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Room Avatar */}
          <div className="relative">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{room.name[0]}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
          </div>
          
          {/* Room Info */}
          <div>
            <h3 className={`font-semibold text-sm ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>{room.name}</h3>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              {room.participants.length}명
              {room.type === 'admin_broadcast' && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded text-xs">
                  공지
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">참가자 ({room.participants.length}명)</h4>
            <div className="flex items-center space-x-2">
              {room.type !== 'admin_broadcast' && canManageRoom && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>초대</span>
                </button>
              )}
              
              {canLeaveRoom && (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>나가기</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {room.participantNames.map((name, index) => {
              const userId = room.participants[index];
              const isCreator = userId === room.createdBy;
              
              return (
                <div key={userId} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">{name[0]}</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {name}
                    {isCreator && <span className="text-blue-500 ml-1">👑</span>}
                    {userId === user?.id && <span className="text-gray-400 ml-1">(나)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-transparent">
        {room.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg">💬</span>
            </div>
            <h3 className={`text-base font-medium mb-1 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>대화를 시작해보세요!</h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>첫 번째 메시지를 보내보세요.</p>
          </div>
        ) : (
          room.messages.map((message: Message) => {
            const isMyMessage = message.senderId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isMyMessage ? '' : 'flex items-end space-x-2'}`}>
                  {!isMyMessage && (
                    <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{message.senderName[0]}</span>
                    </div>
                  )}
                  
                  <div className={isMyMessage ? '' : 'flex-1'}>
                    {!isMyMessage && (
                      <p className={`text-xs mb-1 ml-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{message.senderName}</p>
                    )}
                    
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        isMyMessage
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-100 rounded-bl-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.type === 'file' && message.fileName && (
                        <div className="mt-2 p-2 bg-black/10 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-xs">{message.fileName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-xs mt-1 ${isMyMessage ? 'text-right' : 'ml-1'} ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {room.type !== 'admin_broadcast' || isAdmin ? (
        <div className={`border-t px-4 py-3 bg-transparent ${
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  room.type === 'admin_broadcast' 
                    ? "공지사항 입력..." 
                    : "메시지 입력..."
                }
                className={`w-full px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-transparent text-sm ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-2 rounded-full transition-colors ${
                newMessage.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className={`border-t px-4 py-3 bg-transparent ${
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className={`flex items-center justify-center space-x-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span className="text-sm">🔒</span>
            <p className="text-xs">공지사항은 관리자만 작성할 수 있습니다.</p>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">사용자 초대</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {availableUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤷‍♂️</span>
                </div>
                <p className="text-gray-500">초대할 수 있는 사용자가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">{availableUser.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{availableUser.name}</p>
                        <p className="text-sm text-gray-500">{availableUser.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteUser(availableUser.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      초대
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Leave Room Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">채팅방 나가기</h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-600 mb-4">
                정말로 <strong>{room.name}</strong> 채팅방을 나가시겠습니까?
              </p>
              <p className="text-sm text-gray-500">
                나가면 더 이상 이 채팅방의 메시지를 받을 수 없습니다.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  leaveRoom(room.id);
                  onClose();
                  setShowLeaveModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;