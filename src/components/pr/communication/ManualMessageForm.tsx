import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Users, X, AlertCircle, MessageSquare, Mail, 
  Smartphone, Bell, MessageCircle, Info, FileText, Search,
  UserPlus, UserMinus, Eye, EyeOff, Save, Clock,
  Check, Loader2, Plus, Minus, Maximize2, Minimize2,
  Settings, Zap, TrendingUp, DollarSign, BarChart3,
  Layers, Grid3x3, Layout, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { getTemplates } from '@/lib/pr-communication-store';
import { getEmployees } from '@/lib/hr-employee-store';
import type { MessageChannel } from '@/types/pr-communication';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import '@/styles/pr-communication.css';

interface ManualMessageFormProps {
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

export function ManualMessageForm({ onSend }: ManualMessageFormProps) {
  const employees = getEmployees();
  const templates = getTemplates();
  
  // Form State
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [errors, setErrors] = useState<{
    recipients?: string;
    subject?: string;
    content?: string;
  }>({});
  
  // UI State - Command Center Pattern
  const [showRecipientSheet, setShowRecipientSheet] = useState(false);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => t.channel === channel);
  }, [channel, templates]);

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

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredEmployees.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredEmployees.map(emp => emp.id));
    }
  };

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
      setShowTemplateSheet(false);
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

    setContent('');
    setSubject('');
    setSelectedRecipients([]);
    setSelectedTemplate('');
    setSearchQuery('');
    setErrors({});
    setIsSending(false);
  };

  const getCostEstimate = () => {
    if (channel === 'sms') {
      return selectedRecipients.length * 0.5;
    }
    return 0;
  };

  const getCharacterCount = () => content.length;
  const getSmsCount = () => channel === 'sms' ? Math.ceil(content.length / 160) : 0;
  const isSmsLimitExceeded = channel === 'sms' && content.length > 160;
  const ChannelIcon = channelIcons[channel];
  const allSelected = filteredEmployees.length > 0 && selectedRecipients.length === filteredEmployees.length;

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
      {/* Top Command Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border shrink-0">
        <div className="flex items-center gap-3">
          {/* Channel Quick Select */}
          <div className="flex items-center gap-2">
            {(['sms', 'email', 'whatsapp', 'push'] as MessageChannel[]).map((ch) => {
              const Icon = channelIcons[ch];
              const isSelected = channel === ch;
              return (
                <Button
                  key={ch}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setChannel(ch);
                    setSelectedTemplate('');
                  }}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {channelLabels[ch]}
                </Button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Quick Actions */}
          <Sheet open={showRecipientSheet} onOpenChange={setShowRecipientSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Recipients
                {selectedRecipients.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedRecipients.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[500px]">
              <SheetHeader>
                <SheetTitle>Select Recipients</SheetTitle>
                <SheetDescription>
                  Choose who will receive this message
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="gap-2"
                  >
                    {allSelected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                  {selectedRecipients.length > 0 && (
                    <Badge variant="secondary">
                      {selectedRecipients.length} selected
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <div className="space-y-2">
                    {filteredEmployees.map(employee => {
                      const isSelected = selectedRecipients.includes(employee.id);
                      return (
                        <div
                          key={employee.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'hover:bg-accent border-2 border-transparent'
                          }`}
                          onClick={() => handleRecipientToggle(employee.id)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{employee.name}</div>
                            {employee.email && (
                              <div className="text-sm text-muted-foreground truncate">{employee.email}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showTemplateSheet} onOpenChange={setShowTemplateSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[500px]">
              <SheetHeader>
                <SheetTitle>Message Templates</SheetTitle>
                <SheetDescription>
                  Choose a template to get started quickly
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-3">
                    {filteredTemplates.map(template => {
                      const Icon = channelIcons[template.channel];
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold mb-1">{template.name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {template.content.substring(0, 100)}...
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProperties(!showProperties)}
            className="gap-2"
          >
            {showProperties ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            Properties
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Main Content Area - Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Main Composer - Takes 8 columns */}
        <Card className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden border shadow-lg">
          <CardHeader className="border-b shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Compose Message
              </CardTitle>
              <Badge variant="outline" className="gap-2">
                <ChannelIcon className="h-3.5 w-3.5" />
                {channelLabels[channel]}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            {/* Email Subject */}
            {channel === 'email' && (
              <div className="space-y-2 shrink-0">
                <Label htmlFor="subject" className="text-sm font-semibold">
                  Subject <span className="text-destructive">*</span>
                </Label>
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
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.subject}</span>
                  </div>
                )}
              </div>
            )}

            {/* Message Content */}
            <div className="flex-1 flex flex-col space-y-2 min-h-0">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-sm font-semibold">
                  Message Content <span className="text-destructive">*</span>
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
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: undefined }));
                  }
                }}
                placeholder="Start typing your message here..."
                className={`flex-1 resize-none text-base ${errors.content ? 'border-destructive' : ''} ${isSmsLimitExceeded ? 'border-amber-500' : ''}`}
              />
              {errors.content && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.content}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t shrink-0">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Schedule
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <Label>Schedule Send</Label>
                      <Input type="datetime-local" />
                      <Button size="sm" className="w-full">Set Schedule</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                onClick={handleSend}
                disabled={isSending || selectedRecipients.length === 0 || !content.trim() || (channel === 'email' && !subject.trim())}
                className="gap-2 min-w-[140px]"
                size="lg"
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
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar - Preview & Properties */}
        {showProperties && (
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            {/* Preview Card */}
            {showPreview && (
              <Card className="flex-1 flex flex-col overflow-hidden border shadow-lg">
                <CardHeader className="border-b shrink-0">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4">
                  <div className="space-y-4">
                    {channel === 'email' && subject && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Subject</div>
                        <div className="text-sm font-semibold">{subject}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Content</div>
                      <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg min-h-[200px] border">
                        {content || <span className="text-muted-foreground italic">Start typing to see preview...</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Properties Card */}
            <Card className="border shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recipients</span>
                    <Badge variant="secondary">{selectedRecipients.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <Badge variant="outline" className="gap-1">
                      <ChannelIcon className="h-3 w-3" />
                      {channelLabels[channel]}
                    </Badge>
                  </div>
                  {channel === 'sms' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Cost</span>
                      <span className="text-lg font-bold text-primary">₹{getCostEstimate().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Characters</span>
                    <span className="text-sm font-medium">{getCharacterCount()}</span>
                  </div>
                  {channel === 'sms' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">SMS Count</span>
                      <span className="text-sm font-medium">{getSmsCount()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
