import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTasks, mockStaff, getTaskTypeName, getPriorityName } from '@/data/task-mock-data';
import { Plus, Columns, Calendar, Filter, ListTodo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TaskStatus, TaskPriority } from '@/types/tasks';

export default function TaskBoard() {
  const [activeView, setActiveView] = useState<'kanban' | 'calendar'>('kanban');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [tasks, setTasks] = useState(mockTasks);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesStaff = staffFilter === 'all' || task.assignedStaffId === staffFilter;
      return matchesStatus && matchesPriority && matchesStaff;
    });
  }, [tasks, statusFilter, priorityFilter, staffFilter]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.classList.add('scale-105', 'rotate-1', 'shadow-2xl', 'z-50');
    setTimeout(() => {
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.classList.remove('scale-105', 'rotate-1', 'shadow-2xl', 'z-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    container.classList.add('bg-primary/5', 'ring-2', 'ring-primary/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const container = e.currentTarget as HTMLElement;
    container.classList.remove('bg-primary/5', 'ring-2', 'ring-primary/20');
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    container.classList.remove('bg-primary/5', 'ring-2', 'ring-primary/20');

    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? { ...task, status } : task
      ));
      toast.info(`Task moved to ${status.replace('_', ' ')}`);
    }
  };

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, typeof filteredTasks> = {
      open: [],
      in_progress: [],
      completed: [],
      on_hold: [],
    };
    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Task Board"
        description="Visual execution interface for tracking task progress"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Task Management', href: '/tasks' },
          { label: 'Board', href: '/tasks/board' },
        ]}
      />

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'kanban' | 'calendar')} className="space-y-6 fade-in">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="kanban" className="gap-2">
            <Columns className="h-4 w-4" />
            Kanban View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4 scale-up">
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Filters</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={staffFilter} onValueChange={setStaffFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {mockStaff.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <div className="grid gap-6 md:grid-cols-3 h-auto">
            {/* Open Column */}
            <div
              className="kanban-column flex flex-col gap-4 bg-muted/20 border-0 shadow-inner rounded-3xl p-4 transition-all duration-300"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'open')}
            >
              <div className="flex items-center justify-between px-2 shrink-0">
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground/70">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  Open
                </h3>
                <Badge variant="secondary" className="bg-background/80 text-muted-foreground font-extrabold text-[10px] h-5 px-2">
                  {tasksByStatus.open.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-3 h-auto">
                {/* Inline Add Task Button */}
                <Button
                  variant="outline"
                  className="w-full h-11 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all group rounded-2xl shrink-0"
                  onClick={() => {/* Trigger task creation logic */ }}
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add Task</span>
                </Button>

                <div className="space-y-3 pb-4">
                  {tasksByStatus.open.map(task => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="task-card-compact border-0 border-t-4 border-t-blue-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group relative overflow-hidden cursor-grab active:cursor-grabbing"
                    >
                      <div className="space-y-3 p-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-[13px] leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                            {task.title}
                          </div>
                          <Badge className={`priority-badge ${task.priority} shrink-0`}>
                            {getPriorityName(task.priority)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-3 border-t border-border/40">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                              {task.assignedStaffName?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium text-muted-foreground truncate max-w-[80px]">{task.assignedStaffName}</span>
                          </div>
                          <span className="font-bold text-muted-foreground/60 tabular-nums uppercase text-[9px]">{task.dueDate}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {tasksByStatus.open.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[150px] text-muted-foreground/30 border-2 border-dashed border-muted-foreground/10 rounded-3xl">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for work</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* In Progress Column */}
            <div
              className="kanban-column flex flex-col gap-4 bg-muted/20 border-0 shadow-inner rounded-3xl p-4 transition-all duration-300"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'in_progress')}
            >
              <div className="flex items-center justify-between px-2 shrink-0">
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground/70">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                  In Progress
                </h3>
                <Badge variant="secondary" className="bg-background/80 text-muted-foreground font-extrabold text-[10px] h-5 px-2">
                  {tasksByStatus.in_progress.length}
                </Badge>
              </div>
              <div className="space-y-3 pb-4">
                {tasksByStatus.in_progress.map(task => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="task-card-compact border-0 border-t-4 border-t-orange-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group relative overflow-hidden cursor-grab active:cursor-grabbing"
                  >
                    <div className="space-y-3 p-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-[13px] leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                          {task.title}
                        </div>
                        <Badge className={`priority-badge ${task.priority} shrink-0`}>
                          {getPriorityName(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center font-bold text-orange-600 border border-orange-100">
                            {task.assignedStaffName?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-muted-foreground truncate max-w-[80px]">{task.assignedStaffName}</span>
                        </div>
                        <span className="font-bold text-muted-foreground/60 tabular-nums uppercase text-[9px]">{task.dueDate}</span>
                      </div>
                    </div>
                  </Card>
                ))}
                {tasksByStatus.in_progress.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[150px] text-muted-foreground/30 border-2 border-dashed border-muted-foreground/10 rounded-3xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Focus Mode</span>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div
              className="kanban-column flex flex-col gap-4 bg-muted/20 border-0 shadow-inner rounded-3xl p-4 transition-all duration-300"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'completed')}
            >
              <div className="flex items-center justify-between px-2 shrink-0">
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground/70">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  Completed
                </h3>
                <Badge variant="secondary" className="bg-background/80 text-muted-foreground font-extrabold text-[10px] h-5 px-2">
                  {tasksByStatus.completed.length}
                </Badge>
              </div>
              <div className="space-y-3 pb-4">
                {tasksByStatus.completed.map(task => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="task-card-compact border-0 border-t-4 border-t-green-500 shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 rounded-2xl group relative overflow-hidden cursor-grab active:cursor-grabbing"
                  >
                    <div className="space-y-3 p-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-[13px] leading-tight text-foreground/70 line-through decoration-primary/30 line-clamp-2">
                          {task.title}
                        </div>
                        <Badge className={`priority-badge ${task.priority} opacity-50 shrink-0`}>
                          {getPriorityName(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-600 border border-green-100">
                            {task.assignedStaffName?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-muted-foreground/60 truncate max-w-[80px]">{task.assignedStaffName}</span>
                        </div>
                        <span className="font-bold text-muted-foreground/40 tabular-nums uppercase text-[9px]">{task.dueDate}</span>
                      </div>
                    </div>
                  </Card>
                ))}
                {tasksByStatus.completed.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[150px] text-muted-foreground/30 border-2 border-dashed border-muted-foreground/10 rounded-3xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Victory Lap</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 scale-up h-auto">
          <Card className="glass-card h-full flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Tasks organized by due date</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="divide-y divide-border/30">
                {filteredTasks
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map(task => (
                    <div key={task.id} className="py-4 hover:bg-primary/[0.02] transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`font-bold text-sm mb-1 group-hover:text-primary transition-colors ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-black text-muted-foreground">
                                {task.assignedStaffName?.charAt(0) || 'U'}
                              </div>
                              {task.assignedStaffName}
                            </span>
                            <span className="opacity-30">•</span>
                            <span>{getTaskTypeName(task.type)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={`priority-badge ${task.priority} min-w-[70px] justify-center`}>
                            {getPriorityName(task.priority)}
                          </Badge>
                          <div className="text-[11px] font-black tabular-nums text-primary/80 min-w-[90px] text-right uppercase tracking-wider">
                            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {filteredTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30">
                    <ListTodo className="h-10 w-10 mb-2 opacity-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No tasks found</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
