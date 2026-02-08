import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getPriorityName } from '@/data/task-mock-data';
import type { Task, TaskStatus } from '@/types/tasks';

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onStepToggle?: (taskId: string, stepId: string, completed: boolean) => void;
}

const statusColumns: { status: TaskStatus; label: string; color: string; colorClass: string }[] = [
  { status: 'open', label: 'Open', color: 'blue', colorClass: 'text-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'orange', colorClass: 'text-orange-500' },
  { status: 'completed', label: 'Completed', color: 'green', colorClass: 'text-green-500' },
  { status: 'on_hold', label: 'On Hold', color: 'gray', colorClass: 'text-gray-500' },
];

const priorityBorders: Record<string, string> = {
  low: 'border-t-gray-400',
  medium: 'border-t-blue-400',
  high: 'border-t-orange-400',
  urgent: 'border-t-red-400',
};

import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { useState } from 'react';

export function TaskKanban({ tasks, onTaskClick, onStatusChange, onStepToggle }: TaskKanbanProps) {
  const navigate = useNavigate();

  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce((acc, col) => {
      acc[col.status] = tasks.filter((t) => t.status === col.status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.classList.add('scale-105', 'rotate-2', 'shadow-2xl', 'z-50');
    setTimeout(() => {
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.classList.remove('scale-105', 'rotate-2', 'shadow-2xl', 'z-50');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-auto">
      {statusColumns.map((col) => {
        const columnTasks = tasksByStatus[col.status] || [];
        const isOpenColumn = col.status === 'open';

        return (
          <div key={col.status} className="flex flex-col gap-4 bg-muted/20 rounded-3xl p-4 shadow-inner h-auto">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2 px-2 shrink-0">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2 text-foreground/70 uppercase">
                <div className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-[0_0_8px_currentColor]`}></div>
                {col.label}
              </h3>
              <Badge variant="secondary" className="bg-background/80 text-muted-foreground font-extrabold text-[10px] h-5 px-2">
                {columnTasks.length}
              </Badge>
            </div>

            {/* "+" Button for Open Column */}
            {isOpenColumn && (
              <Button
                variant="outline"
                className="w-full h-11 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all group rounded-2xl shrink-0"
                onClick={() => navigate('/tasks/tasks')}
              >
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Add Task</span>
              </Button>
            )}

            {/* Task Cards Container - Scrollable */}
            <div
              className="space-y-3 pb-4 min-h-[100px]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-accent/10');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-accent/10');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-accent/10');
                const taskId = e.dataTransfer.getData('taskId');
                if (taskId && onStatusChange && col.status !== tasks.find(t => t.id === taskId)?.status) {
                  onStatusChange(taskId, col.status);
                }
              }}
            >
              {columnTasks.map((task) => {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isOverdue = dueDate < today && task.status !== 'completed';

                return (
                  <Card
                    key={task.id}
                    draggable={!!onStatusChange}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`task-card-compact border-0 border-t-4 ${priorityBorders[task.priority] || 'border-t-muted'} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group relative overflow-hidden ${task.status === 'completed' ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''
                      }`}
                  >
                    <div className="space-y-3 p-3">
                      <div className="flex items-start justify-between gap-2" onClick={() => onTaskClick(task)}>
                        <div className={`font-bold text-[13px] leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2 ${task.status === 'completed' ? 'line-through decoration-primary/30' : ''
                          }`}>
                          {task.title}
                        </div>
                        <Badge className={`priority-badge ${task.priority} shrink-0 ${task.status === 'completed' ? 'opacity-50' : ''
                          }`}>
                          {getPriorityName(task.priority)}
                        </Badge>
                      </div>

                      {/* Sub-steps Progress */}
                      {task.steps && task.steps.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                            <div className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3" />
                              <span>{task.steps.filter(s => s.completed).length}/{task.steps.length} Steps</span>
                            </div>
                            <span>{Math.round((task.steps.filter(s => s.completed).length / task.steps.length) * 100)}%</span>
                          </div>
                          <Progress value={(task.steps.filter(s => s.completed).length / task.steps.length) * 100} className="h-1 bg-muted/50" />

                          {/* Expanded Steps List (Optional: only if you want it on the card) */}
                          <div className="pt-1 space-y-1.5 overflow-hidden">
                            {task.steps.map(step => (
                              <div key={step.id} className="flex items-center gap-2 group/step">
                                <Checkbox
                                  id={`${task.id}-${step.id}`}
                                  checked={step.completed}
                                  onCheckedChange={(checked) => onStepToggle?.(task.id, step.id, !!checked)}
                                  className="h-3 w-3 rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label
                                  htmlFor={`${task.id}-${step.id}`}
                                  className={`text-[11px] leading-tight cursor-pointer select-none transition-colors ${step.completed ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground group-hover/step:text-foreground'}`}
                                >
                                  {step.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-border/40" onClick={() => onTaskClick(task)}>
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-border/10`}>
                            {task.assignedStaffName?.charAt(0) || 'U'}
                          </div>
                          <span className={`font-medium truncate max-w-[80px] ${task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'
                            }`}>
                            {task.assignedStaffName}
                          </span>
                        </div>

                        {isOverdue && (
                          <div className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[9px] font-black uppercase animate-pulse shrink-0">
                            Overdue
                          </div>
                        )}

                        <div className={`flex items-center gap-1 shrink-0 ${isOverdue ? 'text-destructive' : 'text-muted-foreground/60'}`}>
                          <Clock className="h-3 w-3" />
                          <span>{format(dueDate, 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[150px] text-muted-foreground/30 border-2 border-dashed border-muted-foreground/10 rounded-3xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Empty Column</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

