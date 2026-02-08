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
  Send, Users, AlertCircle, MessageSquare, Mail, 
  Smartphone, Bell, MessageCircle, Loader2,
  Info, DollarSign, FileText
} from 'lucide-react';
import { getTemplates } from '@/lib/pr-communication-store';
import type { MessageChannel, AudienceFilter, MessageTemplate } from '@/types/pr-communication';
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

interface BulkBroadcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: {
    channel: MessageChannel;
    subject?: string;
    content: string;
    audienceFilter: AudienceFilter;
    recipientCount: number;
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

const audienceOptions = [
  { value: 'all', label: 'All Devotees', count: '~5,000' },
  { value: 'donors', label: 'Donors', count: '~1,200' },
  { value: 'volunteers', label: 'Volunteers', count: '~300' },
  { value: 'custom', label: 'Custom Segment', count: 'Custom' },
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

// Mock cities, events, tags for custom segment
const availableCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
const availableEvents = ['Maha Shivaratri', 'Diwali', 'Holi', 'Navratri', 'Janmashtami', 'Ram Navami'];
const availableTags = ['VIP', 'Regular', 'Premium', 'New Member', 'Active', 'Inactive'];

export function BulkBroadcastModal({ open, onOpenChange, onSend }: BulkBroadcastModalProps) {
  const templates = getTemplates();
  
  // Form State
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'donors' | 'volunteers' | 'custom'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [errors, setErrors] = useState<{
    audience?: string;
    subject?: string;
    content?: string;
  }>({});
  const [isSending, setIsSending] = useState(false);
  
  // Advanced filters
  const [donorMinAmount, setDonorMinAmount] = useState('');
  const [donorMaxAmount, setDonorMaxAmount] = useState('');
  const [donorDateFrom, setDonorDateFrom] = useState('');
  const [donorDateTo, setDonorDateTo] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // UI State for dropdowns
  const [subjectTemplateOpen, setSubjectTemplateOpen] = useState(false);
  const [messageTemplateOpen, setMessageTemplateOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

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

  const calculateRecipientCount = (): number => {
    let count = 0;
    
    if (audienceType === 'all') {
      count = 5000;
    } else if (audienceType === 'donors') {
      count = 1200;
      if (donorMinAmount || donorMaxAmount || donorDateFrom || donorDateTo) {
        count = Math.floor(count * 0.7);
      }
    } else if (audienceType === 'volunteers') {
      count = 300;
    } else if (audienceType === 'custom') {
      count = selectedCities.length * 100 + selectedEvents.length * 50 + selectedTags.length * 30;
      if (count === 0) count = 500;
    }
    
    return count;
  };

  const recipientCount = useMemo(() => calculateRecipientCount(), [
    audienceType, donorMinAmount, donorMaxAmount, donorDateFrom, donorDateTo,
    selectedCities, selectedEvents, selectedTags
  ]);

  const costEstimate = useMemo(() => {
    if (channel === 'sms') {
      return recipientCount * 0.5;
    }
    return 0;
  }, [channel, recipientCount]);

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleEventToggle = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
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

    const audienceFilter: AudienceFilter = {
      type: audienceType,
      ...(audienceType === 'donors' && {
        donorFilter: {
          ...(donorMinAmount && { minAmount: parseFloat(donorMinAmount) }),
          ...(donorMaxAmount && { maxAmount: parseFloat(donorMaxAmount) }),
          ...(donorDateFrom && { dateFrom: donorDateFrom }),
          ...(donorDateTo && { dateTo: donorDateTo }),
        },
      }),
      ...(audienceType === 'custom' && {
        customFilter: {
          ...(selectedCities.length > 0 && { city: selectedCities }),
          ...(selectedEvents.length > 0 && { eventAttended: selectedEvents }),
          ...(selectedTags.length > 0 && { tags: selectedTags }),
        },
      }),
    };

    onSend({
      channel,
      subject: channel === 'email' ? subject : undefined,
      content,
      audienceFilter,
      recipientCount,
    });

    // Reset form
    setContent('');
    setSubject('');
    setAudienceType('all');
    setSelectedTemplate('');
    setDonorMinAmount('');
    setDonorMaxAmount('');
    setDonorDateFrom('');
    setDonorDateTo('');
    setSelectedCities([]);
    setSelectedEvents([]);
    setSelectedTags([]);
    setErrors({});
    setIsSending(false);
  };

  const handleClose = () => {
    if (!isSending) {
      setContent('');
      setSubject('');
      setAudienceType('all');
      setSelectedTemplate('');
      setDonorMinAmount('');
      setDonorMaxAmount('');
      setDonorDateFrom('');
      setDonorDateTo('');
      setSelectedCities([]);
      setSelectedEvents([]);
      setSelectedTags([]);
      setErrors({});
      onOpenChange(false);
    }
  };

  const getCharacterCount = () => content.length;
  const getSmsCount = () => channel === 'sms' ? Math.ceil(content.length / 160) : 0;
  const isSmsLimitExceeded = channel === 'sms' && content.length > 160;
  const ChannelIcon = channelIcons[channel];
  const selectedAudience = audienceOptions.find(opt => opt.value === audienceType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Bulk Broadcast
          </DialogTitle>
          <DialogDescription>
            Select audience, choose a channel, and compose your bulk message
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Step 1: Select Audience - Dropdown */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Audience <span className="text-destructive">*</span>
            </Label>
            
            <Select 
              value={audienceType} 
              onValueChange={(value) => setAudienceType(value as typeof audienceType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select audience type..." />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {option.count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAudience && (
              <div className="text-xs text-muted-foreground">
                Estimated recipients: <span className="font-semibold">{selectedAudience.count}</span>
              </div>
            )}

            {/* Donor Filters */}
            {audienceType === 'donors' && (
              <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <Label className="text-sm font-medium">Donor Filters (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Min Amount (₹)</Label>
                    <Input
                      type="number"
                      value={donorMinAmount}
                      onChange={(e) => setDonorMinAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Amount (₹)</Label>
                    <Input
                      type="number"
                      value={donorMaxAmount}
                      onChange={(e) => setDonorMaxAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Date From</Label>
                    <Input
                      type="date"
                      value={donorDateFrom}
                      onChange={(e) => setDonorDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Date To</Label>
                    <Input
                      type="date"
                      value={donorDateTo}
                      onChange={(e) => setDonorDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Segment Filters */}
            {audienceType === 'custom' && (
              <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <Label className="text-sm font-medium">Custom Segment Filters</Label>
                
                <div className="space-y-2">
                  <Label className="text-xs">Cities</Label>
                  <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedCities.length === 0 ? 'Select cities...' : `${selectedCities.length} selected`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Search cities..." />
                        <CommandList>
                          <CommandEmpty>No cities found.</CommandEmpty>
                          <CommandGroup>
                            {availableCities.map((city) => (
                              <CommandItem
                                key={city}
                                onSelect={() => handleCityToggle(city)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{city}</span>
                                  {selectedCities.includes(city) && (
                                    <Badge variant="secondary" className="text-xs">Selected</Badge>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedCities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedCities.map(city => (
                        <Badge key={city} variant="secondary" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Events</Label>
                  <Popover open={eventsOpen} onOpenChange={setEventsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedEvents.length === 0 ? 'Select events...' : `${selectedEvents.length} selected`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Search events..." />
                        <CommandList>
                          <CommandEmpty>No events found.</CommandEmpty>
                          <CommandGroup>
                            {availableEvents.map((event) => (
                              <CommandItem
                                key={event}
                                onSelect={() => handleEventToggle(event)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{event}</span>
                                  {selectedEvents.includes(event) && (
                                    <Badge variant="secondary" className="text-xs">Selected</Badge>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedEvents.map(event => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Tags</Label>
                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedTags.length === 0 ? 'Select tags...' : `${selectedTags.length} selected`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup>
                            {availableTags.map((tag) => (
                              <CommandItem
                                key={tag}
                                onSelect={() => handleTagToggle(tag)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{tag}</span>
                                  {selectedTags.includes(tag) && (
                                    <Badge variant="secondary" className="text-xs">Selected</Badge>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
                placeholder="Type your bulk message here..."
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

          {/* Summary */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Recipients:</span>
              <span className="font-semibold">{recipientCount.toLocaleString()}</span>
            </div>
            {costEstimate > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Cost:</span>
                <span className="font-bold text-primary flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ₹{costEstimate.toFixed(2)}
                </span>
              </div>
            )}
            {recipientCount > 1000 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Approval required for broadcasts over 1,000 recipients</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !content.trim() || (channel === 'email' && !subject.trim())}
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
                {recipientCount > 1000 ? 'Request Approval' : 'Send Broadcast'}
                <Badge variant="secondary" className="ml-1">
                  {recipientCount.toLocaleString()}
                </Badge>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
