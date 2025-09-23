/**
 * 테마 컨텍스트
 * 다크/라이트 모드 상태 관리를 담당
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 테마 컨텍스트 타입 정의
interface ThemeContextType {
  isDarkMode: boolean;        // 다크모드 상태
  toggleDarkMode: () => void; // 다크모드 토글 함수
}

// 테마 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 테마 컨텍스트 훅
 * 컴포넌트에서 테마 상태와 함수를 사용하기 위한 훅
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ThemeProvider 컴포넌트의 props 타입
interface ThemeProviderProps {
  children: ReactNode;  // 자식 컴포넌트들
}

/**
 * 테마 컨텍스트 제공자 컴포넌트
 * 애플리케이션 전체에 테마 관련 상태와 기능을 제공
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 로컬스토리지에서 다크모드 설정을 불러오거나 기본값(false) 사용
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  /**
   * 다크모드 토글 함수
   * 상태를 변경하고 로컬스토리지에 저장
   */
  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  // 다크모드 상태 변경 시 HTML 클래스 업데이트
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 테마 컨텍스트 값 제공
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};