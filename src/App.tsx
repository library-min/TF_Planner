import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Calendar from './pages/Calendar';
import UserManagement from './pages/UserManagement';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/team" element={<UserManagement />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;