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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Users, X, AlertCircle, MessageSquare, Mail, 
  Smartphone, Bell, MessageCircle, Search, Check, Loader2,
  Info, ChevronDown, FileText
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

interface ComposeMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: {
    channel: MessageChannel;
    subject?: string;
    content: string;
    recipientIds: string[];
    templateId?: string;
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

export function ComposeMessageModal({ open, onOpenChange, onSend }: ComposeMessageModalProps) {
  const employees = getEmployees();
  const templates = getTemplates();
  
  // Form State
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [errors, setErrors] = useState<{
    recipients?: string;
    subject?: string;
    content?: string;
  }>({});
  const [isSending, setIsSending] = useState(false);
  
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    onSend({
      channel,
      subject: channel === 'email' ? subject : undefined,
      content,
      recipientIds: selectedRecipients,
      templateId: selectedTemplate || undefined,
    });

    // Reset form
    setContent('');
    setSubject('');
    setSelectedRecipients([]);
    setSelectedTemplate('');
    setErrors({});
    setIsSending(false);
  };

  const handleClose = () => {
    if (!isSending) {
      setContent('');
      setSubject('');
      setSelectedRecipients([]);
      setSelectedTemplate('');
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
            <MessageSquare className="h-5 w-5" />
            Compose Message
          </DialogTitle>
          <DialogDescription>
            Select participants, choose a channel, and write your message
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecipientToggle(emp.id);
                              }}
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
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
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedRecipients.length === employees.length ? "opacity-100" : "opacity-0"
                          )}
                        />
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
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
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
                setErrors(prev => ({ ...prev, subject: undefined }));
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

          {/* Step 3: Message Content */}
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
                    // Clear template selection if user manually edits subject
                    if (selectedTemplate) {
                      setSelectedTemplate('');
                    }
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
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || selectedRecipients.length === 0 || !content.trim() || (channel === 'email' && !subject.trim())}
            className="gap-2 min-w-[140px]"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
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
