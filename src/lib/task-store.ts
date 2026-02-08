import type { Task, TaskStatus, TaskPriority, TaskActivityEvent } from '@/types/tasks';
import { seedTasks } from '@/data/tasks-dummy-data';

const STORAGE_KEY = 'tasks_store_v1';

interface TaskStoreState {
  tasks: Task[];
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function initState(): TaskStoreState {
  return {
    tasks: seedTasks,
  };
}

export function getTaskState(): TaskStoreState {
  const stored = safeParse<TaskStoreState>(sessionStorage.getItem(STORAGE_KEY));
  if (stored) return stored;
  const initial = initState();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function setTaskState(next: TaskStoreState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function pushActivity(task: Task, action: string, userId: string, userName: string, details?: Record<string, unknown>) {
  const activity: TaskActivityEvent = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: nowIso(),
    userId,
    userName,
    action,
    details,
  };
  task.activityLog = [...(task.activityLog || []), activity];
}

export function listTasks(): Task[] {
  return getTaskState().tasks;
}

export function getTask(id: string): Task | undefined {
  return getTaskState().tasks.find((t) => t.id === id);
}

export function createTask(
  input: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'activityLog'>,
  userId: string,
  userName: string
): Task {
  const state = getTaskState();
  const task: Task = {
    ...input,
    id: `task-${Date.now()}`,
    createdAt: nowIso(),
    createdBy: userId,
    updatedAt: nowIso(),
    activityLog: [],
  };
  pushActivity(task, 'Task created', userId, userName, { title: task.title });
  state.tasks.unshift(task);
  setTaskState(state);
  return task;
}

export function updateTask(
  id: string,
  updates: Partial<Task>,
  userId: string,
  userName: string
): Task | null {
  const state = getTaskState();
  const index = state.tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const task = state.tasks[index];
  const oldStatus = task.status;
  const oldPriority = task.priority;

  Object.assign(task, updates, { updatedAt: nowIso() });

  // Log status change
  if (updates.status && updates.status !== oldStatus) {
    pushActivity(task, 'Status changed', userId, userName, {
      oldStatus,
      newStatus: updates.status,
    });
  }

  // Log priority change
  if (updates.priority && updates.priority !== oldPriority) {
    pushActivity(task, 'Priority changed', userId, userName, {
      oldPriority,
      newPriority: updates.priority,
    });
  }

  // Log assignee change
  if (updates.assigneeId && updates.assigneeId !== task.assigneeId) {
    pushActivity(task, 'Assignee changed', userId, userName, {
      oldAssignee: task.assigneeName,
      newAssignee: updates.assigneeName || task.assigneeName,
    });
  }

  state.tasks[index] = task;
  setTaskState(state);
  return task;
}

export function deleteTask(id: string, userId: string, userName: string): boolean {
  const state = getTaskState();
  const index = state.tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  state.tasks.splice(index, 1);
  setTaskState(state);
  return true;
}

export function bulkUpdateTasks(
  ids: string[],
  updates: Partial<Task>,
  userId: string,
  userName: string
): number {
  const state = getTaskState();
  let count = 0;
  for (const id of ids) {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      Object.assign(task, updates, { updatedAt: nowIso() });
      pushActivity(task, 'Bulk update', userId, userName, updates);
      count++;
    }
  }
  setTaskState(state);
  return count;
}

export function addTaskComment(
  taskId: string,
  text: string,
  userId: string,
  userName: string
): boolean {
  const state = getTaskState();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return false;

  const comment = {
    id: `comment-${Date.now()}`,
    text,
    userId,
    userName,
    createdAt: nowIso(),
  };

  task.comments = [...(task.comments || []), comment];
  pushActivity(task, 'Comment added', userId, userName, { commentId: comment.id });
  setTaskState(state);
  return true;
}

export function updateSubtask(
  taskId: string,
  subtaskId: string,
  completed: boolean,
  userId: string,
  userName: string
): boolean {
  const state = getTaskState();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return false;

  const subtask = task.subtasks.find((st) => st.id === subtaskId);
  if (!subtask) return false;

  subtask.completed = completed;
  if (completed) {
    subtask.completedAt = nowIso();
  } else {
    delete subtask.completedAt;
  }

  pushActivity(task, `Subtask ${completed ? 'completed' : 'reopened'}`, userId, userName, {
    subtaskId,
    subtaskTitle: subtask.title,
  });
  setTaskState(state);
  return true;
}
