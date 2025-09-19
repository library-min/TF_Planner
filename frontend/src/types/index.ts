export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  content: string;
  attendees: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold';
  dueDate: string;
}