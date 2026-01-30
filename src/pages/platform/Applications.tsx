import { PlatformLayout } from '@/components/platform/PlatformLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings, MoreHorizontal } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  users: number;
  createdAt: string;
}

const mockApplications: Application[] = [
  {
    id: 'app-1',
    name: 'Sri Sharadamba Temple',
    tier: 'premium',
    status: 'active',
    users: 45,
    createdAt: '2023-01-15',
  },
  {
    id: 'app-2',
    name: 'Kashi Vishwanath Temple',
    tier: 'basic',
    status: 'active',
    users: 23,
    createdAt: '2023-03-20',
  },
  {
    id: 'app-3',
    name: 'New Temple',
    tier: 'free',
    status: 'pending',
    users: 2,
    createdAt: '2024-01-10',
  },
];

export default function Applications() {
  const columns = [
    {
      key: 'name',
      label: 'Application Name',
      render: (value: unknown, row: Application) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">ID: {row.id}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (value: unknown) => {
        const colors: Record<string, string> = {
          free: 'bg-gray-100 text-gray-800',
          basic: 'bg-blue-100 text-blue-800',
          premium: 'bg-purple-100 text-purple-800',
          enterprise: 'bg-green-100 text-green-800',
        };
        return (
          <Badge className={colors[value as string] || 'bg-gray-100 text-gray-800'}>
            {value as string}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as string;
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          active: 'default',
          suspended: 'destructive',
          pending: 'outline',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
      },
    },
    {
      key: 'users',
      label: 'Users',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage all temple application instances
          </p>
        </div>

        <DataTable
          data={mockApplications}
          columns={columns}
          searchPlaceholder="Search applications..."
          actions={(row) => (
            <>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </>
          )}
        />
      </div>
    </PlatformLayout>
  );
}
