import React from 'react';
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

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.weeklyProgress')}>
          <div className="space-y-3">
            {weeklyProgressData.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{day.day}요일</span>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(day.completed / day.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {day.completed}/{day.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('dashboard.projectStatus')}>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">마감: {project.dueDate}</p>
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

      {/* 관리자만 간트차트 볼 수 있음 */}
      {isAdmin && (
        <GanttChart 
          tasks={allTasks.map(task => ({ ...task, startDate: task.startDate || task.createdAt }))} 
          className="mt-6"
        />
      )}
    </div>
  );
};

export default Dashboard;