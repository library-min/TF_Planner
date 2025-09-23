import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  createdAt: string;
  startDate?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  department: string;
  joinDate: string;
  avatar?: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  createdAt: string;
}

interface DataContextType {
  tasks: Task[];
  users: User[];
  events: Event[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getCompletedTasksCount: () => number;
  getInProgressTasksCount: () => number;
  getProjectProgress: () => number;
  getTeamMemberCount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'UI 디자인 개선',
      description: '사용자 인터페이스 개선 작업',
      priority: 'high',
      status: 'completed',
      assignee: '김철수',
      dueDate: '2024-01-15',
      startDate: '2024-01-01',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'API 연동',
      description: '백엔드 API 연동 작업',
      priority: 'high',
      status: 'completed',
      assignee: '박영희',
      dueDate: '2024-01-20',
      startDate: '2024-01-05',
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      title: '테스트 케이스 작성',
      description: '단위 테스트 및 통합 테스트',
      priority: 'medium',
      status: 'in-progress',
      assignee: '이민수',
      dueDate: '2024-01-25',
      startDate: '2024-01-10',
      createdAt: '2024-01-03'
    },
    {
      id: '4',
      title: '문서화',
      description: '프로젝트 문서 작성',
      priority: 'low',
      status: 'in-progress',
      assignee: '최지영',
      dueDate: '2024-01-30',
      startDate: '2024-01-15',
      createdAt: '2024-01-04'
    },
    {
      id: '5',
      title: '성능 최적화',
      description: '애플리케이션 성능 개선',
      priority: 'medium',
      status: 'pending',
      assignee: '김철수',
      dueDate: '2024-02-05',
      startDate: '2024-01-20',
      createdAt: '2024-01-05'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '김철수',
      email: 'kim@company.com',
      role: 'manager',
      department: '개발팀',
      joinDate: '2023-01-15',
      isActive: true
    },
    {
      id: '2',
      name: '박영희',
      email: 'park@company.com',
      role: 'user',
      department: '개발팀',
      joinDate: '2023-03-10',
      isActive: true
    },
    {
      id: '3',
      name: '이민수',
      email: 'lee@company.com',
      role: 'user',
      department: '개발팀',
      joinDate: '2023-05-20',
      isActive: false
    },
    {
      id: '4',
      name: '최지영',
      email: 'choi@company.com',
      role: 'manager',
      department: '디자인팀',
      joinDate: '2023-07-01',
      isActive: true
    }
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: '주간 팀 미팅',
      date: '2024-01-15',
      time: '10:00',
      description: '프로젝트 진행 상황 공유 및 다음 주 계획 수립',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: '클라이언트 미팅',
      date: '2024-01-17',
      time: '14:00',
      description: '프로젝트 중간 발표 및 피드백 수집',
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      title: '디자인 리뷰',
      date: '2024-01-18',
      time: '15:30',
      description: '새로운 UI/UX 디자인 최종 검토',
      createdAt: '2024-01-03'
    }
  ]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const addEvent = (event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const getInProgressTasksCount = () => {
    return tasks.filter(task => task.status === 'in-progress').length;
  };

  const getProjectProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = getCompletedTasksCount();
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getTeamMemberCount = () => {
    return users.length;
  };

  return (
    <DataContext.Provider value={{
      tasks,
      users,
      events,
      addTask,
      updateTask,
      deleteTask,
      addUser,
      updateUser,
      deleteUser,
      addEvent,
      updateEvent,
      deleteEvent,
      getCompletedTasksCount,
      getInProgressTasksCount,
      getProjectProgress,
      getTeamMemberCount
    }}>
      {children}
    </DataContext.Provider>
  );
};