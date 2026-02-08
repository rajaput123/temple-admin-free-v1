import { useState } from 'react';
import { createMessage } from '@/lib/pr-communication-store';
import type { MessageChannel } from '@/types/pr-communication';
import { toast } from 'sonner';
import { MessageLog } from '@/components/pr/communication/MessageLog';
import { ComposeMessageModal } from '@/components/pr/communication/ComposeMessageModal';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import '@/styles/pr-communication.css';

export default function ManualMessages() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const handleSend = (data: {
    channel: MessageChannel;
    subject?: string;
    content: string;
    recipientIds: string[];
    templateId?: string;
  }) => {
    const costEstimate = data.channel === 'sms' ? data.recipientIds.length * 0.5 : undefined;

    createMessage({
      type: 'manual',
      channel: data.channel,
      subject: data.subject,
      content: data.content,
      recipientIds: data.recipientIds,
      recipientCount: data.recipientIds.length,
      status: 'sent',
      sentAt: new Date().toISOString(),
      costEstimate,
      requiresApproval: false,
      createdBy: 'current-user',
      templateId: data.templateId,
    });

    toast.success(`Message sent to ${data.recipientIds.length} recipient(s)`, {
      description: `Sent via ${data.channel.toUpperCase()}`,
    });
    
    setIsComposeOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manual Messages</h1>
          <p className="text-muted-foreground mt-1">
            Send personalized messages to recipients and track delivery status
          </p>
        </div>
        <Button 
          onClick={() => setIsComposeOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Send className="h-5 w-5" />
          Compose Message
        </Button>
      </div>

      {/* Delivery Logs Table */}
      <MessageLog />

      {/* Compose Modal */}
      <ComposeMessageModal
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
        onSend={handleSend}
      />
    </div>
  );
}
