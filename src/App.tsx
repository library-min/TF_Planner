import { useState } from 'react';
import type { User, Message, Task, Meeting, Event } from './types';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true); // true = 로그인, false = 회원가입
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState([
    { id: '1', title: '웹사이트 리디자인 프로젝트', status: 'in-progress', assignee: '김철수', dueDate: '2024-01-20' },
    { id: '2', title: 'API 문서 업데이트', status: 'completed', assignee: '이영희', dueDate: '2024-01-18' },
    { id: '3', title: '모바일 앱 테스트', status: 'pending', assignee: '박민수', dueDate: '2024-01-25' }
  ]);
  const [meetings, setMeetings] = useState([
    { id: '1', title: '주간 프로젝트 회의', date: '2024-01-15', content: '프로젝트 진행 상황 논의' },
    { id: '2', title: '디자인 리뷰 미팅', date: '2024-01-12', content: 'UI/UX 디자인 검토' },
    { id: '3', title: '기술 스택 논의', date: '2024-01-10', content: '새로운 기술 도입 검토' }
  ]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', dueDate: '', status: 'pending' });
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', content: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', description: '' });
  const [events, setEvents] = useState([
    { id: '1', title: '팀 미팅', date: '2024-01-15', time: '14:00', description: '주간 프로젝트 진행 상황 논의' },
    { id: '2', title: '프로젝트 마감', date: '2024-01-20', time: '18:00', description: '1차 프로젝트 마감일' },
    { id: '3', title: '월간 회고', date: '2024-01-25', time: '17:00', description: '이번 달 성과 및 개선사항 논의' }
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 관리자 기능 state
  const [showUserModal, setShowUserModal] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    emailNotification: true,
    autoBackup: true,
    debugMode: false
  });
  const [adminLogs, setAdminLogs] = useState([
    { id: 1, message: "사용자 '일반사용자'가 로그인했습니다.", timestamp: "2024-01-15 14:30:25", type: "info" },
    { id: 2, message: "새로운 할 일이 생성되었습니다.", timestamp: "2024-01-15 13:45:12", type: "success" },
    { id: 3, message: "시스템 백업이 완료되었습니다.", timestamp: "2024-01-15 12:00:00", type: "warning" }
  ]);
  const [systemStatus, setSystemStatus] = useState({
    server: '정상',
    database: '연결됨',
    backup: '대기중'
  });
  const [allUsers, setAllUsers] = useState([
    { id: 1, name: '관리자', email: 'admin@demo.com', role: 'admin', status: 'active', department: '관리팀', lastLogin: '2024-01-15 14:30' },
    { id: 2, name: '일반사용자', email: 'user@demo.com', role: 'user', status: 'active', department: '개발팀', lastLogin: '2024-01-15 13:45' },
    { id: 3, name: '김개발', email: 'dev@demo.com', role: 'user', status: 'active', department: '개발팀', lastLogin: '2024-01-14 16:20' },
    { id: 4, name: '이디자인', email: 'design@demo.com', role: 'user', status: 'inactive', department: '디자인팀', lastLogin: '2024-01-13 09:15' }
  ]);
  
  // 데모 계정 정보
  const demoAccounts = {
    admin: {
      email: 'admin@demo.com',
      password: 'admin123',
      name: '관리자',
      role: 'admin',
      avatar: '👨‍💼',
      department: '관리팀'
    },
    user: {
      email: 'user@demo.com',
      password: 'user123',
      name: '일반사용자',
      role: 'user',
      avatar: '👤',
      department: '개발팀'
    }
  };

  const tabs = [
    { id: 'dashboard', name: '대시보드', icon: '📊' },
    { id: 'tasks', name: '할 일 관리', icon: '✅' },
    { id: 'meetings', name: '회의록', icon: '📝' },
    { id: 'calendar', name: '일정', icon: '📅' },
    { id: 'team', name: '팀', icon: '👥' },
    ...(user?.role === 'admin' ? [
      { id: 'admin', name: '관리자', icon: '⚙️' },
      { id: 'analytics', name: '분석', icon: '📈' }
    ] : [])
  ];

  const handleLogin = (email: string, password: string) => {
    // 데모 계정 확인
    const adminDemo = demoAccounts.admin;
    const userDemo = demoAccounts.user;
    
    if (email === adminDemo.email && password === adminDemo.password) {
      setUser(adminDemo as User);
      setIsLoggedIn(true);
      return;
    }
    
    if (email === userDemo.email && password === userDemo.password) {
      setUser(userDemo as User);
      setIsLoggedIn(true);
      return;
    }
    
    // 기본 로그인 (개발용)
    if (email && password) {
      setUser({ 
        name: email.split('@')[0], 
        email, 
        password,
        role: 'user',
        avatar: '👤',
        department: '개발팀'
      });
      setIsLoggedIn(true);
    }
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // 실제 구현에서는 서버 API를 호출합니다
    if (name && email && password) {
      setUser({ 
        name, 
        email,
        password, 
        role: 'user',
        avatar: '👤',
        department: '개발팀'
      });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: user?.name || 'Anonymous',
        timestamp: new Date().toLocaleString('ko-KR'),
        type: 'sent' as const
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setShowMessageModal(false);
      
      // 자동 응답 시뮬레이션 (3초 후)
      setTimeout(() => {
        const autoReply = {
          id: (Date.now() + 1).toString(),
          text: '메시지를 받았습니다. 확인 후 답변드리겠습니다! 😊',
          sender: 'System',
          timestamp: new Date().toLocaleString('ko-KR'),
          type: 'received' as const
        };
        setMessages(prev => [...prev, autoReply]);
      }, 3000);
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now().toString(),
        ...newTask
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', assignee: '', dueDate: '', status: 'pending' });
      setShowTaskForm(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleAddMeeting = () => {
    if (newMeeting.title.trim()) {
      const meeting = {
        id: Date.now().toString(),
        ...newMeeting
      };
      setMeetings([...meetings, meeting]);
      setNewMeeting({ title: '', date: '', content: '' });
      setShowMeetingForm(false);
    }
  };

  const handleDeleteMeeting = (meetingId) => {
    setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return '완료 ✅';
      case 'in-progress': return '진행중';
      case 'pending': return '대기 ⏳';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 animate-pulse';
      case 'pending': return 'bg-red-100 text-red-800 hover:bg-red-200 animate-bounce';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.date) {
      const event = {
        id: Date.now().toString(),
        ...newEvent
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', date: '', time: '', description: '' });
      setShowEventForm(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const getEventsByDate = (year, month, date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  // 관리자 기능 함수들
  const handleSystemSettingsChange = (setting, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    // 로그 추가
    const newLog = {
      id: Date.now(),
      message: "시스템 설정이 업데이트되었습니다.",
      timestamp: new Date().toLocaleString('ko-KR'),
      type: "success"
    };
    setAdminLogs(prev => [newLog, ...prev]);
    alert('설정이 저장되었습니다! ✅');
  };

  const handleCheckSystemStatus = () => {
    // 시뮬레이션: 시스템 상태 체크
    setSystemStatus({
      server: Math.random() > 0.1 ? '정상' : '오류',
      database: Math.random() > 0.05 ? '연결됨' : '연결 실패',
      backup: Math.random() > 0.3 ? '완료' : '진행중'
    });
    
    const newLog = {
      id: Date.now(),
      message: "시스템 상태 체크를 실행했습니다.",
      timestamp: new Date().toLocaleString('ko-KR'),
      type: "info"
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  const handleUserStatusToggle = (userId) => {
    setAllUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    
    const newLog = {
      id: Date.now(),
      message: "사용자 상태가 변경되었습니다.",
      timestamp: new Date().toLocaleString('ko-KR'),
      type: "warning"
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  const renderAuthForm = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (showLogin) {
        handleLogin(formData.email, formData.password);
      } else {
        handleSignup(formData.name, formData.email, formData.password);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-4xl font-bold text-gray-900">
              TF-Planner
            </h2>
            <h3 className="mt-2 text-center text-2xl font-semibold text-gray-700">
              {showLogin ? '로그인' : '회원가입'}
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600">
              {showLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!showLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!showLogin}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {showLogin ? '로그인' : '회원가입'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowLogin(!showLogin)}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                {showLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </div>
          </form>

          {/* 데모 계정 정보 */}
          {showLogin && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">🎯 데모 계정</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium text-gray-700">👨‍💼 관리자 계정</span>
                    <div className="text-gray-500">admin@demo.com / admin123</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({email: 'admin@demo.com', password: 'admin123', name: ''});
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    사용
                  </button>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium text-gray-700">👤 일반 사용자</span>
                    <div className="text-gray-500">user@demo.com / user123</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({email: 'user@demo.com', password: 'user123', name: ''});
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    사용
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        const taskData = [
          { name: '완료됨', value: 12, color: '#10B981' },
          { name: '진행중', value: 8, color: '#F59E0B' },
          { name: '대기중', value: 5, color: '#EF4444' }
        ];

        const weeklyData = [
          { day: '월', completed: 4, total: 6 },
          { day: '화', completed: 3, total: 5 },
          { day: '수', completed: 5, total: 7 },
          { day: '목', completed: 2, total: 4 },
          { day: '금', completed: 6, total: 8 }
        ];

        // 원형 차트 컴포넌트
        const PieChart = ({ data, size = 200 }) => {
          const total = data.reduce((sum, item) => sum + item.value, 0);
          let currentAngle = 0;
          const radius = size / 2 - 20;
          const centerX = size / 2;
          const centerY = size / 2;

          return (
            <div className="relative">
              <svg width={size} height={size} className="transform -rotate-90">
                {data.map((item, index) => {
                  const angle = (item.value / total) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                  const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                  const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                  const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  const pathData = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
                  
                  currentAngle += angle;
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{total}</div>
                  <div className="text-sm text-gray-600">총 작업</div>
                </div>
              </div>
            </div>
          );
        };

        // 바 차트 컴포넌트
        const BarChart = ({ data, height = 200 }) => {
          const maxValue = Math.max(...data.map(d => d.total));
          
          return (
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 text-sm font-medium text-gray-700">{item.day}</div>
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${(item.completed / maxValue) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 bg-gray-300 h-4 rounded-full"
                        style={{ 
                          width: `${(item.total / maxValue) * 100}%`,
                          zIndex: -1
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-12">
                      {item.completed}/{item.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>대시보드</h2>
              <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                마지막 업데이트: {new Date().toLocaleString('ko-KR')}
              </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작업 현황</h3>
                <div className="flex items-center justify-center">
                  <PieChart data={taskData} />
                </div>
                <div className="mt-4 space-y-2">
                  {taskData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</span>
                      </div>
                      <span className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}개</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>주간 진행률</h3>
                <BarChart data={weeklyData} />
                <div className={`mt-4 flex justify-between text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>이번 주 완료: {weeklyData.reduce((sum, d) => sum + d.completed, 0)}개</span>
                  <span>전체 작업: {weeklyData.reduce((sum, d) => sum + d.total, 0)}개</span>
                </div>
              </div>
            </div>

            {/* 통계 카드들 - 차트 아래로 이동 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-white bg-opacity-20 rounded-lg">
                    <span className="text-xl lg:text-2xl">✅</span>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">완료된 작업</h3>
                    <div className="text-2xl lg:text-3xl font-bold">12</div>
                    <div className="text-xs lg:text-sm opacity-75">+2 오늘</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-white bg-opacity-20 rounded-lg">
                    <span className="text-xl lg:text-2xl">🔄</span>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">진행중인 작업</h3>
                    <div className="text-2xl lg:text-3xl font-bold">8</div>
                    <div className="text-xs lg:text-sm opacity-75">+1 오늘</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-white bg-opacity-20 rounded-lg">
                    <span className="text-xl lg:text-2xl">👥</span>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">팀 멤버</h3>
                    <div className="text-2xl lg:text-3xl font-bold">4</div>
                    <div className="text-xs lg:text-sm opacity-75">모두 활성</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 lg:p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-white bg-opacity-20 rounded-lg">
                    <span className="text-xl lg:text-2xl">📈</span>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">완료율</h3>
                    <div className="text-2xl lg:text-3xl font-bold">68%</div>
                    <div className="text-xs lg:text-sm opacity-75">+5% 이번주</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">김철수님이 "웹사이트 리디자인" 작업을 완료했습니다</p>
                      <p className="text-xs text-gray-500">5분 전</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">이영희님이 새로운 회의록을 작성했습니다</p>
                      <p className="text-xs text-gray-500">1시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">🔄</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">박민수님이 "API 문서화" 작업을 시작했습니다</p>
                      <p className="text-xs text-gray-500">2시간 전</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>할 일 관리</h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse"
              >
                ✨ 새 할 일 추가
              </button>
            </div>
            
            <div className={`rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6 space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg transform group ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex-1">
                      <h3 className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                      <div className={`flex items-center mt-2 text-sm space-x-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>👤 담당자: {task.assignee}</span>
                        <span>📅 마감일: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-300 transform hover:scale-110 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-lg">아직 등록된 할 일이 없습니다.</p>
                    <p className="text-sm mt-2">새로운 할 일을 추가해보세요! 🚀</p>
                  </div>
                )}
              </div>
            </div>

            {/* 할 일 추가 모달 */}
            {showTaskForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md transform animate-slideUp shadow-2xl">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">✨ 새 할 일 추가</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="할 일 제목을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                      <input
                        type="text"
                        value={newTask.assignee}
                        onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                        placeholder="담당자명을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                      <select
                        value={newTask.status}
                        onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="pending">대기</option>
                        <option value="in-progress">진행중</option>
                        <option value="completed">완료</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setShowTaskForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAddTask}
                      disabled={!newTask.title.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      🚀 추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'meetings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>회의록</h2>
              <button
                onClick={() => setShowMeetingForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse"
              >
                📝 새 회의록 작성
              </button>
            </div>
            
            <div className={`rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="space-y-4">
                {meetings.map((meeting, index) => (
                  <div key={meeting.id} className={`border-b pb-4 last:border-b-0 transition-all duration-300 rounded-lg p-4 cursor-pointer transform hover:scale-105 group ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } ${
                    index % 3 === 0 ? (isDarkMode ? 'hover:bg-blue-900/30 hover:border-blue-700' : 'hover:bg-blue-50 hover:border-blue-200') :
                    index % 3 === 1 ? (isDarkMode ? 'hover:bg-green-900/30 hover:border-green-700' : 'hover:bg-green-50 hover:border-green-200') :
                    (isDarkMode ? 'hover:bg-purple-900/30 hover:border-purple-700' : 'hover:bg-purple-50 hover:border-purple-200')
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        } ${
                          index % 3 === 0 ? (isDarkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-800') :
                          index % 3 === 1 ? (isDarkMode ? 'group-hover:text-green-400' : 'group-hover:text-green-800') :
                          (isDarkMode ? 'group-hover:text-purple-400' : 'group-hover:text-purple-800')
                        }`}>
                          {meeting.title} {index % 3 === 0 ? '📋' : index % 3 === 1 ? '🎨' : '💻'}
                        </h3>
                        <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>📅 {meeting.date}</p>
                        <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{meeting.content}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMeeting(meeting.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-300 transform hover:scale-110 p-1 ml-4"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className={`text-xs font-medium ${
                        index % 3 === 0 ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') :
                        index % 3 === 1 ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                        (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                      }`}>
                        클릭하여 자세히 보기
                      </span>
                    </div>
                  </div>
                ))}
                
                {meetings.length === 0 && (
                  <div className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-lg">아직 작성된 회의록이 없습니다.</p>
                    <p className="text-sm mt-2">새로운 회의록을 작성해보세요! 📝</p>
                  </div>
                )}
              </div>
            </div>

            {/* 회의록 추가 모달 */}
            {showMeetingForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg transform animate-slideUp shadow-2xl">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">📝 새 회의록 작성</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">회의 제목</label>
                      <input
                        type="text"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                        placeholder="회의 제목을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">회의 날짜</label>
                      <input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">회의 내용</label>
                      <textarea
                        value={newMeeting.content}
                        onChange={(e) => setNewMeeting({...newMeeting, content: e.target.value})}
                        placeholder="회의 내용을 상세히 입력하세요..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setShowMeetingForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAddMeeting}
                      disabled={!newMeeting.title.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      📝 작성완료
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'calendar':
        const monthNames = [
          '1월', '2월', '3월', '4월', '5월', '6월',
          '7월', '8월', '9월', '10월', '11월', '12월'
        ];

        const getDaysInMonth = (year, month) => {
          return new Date(year, month + 1, 0).getDate();
        };

        const getFirstDayOfMonth = (year, month) => {
          return new Date(year, month, 1).getDay();
        };

        const handlePrevMonth = () => {
          if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
          } else {
            setCurrentMonth(currentMonth - 1);
          }
        };

        const handleNextMonth = () => {
          if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
          } else {
            setCurrentMonth(currentMonth + 1);
          }
        };

        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const today = new Date();
        const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();
        const todayDate = today.getDate();

        // 캘린더 날짜 배열 생성
        const calendarDays = [];
        
        // 이전 달의 마지막 날들
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
        
        for (let i = firstDay - 1; i >= 0; i--) {
          calendarDays.push({
            date: daysInPrevMonth - i,
            isCurrentMonth: false,
            isPrevMonth: true
          });
        }

        // 현재 달의 날들
        for (let date = 1; date <= daysInMonth; date++) {
          calendarDays.push({
            date: date,
            isCurrentMonth: true,
            isPrevMonth: false,
            isToday: isCurrentMonth && date === todayDate
          });
        }

        // 다음 달의 첫 날들
        const remainingDays = 42 - calendarDays.length; // 6주 * 7일
        for (let date = 1; date <= remainingDays; date++) {
          calendarDays.push({
            date: date,
            isCurrentMonth: false,
            isPrevMonth: false
          });
        }

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>일정 캘린더</h2>
              <button 
                onClick={() => setShowEventForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse"
              >
                ✨ 일정 추가
              </button>
            </div>

            <div className={`rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* 캘린더 헤더 */}
              <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePrevMonth}
                    className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-md ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    🔙 이전
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:border-blue-400' 
                          : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'
                      }`}
                    >
                      {Array.from({length: 21}, (_, i) => currentYear - 10 + i).map(year => (
                        <option key={year} value={year}>{year}년</option>
                      ))}
                    </select>
                    
                    <select
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:border-blue-400' 
                          : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'
                      }`}
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleNextMonth}
                    className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-md ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    다음 🔜
                  </button>
                </div>

                <button
                  onClick={() => {
                    const now = new Date();
                    setCurrentYear(now.getFullYear());
                    setCurrentMonth(now.getMonth());
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    isDarkMode 
                      ? 'text-blue-400 hover:bg-gray-700' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  오늘로
                </button>
              </div>

              {/* 캘린더 본체 */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div 
                      key={day} 
                      className={`py-3 text-center font-semibold transition-colors duration-300 ${
                        index === 0 ? 'text-red-500' : 
                        index === 6 ? 'text-blue-500' : 
                        (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`
                        min-h-[60px] p-2 border rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
                        ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}
                        ${day.isCurrentMonth ? 
                          (isDarkMode ? 'hover:bg-blue-900/30 hover:shadow-lg hover:border-blue-500 text-gray-200' : 'hover:bg-blue-50 hover:shadow-lg hover:border-blue-300') : 
                          (isDarkMode ? 'bg-gray-700 text-gray-500 hover:bg-gray-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100')
                        }
                        ${day.isToday ? 
                          (isDarkMode ? 'bg-gradient-to-br from-blue-800 to-blue-900 border-blue-500 text-blue-200 font-bold shadow-md animate-pulse' : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 text-blue-900 font-bold shadow-md animate-pulse') : 
                          ''
                        }
                        ${index % 7 === 0 && day.isCurrentMonth ? 'text-red-500 hover:text-red-400' : ''}
                        ${index % 7 === 6 && day.isCurrentMonth ? 'text-blue-500 hover:text-blue-400' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">{day.date}</div>
                      {/* 일정 동적 표시 */}
                      {day.isCurrentMonth && getEventsByDate(currentYear, currentMonth, day.date).map((event, eventIndex) => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-1 rounded mt-1 transition-all duration-300 hover:scale-110 cursor-pointer group relative ${
                            eventIndex % 3 === 0 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            eventIndex % 3 === 1 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                            'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate text-xs">
                              {event.time && `${event.time} `}{event.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-300 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 이번 달 일정 요약 */}
            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentYear}년 {monthNames[currentMonth]} 주요 일정
              </h3>
              <div className="space-y-3">
                {events
                  .filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index % 3 === 0 ? 'bg-green-500' :
                          index % 3 === 1 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(event.date).getDate()}일 - {event.title} 
                          {event.time && ` (${event.time})`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all duration-300 transform hover:scale-110 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                
                {events.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
                }).length === 0 && (
                  <div className={`text-center py-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-sm">이번 달에 등록된 일정이 없습니다.</p>
                    <p className="text-xs mt-1">새로운 일정을 추가해보세요! 📅</p>
                  </div>
                )}
              </div>
            </div>

            {/* 일정 추가 모달 */}
            {showEventForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className={`rounded-lg p-6 w-full max-w-md transform animate-slideUp shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📅 새 일정 추가</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>일정 제목</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="일정 제목을 입력하세요"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>날짜</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>시간</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>설명</label>
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        placeholder="일정에 대한 설명을 입력하세요..."
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setShowEventForm(false)}
                      className={`px-4 py-2 border rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        isDarkMode 
                          ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAddEvent}
                      disabled={!newEvent.title.trim() || !newEvent.date}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      📅 추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>팀 관리</h2>
            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`text-center p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">👨‍💼</div>
                  <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>관리자</h3>
                  <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>관리팀</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">관리자</span>
                </div>
                <div className={`text-center p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">👤</div>
                  <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>일반사용자</h3>
                  <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>개발팀</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">사용자</span>
                </div>
                <div className={`text-center p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">👩‍💻</div>
                  <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>김개발</h3>
                  <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>개발팀</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">활성</span>
                </div>
                <div className={`text-center p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">🎨</div>
                  <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>이디자인</h3>
                  <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>디자인팀</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">활성</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⚙️ 관리자 설정</h2>
            
            {/* 관리자 권한 체크 */}
            {user?.role !== 'admin' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">❌ 관리자 권한이 필요합니다.</p>
              </div>
            )}
            
            {user?.role === 'admin' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>👥 사용자 관리</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>총 사용자</span>
                        <span className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>활성 사용자</span>
                        <span className="font-semibold text-green-600">3명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>관리자</span>
                        <span className="font-semibold text-red-600">1명</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowUserModal(true)}
                      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      사용자 관리
                    </button>
                  </div>
                  
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔧 시스템 설정</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={systemSettings.emailNotification}
                          onChange={(e) => handleSystemSettingsChange('emailNotification', e.target.checked)}
                        />
                        <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>이메일 알림</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={systemSettings.autoBackup}
                          onChange={(e) => handleSystemSettingsChange('autoBackup', e.target.checked)}
                        />
                        <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>자동 백업</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={systemSettings.debugMode}
                          onChange={(e) => handleSystemSettingsChange('debugMode', e.target.checked)}
                        />
                        <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>디버그 모드</span>
                      </label>
                    </div>
                    <button 
                      onClick={handleSaveSettings}
                      className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      설정 저장
                    </button>
                  </div>
                  
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 시스템 상태</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>서버 상태</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">정상</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>데이터베이스</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">연결됨</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>백업 상태</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">대기중</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleCheckSystemStatus}
                      className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      상태 확인
                    </button>
                  </div>
                </div>
                
                <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📝 최근 관리자 로그</h3>
                  <div className="space-y-2">
                    <div className={`p-3 rounded border-l-4 border-blue-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>사용자 '일반사용자'가 로그인했습니다.</p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2024-01-15 14:30:25</p>
                    </div>
                    <div className={`p-3 rounded border-l-4 border-green-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>새로운 할 일이 생성되었습니다.</p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2024-01-15 13:45:12</p>
                    </div>
                    <div className={`p-3 rounded border-l-4 border-yellow-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>시스템 백업이 완료되었습니다.</p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2024-01-15 12:00:00</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📈 분석 대시보드</h2>
            
            {user?.role !== 'admin' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">❌ 관리자 권한이 필요합니다.</p>
              </div>
            )}
            
            {user?.role === 'admin' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>총 사용자</h3>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+12% 이번 달</p>
                  </div>
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>완료된 작업</h3>
                    <p className="text-3xl font-bold text-green-600">156</p>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+8% 이번 주</p>
                  </div>
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>활성 프로젝트</h3>
                    <p className="text-3xl font-bold text-purple-600">8</p>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+2 신규</p>
                  </div>
                  <div className={`p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>평균 응답시간</h3>
                    <p className="text-3xl font-bold text-orange-600">2.3s</p>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>-0.5s 개선</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>월별 사용자 증가율</h3>
                    <div className="space-y-4">
                      {['1월', '2월', '3월', '4월', '5월'].map((month, index) => (
                        <div key={month} className="flex items-center justify-between">
                          <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{month}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(index + 1) * 20}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {(index + 1) * 20}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>부서별 활동</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>개발팀</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>디자인팀</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">30%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>관리팀</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">15%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>마케팅팀</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      default:
        return <div className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>페이지를 찾을 수 없습니다.</div>;
    }
  };

  // 로그인하지 않은 경우 인증 폼을 보여줍니다
  if (!isLoggedIn) {
    return renderAuthForm();
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* 헤더 */}
      <header className={`shadow-sm border-b lg:ml-64 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-blue-500">TF-Planner</h1>
            <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Team Collaboration Platform
            </div>
          </div>
        </div>
      </header>

      {/* 사이드 네비게이션 - 고정 위치 */}
      <nav className={`fixed left-0 top-0 h-full w-64 shadow-lg z-10 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-500">TF-Planner</h2>
          <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Team Collaboration</p>
        </div>
        
        <ul className="flex-1 px-6 space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-r-4 border-blue-600 shadow-md scale-105'
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                }`}
              >
                <span className={`mr-3 text-lg transition-transform duration-300 ${
                  activeTab === tab.id ? 'animate-pulse' : 'group-hover:animate-bounce'
                }`}>{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* 사용자 정보 - 사이드바 하단 */}
        <div className={`p-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center mb-3 p-2 rounded-lg transition-all duration-300 cursor-pointer ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold transform transition-transform duration-300 hover:scale-110 hover:rotate-6 shadow-lg">
              {user?.avatar || user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {user?.role === 'admin' ? '👑 관리자' : '안녕하세요!'}
              </p>
              <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.name || 'User'}님 ({user?.department})
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
          >
            <span className="mr-2 transition-transform duration-300 hover:animate-spin">🚪</span>
            로그아웃
          </button>
        </div>
      </nav>

      {/* 다크모드 토글 버튼 */}
      <div className="fixed top-4 right-6 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            isDarkMode 
              ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' 
              : 'bg-gray-800 hover:bg-gray-900 text-yellow-400'
          }`}
        >
          <span className="text-xl transition-transform duration-300 hover:rotate-180">
            {isDarkMode ? '☀️' : '🌙'}
          </span>
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <main className={`ml-64 p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {renderContent()}
      </main>

      {/* 플로팅 메일 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowMessageModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group animate-pulse"
        >
          <span className="text-xl group-hover:animate-bounce">✉️</span>
          {messages.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-ping">
              {messages.length}
            </div>
          )}
        </button>
      </div>

      {/* 메시지 모달 */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform animate-slideUp shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">💌 메시지 보내기</h2>
            
            {/* 기존 메시지들 */}
            {messages.length > 0 && (
              <div className="mb-4 max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg text-sm transform transition-all duration-300 hover:scale-105 ${
                      msg.type === 'sent'
                        ? 'bg-blue-100 text-blue-800 ml-4'
                        : 'bg-green-100 text-green-800 mr-4'
                    }`}
                  >
                    <div className="font-semibold">{msg.sender}</div>
                    <div>{msg.text}</div>
                    <div className="text-xs opacity-70">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="팀에게 전달하고 싶은 메시지를 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
              rows={4}
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                취소
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center"
              >
                <span className="mr-2">🚀</span>
                전송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 관리 모달 */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`rounded-lg p-6 w-full max-w-4xl transform animate-slideUp shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>👥 사용자 관리</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {allUsers.map((userData) => (
                <div key={userData.id} className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {userData.name[0]}
                    </div>
                    <div className="ml-3">
                      <h4 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.name}</h4>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{userData.department}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-medium">역할:</span> {userData.role === 'admin' ? '관리자' : '일반 사용자'}
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-medium">상태:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${userData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {userData.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-medium">마지막 로그인:</span> {userData.lastLogin}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                      편집
                    </button>
                    <button className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                + 새 사용자 추가
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className={`px-4 py-2 border rounded-lg transition-all duration-300 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;