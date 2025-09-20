// 플로팅 채팅 버튼 컴포넌트
// 화면 우하단에 고정되어 있는 채팅 바로가기 버튼
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const FloatingChatButton: React.FC = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅
  const { isDarkMode } = useTheme(); // 다크모드 상태
  const { language } = useLanguage(); // 언어 설정

  // 채팅 페이지로 이동하는 함수
  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <button
      onClick={handleChatClick} // 채팅 페이지로 이동
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        isDarkMode 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } border-2 border-blue-400`}
      title={language === 'ko' ? '채팅하기' : 'Go to Chat'} // 툴팁 텍스트
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default FloatingChatButton;