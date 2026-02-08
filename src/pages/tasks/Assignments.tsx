import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTasks, mockStaff, getTaskTypeName, getPriorityName } from '@/data/task-mock-data';
import { Users, UserCheck, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types/tasks';

export default function Assignments() {
  const [selectedStaff, setSelectedStaff] = useState<string>('all');

  // Calculate workload for each staff member
  const workload = useMemo(() => {
    const staffWorkload = mockStaff.map(staff => {
      const tasks = mockTasks.filter(t => t.assignedStaffId === staff.id);
      const open = tasks.filter(t => t.status === 'open').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;

      return {
        staff,
        tasks,
        open,
        inProgress,
        completed,
        total,
      };
    });

    return staffWorkload;
  }, []);

  // Get tasks for selected staff
  const staffTasks = useMemo(() => {
    if (selectedStaff === 'all') return mockTasks;
    return mockTasks.filter(t => t.assignedStaffId === selectedStaff);
  }, [selectedStaff]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Task Assignments"
        description="Manage task assignments to staff members and monitor workload"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Task Management', href: '/tasks' },
          { label: 'Assignments', href: '/tasks/assignments' },
        ]}
      />

      <div className="space-y-6">
        {/* Workload Overview */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Workload
            </CardTitle>
            <CardDescription>Task distribution across all staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workload.map(({ staff, open, inProgress, completed, total }) => (
                <Card key={staff.id} className="p-4 rounded-lg border">
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold">{staff.name}</div>
                      <div className="text-sm text-muted-foreground">{staff.role} • {staff.department}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{open}</div>
                        <div className="text-xs text-muted-foreground">Open</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">{inProgress}</div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{completed}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Tasks</span>
                        <span className="font-semibold">{total}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Task List */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Staff Assignments
                </CardTitle>
                <CardDescription>View and manage tasks assigned to staff</CardDescription>
              </div>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {mockStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staffTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">{task.title}</div>
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{getTaskTypeName(task.type)}</Badge>
                      <Badge variant="outline">{getPriorityName(task.priority)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Assigned to: {task.assignedStaffName} • Due: {task.dueDate}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Reassign
                  </Button>
                </div>
              ))}
              {staffTasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No tasks found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
