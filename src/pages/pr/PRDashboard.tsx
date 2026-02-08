import { useMemo, useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  getAnnouncements, 
  getMessages, 
  getLiveStreams, 
  getSupportTickets,
} from '@/lib/pr-communication-store';
import { 
  Bell, 
  MessageSquare, 
  Radio, 
  HelpCircle, 
  Plus, 
  Send, 
  Video,
  Clock,
  Activity,
} from 'lucide-react';
import '@/styles/pr-communication.css';

export default function PRDashboard() {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[PRDashboard] Component mounted');
    return () => {
      console.log('[PRDashboard] Component unmounted');
    };
  }, []);

  // Safe data fetching with error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('[PRDashboard] Loading data...');
        
        const annData = getAnnouncements() || [];
        const msgData = getMessages() || [];
        const streamData = getLiveStreams() || [];
        const ticketData = getSupportTickets() || [];
        
        // Validate arrays
        setAnnouncements(Array.isArray(annData) ? annData : []);
        setMessages(Array.isArray(msgData) ? msgData : []);
        setLiveStreams(Array.isArray(streamData) ? streamData : []);
        setSupportTickets(Array.isArray(ticketData) ? ticketData : []);
        
        console.log('[PRDashboard] Data loaded successfully:', {
          announcements: Array.isArray(annData) ? annData.length : 0,
          messages: Array.isArray(msgData) ? msgData.length : 0,
          liveStreams: Array.isArray(streamData) ? streamData.length : 0,
          supportTickets: Array.isArray(ticketData) ? ticketData.length : 0,
        });
        
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('[PRDashboard] Error loading data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load dashboard data');
        // Set empty arrays on error
        setAnnouncements([]);
        setMessages([]);
        setLiveStreams([]);
        setSupportTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    try {
      return {
        activeAnnouncements: Array.isArray(announcements) 
          ? announcements.filter(a => a && a.status === 'published').length 
          : 0,
        scheduledBroadcasts: Array.isArray(messages) 
          ? messages.filter(m => m && m.status === 'scheduled').length 
          : 0,
        liveStatus: Array.isArray(liveStreams) && liveStreams.some(s => s && s.status === 'live') 
          ? 'Live' 
          : 'Offline',
        pendingDevoteeIssues: Array.isArray(supportTickets) 
          ? supportTickets.filter(t => t && (t.status === 'open' || t.status === 'in_progress')).length 
          : 0,
      };
    } catch (error) {
      console.error('[PRDashboard] Error calculating stats:', error);
      return {
        activeAnnouncements: 0,
        scheduledBroadcasts: 0,
        liveStatus: 'Offline',
        pendingDevoteeIssues: 0,
      };
    }
  }, [announcements, messages, liveStreams, supportTickets]);

  const recentActivity = useMemo(() => {
    try {
      const activities: Array<{
        id: string;
        type: 'announcement' | 'message' | 'stream' | 'ticket';
        title: string;
        timestamp: string;
        status?: string;
      }> = [];

      // Recent announcements - with null checks
      if (Array.isArray(announcements)) {
        announcements
          .filter(a => a && a.id && a.title && a.createdAt)
          .sort((a, b) => {
            try {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 3)
          .forEach(a => {
            if (a && a.id && a.title && a.createdAt) {
              activities.push({
                id: a.id,
                type: 'announcement',
                title: a.title || 'Untitled',
                timestamp: a.createdAt,
                status: a.status,
              });
            }
          });
      }

      // Recent messages - with property validation
      if (Array.isArray(messages)) {
        messages
          .filter(m => m && m.id && (m.sentAt || m.createdAt))
          .sort((a, b) => {
            try {
              const dateA = (a.sentAt || a.createdAt) ? new Date(a.sentAt || a.createdAt).getTime() : 0;
              const dateB = (b.sentAt || b.createdAt) ? new Date(b.sentAt || b.createdAt).getTime() : 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 3)
          .forEach(m => {
            if (m && m.id) {
              const safeTitle = m.subject || (m.content && typeof m.content === 'string' ? m.content.substring(0, 50) : 'No title') || 'No title';
              const safeTimestamp = m.sentAt || m.createdAt || new Date().toISOString();
              activities.push({
                id: m.id,
                type: 'message',
                title: safeTitle,
                timestamp: safeTimestamp,
                status: m.status,
              });
            }
          });
      }

      // Recent streams - with null checks
      if (Array.isArray(liveStreams)) {
        liveStreams
          .filter(s => s && s.id && s.title && s.createdAt)
          .sort((a, b) => {
            try {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 2)
          .forEach(s => {
            if (s && s.id && s.title && s.createdAt) {
              activities.push({
                id: s.id,
                type: 'stream',
                title: s.title || 'Untitled Stream',
                timestamp: s.createdAt,
                status: s.status,
              });
            }
          });
      }

      // Recent tickets - with null checks
      if (Array.isArray(supportTickets)) {
        supportTickets
          .filter(t => t && t.id && t.subject && t.createdAt)
          .sort((a, b) => {
            try {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 2)
          .forEach(t => {
            if (t && t.id && t.subject && t.createdAt) {
              activities.push({
                id: t.id,
                type: 'ticket',
                title: t.subject || 'Untitled Ticket',
                timestamp: t.createdAt,
                status: t.status,
              });
            }
          });
      }

      // Sort all activities by timestamp
      return activities
        .filter(a => a && a.timestamp)
        .sort((a, b) => {
          try {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          } catch {
            return 0;
          }
        })
        .slice(0, 10);
    } catch (error) {
      console.error('[PRDashboard] Error building recent activity:', error);
      return [];
    }
  }, [announcements, messages, liveStreams, supportTickets]);

  const formatTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return 'Just now';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Just now';
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    } catch (error) {
      console.error('[PRDashboard] Error formatting time:', error);
      return 'Just now';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'announcement': return Bell;
      case 'message': return MessageSquare;
      case 'stream': return Video;
      case 'ticket': return HelpCircle;
      default: return Activity;
    }
  };

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[PRDashboard] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[PRDashboard] Unhandled promise rejection:', e.reason);
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

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader
          title="PR & Communication Dashboard"
          description="Overview of communications and engagement"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Dashboard', href: '/pr/dashboard' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="PR & Communication Dashboard"
          description="Overview of communications and engagement"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Dashboard', href: '/pr/dashboard' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
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
        title="PR & Communication Dashboard"
        description="Overview of communications and engagement"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Dashboard', href: '/pr/dashboard' },
        ]}
      />

      <div className="space-y-6">
        {/* KPI Cards - Large and Readable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="pr-kpi-card" 
            onClick={() => navigate('/pr/announcements')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="kpi-label">Active Announcements</p>
                  <p className="kpi-value">{stats.activeAnnouncements}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="pr-kpi-card" 
            onClick={() => navigate('/pr/communication/scheduled')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="kpi-label">Scheduled Broadcasts</p>
                  <p className="kpi-value">{stats.scheduledBroadcasts}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="pr-kpi-card" 
            onClick={() => navigate('/pr/live-streaming')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="kpi-label">Live Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="kpi-value">{stats.liveStatus}</p>
                    {stats.liveStatus === 'Live' && (
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Radio className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="pr-kpi-card" 
            onClick={() => navigate('/pr/devotee-experience/support')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="kpi-label">Pending Devotee Issues</p>
                  <p className="kpi-value">{stats.pendingDevoteeIssues}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="pr-card">
              <CardContent className="p-6">
                <h3 className="pr-heading text-lg mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                  ) : (
                    recentActivity.map(activity => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-amber-50/30 transition-colors cursor-pointer"
                          onClick={() => {
                            if (activity.type === 'announcement') navigate('/pr/announcements');
                            else if (activity.type === 'message') navigate('/pr/communication');
                            else if (activity.type === 'stream') navigate('/pr/live-streaming');
                            else if (activity.type === 'ticket') navigate('/pr/devotee-experience/support');
                          }}
                        >
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div>
            <Card className="pr-card">
              <CardContent className="p-6">
                <h3 className="pr-heading text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start gap-2 bg-amber-500 hover:bg-amber-600" 
                    onClick={() => navigate('/pr/announcements/new')}
                  >
                    <Plus className="h-4 w-4" />
                    Create Announcement
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-amber-200 hover:bg-amber-50"
                    onClick={() => navigate('/pr/communication/bulk')}
                  >
                    <Send className="h-4 w-4" />
                    Send Broadcast
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-amber-200 hover:bg-amber-50"
                    onClick={() => navigate('/pr/live-streaming')}
                  >
                    <Video className="h-4 w-4" />
                    Start Live
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
