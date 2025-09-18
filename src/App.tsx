import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import UserManagement from './pages/UserManagement';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';

function App() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <ChatProvider 
          currentUserId={user?.id || ''}
          currentUserName={user?.name || ''}
          isAdmin={isAdmin}
        >
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/team" element={<UserManagement />} />
            </Routes>
          </Layout>
        </ChatProvider>
      </div>
    </Router>
  );
}

export default App;