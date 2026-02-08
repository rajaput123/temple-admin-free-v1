import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTasks, mockStaff, getTaskTypeName, getPriorityName } from '@/data/task-mock-data';
import { Plus, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TaskStatus, TaskPriority, TaskType } from '@/types/tasks';

export default function TaskRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesType = typeFilter === 'all' || task.type === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [searchQuery, statusFilter, priorityFilter, typeFilter]);

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

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Task Registry"
        description="Master repository for all tasks"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Task Management', href: '/tasks' },
          { label: 'Registry', href: '/tasks/registry' },
        ]}
      />

      <div className="space-y-4">
        {/* Filters */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TaskType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="ritual_preparation">Ritual Preparation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>{filteredTasks.length} task(s) found</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Task</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Priority</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Assigned To</th>
                    <th className="text-left p-3 text-sm font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No tasks found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => (
                      <tr key={task.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{getTaskTypeName(task.type)}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {getPriorityName(task.priority)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(task.status)} variant="outline">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{task.assignedStaffName}</td>
                        <td className="p-3 text-sm text-muted-foreground">{task.dueDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
