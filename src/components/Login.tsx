import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import FloatingDarkModeToggle from './FloatingDarkModeToggle';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginAsDemo } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode } = useTheme();

  const translations = {
    ko: {
      title: 'TF-Planner',
      subtitle: '팀 협업 플랫폼',
      login: '로그인',
      email: '이메일',
      password: '비밀번호',
      loginButton: '로그인',
      loginError: '이메일 또는 비밀번호가 올바르지 않습니다.',
      language: '언어',
      demoAccounts: '데모 계정',
      adminDemo: '관리자로 로그인',
      userDemo: '일반 사용자로 로그인'
    },
    en: {
      title: 'TF-Planner',
      subtitle: 'Team Collaboration Platform',
      login: 'Login',
      email: 'Email',
      password: 'Password',
      loginButton: 'Login',
      loginError: 'Email or password is incorrect.',
      demoCredentials: 'Demo Account: admin@tf-planner.com / any password',
      language: 'Language',
      demoAccounts: 'Demo Accounts',
      adminDemo: 'Login as Admin',
      userDemo: 'Login as User'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError(t.loginError);
      }
    } catch (err) {
      setError(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    } py-12 px-4 sm:px-6 lg:px-8`}>
      <FloatingDarkModeToggle />
      
      {/* Language Selector */}
      <div className="absolute top-4 left-4">
        <div className={`flex rounded border ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        } shadow-sm`}>
          <button
            onClick={() => setLanguage('ko')}
            className={`px-3 py-2 text-sm rounded-l ${
              language === 'ko' 
                ? 'bg-blue-500 text-white' 
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-2 text-sm rounded-r ${
              language === 'en' 
                ? 'bg-blue-500 text-white' 
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="max-w-6xl w-full space-y-8">
        {/* Title Section */}
        <div className="text-center">
          <h2 className={`text-4xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {t.title}
          </h2>
          <p className={`mt-2 text-lg ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {t.subtitle}
          </p>
        </div>

        {/* Login Section */}
        <div className="flex items-start justify-center gap-12">
          {/* Login Form */}
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <h3 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {t.login}
              </h3>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                  placeholder={t.email}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                  placeholder={t.password}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : t.loginButton}
            </button>
          </div>

            <div className={`text-center text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>{t.demoCredentials}</p>
            </div>
          </form>
          </div>

          {/* Demo Buttons */}
          <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
              {t.demoAccounts}
            </h3>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => loginAsDemo('admin')}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg border-2 transition-all ${
                isDarkMode 
                  ? 'bg-green-800 border-green-600 text-green-100 hover:bg-green-700' 
                  : 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">{t.adminDemo}</span>
            </button>
            
            <button
              onClick={() => loginAsDemo('user')}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg border-2 transition-all ${
                isDarkMode 
                  ? 'bg-blue-800 border-blue-600 text-blue-100 hover:bg-blue-700' 
                  : 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">{t.userDemo}</span>
            </button>
          </div>
          
          <div className={`text-center text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="mb-2">
              {language === 'ko' ? '빠른 접속을 위한 데모 계정들' : 'Quick access demo accounts'}
            </p>
            <div className="space-y-1">
              <p>• {language === 'ko' ? '관리자: 모든 기능 접근 가능' : 'Admin: Full feature access'}</p>
              <p>• {language === 'ko' ? '사용자: 제한된 기능' : 'User: Limited features'}</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;