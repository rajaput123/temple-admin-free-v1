import { useState, useMemo } from 'react';
import { scheduleMessage, getMessages, deleteMessage } from '@/lib/pr-communication-store';
import type { MessageChannel } from '@/types/pr-communication';
import { toast } from 'sonner';
import { ScheduledMessageModal } from '@/components/pr/communication/ScheduledMessageModal';
import { ScheduledMessagesLog } from '@/components/pr/communication/ScheduledMessagesLog';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/pr-communication.css';

export default function ScheduledMessages() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSchedule = (data: {
    channel: MessageChannel;
    subject?: string;
    content: string;
    recipientIds: string[];
    scheduledAt: string;
    recurrence?: {
      type: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      endDate?: string;
    };
  }) => {
    scheduleMessage({
      type: 'scheduled',
      channel: data.channel,
      subject: data.subject,
      content: data.content,
      recipientIds: data.recipientIds,
      recipientCount: data.recipientIds.length,
      status: 'scheduled',
      scheduledAt: data.scheduledAt,
      requiresApproval: false,
      createdBy: 'current-user',
      recurrence: data.recurrence,
    } as any);

    toast.success('Message scheduled successfully', {
      description: `Scheduled for ${new Date(data.scheduledAt).toLocaleString()}`,
    });
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Messages</h1>
          <p className="text-muted-foreground mt-1">
            Schedule messages to be sent at a specific time or on a recurring basis
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Calendar className="h-5 w-5" />
          Schedule Message
        </Button>
      </div>

      {/* Scheduled Messages Table */}
      <ScheduledMessagesLog />

      {/* Schedule Modal */}
      <ScheduledMessageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSchedule={handleSchedule}
      />
    </div>
  );
}
