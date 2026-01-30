import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, Users, MessageSquare, Calendar } from 'lucide-react';
import { dummyPressReleases, dummySpokespersons, dummyMediaContacts, dummyMediaQueries, dummyPressBriefings } from '@/data/communications-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function MediaPress() {
  const { checkWriteAccess } = usePermissions();
  const [pressReleases] = useState(dummyPressReleases);
  const [spokespersons] = useState(dummySpokespersons);
  const [mediaContacts] = useState(dummyMediaContacts);
  const [mediaQueries] = useState(dummyMediaQueries);
  const [pressBriefings] = useState(dummyPressBriefings);

  const canWrite = checkWriteAccess('communications');

  const pressReleaseColumns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {row.status} • {row.priority}
          </div>
        </div>
      ),
    },
    {
      key: 'spokespersonId',
      label: 'Spokesperson',
      render: (value: unknown, row: any) => {
        const sp = spokespersons.find(s => s.id === row.spokespersonId);
        return <div className="text-sm">{sp?.name || '-'}</div>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.status === 'published' ? 'default' : 'outline'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'publishedAt',
      label: 'Published',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          {row.publishedAt
            ? new Date(row.publishedAt).toLocaleDateString()
            : '-'}
        </div>
      ),
    },
  ];

  const spokespersonColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Contact',
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          <div>{row.contactNumber}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'authorizedFor',
      label: 'Authorized For',
      render: (value: unknown, row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.authorizedFor.map((topic: string) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const mediaContactColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-500">{row.organization}</div>
        </div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Contact',
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          <div>{row.contactNumber}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'beat',
      label: 'Beat',
      render: (value: unknown, row: any) => (
        <Badge variant="outline">{row.beat || 'General'}</Badge>
      ),
    },
    {
      key: 'isVerified',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.isVerified ? 'default' : 'secondary'}>
          {row.isVerified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },
  ];

  const queryColumns = [
    {
      key: 'queryText',
      label: 'Query',
      render: (value: unknown, row: any) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">{row.queryText}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            From: {mediaContacts.find(mc => mc.id === row.mediaContactId)?.name}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.status === 'responded' ? 'default' : 'outline'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'receivedAt',
      label: 'Received',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="text-sm">{new Date(row.receivedAt).toLocaleString()}</div>
      ),
    },
    {
      key: 'respondedAt',
      label: 'Responded',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          {row.respondedAt
            ? new Date(row.respondedAt).toLocaleString()
            : '-'}
        </div>
      ),
    },
  ];

  const briefingColumns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{row.agenda}</div>
        </div>
      ),
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          <div>{new Date(row.scheduledAt).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">
            {new Date(row.scheduledAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: unknown, row: any) => <div className="text-sm">{row.location}</div>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.status === 'scheduled' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Media & Press Management"
        description="Manage press releases, spokesperson assignments, media contacts, and queries"
        actions={
          canWrite ? (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Press Release
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="releases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="releases">
            <FileText className="h-4 w-4 mr-2" />
            Press Releases
          </TabsTrigger>
          <TabsTrigger value="spokespersons">
            <Users className="h-4 w-4 mr-2" />
            Spokespersons
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-2" />
            Media Contacts
          </TabsTrigger>
          <TabsTrigger value="queries">
            <MessageSquare className="h-4 w-4 mr-2" />
            Media Queries
          </TabsTrigger>
          <TabsTrigger value="briefings">
            <Calendar className="h-4 w-4 mr-2" />
            Press Briefings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="releases">
          <DataTable data={pressReleases} columns={pressReleaseColumns} />
        </TabsContent>

        <TabsContent value="spokespersons">
          <div className="mb-4">
            {canWrite && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Spokesperson
              </Button>
            )}
          </div>
          <DataTable data={spokespersons} columns={spokespersonColumns} />
        </TabsContent>

        <TabsContent value="contacts">
          <div className="mb-4">
            {canWrite && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Media Contact
              </Button>
            )}
          </div>
          <DataTable data={mediaContacts} columns={mediaContactColumns} />
        </TabsContent>

        <TabsContent value="queries">
          <DataTable data={mediaQueries} columns={queryColumns} />
        </TabsContent>

        <TabsContent value="briefings">
          <div className="mb-4">
            {canWrite && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Briefing
              </Button>
            )}
          </div>
          <DataTable data={pressBriefings} columns={briefingColumns} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
