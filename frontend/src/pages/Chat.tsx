import React, { useState } from 'react';
import { MessageSquare, Users, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import { ChatRoom as ChatRoomType, useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const { chatRooms, createAdminBroadcast } = useChat();
  const { user, isAdmin } = useAuth();
  const { isDarkMode } = useTheme();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showAdminBroadcast, setShowAdminBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleRoomSelect = (room: ChatRoomType) => {
    setSelectedRoomId(room.id);
  };

  const handleCloseRoom = () => {
    setSelectedRoomId(null);
  };

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      createAdminBroadcast(broadcastMessage.trim());
      setBroadcastMessage('');
      setShowAdminBroadcast(false);
      
      // 공지방 자동 선택
      const broadcastRoom = chatRooms.find(room => room.type === 'admin_broadcast');
      if (broadcastRoom) {
        setSelectedRoomId(broadcastRoom.id);
      }
    }
  };

  return (
    <div className="flex flex-col bg-transparent" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="bg-transparent px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold flex items-center ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <MessageSquare className="w-6 h-6 mr-2 text-blue-500" />
              채팅
            </h1>
          </div>
          
          {/* Admin Broadcast Button */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminBroadcast(true)}
              className="flex items-center px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              <Bell className="w-4 h-4 mr-1" />
              공지
            </button>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex overflow-hidden min-h-0" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {/* Chat List Sidebar */}
        <div className="w-72">
          <ChatList 
            onRoomSelect={handleRoomSelect}
            selectedRoomId={selectedRoomId}
          />
        </div>

        {/* Chat Room or Welcome Screen */}
        <div className="flex-1 flex flex-col bg-transparent">
          {selectedRoomId ? (
            <ChatRoom 
              roomId={selectedRoomId} 
              onClose={handleCloseRoom}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-transparent">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  채팅을 시작하세요
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  왼쪽에서 채팅방을 선택하세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Broadcast Modal */}
      {showAdminBroadcast && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-transparent backdrop-blur-xl rounded-2xl p-8 w-full max-w-lg border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">전체 공지사항 보내기</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                공지 내용
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="전체 팀원들에게 보낼 공지사항을 입력하세요..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Bell className="w-3 h-3 text-yellow-800" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">주의사항</p>
                  <p className="text-yellow-700">
                    이 메시지는 모든 팀원들에게 전송됩니다. 신중하게 작성해주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAdminBroadcast(false);
                  setBroadcastMessage('');
                }}
                className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                공지 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;