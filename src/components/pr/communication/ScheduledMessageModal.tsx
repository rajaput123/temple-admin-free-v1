import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Users, AlertCircle, MessageSquare, Mail, 
  Smartphone, Bell, MessageCircle, Loader2,
  Info, Clock, Repeat, FileText
} from 'lucide-react';
import { getEmployees } from '@/lib/hr-employee-store';
import { getTemplates } from '@/lib/pr-communication-store';
import type { MessageChannel, MessageTemplate } from '@/types/pr-communication';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import '@/styles/pr-communication.css';

interface ScheduledMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: {
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
  }) => void;
}

const channelIcons = {
  sms: Smartphone,
  email: Mail,
  whatsapp: MessageCircle,
  push: Bell,
};

const channelLabels = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Push Notification',
};

const recurrenceTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// Common email subject templates
const emailSubjectTemplates = [
  'Important Announcement',
  'Event Reminder',
  'Meeting Invitation',
  'Update Notification',
  'Thank You Message',
  'Welcome Message',
  'Payment Reminder',
  'Service Update',
];

export function ScheduledMessageModal({ open, onOpenChange, onSchedule }: ScheduledMessageModalProps) {
  const employees = getEmployees();
  const templates = getTemplates();
  
  // Form State
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [errors, setErrors] = useState<{
    recipients?: string;
    subject?: string;
    content?: string;
    scheduledAt?: string;
  }>({});
  const [isScheduling, setIsScheduling] = useState(false);
  
  // UI State for dropdowns
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [subjectTemplateOpen, setSubjectTemplateOpen] = useState(false);
  const [messageTemplateOpen, setMessageTemplateOpen] = useState(false);

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
      setErrors({});
      setMessageTemplateOpen(false);
    }
  };

  const handleRecipientToggle = (employeeId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
    if (errors.recipients) {
      setErrors(prev => ({ ...prev, recipients: undefined }));
    }
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipients.length === employees.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(employees.map(emp => emp.id));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (selectedRecipients.length === 0) {
      newErrors.recipients = 'Please select at least one recipient';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Message content is required';
    }
    
    if (channel === 'email' && !subject.trim()) {
      newErrors.subject = 'Email subject is required';
    }

    if (!scheduledAt || !scheduledTime) {
      newErrors.scheduledAt = 'Scheduled date and time are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      return;
    }

    setIsScheduling(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const scheduledDateTime = `${scheduledAt}T${scheduledTime}`;

    onSchedule({
      channel,
      subject: channel === 'email' ? subject : undefined,
      content,
      recipientIds: selectedRecipients,
      scheduledAt: scheduledDateTime,
      recurrence: isRecurring ? {
        type: recurrenceType,
        interval: parseInt(recurrenceInterval) || 1,
        endDate: recurrenceEndDate || undefined,
      } : undefined,
    });

    // Reset form
    setContent('');
    setSubject('');
    setSelectedRecipients([]);
    setSelectedTemplate('');
    setScheduledAt('');
    setScheduledTime('');
    setIsRecurring(false);
    setRecurrenceType('daily');
    setRecurrenceInterval('1');
    setRecurrenceEndDate('');
    setErrors({});
    setIsScheduling(false);
  };

  const handleClose = () => {
    if (!isScheduling) {
      setContent('');
      setSubject('');
      setSelectedRecipients([]);
      setSelectedTemplate('');
      setScheduledAt('');
      setScheduledTime('');
      setIsRecurring(false);
      setRecurrenceType('daily');
      setRecurrenceInterval('1');
      setRecurrenceEndDate('');
      setErrors({});
      onOpenChange(false);
    }
  };

  const getCharacterCount = () => content.length;
  const getSmsCount = () => channel === 'sms' ? Math.ceil(content.length / 160) : 0;
  const isSmsLimitExceeded = channel === 'sms' && content.length > 160;
  const ChannelIcon = channelIcons[channel];
  const selectedRecipientsData = employees.filter(emp => selectedRecipients.includes(emp.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Message
          </DialogTitle>
          <DialogDescription>
            Select participants, choose a channel, compose your message, and set the schedule
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Step 1: Select Participants - Dropdown */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Participants <span className="text-destructive">*</span>
            </Label>
            
            <Popover open={participantsOpen} onOpenChange={setParticipantsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={participantsOpen}
                  className="w-full justify-between h-auto min-h-[42px] py-2"
                >
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    {selectedRecipients.length === 0 ? (
                      <span className="text-muted-foreground">Select participants...</span>
                    ) : (
                      <>
                        {selectedRecipientsData.slice(0, 2).map(emp => (
                          <Badge key={emp.id} variant="secondary" className="gap-1">
                            {emp.name}
                          </Badge>
                        ))}
                        {selectedRecipients.length > 2 && (
                          <Badge variant="secondary">
                            +{selectedRecipients.length - 2} more
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search participants..." />
                  <CommandList>
                    <CommandEmpty>No participants found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleSelectAllRecipients}
                        className="font-semibold"
                      >
                        {selectedRecipients.length === employees.length ? 'Deselect All' : 'Select All'}
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup>
                      {employees.map((employee) => {
                        const isSelected = selectedRecipients.includes(employee.id);
                        return (
                          <CommandItem
                            key={employee.id}
                            value={`${employee.name} ${employee.email || ''}`}
                            onSelect={() => handleRecipientToggle(employee.id)}
                          >
                            <div className={cn(
                              "mr-2 h-4 w-4 flex items-center justify-center",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}>
                              {isSelected && '✓'}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{employee.name}</div>
                              {employee.email && (
                                <div className="text-xs text-muted-foreground">{employee.email}</div>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {errors.recipients && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.recipients}</span>
              </div>
            )}

            {selectedRecipients.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {selectedRecipients.length} participant{selectedRecipients.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Step 2: Select Channel - Dropdown */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Select Channel <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={channel} 
              onValueChange={(value) => {
                setChannel(value as MessageChannel);
                setSelectedTemplate('');
              }}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <ChannelIcon className="h-4 w-4" />
                  <SelectValue placeholder="Select a channel..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>SMS</span>
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                </SelectItem>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </div>
                </SelectItem>
                <SelectItem value="push">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Push Notification</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Selection */}
          {filteredTemplates.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Use Template <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
              </Label>
              <Popover open={messageTemplateOpen} onOpenChange={setMessageTemplateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedTemplate ? (
                      <span className="truncate">
                        {templates.find(t => t.id === selectedTemplate)?.name || 'Select template...'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select a template...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search templates..." />
                    <CommandList>
                      <CommandEmpty>No templates found for this channel.</CommandEmpty>
                      <CommandGroup>
                        {filteredTemplates.map((template) => (
                          <CommandItem
                            key={template.id}
                            onSelect={() => handleTemplateSelect(template.id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex-1">
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {template.content.substring(0, 50)}...
                                </div>
                              </div>
                              {selectedTemplate === template.id && (
                                <Badge variant="secondary" className="ml-2 text-xs">Selected</Badge>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedTemplate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Template loaded
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      setSelectedTemplate('');
                      setContent('');
                      setSubject('');
                    }}
                  >
                    Clear Template
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule Time */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    if (errors.scheduledAt) {
                      setErrors(prev => ({ ...prev, scheduledAt: undefined }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.scheduledAt ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Time</Label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => {
                    setScheduledTime(e.target.value);
                    if (errors.scheduledAt) {
                      setErrors(prev => ({ ...prev, scheduledAt: undefined }));
                    }
                  }}
                  className={errors.scheduledAt ? 'border-destructive' : ''}
                />
              </div>
            </div>
            {errors.scheduledAt && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.scheduledAt}</span>
              </div>
            )}

            {/* Recurrence */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recurring Message
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={isRecurring ? 'bg-primary/10' : ''}
                >
                  {isRecurring ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              {isRecurring && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Recurrence Type</Label>
                      <Select 
                        value={recurrenceType} 
                        onValueChange={(value) => setRecurrenceType(value as typeof recurrenceType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {recurrenceTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Interval</Label>
                      <Input
                        type="number"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      min={scheduledAt || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Message Content */}
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            {channel === 'email' && (
              <div className="space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subject" className="text-base font-semibold">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={subjectTemplateOpen} onOpenChange={setSubjectTemplateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Use Template
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search templates..." />
                        <CommandList>
                          <CommandEmpty>No templates found.</CommandEmpty>
                          <CommandGroup>
                            {emailSubjectTemplates.map((template) => (
                              <CommandItem
                                key={template}
                                onSelect={() => {
                                  setSubject(template);
                                  setSubjectTemplateOpen(false);
                                  if (errors.subject) {
                                    setErrors(prev => ({ ...prev, subject: undefined }));
                                  }
                                }}
                              >
                                {template}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) {
                      setErrors(prev => ({ ...prev, subject: undefined }));
                    }
                  }}
                  placeholder="Enter email subject line"
                  className={errors.subject ? 'border-destructive' : ''}
                />
                {errors.subject && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.subject}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 flex flex-col space-y-2 min-h-0">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-base font-semibold">
                  Message <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {channel === 'sms' && (
                    <div className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      <span>160 chars/SMS</span>
                    </div>
                  )}
                  <span className={isSmsLimitExceeded ? 'text-amber-600 font-semibold' : ''}>
                    {getCharacterCount()} {channel === 'sms' ? '/ 160' : ''} chars
                  </span>
                  {channel === 'sms' && (
                    <span className={getSmsCount() > 1 ? 'text-amber-600 font-semibold' : ''}>
                      {getSmsCount()} SMS
                    </span>
                  )}
                </div>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  // Clear template selection if user manually edits content
                  if (selectedTemplate) {
                    setSelectedTemplate('');
                  }
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: undefined }));
                  }
                }}
                placeholder="Type your message here..."
                className={`flex-1 resize-none ${errors.content ? 'border-destructive' : ''} ${isSmsLimitExceeded ? 'border-amber-500' : ''}`}
              />
              {errors.content && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.content}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isScheduling}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isScheduling || selectedRecipients.length === 0 || !content.trim() || (channel === 'email' && !subject.trim()) || !scheduledAt || !scheduledTime}
            className="gap-2 min-w-[140px]"
          >
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Schedule Message
                {selectedRecipients.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedRecipients.length}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
