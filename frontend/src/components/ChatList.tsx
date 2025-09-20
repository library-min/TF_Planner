import React, { useState } from 'react';
import { MessageCircle, Plus, Users, Bell, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat, ChatRoom } from '../contexts/ChatContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatListProps {
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ onRoomSelect, selectedRoomId }) => {
  const { chatRooms, unreadCounts, createRoom, isConnected } = useChat();
  const { users } = useData();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
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
    // 1:1 채팅방 ID를 일관되게 생성
    const generateDirectMessageRoomId = (userId1: string, userId2: string): string => {
      const sortedIds = [userId1, userId2].sort();
      return `dm_${sortedIds[0]}_${sortedIds[1]}`;
    };

    const expectedRoomId = generateDirectMessageRoomId(user?.id || '', userId);
    const existingRoom = chatRooms.find(room => 
      room.id === expectedRoomId || (
        room.type === 'individual' &&
        room.participants.includes(user?.id || '') &&
        room.participants.includes(userId) &&
        room.participants.length === 2
      )
    );

    if (existingRoom) {
      onRoomSelect(existingRoom);
    } else {
      const roomId = createRoom('individual', [userId]);
      // 새로 생성된 방을 즉시 선택
      setTimeout(() => {
        const newRoom = chatRooms.find(room => room.id === roomId);
        if (newRoom) {
          onRoomSelect(newRoom);
        }
      }, 100);
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
    <div className="w-full bg-transparent flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-transparent">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-bold flex items-center ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
            채팅
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowNewChatModal(true)}
              disabled={!isConnected}
              className={`p-2 text-gray-500 rounded-lg transition-colors ${
                isConnected ? 'hover:text-blue-600 hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'
              }`}
              title="새 채팅"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGroupChatModal(true)}
              disabled={!isConnected}
              className={`p-2 text-gray-500 rounded-lg transition-colors ${
                isConnected ? 'hover:text-purple-600 hover:bg-purple-50' : 'opacity-50 cursor-not-allowed'
              }`}
              title="그룹 채팅 만들기"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="채팅방 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent text-sm ${
              isDarkMode 
                ? 'border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {userRooms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-400" />
            </div>
            <p className="font-medium text-gray-600">채팅방이 없습니다</p>
            <p className="text-sm text-gray-500 mt-1">새 채팅을 시작해보세요! 🚀</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/40">
            {userRooms
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
              .map((room) => {
                const unreadCount = unreadCounts[room.id] || 0;
                const isSelected = selectedRoomId === room.id;
                
                // 마지막 메시지가 내가 보낸 것이면 읽지 않음 표시 안함
                const lastMessage = room.messages[room.messages.length - 1];
                const isMyLastMessage = lastMessage && lastMessage.senderId === user?.id;
                const shouldShowUnread = unreadCount > 0 && !isMyLastMessage;
                
                return (
                  <div
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-r-2 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          room.type === 'admin_broadcast' 
                            ? 'bg-red-500' 
                            : room.type === 'group'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}>
                          {room.type === 'admin_broadcast' ? (
                            <Bell className="w-5 h-5" />
                          ) : room.type === 'group' ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            room.name[0]
                          )}
                        </div>
                        {shouldShowUnread && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium text-sm truncate ${
                            shouldShowUnread 
                              ? (isDarkMode ? 'text-gray-100' : 'text-gray-900')
                              : (isDarkMode ? 'text-gray-200' : 'text-gray-700')
                          }`}>
                            {room.name}
                            {room.type === 'admin_broadcast' && (
                              <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                                공지
                              </span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessageAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${
                          shouldShowUnread 
                            ? (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                            : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-transparent'} backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>새 채팅 시작</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableUsers.map((availableUser) => (
                <div
                  key={availableUser.id}
                  onClick={() => startDirectMessage(availableUser.id)}
                  className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${isDarkMode ? 'hover:bg-gray-700 hover:border-blue-800/50' : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200/50'} hover:shadow-md`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {availableUser.name[0]}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{availableUser.name}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{availableUser.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className={`px-6 py-2.5 rounded-xl transition-all duration-200 font-medium ${isDarkMode ? 'text-gray-300 border border-gray-600 hover:bg-gray-700' : 'text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {showGroupChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-transparent'} backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>그룹 채팅 만들기</h3>
            
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                그룹 이름 (선택사항)
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="그룹 이름을 입력하세요"
                className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                참가자 선택 ({selectedUsers.length}명)
              </label>
              <div className={`space-y-2 max-h-48 overflow-y-auto rounded-xl p-3 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {availableUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${ 
                      selectedUsers.includes(availableUser.id) 
                        ? isDarkMode ? 'bg-blue-900/50 border border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm' 
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50/80'
                    }`}
                    onClick={() => toggleUserSelection(availableUser.id)}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={selectedUsers.includes(availableUser.id)}
                      className={`rounded text-blue-600 focus:ring-blue-500 w-4 h-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                    />
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                      {availableUser.name[0]}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{availableUser.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{availableUser.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowGroupChatModal(false);
                  setSelectedUsers([]);
                  setGroupName('');
                }}
                className={`px-6 py-2.5 rounded-xl transition-all duration-200 font-medium ${isDarkMode ? 'text-gray-300 border border-gray-600 hover:bg-gray-700' : 'text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
              >
                취소
              </button>
              <button
                onClick={createGroupChat}
                disabled={selectedUsers.length === 0 || !isConnected}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
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