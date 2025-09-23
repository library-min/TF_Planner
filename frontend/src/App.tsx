/**
 * TF-Planner 메인 애플리케이션 컴포넌트
 * 라우팅과 인증 처리를 담당하는 루트 컴포넌트
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// 컴포넌트 임포트
import Layout from './components/Layout'; // 메인 레이아웃
import Login from './components/Login'; // 로그인 페이지

// 페이지 컴포넌트들
import Dashboard from './pages/Dashboard'; // 대시보드
import Tasks from './pages/Tasks'; // 작업 관리
import Meetings from './pages/Meetings'; // 회의 관리
import Calendar from './pages/Calendar'; // 일정 관리
import Chat from './pages/Chat'; // 채팅
import UserManagement from './pages/UserManagement'; // 사용자 관리

// 컨텍스트 훅들
import { useTheme } from './contexts/ThemeContext'; // 테마 관리
import { useAuth } from './contexts/AuthContext'; // 인증 관리
import { ChatProvider } from './contexts/ChatContext'; // 채팅 관리

/**
 * 메인 App 컴포넌트
 * 인증 상태에 따라 로그인 페이지 또는 메인 애플리케이션을 렌더링
 */
function App() {
  const { isDarkMode } = useTheme(); // 다크모드 상태
  const { isAuthenticated, user, isAdmin } = useAuth(); // 인증 상태 및 사용자 정보

  // 비로그인 상태일 때 로그인 페이지 표시
  if (!isAuthenticated) {
    return <Login />;
  }

  // 로그인 상태일 때 메인 애플리케이션 표시
  return (
    <Router>
      {/* 다크/라이트 모드에 따른 배경색 설정 */}
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* 채팅 기능을 위한 컨텍스트 제공 */}
        <ChatProvider 
          currentUserId={user?.id || ''} // 현재 로그인된 사용자 ID
          currentUserName={user?.name || ''} // 현재 로그인된 사용자 이름
          isAdmin={isAdmin} // 관리자 권한 여부
        >
          {/* 메인 레이아웃 (네비게이션 포함) */}
          <Layout>
            <Routes>
              {/* 각 페이지로의 라우트 정의 */}
              <Route path="/" element={<Dashboard />} />         {/* 대시보드 (홈) */}
              <Route path="/tasks" element={<Tasks />} />        {/* 작업 관리 */}
              <Route path="/meetings" element={<Meetings />} />  {/* 회의 관리 */}
              <Route path="/calendar" element={<Calendar />} />  {/* 일정 관리 */}
              <Route path="/chat" element={<Chat />} />          {/* 채팅 */}
              <Route path="/team" element={<UserManagement />} /> {/* 사용자 관리 */}
            </Routes>
          </Layout>
        </ChatProvider>
      </div>
    </Router>
  );
}

export default App;