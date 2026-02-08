import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3,
  Send,
  Plus,
  AlertCircle
} from 'lucide-react';
import ManualMessages from './ManualMessages';
import BulkBroadcast from './BulkBroadcast';
import ScheduledMessages from './ScheduledMessages';
import Templates from './Templates';
import DeliveryReports from './DeliveryReports';

export default function CommunicationCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Component mount/unmount logging
  useEffect(() => {
    console.log('[CommunicationCenter] Component mounted');
    return () => {
      console.log('[CommunicationCenter] Component unmounted');
    };
  }, []);

  // Determine active tab from URL
  const getActiveTab = () => {
    try {
      if (location.pathname.includes('/bulk')) return 'bulk';
      if (location.pathname.includes('/scheduled')) return 'scheduled';
      if (location.pathname.includes('/templates')) return 'templates';
      if (location.pathname.includes('/reports')) return 'reports';
      return 'manual'; // default
    } catch (error) {
      console.error('[CommunicationCenter] Error determining active tab:', error);
      return 'manual';
    }
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Sync tab with URL changes
  useEffect(() => {
    try {
      const tab = getActiveTab();
      console.log('[CommunicationCenter] Tab changed to:', tab);
      setActiveTab(tab);
    } catch (error) {
      console.error('[CommunicationCenter] Error syncing tab:', error);
      setHasError(true);
      setErrorMessage('Failed to initialize communication center');
    }
  }, [location.pathname]);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[CommunicationCenter] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[CommunicationCenter] Unhandled promise rejection:', e.reason);
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
  
  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="Communication Center"
          description="Manage all communication channels and messaging"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Communication Center', href: '/pr/communication' },
          ]}
        />
        <Card className="p-8 max-w-2xl mx-auto mt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Error Loading Communication Center</h3>
              <p className="text-sm text-muted-foreground">{errorMessage || 'An unexpected error occurred'}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload Page
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const routes: Record<string, string> = {
      manual: '/pr/communication/manual',
      bulk: '/pr/communication/bulk',
      scheduled: '/pr/communication/scheduled',
      templates: '/pr/communication/templates',
      reports: '/pr/communication/reports',
    };
    navigate(routes[value] || routes.manual);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Communication Center"
        description="Manage all communication channels and messaging"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Communication Center', href: '/pr/communication' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="default"
              size="sm"
              className="gap-2 shadow-sm"
              onClick={() => {
                setActiveTab('manual');
                handleTabChange('manual');
              }}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Send</span>
              <span className="sm:hidden">Send</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setActiveTab('scheduled');
                handleTabChange('scheduled');
              }}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setActiveTab('templates');
                handleTabChange('templates');
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Template</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col h-[calc(100vh-180px)] min-h-[600px]">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <TabsList className="w-full justify-start border-0 rounded-none h-auto p-0 bg-transparent gap-1">
              <TabsTrigger
                value="manual"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2 transition-all hover:text-foreground"
                aria-label="Manual Messages"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Manual Messages</span>
                <span className="sm:hidden">Manual</span>
              </TabsTrigger>
              <TabsTrigger
                value="bulk"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2 transition-all hover:text-foreground"
                aria-label="Bulk Broadcast"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Bulk Broadcast</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2 transition-all hover:text-foreground"
                aria-label="Scheduled Messages"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Scheduled</span>
                <span className="sm:hidden">Schedule</span>
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2 transition-all hover:text-foreground"
                aria-label="Message Templates"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Templates</span>
                <span className="sm:hidden">Templates</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2 transition-all hover:text-foreground"
                aria-label="Delivery Reports"
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">Reports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-1">
            <TabsContent value="manual" className="m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
              <ManualMessages />
            </TabsContent>

            <TabsContent value="bulk" className="m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
              <BulkBroadcast />
            </TabsContent>

            <TabsContent value="scheduled" className="m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
              <ScheduledMessages />
            </TabsContent>

            <TabsContent value="templates" className="m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
              <Templates />
            </TabsContent>

            <TabsContent value="reports" className="m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
              <DeliveryReports />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
