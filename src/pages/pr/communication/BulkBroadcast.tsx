import { useState } from 'react';
import { sendBulkBroadcast, getMessages } from '@/lib/pr-communication-store';
import type { MessageChannel, AudienceFilter } from '@/types/pr-communication';
import { toast } from 'sonner';
import { BulkBroadcastModal } from '@/components/pr/communication/BulkBroadcastModal';
import { BulkBroadcastLog } from '@/components/pr/communication/BulkBroadcastLog';
import { Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/pr-communication.css';

export default function BulkBroadcast() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSend = (data: {
    channel: MessageChannel;
    subject?: string;
    content: string;
    audienceFilter: AudienceFilter;
    recipientCount: number;
  }) => {
    sendBulkBroadcast({
      type: 'bulk',
      channel: data.channel,
      subject: data.subject,
      content: data.content,
      recipientIds: [],
      recipientCount: data.recipientCount,
      status: 'sent',
      sentAt: new Date().toISOString(),
      costEstimate: data.channel === 'sms' ? data.recipientCount * 0.5 : undefined,
      requiresApproval: data.recipientCount > 1000,
      createdBy: 'current-user',
      audienceFilter: data.audienceFilter,
    });

    toast.success(`Bulk message sent to ${data.recipientCount.toLocaleString()} recipients`, {
      description: `Sent via ${data.channel.toUpperCase()}`,
    });
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Broadcast</h1>
          <p className="text-muted-foreground mt-1">
            Send messages to large groups of recipients at once
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Send className="h-5 w-5" />
          Create Bulk Broadcast
        </Button>
      </div>

      {/* Bulk Broadcast Logs Table */}
      <BulkBroadcastLog />

      {/* Bulk Broadcast Modal */}
      <BulkBroadcastModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSend={handleSend}
      />
    </div>
  );
}
