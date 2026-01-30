import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Send } from 'lucide-react';
import { dummyDevoteeMessages } from '@/data/communications-data';
import type { DevoteeMessage, DeliveryStatus } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';
import { DevoteeMessageModal } from '@/components/pr/DevoteeMessageModal';

const deliveryStatusColors: Record<DeliveryStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  read: 'bg-purple-100 text-purple-700',
};

export default function DevoteeCommunication() {
  const { checkWriteAccess } = usePermissions();
  const [messages, setMessages] = useState<DevoteeMessage[]>(dummyDevoteeMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<DevoteeMessage | null>(null);

  const canWrite = checkWriteAccess('communications');

  const handleCreate = () => {
    setEditingMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (message: DevoteeMessage) => {
    setEditingMessage(message);
    setIsModalOpen(true);
  };

  const handleSave = (data: Partial<DevoteeMessage>) => {
    if (editingMessage) {
      setMessages(messages.map(m => m.id === editingMessage.id ? { ...m, ...data } as DevoteeMessage : m));
    } else {
      const newMessage: DevoteeMessage = {
        id: `msg-${Date.now()}`,
        messageType: data.messageType || 'booking_confirmation',
        content: data.content || '',
        recipientType: data.recipientType || 'individual',
        recipientIds: data.recipientIds || [],
        channels: data.channels || [],
        deliveryStatus: 'pending',
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        ...data,
      };
      setMessages([...messages, newMessage]);
    }
    setIsModalOpen(false);
    setEditingMessage(null);
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'messageType',
      label: 'Type',
      sortable: true,
      render: (value: unknown, row: DevoteeMessage) => (
        <Badge variant="outline">{row.messageType.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'subject',
      label: 'Subject / Content',
      render: (value: unknown, row: DevoteeMessage) => (
        <div className="max-w-md">
          {row.subject && (
            <div className="font-medium text-gray-900">{row.subject}</div>
          )}
          <div className="text-sm text-gray-600 truncate mt-0.5">{row.content}</div>
        </div>
      ),
    },
    {
      key: 'recipientType',
      label: 'Recipients',
      sortable: true,
      render: (value: unknown, row: DevoteeMessage) => (
        <div className="text-sm">
          <div className="font-medium">{row.recipientType}</div>
          {row.recipientIds && (
            <div className="text-xs text-gray-500">{row.recipientIds.length} recipients</div>
          )}
        </div>
      ),
    },
    {
      key: 'channels',
      label: 'Channels',
      render: (value: unknown, row: DevoteeMessage) => (
        <div className="flex flex-wrap gap-1">
          {row.channels.map((ch: string) => (
            <Badge key={ch} variant="outline" className="text-xs">
              {ch.toUpperCase()}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'deliveryStatus',
      label: 'Delivery Status',
      sortable: true,
      render: (value: unknown, row: DevoteeMessage) => (
        <Badge className={deliveryStatusColors[row.deliveryStatus]}>
          {row.deliveryStatus}
        </Badge>
      ),
    },
    {
      key: 'sentAt',
      label: 'Sent At',
      sortable: true,
      render: (value: unknown, row: DevoteeMessage) => (
        <div className="text-sm">
          {row.sentAt
            ? new Date(row.sentAt).toLocaleString()
            : row.scheduledAt
            ? `Scheduled: ${new Date(row.scheduledAt).toLocaleString()}`
            : 'Not sent'}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Devotee Communication"
        description="Manage targeted messaging to devotees based on bookings, seva, and festivals"
        actions={
          canWrite ? (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total Messages</div>
            <div className="text-2xl font-bold mt-1">{messages.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Delivered</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {messages.filter(m => m.deliveryStatus === 'delivered').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {messages.filter(m => m.deliveryStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Failed</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {messages.filter(m => m.deliveryStatus === 'failed').length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable 
          data={filteredMessages} 
          columns={columns}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      </div>

      {/* Devotee Message Modal */}
      <DevoteeMessageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        message={editingMessage}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
