import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/pr/shared/StatusBadge';
import { EmptyState } from '@/components/pr/shared/EmptyState';
import { FileText, MessageSquare, Clock, Users } from 'lucide-react';
import { getMessages, getDeliveryReports } from '@/lib/pr-communication-store';
import { getEmployees } from '@/lib/hr-employee-store';
import type { Message } from '@/types/pr-communication';
import '@/styles/pr-communication.css';

const channelLabels: Record<string, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Push',
};

export function MessageLog() {
  const messages = getMessages().filter(m => m.type === 'manual');
  const deliveryReports = getDeliveryReports();
  const employees = getEmployees();

  const getRecipientName = (recipientId: string) => {
    const employee = employees.find(e => e.id === recipientId);
    return employee?.name || recipientId;
  };

  const getDeliveryStatus = (messageId: string, recipientId: string) => {
    const report = deliveryReports.find(r => r.messageId === messageId && r.recipientId === recipientId);
    return report?.status || 'sent';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
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
          </div>
          {row.subject && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              {row.content.substring(0, 80)}...
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'recipient',
      label: 'Recipients',
      render: (_: unknown, row: Message) => {
        const recipientId = row.recipientIds[0];
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {getRecipientName(recipientId)}
            </div>
            {row.recipientCount > 1 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>+{row.recipientCount - 1} more</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Message) => {
        const recipientId = row.recipientIds[0];
        const status = getDeliveryStatus(row.id, recipientId);
        return <StatusBadge status={status as any} />;
      },
    },
    {
      key: 'timestamp',
      label: 'Sent',
      sortable: true,
      render: (_: unknown, row: Message) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{row.sentAt ? formatDate(row.sentAt) : '—'}</span>
        </div>
      ),
    },
  ];

  if (messages.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-12">
          <EmptyState
            icon={FileText}
            title="No messages sent yet"
            description="Send your first manual message to see the delivery log here"
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
              <MessageSquare className="h-5 w-5" />
              Delivery Log
            </CardTitle>
            <CardDescription className="mt-1">
              View all sent messages and their delivery status
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
          searchPlaceholder="Search messages, recipients, or channels..."
          emptyMessage="No messages found"
        />
      </CardContent>
    </Card>
  );
}
