/**
 * 인증 컨텍스트
 * 사용자 인증 상태 관리 및 로그인/회원가입 기능을 제공
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 사용자 정보 인터페이스
interface User {
  id: string;          // 사용자 고유 ID
  name: string;        // 사용자 이름
  email: string;       // 이메일 주소 (로그인 ID)
  role: string;        // 사용자 권한 (관리자/사용자)
}

// 로컬스토리지에 저장되는 사용자 정보 인터페이스 (비밀번호 포함)
interface StoredUser extends User {
  password?: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;                                    // 현재 로그인된 사용자 정보
  isAuthenticated: boolean;                             // 인증 상태
  isAdmin: boolean;                                     // 관리자 권한 여부
  login: (email: string, password: string) => Promise<boolean>; // 로그인 함수
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>; // 회원가입 함수
  loginAsDemo: (userType: 'admin' | 'user' | 'user1' | 'user2' | 'user3' | 'user4' | 'user5') => void;    // 데모 로그인 함수
  logout: () => void;                                   // 로그아웃 함수
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 컨텍스트 훅
 * 컴포넌트에서 인증 상태와 함수들을 사용하기 위한 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider 컴포넌트의 props 타입
interface AuthProviderProps {
  children: ReactNode;  // 자식 컴포넌트들
}

/**
 * 인증 컨텍스트 제공자 컴포넌트
 * 애플리케이션 전체에 인증 상태와 기능을 제공
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 로컬스토리지에서 저장된 사용자 정보를 초기값으로 설정
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 인증 상태 및 관리자 권한 확인
  const isAuthenticated = !!user;
  const isAdmin = user?.role === '관리자';

  /**
   * 로그인 함수
   * @param email 사용자 이메일
   * @param password 사용자 비밀번호
   * @returns 로그인 성공 여부
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) return false;
    
    // 로컬스토리지에서 등록된 사용자 목록 확인
    const registeredUsers: StoredUser[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const registeredUser = registeredUsers.find((user) => 
      user.email === email && user.password === password
    );
    
    // 등록된 사용자가 있으면 로그인 처리
    if (registeredUser) {
      const { password: _, ...userWithoutPassword } = registeredUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    // 기본 데모 계정 (하위 호환성 유지)
    if (email === 'admin@tf-planner.com') {
      const userData: User = {
        id: '1',
        name: '김철수',
        email,
        role: '관리자'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  /**
   * 데모 로그인 함수
   * @param userType 사용자 타입 (admin, user1~user5)
   */
  const loginAsDemo = (userType: 'admin' | 'user' | 'user1' | 'user2' | 'user3' | 'user4' | 'user5') => {
    // 데모 사용자 데이터 매핑
    const demoUsers: { [key: string]: User } = {
      admin: {
        id: '1',
        name: '김철수',
        email: 'admin@tf-planner.com',
        role: '관리자'
      },
      user: {  // 하위 호환성을 위해 유지
        id: '2',
        name: '박영희',
        email: 'user1@tf-planner.com',
        role: '일반사용자'
      },
      user1: {
        id: '2',
        name: '박영희',
        email: 'user1@tf-planner.com',
        role: '일반사용자'
      },
      user2: {
        id: '3',
        name: '이민수',
        email: 'user2@tf-planner.com',
        role: '일반사용자'
      },
      user3: {
        id: '4',
        name: '최지영',
        email: 'user3@tf-planner.com',
        role: '일반사용자'
      },
      user4: {
        id: '5',
        name: '정수진',
        email: 'user4@tf-planner.com',
        role: '일반사용자'
      },
      user5: {
        id: '6',
        name: '강호동',
        email: 'user5@tf-planner.com',
        role: '일반사용자'
      }
    };
    
    const userData = demoUsers[userType];
    if (userData) {
      // 사용자 정보 설정 및 로컬스토리지에 저장
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  /**
   * 회원가입 함수
   * @param name 사용자 이름
   * @param email 사용자 이메일
   * @param password 사용자 비밀번호
   * @returns 회원가입 결과 (성공 여부 및 에러 메시지)
   */
  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 입력 데이터 유효성 검사
    if (!name.trim()) {
      return { success: false, error: '이름을 입력해주세요.' };
    }
    if (!email.trim()) {
      return { success: false, error: '이메일을 입력해주세요.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: '비밀번호는 6자 이상이어야 합니다.' };
    }
    
    // 이메일 중복 체크 (로컬스토리지에서 기존 사용자 확인)
    const existingUsers: StoredUser[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (existingUsers.some((user) => user.email === email)) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }
    
    // 새 사용자 정보 생성
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      role: '사용자'
    };
    
    // 등록된 사용자 목록에 추가 (비밀번호 포함)
    const updatedUsers = [...existingUsers, { ...newUser, password }];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // 자동 로그인 처리
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return { success: true };
  };

  /**
   * 로그아웃 함수
   * 사용자 정보를 초기화하고 로컬스토리지에서 제거
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 컴포넌트 마운트 시 로컬스토리지에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 인증 컨텍스트 값 제공
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      signup,
      loginAsDemo,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};