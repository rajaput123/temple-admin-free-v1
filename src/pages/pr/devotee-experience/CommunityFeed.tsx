import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getCommunityPosts, approveCommunityPost } from '@/lib/pr-communication-store';
import type { CommunityPost } from '@/types/pr-communication';
import { toast } from 'sonner';

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'pending' | 'reported'>('feed');

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[CommunityFeed] Component mounted');
    return () => {
      console.log('[CommunityFeed] Component unmounted');
    };
  }, []);

  // Safe data fetching
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        console.log('[CommunityFeed] Loading data...');
        const data = getCommunityPosts();
        if (Array.isArray(data)) {
          setPosts(data);
          console.log('[CommunityFeed] Data loaded successfully:', data.length);
        } else {
          console.warn('[CommunityFeed] Invalid data structure, using empty array');
          setPosts([]);
        }
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('[CommunityFeed] Error loading data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load community posts');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[CommunityFeed] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[CommunityFeed] Unhandled promise rejection:', e.reason);
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

  const approvedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'approved');
  }, [posts]);

  const pendingPosts = useMemo(() => {
    return posts.filter(p => p.status === 'pending');
  }, [posts]);

  const reportedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'reported');
  }, [posts]);

  const handleApprove = (postId: string) => {
    try {
      const approved = approveCommunityPost(postId, 'current-user');
      if (approved) {
        const updatedPosts = getCommunityPosts();
        if (Array.isArray(updatedPosts)) {
          setPosts(updatedPosts);
        }
        toast.success('Post approved');
      }
    } catch (error) {
      console.error('[CommunityFeed] Error approving post:', error);
      toast.error('Failed to approve post');
    }
  };

  const handleReject = (postId: string) => {
    // Implementation for reject
    toast.info('Post rejected');
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader
          title="Community Feed"
          description="Manage devotee community posts and engagement"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Devotee Experience', href: '/pr/devotee-experience' },
            { label: 'Community Feed', href: '/pr/devotee-experience/feed' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading community posts...</p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  // Error state
  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="Community Feed"
          description="Manage devotee community posts and engagement"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Devotee Experience', href: '/pr/devotee-experience' },
            { label: 'Community Feed', href: '/pr/devotee-experience/feed' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Community Posts</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage || 'An unexpected error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Community Feed"
        description="Manage devotee community posts and engagement"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Devotee Experience', href: '/pr/devotee-experience' },
          { label: 'Community Feed', href: '/pr/devotee-experience/feed' },
        ]}
      />

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="feed">
              Feed
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval
              {pendingPosts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingPosts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reported">
              Reported
              {reportedPosts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {reportedPosts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            {approvedPosts.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="font-medium">No posts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Approved posts will appear here</p>
                </CardContent>
              </Card>
            ) : (
              approvedPosts.map(post => (
                <Card key={post.id} className="rounded-xl border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {post.devoteeName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{post.devoteeName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>👍 {post.likes.length}</span>
                          <span>💬 {post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingPosts.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600 opacity-30" />
                  <p className="font-medium">No pending posts</p>
                  <p className="text-sm text-muted-foreground mt-1">All posts have been reviewed</p>
                </CardContent>
              </Card>
            ) : (
              pendingPosts.map(post => (
                <Card key={post.id} className="rounded-xl border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {post.devoteeName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{post.devoteeName}</span>
                          <Badge variant="outline" className="text-xs">Pending</Badge>
                        </div>
                        <p className="text-sm mb-4">{post.content}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleApprove(post.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleReject(post.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reported" className="space-y-4">
            {reportedPosts.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600 opacity-30" />
                  <p className="font-medium">No reported posts</p>
                  <p className="text-sm text-muted-foreground mt-1">Reported posts will appear here</p>
                </CardContent>
              </Card>
            ) : (
              reportedPosts.map(post => (
                <Card key={post.id} className="rounded-xl border shadow-sm border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{post.devoteeName}</span>
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                            Reported
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{post.content}</p>
                        {post.reportedReason && (
                          <p className="text-xs text-muted-foreground mb-4">
                            Reason: {post.reportedReason}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            Review
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-2">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
