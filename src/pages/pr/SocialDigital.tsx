import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Share2, Calendar, Facebook, Twitter, Instagram } from 'lucide-react';
import { dummySocialChannels, dummySocialPosts, dummyContentCalendars } from '@/data/communications-data';
import type { SocialPost, SocialPlatform } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';

const platformIcons: Record<SocialPlatform, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Share2,
  whatsapp_business: Share2,
  telegram: Share2,
};

export default function SocialDigital() {
  const { checkWriteAccess } = usePermissions();
  const [channels] = useState(dummySocialChannels);
  const [posts] = useState<SocialPost[]>(dummySocialPosts);
  const [calendars] = useState(dummyContentCalendars);
  const [searchQuery, setSearchQuery] = useState('');

  const canWrite = checkWriteAccess('communications');

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const channelColumns = [
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (value: unknown, row: any) => {
        const Icon = platformIcons[row.platform] || Share2;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium capitalize">{row.platform.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      key: 'accountName',
      label: 'Account',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div>
          <div className="font-medium">{row.accountName}</div>
          <div className="text-xs text-gray-500">{row.accountHandle}</div>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.isActive ? 'default' : 'secondary'}>
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {row.isOfficial && (
            <Badge variant="outline" className="text-xs">Official</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'managedBy',
      label: 'Managed By',
      render: (value: unknown, row: any) => (
        <div className="text-sm">{row.managedBy.length} users</div>
      ),
    },
  ];

  const postColumns = [
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (value: unknown, row: SocialPost) => {
        const Icon = platformIcons[row.platform] || Share2;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm capitalize">{row.platform.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      key: 'content',
      label: 'Content',
      render: (value: unknown, row: SocialPost) => (
        <div className="max-w-md">
          <div className="text-sm text-gray-900 truncate">{row.content}</div>
          {row.mediaUrls && row.mediaUrls.length > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">
              {row.mediaUrls.length} media file(s)
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: SocialPost) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.status === 'published' ? 'default' : 'outline'}>
            {row.status}
          </Badge>
          {row.isPinned && (
            <Badge variant="outline" className="text-xs">Pinned</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'moderationStatus',
      label: 'Moderation',
      sortable: true,
      render: (value: unknown, row: SocialPost) => (
        <Badge
          variant={
            row.moderationStatus === 'approved'
              ? 'default'
              : row.moderationStatus === 'rejected'
              ? 'destructive'
              : 'outline'
          }
        >
          {row.moderationStatus}
        </Badge>
      ),
    },
    {
      key: 'engagementMetrics',
      label: 'Engagement',
      render: (value: unknown, row: SocialPost) => {
        const metrics = row.engagementMetrics;
        if (!metrics) return <span className="text-sm text-gray-500">-</span>;
        return (
          <div className="text-xs">
            <div>👍 {metrics.likes || 0}</div>
            <div>📤 {metrics.shares || 0}</div>
            <div>💬 {metrics.comments || 0}</div>
          </div>
        );
      },
    },
    {
      key: 'publishedAt',
      label: 'Published',
      sortable: true,
      render: (value: unknown, row: SocialPost) => (
        <div className="text-sm">
          {row.publishedAt
            ? new Date(row.publishedAt).toLocaleDateString()
            : '-'}
        </div>
      ),
    },
  ];

  const calendarColumns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="max-w-md">
          <div className="font-medium">{row.title}</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">{row.content}</div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          <div>{new Date(row.scheduledDate).toLocaleDateString()}</div>
          {row.scheduledTime && (
            <div className="text-xs text-gray-500">{row.scheduledTime}</div>
          )}
        </div>
      ),
    },
    {
      key: 'channels',
      label: 'Channels',
      render: (value: unknown, row: any) => (
        <div className="text-sm">{row.channels.length} channel(s)</div>
      ),
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
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Social & Digital Channels"
        description="Manage official social media accounts, content publishing, and moderation"
        actions={
          canWrite ? (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">
            <Share2 className="h-4 w-4 mr-2" />
            Social Channels
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Share2 className="h-4 w-4 mr-2" />
            Social Posts
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Content Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <div className="mb-4">
            {canWrite && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            )}
          </div>
          <DataTable data={channels} columns={channelColumns} />
        </TabsContent>

        <TabsContent value="posts">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Total Posts</div>
                <div className="text-2xl font-bold mt-1">{posts.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Published</div>
                <div className="text-2xl font-bold mt-1 text-green-600">
                  {posts.filter(p => p.status === 'published').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Pending Moderation</div>
                <div className="text-2xl font-bold mt-1 text-yellow-600">
                  {posts.filter(p => p.moderationStatus === 'pending').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Flagged</div>
                <div className="text-2xl font-bold mt-1 text-red-600">
                  {posts.filter(p => p.misinformationFlags && p.misinformationFlags.length > 0).length}
                </div>
              </div>
            </div>

            <DataTable data={filteredPosts} columns={postColumns} />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="mb-4">
            {canWrite && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Content
              </Button>
            )}
          </div>
          <DataTable data={calendars} columns={calendarColumns} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
