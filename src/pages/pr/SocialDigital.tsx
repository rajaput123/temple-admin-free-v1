import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Share2, Calendar, Facebook, Twitter, Instagram, History } from 'lucide-react';
import { dummySocialChannels, dummySocialPosts, dummyContentCalendars } from '@/data/communications-data';
import type { SocialPost, SocialPlatform } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components/ui/use-toast';
import { CreatePostModal } from '@/components/pr/communication/CreatePostModal';
import { PostLog } from '@/components/pr/communication/PostLog';
import { toast } from 'sonner';
import '@/styles/pr-communication.css';

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
  const [channels, setChannels] = useState(dummySocialChannels);
  const [posts, setPosts] = useState<SocialPost[]>(dummySocialPosts);
  const [calendars] = useState(dummyContentCalendars);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'posts' | 'calendar'>('posts');

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[SocialDigital] Component mounted');
    return () => {
      console.log('[SocialDigital] Component unmounted');
    };
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[SocialDigital] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[SocialDigital] Unhandled promise rejection:', e.reason);
      setHasError(true);
      setErrorMessage(e.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejection);
    
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejection);
    };
  }, []);

  const canWrite = checkWriteAccess('communications');

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePost = (data: {
    content: string;
    platforms: SocialPlatform[];
    mediaFiles?: File[];
  }) => {
    // Convert to SocialPost format (using communications type)
    const newPost: SocialPost = {
      id: `POST-${String(posts.length + 1).padStart(3, '0')}`,
      platform: data.platforms[0] as any, // Using first platform for compatibility
      content: data.content,
      mediaUrls: data.mediaFiles?.map(f => URL.createObjectURL(f)) || [],
      status: 'published',
      moderationStatus: 'approved',
      isPinned: false,
      priority: 'normal' as any,
      engagementMetrics: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
      },
      publishedAt: new Date().toISOString(),
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      version: 1,
      isLocked: false,
    };

    setPosts(prev => [newPost, ...prev]);
    toast.success('Post created successfully', {
      description: `Posted to ${data.platforms.length} platform(s)`,
    });
    setIsPostModalOpen(false);
    setActiveTab('posts');
  };


  // Error state
  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="Social & Digital"
          description="Manage social media presence and digital content"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Social & Digital', href: '/pr/social' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Social & Digital</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage || 'An unexpected error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

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
        title="Social & Digital"
        description="Manage official social media accounts, content publishing, and moderation"
        actions={
          canWrite ? (
            <Button 
              onClick={() => setIsPostModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
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
              <Button onClick={() => toast({ title: 'Coming Soon', description: 'Channel management feature will be available soon.' })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            )}
          </div>
          <DataTable data={channels} columns={channelColumns} />
        </TabsContent>

        <TabsContent value="posts" className="m-0">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Social Posts</h2>
                <p className="text-muted-foreground">
                  View and manage all your social media posts
                </p>
              </div>
            </div>
            <PostLog posts={posts} />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="mb-4">
            {canWrite && (
              <Button onClick={() => toast({ title: 'Coming Soon', description: 'Content scheduling feature will be available soon.' })}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Content
              </Button>
            )}
          </div>
          <DataTable data={calendars} columns={calendarColumns} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreatePostModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
        onPost={handleCreatePost}
      />
    </MainLayout>
  );
}
