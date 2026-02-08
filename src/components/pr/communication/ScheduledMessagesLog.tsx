import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/pr/shared/StatusBadge';
import { EmptyState } from '@/components/pr/shared/EmptyState';
import { FileText, Calendar, Clock, Users, Repeat } from 'lucide-react';
import { getMessages } from '@/lib/pr-communication-store';
import type { Message } from '@/types/pr-communication';
import '@/styles/pr-communication.css';

const channelLabels: Record<string, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Push',
};

export function ScheduledMessagesLog() {
  const messages = getMessages().filter(m => m.status === 'scheduled' && m.scheduledAt);

  const formatTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Past due';
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'Soon';
  };

  const columns = [
    {
      key: 'message',
      label: 'Message',
      render: (_: unknown, row: Message) => (
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-foreground truncate">
              {row.subject || row.content.substring(0, 60)}
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {channelLabels[row.channel] || row.channel}
            </Badge>
            {(row as any).recurrence && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Repeat className="h-3 w-3" />
                Recurring
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{row.recipientCount} recipients</span>
          </div>
        </div>
      ),
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled Time',
      sortable: true,
      render: (_: unknown, row: Message) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {row.scheduledAt ? new Date(row.scheduledAt).toLocaleDateString() : '—'}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.scheduledAt && new Date(row.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          {row.scheduledAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTimeUntil(row.scheduledAt)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Message) => (
        <StatusBadge status={row.status as any} />
      ),
    },
  ];

  if (messages.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-12">
          <EmptyState
            icon={FileText}
            title="No scheduled messages"
            description="Schedule your first message to see it here"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Messages
            </CardTitle>
            <CardDescription className="mt-1">
              View all scheduled messages and their delivery times
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={messages}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search scheduled messages..."
          emptyMessage="No scheduled messages found"
        />
      </CardContent>
    </Card>
  );
}
