import { PlatformLayout } from '@/components/platform/PlatformLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CreditCard, TrendingUp, Activity } from 'lucide-react';

export default function PlatformDashboard() {
  const stats = [
    {
      title: 'Total Applications',
      value: '12',
      description: 'Active temple applications',
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: '156',
      description: 'Across all applications',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Active Subscriptions',
      value: '8',
      description: 'Premium & Enterprise',
      icon: CreditCard,
      color: 'text-purple-600',
    },
    {
      title: 'System Health',
      value: '99.9%',
      description: 'Uptime this month',
      icon: Activity,
      color: 'text-emerald-600',
    },
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of platform operations and metrics
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New temple application submitted</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Subscription upgraded to Premium</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common platform tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors">
                  Create new application
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors">
                  View all applications
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors">
                  Manage subscriptions
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors">
                  Review pending registrations
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PlatformLayout>
  );
}
