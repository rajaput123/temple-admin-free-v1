import { useState, useEffect, useMemo } from 'react';
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
  FileText, AlertCircle, Mail, 
  Smartphone, Bell, MessageCircle, Loader2,
  Info, X
} from 'lucide-react';
import type { MessageTemplate, MessageChannel } from '@/types/pr-communication';
import '@/styles/pr-communication.css';

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: MessageTemplate | null;
  onSave: (data: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
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

const availableCategories = [
  'Announcement',
  'Reminder',
  'Welcome',
  'Thank You',
  'Event',
  'Payment',
  'General',
];

const availableVariables = [
  '{{name}}',
  '{{amount}}',
  '{{date}}',
  '{{festivalName}}',
  '{{timings}}',
  '{{templeName}}',
  '{{devoteeName}}',
];

export function TemplateModal({ open, onOpenChange, template, onSave }: TemplateModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    category?: string;
    channel?: string;
    content?: string;
    subject?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setChannel(template.channel);
      setSubject(template.subject || '');
      setContent(template.content);
      setVariables(template.variables);
    } else {
      setName('');
      setCategory('');
      setChannel('sms');
      setSubject('');
      setContent('');
      setVariables([]);
    }
  }, [template, open]);

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    return Array.from(matches, m => `{{${m[1]}}}`);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    const extracted = extractVariables(value);
    setVariables(extracted);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      handleContentChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Template content is required';
    }
    
    if (channel === 'email' && !subject.trim()) {
      newErrors.subject = 'Email subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    onSave({
      name,
      category,
      channel,
      subject: channel === 'email' ? subject : undefined,
      content,
      variables,
      createdBy: template?.createdBy || 'current-user',
    });

    // Reset form
    setName('');
    setCategory('');
    setChannel('sms');
    setSubject('');
    setContent('');
    setVariables([]);
    setErrors({});
    setIsSaving(false);
  };

  const handleClose = () => {
    if (!isSaving) {
      setName('');
      setCategory('');
      setChannel('sms');
      setSubject('');
      setContent('');
      setVariables([]);
      setErrors({});
      onOpenChange(false);
    }
  };

  const getCharacterCount = () => content.length;
  const getSmsCount = () => channel === 'sms' ? Math.ceil(content.length / 160) : 0;
  const ChannelIcon = channelIcons[channel];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
          <DialogDescription>
            Create a reusable message template with variables for personalization
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Template Name */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Enter template name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Category and Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={category} 
                onValueChange={(value) => {
                  setCategory(value);
                  if (errors.category) {
                    setErrors(prev => ({ ...prev, category: undefined }));
                  }
                }}
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.category}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Channel <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={channel} 
                onValueChange={(value) => {
                  setChannel(value as MessageChannel);
                  if (errors.channel) {
                    setErrors(prev => ({ ...prev, channel: undefined }));
                  }
                }}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <ChannelIcon className="h-4 w-4" />
                    <SelectValue placeholder="Select channel..." />
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
          </div>

          {/* Email Subject */}
          {channel === 'email' && (
            <div className="space-y-3">
              <Label htmlFor="subject" className="text-base font-semibold">
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
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.subject}</span>
                </div>
              )}
            </div>
          )}

          {/* Template Content */}
          <div className="flex-1 flex flex-col space-y-3 min-h-0">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-base font-semibold">
                Template Content <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Select onValueChange={insertVariable}>
                  <SelectTrigger className="h-8 text-xs w-40">
                    <SelectValue placeholder="Insert variable..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVariables.map(variable => (
                      <SelectItem key={variable} value={variable}>
                        {variable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {channel === 'sms' && (
                    <div className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      <span>160 chars/SMS</span>
                    </div>
                  )}
                  <span>{getCharacterCount()} {channel === 'sms' ? '/ 160' : ''} chars</span>
                </div>
              </div>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => {
                handleContentChange(e.target.value);
                if (errors.content) {
                  setErrors(prev => ({ ...prev, content: undefined }));
                }
              }}
              placeholder="Enter template content. Use {{variable}} for dynamic values..."
              className={`flex-1 resize-none ${errors.content ? 'border-destructive' : ''}`}
            />
            {errors.content && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.content}</span>
              </div>
            )}

            {/* Detected Variables */}
            {variables.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Detected Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !category.trim() || !content.trim() || (channel === 'email' && !subject.trim())}
            className="gap-2 min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                {template ? 'Update Template' : 'Create Template'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
