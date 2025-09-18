import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import GanttChart from '../components/GanttChart';
import { Task, Project, TeamMember } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const { isAdmin } = useAuth();
  const { 
    getCompletedTasksCount, 
    getInProgressTasksCount, 
    getProjectProgress, 
    getTeamMemberCount,
    tasks,
    users
  } = useData();
  // 오늘의 할 일을 실제 데이터에서 가져오기 (최근 5개)
  const todayTasks = tasks.slice(0, 3);

  // 간트차트용 데이터 (실제 tasks 사용)
  const allTasks = tasks;

  const projects: Project[] = [
    { id: '1', name: '웹 앱 개발', progress: 75, status: 'active', dueDate: '2024-02-28' },
    { id: '2', name: '모바일 앱 개발', progress: 45, status: 'active', dueDate: '2024-03-15' },
    { id: '3', name: '데이터 분석 시스템', progress: 90, status: 'active', dueDate: '2024-01-30' },
  ];

  // 팀 멤버 데이터 (실제 users 사용)
  const teamMembers = users.map(user => ({
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar || ''
  }));

  const taskStatusData = [
    { name: t('dashboard.completed'), value: getCompletedTasksCount(), color: '#10B981' },
    { name: t('dashboard.inProgress'), value: getInProgressTasksCount(), color: '#F59E0B' },
    { name: t('dashboard.pending'), value: tasks.filter(task => task.status === 'pending').length, color: '#EF4444' },
  ];

  const weeklyProgressData = [
    { day: '월', completed: 4, total: 6 },
    { day: '화', completed: 3, total: 5 },
    { day: '수', completed: 5, total: 7 },
    { day: '목', completed: 2, total: 4 },
    { day: '금', completed: 6, total: 8 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('dashboard.completed');
      case 'in-progress': return t('dashboard.inProgress');
      case 'pending': return t('dashboard.pending');
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t('tasks.high');
      case 'medium': return t('tasks.medium');
      case 'low': return t('tasks.low');
      default: return priority;
    }
  };

  const [animatedCounts, setAnimatedCounts] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  const actualCounts = {
    completed: getCompletedTasksCount(),
    inProgress: getInProgressTasksCount(),
    pending: tasks.filter(task => task.status === 'pending').length
  };
  
  const totalTasks = actualCounts.completed + actualCounts.inProgress + actualCounts.pending;
  
  useEffect(() => {
    setIsAnimating(true);
    const animationDuration = 1500;
    const steps = 60;
    const stepDuration = animationDuration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedCounts({
        completed: Math.floor(actualCounts.completed * progress),
        inProgress: Math.floor(actualCounts.inProgress * progress),
        pending: Math.floor(actualCounts.pending * progress)
      });
      
      if (currentStep >= steps) {
        setAnimatedCounts(actualCounts);
        setIsAnimating(false);
        clearInterval(timer);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [actualCounts.completed, actualCounts.inProgress, actualCounts.pending]);
  
  const getPercentage = (value: number) => {
    return totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
      </div>
      
      {/* Animated Progress Chart */}
      <Card title="작업 현황 차트">
        <div className="space-y-6">
          {/* Circular Progress Chart */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                
                {/* Completed Tasks Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${getPercentage(animatedCounts.completed) * 2.2} 220`}
                  strokeDashoffset="0"
                  className="transition-all duration-500 ease-out"
                  style={{
                    filter: isAnimating ? 'drop-shadow(0 0 6px #10b981)' : 'none'
                  }}
                />
                
                {/* In Progress Tasks Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeDasharray={`${getPercentage(animatedCounts.inProgress) * 2.2} 220`}
                  strokeDashoffset={`-${getPercentage(animatedCounts.completed) * 2.2}`}
                  className="transition-all duration-500 ease-out"
                  style={{
                    filter: isAnimating ? 'drop-shadow(0 0 6px #f59e0b)' : 'none'
                  }}
                />
                
                {/* Pending Tasks Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray={`${getPercentage(animatedCounts.pending) * 2.2} 220`}
                  strokeDashoffset={`-${(getPercentage(animatedCounts.completed) + getPercentage(animatedCounts.inProgress)) * 2.2}`}
                  className="transition-all duration-500 ease-out"
                  style={{
                    filter: isAnimating ? 'drop-shadow(0 0 6px #ef4444)' : 'none'
                  }}
                />
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${
                    isAnimating ? 'scale-110' : 'scale-100'
                  }`}>
                    {animatedCounts.completed + animatedCounts.inProgress + animatedCounts.pending}
                  </div>
                  <div className="text-sm text-gray-500">총 작업</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">완료</span>
              </div>
              <div className={`text-2xl font-bold text-green-600 transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}>
                {animatedCounts.completed}
              </div>
              <div className="text-xs text-gray-500">{getPercentage(animatedCounts.completed)}%</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">진행중</span>
              </div>
              <div className={`text-2xl font-bold text-yellow-600 transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}>
                {animatedCounts.inProgress}
              </div>
              <div className="text-xs text-gray-500">{getPercentage(animatedCounts.inProgress)}%</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">대기</span>
              </div>
              <div className={`text-2xl font-bold text-red-600 transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}>
                {animatedCounts.pending}
              </div>
              <div className="text-xs text-gray-500">{getPercentage(animatedCounts.pending)}%</div>
            </div>
          </div>
          
          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">완료된 작업</span>
                <span className="text-green-600 font-medium">{getPercentage(animatedCounts.completed)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${getPercentage(animatedCounts.completed)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">진행중인 작업</span>
                <span className="text-yellow-600 font-medium">{getPercentage(animatedCounts.inProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${getPercentage(animatedCounts.inProgress)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">대기중인 작업</span>
                <span className="text-red-600 font-medium">{getPercentage(animatedCounts.pending)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${getPercentage(animatedCounts.pending)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 mr-3" />
            <div>
              <p className="text-blue-100">{t('dashboard.completedTasks')}</p>
              <p className="text-2xl font-bold">{getCompletedTasksCount()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center">
            <Clock className="w-8 h-8 mr-3" />
            <div>
              <p className="text-yellow-100">{t('dashboard.inProgressTasks')}</p>
              <p className="text-2xl font-bold">{getInProgressTasksCount()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-3" />
            <div>
              <p className="text-green-100">{t('dashboard.projectProgress')}</p>
              <p className="text-2xl font-bold">{getProjectProgress()}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <Users className="w-8 h-8 mr-3" />
            <div>
              <p className="text-purple-100">{t('dashboard.teamMembers')}</p>
              <p className="text-2xl font-bold">{getTeamMemberCount()}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.todayTasks')}>
          <div className="space-y-4">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span>{t('tasks.assignee')}: {task.assignee}</span>
                    <span className={`ml-3 px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('dashboard.taskStatus')}>
          <div className="space-y-4">
            {taskStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>


      {/* 관리자만 팀 멤버 현황 볼 수 있음 */}
      {isAdmin && (
        <Card title={t('dashboard.teamMemberStatus')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                  {member.name[0]}
                </div>
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.role}</p>
                <div className="mt-2 flex justify-center">
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                    {t('dashboard.active')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};

export default Dashboard;