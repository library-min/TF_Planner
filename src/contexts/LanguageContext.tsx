import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ko: {
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.tasks': '할 일 관리',
    'nav.calendar': '캘린더',
    'nav.meetings': '회의록',
    'nav.userManagement': '사용자 관리',
    
    // Dashboard
    'dashboard.title': '대시보드',
    'dashboard.subtitle': '팀의 현재 진행 상황을 한눈에 확인하세요',
    'dashboard.completedTasks': '완료된 작업',
    'dashboard.inProgressTasks': '진행중인 작업',
    'dashboard.projectProgress': '프로젝트 진행률',
    'dashboard.teamMembers': '팀 멤버',
    'dashboard.todayTasks': '오늘의 할 일',
    'dashboard.taskStatus': '작업 현황',
    'dashboard.weeklyProgress': '주간 진행률',
    'dashboard.projectStatus': '프로젝트 현황',
    'dashboard.teamMemberStatus': '팀 멤버 현황',
    'dashboard.completed': '완료',
    'dashboard.inProgress': '진행중',
    'dashboard.pending': '대기중',
    'dashboard.active': '활성',
    
    // Tasks
    'tasks.title': '할 일 관리',
    'tasks.subtitle': '팀의 모든 작업을 효율적으로 관리하세요',
    'tasks.listView': '목록',
    'tasks.ganttView': '간트차트',
    'tasks.addTask': '새 작업 추가',
    'tasks.search': '작업 제목이나 담당자로 검색...',
    'tasks.all': '전체',
    'tasks.todo': '대기',
    'tasks.inProgress': '진행중',
    'tasks.completed': '완료',
    'tasks.high': '높음',
    'tasks.medium': '보통',
    'tasks.low': '낮음',
    'tasks.assignee': '담당자',
    'tasks.dueDate': '마감일',
    'tasks.priority': '우선순위',
    'tasks.start': '시작하기',
    'tasks.complete': '완료하기',
    'tasks.restart': '재시작',
    'tasks.files': '파일',
    'tasks.noResults': '검색 결과가 없습니다',
    'tasks.tryDifferent': '다른 검색어나 필터를 시도해보세요',
    'tasks.pendingTasks': '대기중',
    'tasks.tasks': '개의 작업',
    'tasks.ganttChart': '간트 차트',
    
    // Add Task Modal
    'addTask.title': '새 작업 추가',
    'addTask.taskTitle': '작업 제목',
    'addTask.taskTitlePlaceholder': '작업 제목을 입력하세요',
    'addTask.description': '설명',
    'addTask.descriptionPlaceholder': '작업에 대한 상세 설명을 입력하세요',
    'addTask.assignee': '담당자',
    'addTask.priority': '우선순위',
    'addTask.startDate': '시작일',
    'addTask.dueDate': '마감일',
    'addTask.fileAttachment': '파일 첨부',
    'addTask.cancel': '취소',
    'addTask.add': '추가',
    
    // Meetings
    'meetings.title': '회의록',
    'meetings.subtitle': '팀 회의의 모든 내용을 체계적으로 관리하세요',
    'meetings.addMeeting': '새 회의록 추가',
    'meetings.search': '회의 제목으로 검색...',
    'meetings.date': '날짜',
    'meetings.attendees': '참석자',
    'meetings.noResults': '검색 결과가 없습니다',
    'meetings.tryDifferent': '다른 검색어를 시도해보세요',
    'meetings.addComment': '댓글 추가',
    'meetings.commentPlaceholder': '댓글을 입력하세요...',
    'meetings.submit': '등록',
    
    // Add Meeting Modal
    'addMeeting.title': '새 회의록 추가',
    'addMeeting.meetingTitle': '회의 제목',
    'addMeeting.meetingTitlePlaceholder': '회의 제목을 입력하세요',
    'addMeeting.meetingDate': '회의 날짜',
    'addMeeting.content': '회의 내용',
    'addMeeting.contentPlaceholder': '회의 내용을 입력하세요...',
    'addMeeting.attendees': '참석자',
    'addMeeting.attendeesPlaceholder': '참석자를 선택하세요',
    'addMeeting.fileAttachment': '파일 첨부',
    'addMeeting.cancel': '취소',
    'addMeeting.add': '추가',
    
    // User Management
    'users.title': '사용자 관리',
    'users.subtitle': '팀 멤버들의 정보를 관리하고 권한을 설정하세요',
    'users.addUser': '새 사용자 추가',
    'users.search': '이름이나 이메일로 검색...',
    'users.allRoles': '전체 역할',
    'users.admin': '관리자',
    'users.user': '사용자',
    'users.name': '이름',
    'users.email': '이메일',
    'users.role': '역할',
    'users.department': '부서',
    'users.status': '상태',
    'users.actions': '작업',
    'users.active': '활성',
    'users.inactive': '비활성',
    'users.edit': '편집',
    'users.delete': '삭제',
    'users.confirmDelete': '정말로 이 사용자를 삭제하시겠습니까?',
    'users.noResults': '검색 결과가 없습니다',
    'users.tryDifferent': '다른 검색어나 필터를 시도해보세요',
    
    // Add User Modal
    'addUser.title': '새 사용자 추가',
    'addUser.name': '이름',
    'addUser.namePlaceholder': '사용자 이름을 입력하세요',
    'addUser.email': '이메일',
    'addUser.emailPlaceholder': '이메일 주소를 입력하세요',
    'addUser.password': '비밀번호',
    'addUser.passwordPlaceholder': '비밀번호를 입력하세요',
    'addUser.role': '역할',
    'addUser.department': '부서',
    'addUser.departmentPlaceholder': '부서를 입력하세요',
    'addUser.cancel': '취소',
    'addUser.add': '추가',
    
    // Calendar
    'calendar.title': '캘린더',
    'calendar.subtitle': '일정을 한눈에 확인하고 관리하세요',
    'calendar.addEvent': '새 일정 추가',
    'calendar.today': '오늘',
    'calendar.month': '월',
    'calendar.week': '주',
    'calendar.day': '일',
    'calendar.noEvents': '이 날짜에는 일정이 없습니다',
    
    // File Attachment
    'fileAttachment.dragDrop': '파일을 여기로 드래그하거나 클릭하여 선택하세요',
    'fileAttachment.maxSize': '최대',
    'fileAttachment.maxFiles': '개 파일까지 가능',
    'fileAttachment.supportedFormats': '지원 형식',
    'fileAttachment.attachedFiles': '첨부된 파일',
    'fileAttachment.preview': '미리보기',
    'fileAttachment.download': '다운로드',
    'fileAttachment.remove': '제거',
    'fileAttachment.uploading': '업로드 중...',
    'fileAttachment.totalFiles': '총',
    'fileAttachment.totalSize': '파일',
    
    // Common
    'common.save': '저장',
    'common.cancel': '취소',
    'common.edit': '편집',
    'common.delete': '삭제',
    'common.add': '추가',
    'common.search': '검색',
    'common.filter': '필터',
    'common.status': '상태',
    'common.date': '날짜',
    'common.time': '시간',
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.success': '성공적으로 완료되었습니다',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Task Management',
    'nav.calendar': 'Calendar',
    'nav.meetings': 'Meeting Notes',
    'nav.userManagement': 'User Management',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Get an overview of your team\'s current progress',
    'dashboard.completedTasks': 'Completed Tasks',
    'dashboard.inProgressTasks': 'In Progress Tasks',
    'dashboard.projectProgress': 'Project Progress',
    'dashboard.teamMembers': 'Team Members',
    'dashboard.todayTasks': 'Today\'s Tasks',
    'dashboard.taskStatus': 'Task Status',
    'dashboard.weeklyProgress': 'Weekly Progress',
    'dashboard.projectStatus': 'Project Status',
    'dashboard.teamMemberStatus': 'Team Member Status',
    'dashboard.completed': 'Completed',
    'dashboard.inProgress': 'In Progress',
    'dashboard.pending': 'Pending',
    'dashboard.active': 'Active',
    
    // Tasks
    'tasks.title': 'Task Management',
    'tasks.subtitle': 'Efficiently manage all your team\'s tasks',
    'tasks.listView': 'List',
    'tasks.ganttView': 'Gantt Chart',
    'tasks.addTask': 'Add New Task',
    'tasks.search': 'Search by task title or assignee...',
    'tasks.all': 'All',
    'tasks.todo': 'To Do',
    'tasks.inProgress': 'In Progress',
    'tasks.completed': 'Completed',
    'tasks.high': 'High',
    'tasks.medium': 'Medium',
    'tasks.low': 'Low',
    'tasks.assignee': 'Assignee',
    'tasks.dueDate': 'Due Date',
    'tasks.priority': 'Priority',
    'tasks.start': 'Start',
    'tasks.complete': 'Complete',
    'tasks.restart': 'Restart',
    'tasks.files': 'Files',
    'tasks.noResults': 'No search results found',
    'tasks.tryDifferent': 'Try different search terms or filters',
    'tasks.pendingTasks': 'Pending',
    'tasks.tasks': 'tasks',
    'tasks.ganttChart': 'Gantt Chart',
    
    // Add Task Modal
    'addTask.title': 'Add New Task',
    'addTask.taskTitle': 'Task Title',
    'addTask.taskTitlePlaceholder': 'Enter task title',
    'addTask.description': 'Description',
    'addTask.descriptionPlaceholder': 'Enter detailed description of the task',
    'addTask.assignee': 'Assignee',
    'addTask.priority': 'Priority',
    'addTask.startDate': 'Start Date',
    'addTask.dueDate': 'Due Date',
    'addTask.fileAttachment': 'File Attachment',
    'addTask.cancel': 'Cancel',
    'addTask.add': 'Add',
    
    // Meetings
    'meetings.title': 'Meeting Notes',
    'meetings.subtitle': 'Systematically manage all your team meeting content',
    'meetings.addMeeting': 'Add New Meeting',
    'meetings.search': 'Search by meeting title...',
    'meetings.date': 'Date',
    'meetings.attendees': 'Attendees',
    'meetings.noResults': 'No search results found',
    'meetings.tryDifferent': 'Try different search terms',
    'meetings.addComment': 'Add Comment',
    'meetings.commentPlaceholder': 'Enter your comment...',
    'meetings.submit': 'Submit',
    
    // Add Meeting Modal
    'addMeeting.title': 'Add New Meeting',
    'addMeeting.meetingTitle': 'Meeting Title',
    'addMeeting.meetingTitlePlaceholder': 'Enter meeting title',
    'addMeeting.meetingDate': 'Meeting Date',
    'addMeeting.content': 'Meeting Content',
    'addMeeting.contentPlaceholder': 'Enter meeting content...',
    'addMeeting.attendees': 'Attendees',
    'addMeeting.attendeesPlaceholder': 'Select attendees',
    'addMeeting.fileAttachment': 'File Attachment',
    'addMeeting.cancel': 'Cancel',
    'addMeeting.add': 'Add',
    
    // User Management
    'users.title': 'User Management',
    'users.subtitle': 'Manage team member information and set permissions',
    'users.addUser': 'Add New User',
    'users.search': 'Search by name or email...',
    'users.allRoles': 'All Roles',
    'users.admin': 'Admin',
    'users.user': 'User',
    'users.name': 'Name',
    'users.email': 'Email',
    'users.role': 'Role',
    'users.department': 'Department',
    'users.status': 'Status',
    'users.actions': 'Actions',
    'users.active': 'Active',
    'users.inactive': 'Inactive',
    'users.edit': 'Edit',
    'users.delete': 'Delete',
    'users.confirmDelete': 'Are you sure you want to delete this user?',
    'users.noResults': 'No search results found',
    'users.tryDifferent': 'Try different search terms or filters',
    
    // Add User Modal
    'addUser.title': 'Add New User',
    'addUser.name': 'Name',
    'addUser.namePlaceholder': 'Enter user name',
    'addUser.email': 'Email',
    'addUser.emailPlaceholder': 'Enter email address',
    'addUser.password': 'Password',
    'addUser.passwordPlaceholder': 'Enter password',
    'addUser.role': 'Role',
    'addUser.department': 'Department',
    'addUser.departmentPlaceholder': 'Enter department',
    'addUser.cancel': 'Cancel',
    'addUser.add': 'Add',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.subtitle': 'View and manage your schedule at a glance',
    'calendar.addEvent': 'Add New Event',
    'calendar.today': 'Today',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.noEvents': 'No events on this date',
    
    // File Attachment
    'fileAttachment.dragDrop': 'Drag files here or click to select',
    'fileAttachment.maxSize': 'Max',
    'fileAttachment.maxFiles': 'files allowed',
    'fileAttachment.supportedFormats': 'Supported formats',
    'fileAttachment.attachedFiles': 'Attached Files',
    'fileAttachment.preview': 'Preview',
    'fileAttachment.download': 'Download',
    'fileAttachment.remove': 'Remove',
    'fileAttachment.uploading': 'Uploading...',
    'fileAttachment.totalFiles': 'Total',
    'fileAttachment.totalSize': 'files',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Successfully completed',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};