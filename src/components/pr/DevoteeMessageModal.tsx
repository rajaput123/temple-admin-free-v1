import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { DevoteeMessage, CommunicationChannel } from '@/types/communications';

interface DevoteeMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: DevoteeMessage | null;
  onSave: (data: Partial<DevoteeMessage>) => void;
}

const messageTypes: DevoteeMessage['messageType'][] = ['booking_confirmation', 'reminder', 'delay_alert', 'reschedule', 'general'];
const recipientTypes: DevoteeMessage['recipientType'][] = ['individual', 'group', 'all'];
const channels: CommunicationChannel[] = ['sms', 'whatsapp', 'email', 'app'];

export function DevoteeMessageModal({
  open,
  onOpenChange,
  message,
  onSave,
}: DevoteeMessageModalProps) {
  const [formData, setFormData] = useState({
    messageType: 'booking_confirmation' as DevoteeMessage['messageType'],
    subject: '',
    content: '',
    recipientType: 'individual' as DevoteeMessage['recipientType'],
    recipientIds: [] as string[],
    channels: [] as CommunicationChannel[],
    scheduledAt: '',
  });

  useEffect(() => {
    if (message) {
      setFormData({
        messageType: message.messageType,
        subject: message.subject || '',
        content: message.content,
        recipientType: message.recipientType,
        recipientIds: message.recipientIds || [],
        channels: message.channels,
        scheduledAt: message.scheduledAt ? new Date(message.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setFormData({
        messageType: 'booking_confirmation',
        subject: '',
        content: '',
        recipientType: 'individual',
        recipientIds: [],
        channels: [],
        scheduledAt: '',
      });
    }
  }, [message, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
    });
  };

  const toggleChannel = (channel: CommunicationChannel) => {
    setFormData({
      ...formData,
      channels: formData.channels.includes(channel)
        ? formData.channels.filter(c => c !== channel)
        : [...formData.channels, channel],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{message ? 'Edit Message' : 'New Devotee Message'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type *</Label>
                <Select
                  value={formData.messageType}
                  onValueChange={(value) => setFormData({ ...formData, messageType: value as DevoteeMessage['messageType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipient Type</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) => setFormData({ ...formData, recipientType: value as DevoteeMessage['recipientType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="grid grid-cols-2 gap-2">
                  {channels.map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel}
                        checked={formData.channels.includes(channel)}
                        onCheckedChange={() => toggleChannel(channel)}
                      />
                      <Label
                        htmlFor={channel}
                        className="text-sm font-normal cursor-pointer uppercase"
                      >
                        {channel}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="recipientIds">Recipient IDs (comma-separated)</Label>
                <Input
                  id="recipientIds"
                  value={formData.recipientIds.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    recipientIds: e.target.value.split(',').map(id => id.trim()).filter(id => id) 
                  })}
                  placeholder="Enter recipient IDs separated by commas"
                />
                <p className="text-xs text-gray-500">
                  {formData.recipientIds.length} recipient(s) selected
                </p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter message subject (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter message content"
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule Send Time (optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to send immediately
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="outline">
              Save Draft
            </Button>
            {formData.scheduledAt ? (
              <Button type="submit">
                Schedule
              </Button>
            ) : (
              <Button type="submit">
                Send Now
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
