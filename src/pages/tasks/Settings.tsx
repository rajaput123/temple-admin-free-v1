import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTaskTypes, mockPriorities, mockStaff } from '@/data/task-mock-data';
import { Settings as SettingsIcon, Users, ListTodo, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TaskSettings() {
  return (
    <MainLayout>
      <PageHeader
        title="Task Settings"
        description="Configure task types, priority levels, and manage staff"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Task Management', href: '/tasks' },
          { label: 'Settings', href: '/tasks/settings' },
        ]}
      />

      <Tabs defaultValue="task-types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="task-types" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Task Types
          </TabsTrigger>
          <TabsTrigger value="priorities" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Priority Levels
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <Users className="h-4 w-4" />
            Staff Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="task-types" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task Types</CardTitle>
                  <CardDescription>Manage task categories and types</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTaskTypes.map(taskType => (
                  <Card key={taskType.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{taskType.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{taskType.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{taskType.id}</Badge>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Priority Levels</CardTitle>
                  <CardDescription>Configure task priority levels and their descriptions</CardDescription>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPriorities.map(priority => (
                  <Card key={priority.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold">{priority.name}</div>
                          <Badge className={priority.color} variant="outline">
                            {priority.id}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{priority.description}</div>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>Manage staff members who can be assigned tasks</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStaff.map(staff => (
                  <Card key={staff.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{staff.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {staff.role} • {staff.department} • {staff.contact}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{staff.id}</Badge>
                        <Button variant="ghost" size="sm">Edit</Button>
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
