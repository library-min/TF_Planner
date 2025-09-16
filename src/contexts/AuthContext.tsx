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
  login: (email: string, password: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // 간단한 로그인 시뮬레이션 (실제로는 API 호출)
    if (email && password) {
      const userData: User = {
        id: '1',
        name: email === 'admin@tf-planner.com' ? '김철수' : 'Kim Cheolsu',
        email,
        role: email === 'admin@tf-planner.com' ? '관리자' : '사용자'
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
      login,
      loginAsDemo,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};