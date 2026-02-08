import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RecurrenceRuleBuilder } from './RecurrenceRuleBuilder';
import { Calendar, Clock, Zap, FileText, X } from 'lucide-react';
import type { Message, MessageChannel, RecurrenceRule, AudienceFilter } from '@/types/pr-communication';
import { scheduleMessage, getTemplates } from '@/lib/pr-communication-store';
import { toast } from 'sonner';

interface ScheduledMessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: Message | null;
  onSave: () => void;
}

export function ScheduledMessageForm({ open, onOpenChange, message, onSave }: ScheduledMessageFormProps) {
  const templates = getTemplates();
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);
  const [audienceType, setAudienceType] = useState<'all' | 'donors' | 'volunteers' | 'custom'>('all');
  const [triggerType, setTriggerType] = useState<'manual' | 'donation' | 'event' | 'custom'>('manual');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => t.channel === channel);
  }, [channel, templates]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setContent(template.content);
      if (template.subject) {
        setSubject(template.subject);
      }
      setChannel(template.channel);
    }
  };

  const handleClearTemplate = () => {
    setSelectedTemplate('');
    setContent('');
    setSubject('');
  };

  useEffect(() => {
    if (message) {
      setChannel(message.channel);
      setSubject(message.subject || '');
      setContent(message.content);
      setScheduledAt(message.scheduledAt ? new Date(message.scheduledAt).toISOString().split('T')[0] : '');
      setScheduledTime(message.scheduledAt ? new Date(message.scheduledAt).toTimeString().slice(0, 5) : '');
      setIsRecurring(!!(message as any).recurrence);
      setRecurrenceRule((message as any).recurrence || null);
    } else {
      // Set default scheduled time to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledAt(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('09:00');
    }
  }, [message]);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please enter message content');
      return;
    }
    if (channel === 'email' && !subject.trim()) {
      toast.error('Please enter email subject');
      return;
    }
    if (!scheduledAt || !scheduledTime) {
      toast.error('Please select scheduled date and time');
      return;
    }
    if (isRecurring && !recurrenceRule) {
      toast.error('Please configure recurrence rule');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`).toISOString();

    const audienceFilter: AudienceFilter = {
      type: audienceType,
    };

    const messageData: Omit<Message, 'id' | 'createdAt'> = {
      type: 'scheduled',
      channel,
      subject: channel === 'email' ? subject : undefined,
      content,
      recipientIds: [],
      recipientCount: 0, // Will be calculated based on audience
      status: 'scheduled',
      scheduledAt: scheduledDateTime,
      requiresApproval: false,
      createdBy: 'current-user',
      ...(isRecurring && recurrenceRule && { recurrence: recurrenceRule } as any),
    };

    scheduleMessage(messageData as any);
    toast.success(isRecurring ? 'Recurring message scheduled' : 'Message scheduled');
    onSave();
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setChannel('sms');
    setSubject('');
    setContent('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledAt(tomorrow.toISOString().split('T')[0]);
    setScheduledTime('09:00');
    setIsRecurring(false);
    setRecurrenceRule(null);
    setAudienceType('all');
    setTriggerType('manual');
    setTriggerEvent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{message ? 'Edit Scheduled Message' : 'Schedule New Message'}</DialogTitle>
          <DialogDescription>
            Create a one-time or recurring scheduled message
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Template Selector */}
            {filteredTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Use Template (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.channel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9"
                      onClick={handleClearTemplate}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedTemplate && (
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Template loaded
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Channel *</Label>
              <Select value={channel} onValueChange={(v) => {
                setChannel(v as MessageChannel);
                setSelectedTemplate('');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {channel === 'email' && (
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Content *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message"
                rows={6}
              />
              {channel === 'sms' && (
                <p className="text-xs text-muted-foreground">
                  {content.length} / 160 characters
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Recurring Message</Label>
                <p className="text-xs text-muted-foreground">Send this message repeatedly based on a schedule</p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {!isRecurring ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Scheduled for:</span>
                    <span>
                      {scheduledAt && scheduledTime
                        ? new Date(`${scheduledAt}T${scheduledTime}`).toLocaleString()
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                <RecurrenceRuleBuilder
                  value={recurrenceRule || undefined}
                  onChange={setRecurrenceRule}
                />
              </div>
            )}

            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-medium">Trigger-Based Automation (Optional)</Label>
              </div>
              <div className="space-y-3">
                <Select value={triggerType} onValueChange={(v) => setTriggerType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (Schedule Only)</SelectItem>
                    <SelectItem value="donation">After Donation</SelectItem>
                    <SelectItem value="event">After Event Registration</SelectItem>
                    <SelectItem value="custom">Custom Trigger</SelectItem>
                  </SelectContent>
                </Select>
                {triggerType !== 'manual' && (
                  <Input
                    placeholder="Enter trigger event name or ID"
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  {triggerType === 'donation' && 'Message will be sent automatically after a donation is received'}
                  {triggerType === 'event' && 'Message will be sent automatically after event registration'}
                  {triggerType === 'custom' && 'Configure custom trigger logic'}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={audienceType} onValueChange={(v) => setAudienceType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devotees</SelectItem>
                  <SelectItem value="donors">Donors</SelectItem>
                  <SelectItem value="volunteers">Volunteers</SelectItem>
                  <SelectItem value="custom">Custom Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-sm">
                <span className="font-medium">Recipient Count:</span>
                <span className="ml-2">
                  {audienceType === 'all' ? '~5,000' :
                   audienceType === 'donors' ? '~1,200' :
                   audienceType === 'volunteers' ? '~300' : 'Custom'}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
