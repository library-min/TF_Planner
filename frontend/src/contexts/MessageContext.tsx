import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type: 'sent' | 'received';
}

interface MessageContextType {
  messages: Message[];
  showMessageModal: boolean;
  setShowMessageModal: (show: boolean) => void;
  addMessage: (text: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '프로젝트 진행 상황이 어떤가요?',
      sender: '김철수',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'received'
    },
    {
      id: '2',
      text: '계획대로 잘 진행되고 있습니다!',
      sender: '현재 사용자',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'sent'
    }
  ]);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const addMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: '현재 사용자',
      timestamp: new Date().toISOString(),
      type: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <MessageContext.Provider value={{
      messages,
      showMessageModal,
      setShowMessageModal,
      addMessage
    }}>
      {children}
    </MessageContext.Provider>
  );
};