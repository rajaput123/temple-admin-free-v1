import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MessageTemplate, MessageChannel } from '@/types/pr-communication';

interface TemplateFormProps {
  template?: MessageTemplate | null;
  onSave: (data: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const availableVariables = [
  '{{name}}',
  '{{amount}}',
  '{{date}}',
  '{{festivalName}}',
  '{{timings}}',
  '{{templeName}}',
  '{{devoteeName}}',
];

export function TemplateForm({ template, onSave, onCancel }: TemplateFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setChannel(template.channel);
      setSubject(template.subject || '');
      setContent(template.content);
      setVariables(template.variables);
    }
  }, [template]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      channel,
      subject: channel === 'email' ? subject : undefined,
      content,
      variables,
      createdBy: template?.createdBy || 'current-user',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., donation, festival"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="channel">Channel *</Label>
        <Select value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
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
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content *</Label>
          <div className="text-xs text-muted-foreground">
            Detected variables: {variables.length}
          </div>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter template content. Use {{variable}} for dynamic values."
          rows={8}
          required
        />
      </div>

      <div className="p-4 rounded-lg border bg-muted/50">
        <Label className="text-sm font-medium mb-2 block">Available Variables</Label>
        <div className="flex flex-wrap gap-2">
          {availableVariables.map(variable => (
            <Button
              key={variable}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable(variable)}
              className="text-xs"
            >
              {variable}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click a variable to insert it into your template
        </p>
      </div>

      {variables.length > 0 && (
        <div className="p-4 rounded-lg border bg-blue-50">
          <Label className="text-sm font-medium mb-2 block">Detected Variables</Label>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </form>
  );
}
