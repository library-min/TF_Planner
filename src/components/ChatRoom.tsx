import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, MoreVertical, UserPlus, UserMinus, X } from 'lucide-react';
import { useChat, ChatRoom as ChatRoomType, Message } from '../contexts/ChatContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatRoomProps {
  room: ChatRoomType;
  onClose: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ room, onClose }) => {
  const { sendMessage, inviteToRoom, removeFromRoom } = useChat();
  const { users } = useData();
  const { user, isAdmin } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [room.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(room.id, newMessage.trim());
      setNewMessage('');
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {room.name[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-500">
                {room.participants.length}명
                {room.type === 'admin_broadcast' && (
                  <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                    공지방
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {room.type !== 'admin_broadcast' && canManageRoom && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="사용자 초대"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="참가자 목록"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-3">참가자 ({room.participants.length}명)</h4>
          <div className="space-y-2">
            {room.participantNames.map((name, index) => {
              const userId = room.participants[index];
              const isCreator = userId === room.createdBy;
              const canRemove = canManageRoom && userId !== user?.id && !isCreator;
              
              return (
                <div key={userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {name[0]}
                    </div>
                    <span className="text-sm text-gray-700">
                      {name}
                      {isCreator && <span className="ml-1 text-xs text-blue-600">(방장)</span>}
                      {userId === user?.id && <span className="ml-1 text-xs text-gray-500">(나)</span>}
                    </span>
                  </div>
                  {canRemove && (
                    <button
                      onClick={() => handleRemoveUser(userId)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="내보내기"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {room.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          room.messages.map((message: Message) => {
            const isMyMessage = message.senderId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-1' : 'order-2'}`}>
                  {!isMyMessage && (
                    <div className="text-xs text-gray-500 mb-1">{message.senderName}</div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isMyMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.type === 'file' && message.fileName && (
                      <div className="mt-2 p-2 bg-white bg-opacity-20 rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-xs">{message.fileName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                    {formatTimestamp(message.timestamp)}
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
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <Image className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  room.type === 'admin_broadcast' 
                    ? "전체 공지사항을 입력하세요..." 
                    : "메시지를 입력하세요..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-center text-gray-500 text-sm">
            공지사항은 관리자만 작성할 수 있습니다.
          </p>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">사용자 초대</h3>
            {availableUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                초대할 수 있는 사용자가 없습니다.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {availableUser.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{availableUser.name}</p>
                        <p className="text-sm text-gray-500">{availableUser.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteUser(availableUser.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      초대
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;