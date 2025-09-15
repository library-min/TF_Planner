import React from 'react';
import { Calendar, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import GanttChart from '../components/GanttChart';
import { Task, Project, TeamMember } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const todayTasks: Task[] = [
    { id: '1', title: '프로젝트 계획 수립', assignee: '김철수', dueDate: '2024-01-15', startDate: '2024-01-10', status: 'in-progress', priority: 'high' },
    { id: '2', title: 'UI 디자인 리뷰', assignee: '이영희', dueDate: '2024-01-15', startDate: '2024-01-12', status: 'todo', priority: 'medium' },
    { id: '3', title: '데이터베이스 스키마 설계', assignee: '박민수', dueDate: '2024-01-15', startDate: '2024-01-08', status: 'completed', priority: 'high' },
  ];

  const allTasks: Task[] = [
    { id: '1', title: '프로젝트 계획 수립', assignee: '김철수', dueDate: '2024-01-15', startDate: '2024-01-10', status: 'in-progress', priority: 'high' },
    { id: '2', title: 'UI 디자인 리뷰', assignee: '이영희', dueDate: '2024-01-18', startDate: '2024-01-12', status: 'todo', priority: 'medium' },
    { id: '3', title: '데이터베이스 스키마 설계', assignee: '박민수', dueDate: '2024-01-15', startDate: '2024-01-08', status: 'completed', priority: 'high' },
    { id: '4', title: '모바일 앱 테스트', assignee: '정수진', dueDate: '2024-01-22', startDate: '2024-01-15', status: 'todo', priority: 'medium' },
    { id: '5', title: '보안 취약점 점검', assignee: '김철수', dueDate: '2024-01-25', startDate: '2024-01-16', status: 'in-progress', priority: 'high' }
  ];

  const projects: Project[] = [
    { id: '1', name: '웹 앱 개발', progress: 75, status: 'active', dueDate: '2024-02-28' },
    { id: '2', name: '모바일 앱 개발', progress: 45, status: 'active', dueDate: '2024-03-15' },
    { id: '3', name: '데이터 분석 시스템', progress: 90, status: 'active', dueDate: '2024-01-30' },
  ];

  const teamMembers: TeamMember[] = [
    { id: '1', name: '김철수', role: '팀 리더', avatar: '' },
    { id: '2', name: '이영희', role: 'UI/UX 디자이너', avatar: '' },
    { id: '3', name: '박민수', role: '백엔드 개발자', avatar: '' },
    { id: '4', name: '정수진', role: '프론트엔드 개발자', avatar: '' },
  ];

  const taskStatusData = [
    { name: '완료', value: 12, color: '#10B981' },
    { name: '진행중', value: 8, color: '#F59E0B' },
    { name: '대기중', value: 5, color: '#EF4444' },
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
      case 'todo': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
              <p className="text-blue-100">완료된 작업</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center">
            <Clock className="w-8 h-8 mr-3" />
            <div>
              <p className="text-yellow-100">진행중인 작업</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-3" />
            <div>
              <p className="text-green-100">프로젝트 진행률</p>
              <p className="text-2xl font-bold">70%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <Users className="w-8 h-8 mr-3" />
            <div>
              <p className="text-purple-100">팀 멤버</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="오늘의 할 일">
          <div className="space-y-4">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span>담당자: {task.assignee}</span>
                    <span className={`ml-3 px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? '완료' : task.status === 'in-progress' ? '진행중' : '대기'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="작업 현황">
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
        <Card title="주간 진행률">
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

        <Card title="프로젝트 현황">
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

      <Card title="팀 멤버 현황">
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
                  활성
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <GanttChart 
        tasks={allTasks.map(task => ({ ...task, startDate: task.startDate! }))} 
        className="mt-6"
      />
    </div>
  );
};

export default Dashboard;