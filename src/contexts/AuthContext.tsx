import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (userType: 'admin' | 'user') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!user;
  const isAdmin = user?.role === '관리자';

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) return false;
    
    // 등록된 사용자 확인
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const registeredUser = registeredUsers.find((user: any) => 
      user.email === email && user.password === password
    );
    
    if (registeredUser) {
      const { password: _, ...userWithoutPassword } = registeredUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    // 기본 데모 계정 (하위 호환성)
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

  const loginAsDemo = (userType: 'admin' | 'user') => {
    const userData: User = userType === 'admin' 
      ? {
          id: '1',
          name: '김철수 (관리자)',
          email: 'admin@tf-planner.com',
          role: '관리자'
        }
      : {
          id: '2',
          name: '박영희 (일반 사용자)',
          email: 'user@tf-planner.com',
          role: '사용자'
        };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 간단한 유효성 검사
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
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (existingUsers.some((user: any) => user.email === email)) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }
    
    // 새 사용자 등록
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      role: '사용자'
    };
    
    // 등록된 사용자 목록에 추가
    const updatedUsers = [...existingUsers, { ...newUser, password }];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // 자동 로그인
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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