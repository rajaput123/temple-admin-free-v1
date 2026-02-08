import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Radio, Play, Square, Clock, Users, AlertCircle, Calendar } from 'lucide-react';
import { 
  getLiveStreams, 
  startLiveStream, 
  stopLiveStream,
  updateStreamStatus 
} from '@/lib/pr-communication-store';
import type { LiveStream, StreamStatus } from '@/types/pr-communication';
import { toast } from 'sonner';

export default function LiveStreaming() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[LiveStreaming] Component mounted');
    return () => {
      console.log('[LiveStreaming] Component unmounted');
    };
  }, []);

  // Safe data fetching
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        console.log('[LiveStreaming] Loading data...');
        const data = getLiveStreams();
        if (Array.isArray(data)) {
          setStreams(data);
          console.log('[LiveStreaming] Data loaded successfully:', data.length);
        } else {
          console.warn('[LiveStreaming] Invalid data structure, using empty array');
          setStreams([]);
        }
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('[LiveStreaming] Error loading data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load live streams');
        setStreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update streams periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const data = getLiveStreams();
        if (Array.isArray(data)) {
          setStreams(data);
          // Simulate viewer count updates for live streams
          data.forEach(stream => {
            if (stream.status === 'live') {
              const newCount = stream.viewerCount + Math.floor(Math.random() * 10) - 5;
              updateStreamStatus(stream.id, 'live', Math.max(0, newCount));
            }
          });
        }
      } catch (error) {
        console.error('[LiveStreaming] Error updating streams:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[LiveStreaming] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[LiveStreaming] Unhandled promise rejection:', e.reason);
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

  const activeStreams = useMemo(() => {
    return streams.filter(s => s.status === 'live');
  }, [streams]);

  const scheduledStreams = useMemo(() => {
    return streams.filter(s => s.status === 'scheduled');
  }, [streams]);

  const pastStreams = useMemo(() => {
    return streams.filter(s => s.status === 'ended' || s.status === 'offline');
  }, [streams]);

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader
          title="Live Streaming"
          description="Manage live video broadcasts"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Live Streaming', href: '/pr/live-streaming' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading live streams...</p>
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
          title="Live Streaming"
          description="Manage live video broadcasts"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Live Streaming', href: '/pr/live-streaming' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Live Streams</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage || 'An unexpected error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const handleGoLive = (streamId: string) => {
    try {
      const stream = startLiveStream(streamId, 'current-user');
      if (stream) {
        const updatedStreams = getLiveStreams();
        if (Array.isArray(updatedStreams)) {
          setStreams(updatedStreams);
        }
        setSelectedStream(stream);
        toast.success('Stream started successfully');
      }
    } catch (error) {
      console.error('[LiveStreaming] Error starting stream:', error);
      toast.error('Failed to start stream');
    }
  };

  const handleEndStream = (streamId: string) => {
    if (confirm('Are you sure you want to end this stream?')) {
      try {
        const stream = stopLiveStream(streamId, 'current-user');
        if (stream) {
          const updatedStreams = getLiveStreams();
          if (Array.isArray(updatedStreams)) {
            setStreams(updatedStreams);
          }
          setSelectedStream(null);
          toast.success('Stream ended successfully');
        }
      } catch (error) {
        console.error('[LiveStreaming] Error ending stream:', error);
        toast.error('Failed to end stream');
      }
    }
  };

  const getStatusBadge = (status: StreamStatus) => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
            LIVE
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            🟡 SCHEDULED
          </Badge>
        );
      case 'offline':
      case 'ended':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            ⚫ OFFLINE
          </Badge>
        );
    }
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '0:00:00';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Live Streaming"
        description="Manage live video broadcasts"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Live Streaming', href: '/pr/live-streaming' },
        ]}
      />

      <div className="space-y-6">
        {/* Main Video Player Section - Always Visible */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {activeStreams.length > 0 ? 'Live Now' : 'Video Streaming'}
            </h3>
            {activeStreams.length === 0 && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (scheduledStreams.length > 0) {
                    handleGoLive(scheduledStreams[0].id);
                  }
                }}
              >
                <Play className="h-4 w-4" />
                Start Stream
              </Button>
            )}
          </div>

          {/* Video Player - Show active stream or placeholder */}
          {activeStreams.length > 0 ? (
            activeStreams.map(stream => (
              <Card key={stream.id} className="rounded-xl border-2 border-red-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Stream Player - Prominent */}
                    <div className="lg:col-span-2">
                      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                        {/* Video Container */}
                        <div className="aspect-video relative">
                          {stream.embedUrl && stream.platform === 'youtube' ? (
                            <iframe
                              src={stream.embedUrl.replace('live-stream-id', 'dQw4w9WgXcQ')}
                              className="absolute inset-0 w-full h-full"
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                              allowFullScreen
                              style={{ border: 'none' }}
                            />
                          ) : stream.embedUrl && stream.platform === 'facebook' ? (
                            <iframe
                              src={stream.embedUrl}
                              className="absolute inset-0 w-full h-full"
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                              allowFullScreen
                              style={{ border: 'none' }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                              <div className="text-white text-center z-10">
                                <div className="relative mb-4">
                                  <Video className="h-24 w-24 mx-auto opacity-30" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                                  </div>
                                </div>
                                <p className="text-xl font-semibold mb-2">{stream.title}</p>
                                <p className="text-sm opacity-75">Live Stream Ready</p>
                                <p className="text-xs opacity-50 mt-2">Video player will appear here</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4 z-20">
                            {getStatusBadge(stream.status)}
                          </div>
                          
                          {/* Video Controls Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
                            <div className="flex items-center justify-between text-white">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm font-semibold">{stream.viewerCount.toLocaleString()} watching</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-xs">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-medium">{formatDuration(stream.actualStartTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Control Panel */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{stream.title}</h4>
                        <p className="text-sm text-muted-foreground">{stream.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Viewers</span>
                          </div>
                          <span className="text-xl font-bold">{stream.viewerCount}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Duration</span>
                          </div>
                          <span className="text-sm font-mono">{formatDuration(stream.actualStartTime)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Peak Viewers</span>
                          </div>
                          <span className="text-sm font-bold">{stream.peakViewerCount}</span>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={() => handleEndStream(stream.id)}
                      >
                        <Square className="h-4 w-4" />
                        End Stream
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            /* Placeholder Video Player */
            <Card className="rounded-xl border-2 border-dashed border-gray-300 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Player Placeholder */}
                  <div className="lg:col-span-2">
                    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                      <div className="aspect-video relative flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-white text-center z-10">
                          <div className="relative mb-6">
                            <Video className="h-32 w-32 mx-auto opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-4 w-4 bg-gray-500 rounded-full"></div>
                            </div>
                          </div>
                          <p className="text-2xl font-semibold mb-2">No Active Stream</p>
                          <p className="text-sm opacity-75 mb-4">Start a scheduled stream to begin broadcasting</p>
                          {scheduledStreams.length > 0 && (
                            <Button
                              className="gap-2"
                              onClick={() => handleGoLive(scheduledStreams[0].id)}
                            >
                              <Play className="h-4 w-4" />
                              Start {scheduledStreams[0].title}
                            </Button>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            ⚫ OFFLINE
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Stream Information</h4>
                      <p className="text-sm text-muted-foreground">
                        {scheduledStreams.length > 0 
                          ? `You have ${scheduledStreams.length} scheduled stream${scheduledStreams.length > 1 ? 's' : ''} ready to start.`
                          : 'No streams available. Create a new stream to get started.'}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Viewers</span>
                        </div>
                        <span className="text-xl font-bold">0</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Status</span>
                        </div>
                        <span className="text-sm font-mono">Offline</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stream List */}
        <Tabs defaultValue="scheduled" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="past">Past Streams</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledStreams.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="font-medium">No scheduled streams</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a new stream to get started</p>
                </CardContent>
              </Card>
            ) : (
              scheduledStreams.map(stream => (
                <Card key={stream.id} className="rounded-xl border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {stream.scheduledStartTime 
                              ? new Date(stream.scheduledStartTime).toLocaleString()
                              : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(stream.status)}
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handleGoLive(stream.id)}
                        >
                          <Play className="h-4 w-4" />
                          Start Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastStreams.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="font-medium">No past streams</p>
                  <p className="text-sm text-muted-foreground mt-1">Past streams will appear here</p>
                </CardContent>
              </Card>
            ) : (
              pastStreams.map(stream => (
                <Card key={stream.id} className="rounded-xl border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Ended: {stream.endTime ? new Date(stream.endTime).toLocaleString() : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(stream.status)}
                        <div className="text-sm text-muted-foreground">
                          Peak: {stream.peakViewerCount} viewers
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
