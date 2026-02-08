import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTasks, mockStaff } from '@/data/task-mock-data';
import { BarChart3, TrendingUp, Users, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Reports() {
  // Calculate task status report
  const statusReport = useMemo(() => {
    const total = mockTasks.length;
    const open = mockTasks.filter(t => t.status === 'open').length;
    const inProgress = mockTasks.filter(t => t.status === 'in_progress').length;
    const completed = mockTasks.filter(t => t.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, open, inProgress, completed, completionRate };
  }, []);

  // Calculate completion report
  const completionReport = useMemo(() => {
    const completed = mockTasks.filter(t => t.status === 'completed');
    const overdue = mockTasks.filter(t => {
      const due = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today && t.status !== 'completed';
    });
    const onTime = completed.filter(t => {
      const due = new Date(t.dueDate);
      const completed = t.completedAt ? new Date(t.completedAt) : new Date();
      return completed <= due;
    });

    return {
      completed: completed.length,
      overdue: overdue.length,
      onTime: onTime.length,
      onTimeRate: completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 0,
    };
  }, []);

  // Calculate staff performance
  const staffPerformance = useMemo(() => {
    return mockStaff.map(staff => {
      const tasks = mockTasks.filter(t => t.assignedStaffId === staff.id);
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        staff,
        total,
        completed,
        completionRate,
      };
    });
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Task Reports"
        description="Generate insights and reports on task completion and staff performance"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Task Management', href: '/tasks' },
          { label: 'Reports', href: '/tasks/reports' },
        ]}
      />

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Task Status
          </TabsTrigger>
          <TabsTrigger value="completion" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Completion Report
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Users className="h-4 w-4" />
            Staff Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task Status Report</CardTitle>
                  <CardDescription>Overview of all tasks by status</CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Total Tasks</div>
                  <div className="text-3xl font-bold">{statusReport.total}</div>
                </Card>
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Open</div>
                  <div className="text-3xl font-bold text-blue-600">{statusReport.open}</div>
                </Card>
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">In Progress</div>
                  <div className="text-3xl font-bold text-orange-600">{statusReport.inProgress}</div>
                </Card>
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Completed</div>
                  <div className="text-3xl font-bold text-green-600">{statusReport.completed}</div>
                </Card>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Completion Rate</div>
                <div className="text-2xl font-bold">{statusReport.completionRate}%</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Completion Report</CardTitle>
                  <CardDescription>Task completion metrics and trends</CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Completed Tasks</div>
                  <div className="text-3xl font-bold text-green-600">{completionReport.completed}</div>
                </Card>
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Overdue Tasks</div>
                  <div className="text-3xl font-bold text-red-600">{completionReport.overdue}</div>
                </Card>
                <Card className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">On-Time Completion</div>
                  <div className="text-3xl font-bold text-blue-600">{completionReport.onTime}</div>
                </Card>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">On-Time Completion Rate</div>
                <div className="text-2xl font-bold">{completionReport.onTimeRate}%</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Performance</CardTitle>
                  <CardDescription>Individual performance metrics by staff member</CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffPerformance.map(({ staff, total, completed, completionRate }) => (
                  <Card key={staff.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">{staff.role} • {staff.department}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="text-xl font-bold">{total}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Completed</div>
                          <div className="text-xl font-bold text-green-600">{completed}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Rate</div>
                          <div className="text-xl font-bold">{completionRate}%</div>
                        </div>
                        <Badge variant={completionRate >= 80 ? 'default' : completionRate >= 50 ? 'secondary' : 'destructive'}>
                          {completionRate >= 80 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
