import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const FloatingChatButton: React.FC = () => {
  const { setShowMessageModal } = useMessage();
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();

  return (
    <button
      onClick={() => setShowMessageModal(true)}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } border-2 border-blue-400`}
      title={language === 'ko' ? '메시지 보내기' : 'Send Message'}
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default FloatingChatButton;