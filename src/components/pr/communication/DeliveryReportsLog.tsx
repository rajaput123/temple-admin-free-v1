import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, CheckCircle2, XCircle, Clock, RefreshCw, Eye, MousePointerClick,
  Filter, BarChart3
} from 'lucide-react';
import { getDeliveryReports, getMessages, updateDeliveryReport } from '@/lib/pr-communication-store';
import type { DeliveryReport } from '@/types/pr-communication';
import { toast } from 'sonner';
import '@/styles/pr-communication.css';

export function DeliveryReportsLog() {
  const [reports, setReports] = useState(getDeliveryReports());
  const messages = getMessages();
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const refreshReports = () => {
    setReports(getDeliveryReports());
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || report.channel === channelFilter;
      return matchesStatus && matchesChannel;
    });
  }, [reports, statusFilter, channelFilter]);

  const stats = useMemo(() => {
    const sent = reports.filter(r => r.status === 'sent' || r.status === 'delivered').length;
    const delivered = reports.filter(r => r.status === 'delivered').length;
    const failed = reports.filter(r => r.status === 'failed' || r.status === 'bounced').length;
    const successRate = reports.length > 0 ? (delivered / reports.length) * 100 : 0;
    
    const emailReports = reports.filter(r => r.channel === 'email');
    const opened = emailReports.filter(r => r.openedAt).length;
    const clicked = emailReports.filter(r => r.clickedAt).length;
    const openRate = emailReports.length > 0 ? (opened / emailReports.length) * 100 : 0;
    const clickRate = emailReports.length > 0 ? (clicked / emailReports.length) * 100 : 0;
    
    return { sent, delivered, failed, successRate, opened, clicked, openRate, clickRate, emailCount: emailReports.length };
  }, [reports]);

  const handleRetry = (reportId: string) => {
    setRetryingIds(prev => new Set(prev).add(reportId));
    
    setTimeout(() => {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        updateDeliveryReport(reportId, {
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
        toast.success('Message retry initiated');
        refreshReports();
      }
      setRetryingIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }, 1000);
  };

  const getStatusColor = (status: DeliveryReport['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'bounced': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: DeliveryReport['status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'bounced': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const columns = [
    {
      key: 'messageId',
      label: 'Message',
      render: (_: unknown, row: DeliveryReport) => {
        const message = messages.find(m => m.id === row.messageId);
        return (
          <div>
            <div className="font-medium text-sm">
              {message?.subject || message?.content.substring(0, 50) || 'Unknown message'}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.channel.toUpperCase()}
            </div>
          </div>
        );
      },
    },
    {
      key: 'recipientId',
      label: 'Recipient',
      render: (_: unknown, row: DeliveryReport) => (
        <div className="text-sm">{row.recipientId}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: DeliveryReport) => (
        <Badge className={`${getStatusColor(row.status)} text-xs`} variant="outline">
          <div className="flex items-center gap-1">
            {getStatusIcon(row.status)}
            {row.status}
          </div>
        </Badge>
      ),
    },
    {
      key: 'sentAt',
      label: 'Sent At',
      sortable: true,
      render: (_: unknown, row: DeliveryReport) => (
        <div className="text-sm">
          {new Date(row.sentAt).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'deliveredAt',
      label: 'Delivered At',
      render: (_: unknown, row: DeliveryReport) => (
        <div className="text-sm">
          {row.deliveredAt ? new Date(row.deliveredAt).toLocaleString() : '—'}
        </div>
      ),
    },
    ...(reports.some(r => r.channel === 'email') ? [
      {
        key: 'openedAt',
        label: 'Opened',
        render: (_: unknown, row: DeliveryReport) => (
          row.channel === 'email' ? (
            <div className="text-sm">
              {row.openedAt ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Eye className="h-3 w-3" />
                  {new Date(row.openedAt).toLocaleString()}
                </div>
              ) : (
                <span className="text-muted-foreground">Not opened</span>
              )}
            </div>
          ) : <span className="text-muted-foreground">—</span>
        ),
      },
      {
        key: 'clickedAt',
        label: 'Clicked',
        render: (_: unknown, row: DeliveryReport) => (
          row.channel === 'email' ? (
            <div className="text-sm">
              {row.clickedAt ? (
                <div className="flex items-center gap-1 text-blue-600">
                  <MousePointerClick className="h-3 w-3" />
                  {new Date(row.clickedAt).toLocaleString()}
                </div>
              ) : (
                <span className="text-muted-foreground">Not clicked</span>
              )}
            </div>
          ) : <span className="text-muted-foreground">—</span>
        ),
      },
    ] : []),
    {
      key: 'cost',
      label: 'Cost',
      render: (_: unknown, row: DeliveryReport) => (
        <div className="text-sm">
          {row.cost ? `₹${row.cost.toFixed(2)}` : '—'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: DeliveryReport) => (
        (row.status === 'failed' || row.status === 'bounced') ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRetry(row.id)}
            disabled={retryingIds.has(row.id)}
            className="gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${retryingIds.has(row.id) ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-${stats.emailCount > 0 ? '6' : '4'} gap-2`}>
        <Card className="rounded-lg border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sent</p>
                <p className="text-lg font-semibold mt-0.5">{stats.sent}</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-lg font-semibold text-green-600 mt-0.5">{stats.delivered}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-lg font-semibold text-red-600 mt-0.5">{stats.failed}</p>
              </div>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-semibold mt-0.5">{stats.successRate.toFixed(1)}%</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-[10px]">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.emailCount > 0 && (
          <>
            <Card className="rounded-lg border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Open Rate</p>
                    <p className="text-lg font-semibold text-blue-600 mt-0.5">{stats.openRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stats.opened} opened</p>
                  </div>
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Click Rate</p>
                    <p className="text-lg font-semibold text-purple-600 mt-0.5">{stats.clickRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stats.clicked} clicked</p>
                  </div>
                  <MousePointerClick className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Status:</Label>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Channel:</Label>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Delivery Reports
              </CardTitle>
              <CardDescription className="mt-1">
                View detailed delivery status and engagement metrics
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filteredReports}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search delivery reports..."
            emptyMessage="No delivery reports found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
