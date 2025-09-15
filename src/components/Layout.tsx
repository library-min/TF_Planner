import React from 'react';
import Navigation from './Navigation';
import MessageModal from './MessageModal';
import FloatingDarkModeToggle from './FloatingDarkModeToggle';
import FloatingChatButton from './FloatingChatButton';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation />
      <main className="lg:pl-64 flex-1">
        <div className="h-full w-full">
          <div className="max-w-6xl mx-auto p-4 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </div>
      </main>
      <FloatingDarkModeToggle />
      <FloatingChatButton />
      <MessageModal />
    </div>
  );
};

export default Layout;