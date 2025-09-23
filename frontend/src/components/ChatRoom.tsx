import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Settings, Plus, Smile, Paperclip, X, LogOut, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat, Message } from '../contexts/ChatContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatRoomProps {
  roomId: string;
  onClose: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, onClose }) => {
  const { 
    sendMessage, 
    inviteToRoom, 
    removeFromRoom, 
    leaveRoom, 
    getRoomById, 
    joinRoom,
    updateParticipants,
    joinGroupRoom
  } = useChat();
  const room = getRoomById(roomId);

  const { users } = useData();
  const { user, isAdmin } = useAuth();
  const { isDarkMode } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      
      // 그룹 채팅인 경우 입장 이벤트 전송
      if (room && room.type === 'group') {
        joinGroupRoom(roomId);
      }
      
      // 참가자 목록 동기화 요청
      updateParticipants(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [room?.messages]);

  // 참가자 모달이 열릴 때마다 최신 참가자 목록 동기화
  useEffect(() => {
    if (showParticipants && roomId) {
      console.log('🔄 참가자 모달 열림 - 참가자 목록 동기화 요청');
      updateParticipants(roomId);
    }
  }, [showParticipants, roomId]);

  if (!room) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-transparent">
        <div className="text-center">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>채팅방을 선택해주세요.</h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>왼쪽 목록에서 대화를 시작할 채팅방을 선택하세요.</p>
        </div>
      </div>
    );
  }

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 업로드 상태 초기화
    setIsUploading(true);
    setUploadError(null);

    // 파일 크기 체크 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('파일 크기가 너무 큽니다. (최대 100MB)');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 파일 메시지 전송
        sendMessage(room.id, file.name, 'file', result.fileUrl, file.name);
        console.log('파일 업로드 및 전송 완료:', result);
      } else {
        setUploadError(result.message || '파일 업로드에 실패했습니다.');
        console.error('파일 업로드 실패:', result);
      }
    } catch (error) {
      setUploadError('네트워크 오류가 발생했습니다.');
      console.error('파일 업로드 중 오류:', error);
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:3001${fileUrl}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 중 오류:', error);
    }
  };

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
    '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
    '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
    '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'
  ];

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
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
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-1.5 text-gray-400 rounded transition-colors ${isDarkMode ? 'hover:text-gray-200 hover:bg-gray-700' : 'hover:text-gray-600 hover:bg-gray-100'}`}>
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className={`p-1.5 text-gray-400 rounded transition-colors ${isDarkMode ? 'hover:text-red-400 hover:bg-red-900/50' : 'hover:text-red-500 hover:bg-red-50'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className={`border-b px-6 py-4 ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>참가자 ({room.participants.length}명)</h4>
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
                <div key={userId} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">{name[0]}</span>
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {name}
                    {isCreator && <span className="text-blue-500 ml-1">👑</span>}
                    {userId === user?.id && <span className={`ml-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>(나)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-transparent min-h-0" style={{ maxHeight: 'calc(100vh - 300px)' }}>
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
                      {message.type === 'file' ? (
                        <div className="mt-2 p-3 bg-black/10 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm font-medium">{message.fileName}</span>
                            </div>
                            <button
                              onClick={() => handleFileDownload(message.fileUrl || '', message.fileName || '')}
                              className="p-1 hover:bg-black/10 rounded transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
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

      {/* Upload Status */}
      {(isUploading || uploadError) && (
        <div className={`px-4 py-2 border-t ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          {isUploading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                파일 업로드 중...
              </span>
            </div>
          )}
          {uploadError && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-500">{uploadError}</span>
              <button
                onClick={() => setUploadError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={`border-t px-4 py-3 ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="max-h-40 overflow-y-auto">
            <div className="grid grid-cols-10 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                <Smile className="w-4 h-4" />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`p-1.5 rounded transition-colors ${
                isUploading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Paperclip className={`w-4 h-4 ${isUploading ? 'animate-pulse' : ''}`} />
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
          <div className={`rounded-2xl p-6 w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>사용자 초대</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`p-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {availableUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤷‍♂️</span>
                </div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>초대할 수 있는 사용자가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">{availableUser.name[0]}</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{availableUser.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{availableUser.role}</p>
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