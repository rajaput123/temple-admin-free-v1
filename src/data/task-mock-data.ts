import type { Staff, Task, TaskTypeConfig, PriorityConfig } from '@/types/tasks';

// Mock Staff Data
export const mockStaff: Staff[] = [
  { id: 'STF001', name: 'Swami Krishna Das', role: 'Priest', department: 'Rituals', contact: 'krishna@temple.org' },
  { id: 'STF002', name: 'Ramesh Kumar', role: 'Cleaner', department: 'Maintenance', contact: 'ramesh@temple.org' },
  { id: 'STF003', name: 'Priya Sharma', role: 'Accountant', department: 'Finance', contact: 'priya@temple.org' },
  { id: 'STF004', name: 'Mohan Singh', role: 'Security Guard', department: 'Security', contact: 'mohan@temple.org' },
  { id: 'STF005', name: 'Lakshmi Devi', role: 'Cook', department: 'Kitchen', contact: 'lakshmi@temple.org' },
  { id: 'STF006', name: 'Anil Patel', role: 'Maintenance Worker', department: 'Maintenance', contact: 'anil@temple.org' },
];

// Mock Task Types
export const mockTaskTypes: TaskTypeConfig[] = [
  { id: 'cleaning', name: 'Cleaning', description: 'Daily cleaning and maintenance of temple premises' },
  { id: 'ritual_preparation', name: 'Ritual Preparation', description: 'Preparing for daily puja and special ceremonies' },
  { id: 'maintenance', name: 'Maintenance', description: 'Repair and upkeep of temple infrastructure' },
  { id: 'security', name: 'Security', description: 'Security rounds and monitoring activities' },
  { id: 'administrative', name: 'Administrative', description: 'Office work, documentation, and record keeping' },
];

// Mock Priority Levels
export const mockPriorities: PriorityConfig[] = [
  { id: 'low', name: 'Low', description: 'Can be completed within a week, no urgency', color: 'bg-gray-100 text-gray-800' },
  { id: 'medium', name: 'Medium', description: 'Should be completed within 2-3 days', color: 'bg-blue-100 text-blue-800' },
  { id: 'high', name: 'High', description: 'Needs attention within 24 hours', color: 'bg-orange-100 text-orange-800' },
  { id: 'urgent', name: 'Urgent', description: 'Requires immediate action, same day', color: 'bg-red-100 text-red-800' },
];

// Mock Task Records
export const mockTasks: Task[] = [
  {
    id: 'TSK001',
    title: 'Clean main hall and sanctum',
    type: 'cleaning',
    priority: 'medium',
    status: 'in_progress',
    assignedStaffId: 'STF002',
    assignedStaffName: 'Ramesh Kumar',
    dueDate: '2024-01-15',
    description: 'Thorough cleaning of main prayer hall and sanctum sanctorum',
    createdAt: '2024-01-14',
  },
  {
    id: 'TSK002',
    title: 'Prepare for morning aarti',
    type: 'ritual_preparation',
    priority: 'high',
    status: 'completed',
    assignedStaffId: 'STF001',
    assignedStaffName: 'Swami Krishna Das',
    dueDate: '2024-01-14',
    description: 'Set up all items needed for morning aarti ceremony',
    createdAt: '2024-01-13',
    completedAt: '2024-01-14',
  },
  {
    id: 'TSK003',
    title: 'Fix leaking tap in kitchen',
    type: 'maintenance',
    priority: 'high',
    status: 'open',
    assignedStaffId: 'STF006',
    assignedStaffName: 'Anil Patel',
    dueDate: '2024-01-16',
    description: 'Repair the leaking tap in the kitchen area',
    createdAt: '2024-01-14',
  },
  {
    id: 'TSK004',
    title: 'Night security rounds',
    type: 'security',
    priority: 'medium',
    status: 'in_progress',
    assignedStaffId: 'STF004',
    assignedStaffName: 'Mohan Singh',
    dueDate: '2024-01-15',
    description: 'Complete night security rounds of temple premises',
    createdAt: '2024-01-14',
  },
  {
    id: 'TSK005',
    title: 'Update monthly accounts',
    type: 'administrative',
    priority: 'low',
    status: 'open',
    assignedStaffId: 'STF003',
    assignedStaffName: 'Priya Sharma',
    dueDate: '2024-01-20',
    description: 'Update and reconcile monthly financial accounts',
    createdAt: '2024-01-14',
  },
  {
    id: 'TSK006',
    title: 'Prepare prasad for 100 devotees',
    type: 'ritual_preparation',
    priority: 'high',
    status: 'in_progress',
    assignedStaffId: 'STF005',
    assignedStaffName: 'Lakshmi Devi',
    dueDate: '2024-01-15',
    description: 'Prepare prasad for special ceremony with 100 devotees',
    createdAt: '2024-01-14',
  },
  {
    id: 'TSK007',
    title: 'Deep clean prayer hall',
    type: 'cleaning',
    priority: 'medium',
    status: 'open',
    assignedStaffId: 'STF002',
    assignedStaffName: 'Ramesh Kumar',
    dueDate: '2024-01-18',
    description: 'Deep cleaning of the main prayer hall',
    createdAt: '2024-01-14',
  },
  {
    id: 'TSK008',
    title: 'Repair broken door lock',
    type: 'maintenance',
    priority: 'urgent',
    status: 'open',
    assignedStaffId: 'STF006',
    assignedStaffName: 'Anil Patel',
    dueDate: '2024-01-15',
    description: 'Urgent repair of broken lock on main entrance door',
    createdAt: '2024-01-15',
  },
  {
    id: 'TSK009',
    title: 'Prepare for special festival',
    type: 'ritual_preparation',
    priority: 'high',
    status: 'in_progress',
    assignedStaffId: 'STF001',
    assignedStaffName: 'Swami Krishna Das',
    dueDate: '2024-01-17',
    description: 'Complete preparation for upcoming special festival',
    createdAt: '2024-01-13',
  },
  {
    id: 'TSK010',
    title: 'Review security camera footage',
    type: 'security',
    priority: 'low',
    status: 'open',
    assignedStaffId: 'STF004',
    assignedStaffName: 'Mohan Singh',
    dueDate: '2024-01-19',
    description: 'Review and document security camera footage from past week',
    createdAt: '2024-01-14',
  },
];

// Helper functions
export const getStaffById = (id: string): Staff | undefined => {
  return mockStaff.find(staff => staff.id === id);
};

export const getTaskTypeName = (type: string): string => {
  return mockTaskTypes.find(t => t.id === type)?.name || type;
};

export const getPriorityName = (priority: string): string => {
  return mockPriorities.find(p => p.id === priority)?.name || priority;
};
