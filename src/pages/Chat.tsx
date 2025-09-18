import React, { useState } from 'react';
import { MessageSquare, Users, Bell } from 'lucide-react';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import { ChatRoom as ChatRoomType, useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const { chatRooms, createAdminBroadcast } = useChat();
  const { user, isAdmin } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showAdminBroadcast, setShowAdminBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleRoomSelect = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleCloseRoom = () => {
    setSelectedRoom(null);
  };

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      createAdminBroadcast(broadcastMessage.trim());
      setBroadcastMessage('');
      setShowAdminBroadcast(false);
      
      // 공지방 자동 선택
      const broadcastRoom = chatRooms.find(room => room.type === 'admin_broadcast');
      if (broadcastRoom) {
        setSelectedRoom(broadcastRoom);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-7 h-7 mr-3 text-blue-500" />
              채팅
            </h1>
            <p className="text-gray-600 mt-1">
              팀원들과 실시간으로 소통하세요
            </p>
          </div>
          
          {/* Admin Broadcast Button */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminBroadcast(true)}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Bell className="w-5 h-5 mr-2" />
              전체 공지 보내기
            </button>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <ChatList 
          onRoomSelect={handleRoomSelect}
          selectedRoomId={selectedRoom?.id || null}
        />

        {/* Chat Room or Welcome Screen */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <ChatRoom 
              room={selectedRoom} 
              onClose={handleCloseRoom}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  채팅을 시작하세요
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  왼쪽에서 채팅방을 선택하거나 새로운 대화를 시작해보세요.
                </p>
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <Users className="w-4 h-4 mr-2" />
                    팀원들과 1:1 또는 그룹 채팅이 가능합니다
                  </div>
                  {isAdmin && (
                    <div className="flex items-center justify-center">
                      <Bell className="w-4 h-4 mr-2" />
                      관리자는 전체 공지사항을 보낼 수 있습니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Broadcast Modal */}
      {showAdminBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center mb-4">
              <Bell className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">전체 공지사항 보내기</h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공지 내용
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="전체 팀원들에게 보낼 공지사항을 입력하세요..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Bell className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">주의사항</p>
                  <p className="text-yellow-700">
                    이 메시지는 모든 팀원들에게 전송됩니다. 신중하게 작성해주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAdminBroadcast(false);
                  setBroadcastMessage('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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