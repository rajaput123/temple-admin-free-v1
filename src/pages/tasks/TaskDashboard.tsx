import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { mockTasks } from '@/data/task-mock-data';
import {
  LayoutGrid,
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TaskDashboard() {
  const navigate = useNavigate();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = mockTasks.length;
    const open = mockTasks.filter(t => t.status === 'open').length;
    const inProgress = mockTasks.filter(t => t.status === 'in_progress').length;
    const completed = mockTasks.filter(t => t.status === 'completed').length;
    const overdue = mockTasks.filter(t => {
      const due = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today && t.status !== 'completed';
    }).length;
    const urgent = mockTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

    return { total, open, inProgress, completed, overdue, urgent };
  }, []);

  // Get urgent tasks
  const urgentTasks = useMemo(() => {
    return mockTasks
      .filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed')
      .slice(0, 5);
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Task Management Dashboard"
        description="Overview of all tasks and activities"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Task Management', href: '/tasks' },
          { label: 'Dashboard', href: '/tasks/dashboard' },
        ]}
      />

      <div className="space-y-4 fade-in">
        {/* Stat Cards */}
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Card className="stat-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</CardTitle>
                <LayoutGrid className="h-4 w-4 text-primary opacity-60" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold tracking-tight">{stats.total}</div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5" />
                All tasks
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card medium border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open</CardTitle>
                <Clock className="h-4 w-4 text-blue-600 opacity-60" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold tracking-tight text-blue-600">{stats.open}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Awaiting</p>
            </CardContent>
          </Card>

          <Card className="stat-card high border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
                <ListTodo className="h-4 w-4 text-orange-600 opacity-60" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold tracking-tight text-orange-600">{stats.inProgress}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Working</p>
            </CardContent>
          </Card>

          <Card className="stat-card success border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Done</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600 opacity-60" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold tracking-tight text-green-600">{stats.completed}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Finished</p>
            </CardContent>
          </Card>

          <Card className="stat-card urgent border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600 opacity-60" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold tracking-tight text-red-600">{stats.overdue}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Past due</p>
            </CardContent>
          </Card>

          <Card className="stat-card urgent border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Urgent</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600 opacity-60 pulse-soft" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold tracking-tight text-red-600">{stats.urgent}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Critical</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-xl border-0 shadow-sm hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common task operations</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid gap-2 md:grid-cols-3">
              <Button
                onClick={() => navigate('/tasks/registry')}
                className="h-auto flex-col items-start p-3 gap-1.5"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Create Task</div>
                  <div className="text-[10px] text-muted-foreground">Add new task</div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/tasks/tasks')}
                className="h-auto flex-col items-start p-3 gap-1.5"
                variant="outline"
              >
                <ListTodo className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-semibold text-sm">View Tasks</div>
                  <div className="text-[10px] text-muted-foreground">Manage & assign</div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/tasks/board')}
                className="h-auto flex-col items-start p-3 gap-1.5"
                variant="outline"
              >
                <LayoutGrid className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Task Board</div>
                  <div className="text-[10px] text-muted-foreground">Kanban view</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <Card className="rounded-xl border-0 shadow-sm hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Urgent Tasks
              </CardTitle>
              <CardDescription className="text-xs">Requires immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {urgentTasks.map(task => (
                  <div
                    key={task.id}
                    className="task-card-compact cursor-pointer p-3"
                    onClick={() => navigate(`/tasks/registry?task=${task.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-medium text-sm">{task.title}</span>
                        <Badge
                          className={`priority-badge ${task.priority} text-[10px] px-1.5 py-0.5`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>{task.assignedStaffName}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
