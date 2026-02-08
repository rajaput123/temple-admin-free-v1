// Task Management Types

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'on_hold';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskType = 'cleaning' | 'ritual_preparation' | 'maintenance' | 'security' | 'administrative';

export interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  contact: string;
}

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedStaffId: string;
  assignedStaffName: string;
  dueDate: string;
  description?: string;
  createdAt?: string;
  completedAt?: string;
  steps?: TaskStep[];
}

export interface TaskTypeConfig {
  id: string;
  name: string;
  description: string;
}

export interface PriorityConfig {
  id: TaskPriority;
  name: string;
  description: string;
  color: string;
}
