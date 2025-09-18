import React, { useState } from 'react';
import { MessageCircle, Plus, Users, Bell, Search, MoreHorizontal } from 'lucide-react';
import { useChat, ChatRoom } from '../contexts/ChatContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatListProps {
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ onRoomSelect, selectedRoomId }) => {
  const { chatRooms, unreadCounts, createRoom } = useChat();
  const { users } = useData();
  const { user, isAdmin } = useAuth();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  // 현재 사용자가 참여한 채팅방만 표시
  const userRooms = chatRooms.filter(room => 
    room.participants.includes(user?.id || '') &&
    (room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     room.participantNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const availableUsers = users.filter(u => u.id !== user?.id);

  const formatLastMessage = (room: ChatRoom) => {
    if (room.messages.length === 0) {
      return '메시지가 없습니다';
    }
    
    const lastMessage = room.messages[room.messages.length - 1];
    const preview = lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + '...' 
      : lastMessage.content;
    
    return `${lastMessage.senderName}: ${preview}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  const startDirectMessage = (userId: string) => {
    const existingRoom = chatRooms.find(room => 
      room.type === 'individual' &&
      room.participants.includes(user?.id || '') &&
      room.participants.includes(userId) &&
      room.participants.length === 2
    );

    if (existingRoom) {
      onRoomSelect(existingRoom);
    } else {
      const roomId = createRoom('individual', [userId]);
      const newRoom = chatRooms.find(room => room.id === roomId);
      if (newRoom) {
        onRoomSelect(newRoom);
      }
    }
    setShowNewChatModal(false);
  };

  const createGroupChat = () => {
    if (selectedUsers.length === 0) return;
    
    const name = groupName.trim() || `그룹 채팅 ${selectedUsers.length + 1}명`;
    const roomId = createRoom('group', selectedUsers, name);
    const newRoom = chatRooms.find(room => room.id === roomId);
    if (newRoom) {
      onRoomSelect(newRoom);
    }
    
    setShowGroupChatModal(false);
    setSelectedUsers([]);
    setGroupName('');
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            채팅
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="새 채팅"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowGroupChatModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="그룹 채팅 만들기"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="채팅방 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {userRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>채팅방이 없습니다</p>
            <p className="text-sm">새 채팅을 시작해보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userRooms
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
              .map((room) => {
                const unreadCount = unreadCounts[room.id] || 0;
                const isSelected = selectedRoomId === room.id;
                
                return (
                  <div
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          room.type === 'admin_broadcast' 
                            ? 'bg-red-500' 
                            : room.type === 'group'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}>
                          {room.type === 'admin_broadcast' ? (
                            <Bell className="w-6 h-6" />
                          ) : room.type === 'group' ? (
                            <Users className="w-6 h-6" />
                          ) : (
                            room.name[0]
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${
                            unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {room.name}
                            {room.type === 'admin_broadcast' && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                                공지
                              </span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(room.lastMessageAt)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mt-1 ${
                          unreadCount > 0 ? 'text-gray-600 font-medium' : 'text-gray-500'
                        }`}>
                          {formatLastMessage(room)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 채팅 시작</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableUsers.map((availableUser) => (
                <div
                  key={availableUser.id}
                  onClick={() => startDirectMessage(availableUser.id)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {availableUser.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{availableUser.name}</p>
                    <p className="text-sm text-gray-500">{availableUser.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {showGroupChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">그룹 채팅 만들기</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                그룹 이름 (선택사항)
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="그룹 이름을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                참가자 선택 ({selectedUsers.length}명)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {availableUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${
                      selectedUsers.includes(availableUser.id) 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleUserSelection(availableUser.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(availableUser.id)}
                      onChange={() => toggleUserSelection(availableUser.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {availableUser.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{availableUser.name}</p>
                      <p className="text-xs text-gray-500">{availableUser.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowGroupChatModal(false);
                  setSelectedUsers([]);
                  setGroupName('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={createGroupChat}
                disabled={selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;