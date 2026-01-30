import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, AlertTriangle, FileText, MapPin } from 'lucide-react';
import { dummyCrisisAlerts, dummyCrisisTemplates } from '@/data/communications-data';
import type { CrisisAlert, CrisisType } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';

const crisisTypeColors: Record<CrisisType, string> = {
  crowd_control: 'bg-red-100 text-red-700',
  delay: 'bg-yellow-100 text-yellow-700',
  incident: 'bg-orange-100 text-orange-700',
  weather: 'bg-blue-100 text-blue-700',
  emergency: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function CrisisEmergency() {
  const { checkWriteAccess } = usePermissions();
  const [alerts] = useState<CrisisAlert[]>(dummyCrisisAlerts);
  const [templates] = useState(dummyCrisisTemplates);
  const [searchQuery, setSearchQuery] = useState('');

  const canWrite = checkWriteAccess('communications');

  const filteredAlerts = alerts.filter((alert) =>
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const alertColumns = [
    {
      key: 'crisisType',
      label: 'Crisis Type',
      sortable: true,
      render: (value: unknown, row: CrisisAlert) => (
        <Badge className={crisisTypeColors[row.crisisType]}>
          {row.crisisType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: unknown, row: CrisisAlert) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">{row.content}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: unknown, row: CrisisAlert) => (
        <Badge variant="destructive">{row.priority.toUpperCase()}</Badge>
      ),
    },
    {
      key: 'geoTargeted',
      label: 'Geo-Targeted',
      render: (value: unknown, row: CrisisAlert) => (
        <div className="flex items-center gap-1">
          {row.geoTargeted ? (
            <>
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">Yes</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">No</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: CrisisAlert) => (
        <Badge variant={row.status === 'published' ? 'default' : 'outline'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'publishedAt',
      label: 'Published',
      sortable: true,
      render: (value: unknown, row: CrisisAlert) => (
        <div className="text-sm">
          {row.publishedAt
            ? new Date(row.publishedAt).toLocaleString()
            : '-'}
        </div>
      ),
    },
  ];

  const templateColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      key: 'crisisType',
      label: 'Crisis Type',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge className={crisisTypeColors[row.crisisType]}>
          {row.crisisType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'defaultChannels',
      label: 'Default Channels',
      render: (value: unknown, row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.defaultChannels.map((ch: string) => (
            <Badge key={ch} variant="outline" className="text-xs">
              {ch.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'defaultPriority',
      label: 'Priority',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.defaultPriority === 'urgent' ? 'destructive' : 'outline'}>
          {row.defaultPriority}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Crisis & Emergency Communication"
        description="Manage crisis alerts, emergency broadcasts, and incident communication"
        actions={
          canWrite ? (
            <Button variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              New Crisis Alert
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Crisis Alerts
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Crisis Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="text-sm text-gray-600">Active Alerts</div>
                <div className="text-2xl font-bold mt-1 text-red-600">
                  {alerts.filter(a => a.status === 'published').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Total Alerts</div>
                <div className="text-2xl font-bold mt-1">{alerts.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Emergency Overrides</div>
                <div className="text-2xl font-bold mt-1 text-orange-600">
                  {alerts.filter(a => a.isEmergencyOverride).length}
                </div>
              </div>
            </div>

            <DataTable data={filteredAlerts} columns={alertColumns} />
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="mb-4">
            {canWrite && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            )}
          </div>
          <DataTable data={templates} columns={templateColumns} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
