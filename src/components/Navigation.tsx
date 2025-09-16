import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Users,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/tasks', icon: CheckSquare, label: t('nav.tasks') },
    { path: '/meetings', icon: FileText, label: t('nav.meetings') },
    { path: '/calendar', icon: Calendar, label: t('nav.calendar') },
    { path: '/team', icon: Users, label: t('nav.userManagement') },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed left-0 top-0 h-full w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-all duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Top Controls */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          {/* Language Selector */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Language</span>
            <div className={`flex rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
              <button
                onClick={() => setLanguage('ko')}
                className={`px-2 py-1 text-xs rounded-l ${
                  language === 'ko' 
                    ? 'bg-blue-500 text-white' 
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs rounded-r ${
                  language === 'en' 
                    ? 'bg-blue-500 text-white' 
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">TF-Planner</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Team Collaboration</p>
        </div>
        
        <ul className="mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-6 py-3 text-sm transition-colors ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-900 text-blue-300 border-r-2 border-blue-400'
                        : 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Profile Section */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 flex-1">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.role || (language === 'ko' ? '사용자' : 'User')}
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className={`w-full mt-3 text-xs py-1 px-2 rounded transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              {language === 'ko' ? '로그아웃' : 'Logout'}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;