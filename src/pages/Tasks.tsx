import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, User, Flag, BarChart3, Paperclip } from 'lucide-react';
import Card from '../components/Card';
import GanttChart from '../components/GanttChart';
import FileAttachment from '../components/FileAttachment';
import { Task, AttachedFile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Tasks: React.FC = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: '웹사이트 리디자인 프로젝트 계획',
      description: '새로운 브랜드 가이드라인에 맞춰 웹사이트 전체 리디자인 계획 수립',
      assignee: '김철수',
      dueDate: '2024-01-20',
      startDate: '2024-01-10',
      status: 'in-progress',
      priority: 'high',
      attachments: []
    },
    {
      id: '2',
      title: 'API 문서 업데이트',
      description: '새로 추가된 엔드포인트들에 대한 API 문서 작성',
      assignee: '이영희',
      dueDate: '2024-01-18',
      startDate: '2024-01-12',
      status: 'todo',
      priority: 'medium',
      attachments: []
    },
    {
      id: '3',
      title: '데이터베이스 마이그레이션',
      description: '사용자 테이블 스키마 변경 및 데이터 마이그레이션 작업',
      assignee: '박민수',
      dueDate: '2024-01-15',
      startDate: '2024-01-08',
      status: 'completed',
      priority: 'high',
      attachments: []
    },
    {
      id: '4',
      title: '모바일 앱 테스트',
      description: 'iOS와 Android 버전 기능 테스트 및 버그 수정',
      assignee: '정수진',
      dueDate: '2024-01-22',
      startDate: '2024-01-15',
      status: 'todo',
      priority: 'medium',
      attachments: []
    },
    {
      id: '5',
      title: '보안 취약점 점검',
      description: '시스템 전반적인 보안 취약점 검사 및 패치',
      assignee: '김철수',
      dueDate: '2024-01-25',
      startDate: '2024-01-16',
      status: 'in-progress',
      priority: 'high',
      attachments: []
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'gantt'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      case 'todo': return '대기';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'todo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleFilesChange = (taskId: string, files: AttachedFile[]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, attachments: files } : task
    ));
  };

  const ganttTasks = filteredTasks.filter(task => task.startDate).map(task => ({
    ...task,
    startDate: task.startDate!
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('tasks.title')}</h1>
          <p className="text-gray-600 mt-2">{t('tasks.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                currentView === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('tasks.listView')}
            </button>
            <button
              onClick={() => setCurrentView('gantt')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                currentView === 'gantt' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('tasks.ganttView')}
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('tasks.addTask')}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="작업 제목이나 담당자로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="todo">대기</option>
            <option value="in-progress">진행중</option>
            <option value="completed">완료</option>
          </select>
        </div>
      </div>

      {currentView === 'list' ? (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex items-center text-gray-500">
                        <Paperclip className="w-4 h-4 mr-1" />
                        <span className="text-xs">{task.attachments.length}</span>
                      </div>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flag className="w-4 h-4" />
                      <span className={getPriorityColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                    className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Paperclip className="w-4 h-4 mr-1" />
                    파일
                  </button>
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === 'todo' ? 'in-progress' : 'completed')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        task.status === 'todo' 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {task.status === 'todo' ? '시작하기' : '완료하기'}
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'in-progress')}
                      className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                    >
                      재시작
                    </button>
                  )}
                </div>
              </div>
              
              {selectedTaskId === task.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">파일 첨부</h4>
                  <FileAttachment
                    files={task.attachments || []}
                    onFilesChange={(files) => handleFilesChange(task.id, files)}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <GanttChart tasks={ganttTasks} />
      )}

      {filteredTasks.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 시도해보세요</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="대기중" className="border-l-4 border-red-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.status === 'todo').length}
            </div>
            <div className="text-gray-600">개의 작업</div>
          </div>
        </Card>

        <Card title="진행중" className="border-l-4 border-yellow-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="text-gray-600">개의 작업</div>
          </div>
        </Card>

        <Card title="완료됨" className="border-l-4 border-green-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-gray-600">개의 작업</div>
          </div>
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">새 작업 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업 제목</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="작업에 대한 상세 설명을 입력하세요"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>김철수</option>
                    <option>이영희</option>
                    <option>박민수</option>
                    <option>정수진</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">파일 첨부</label>
                <FileAttachment
                  files={[]}
                  onFilesChange={() => {}}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;