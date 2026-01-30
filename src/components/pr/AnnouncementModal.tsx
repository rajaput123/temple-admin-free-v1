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
import type { Announcement, CommunicationChannel } from '@/types/communications';

interface AnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onSave: (data: Partial<Announcement>) => void;
}

const categories = ['darshan', 'seva', 'festival', 'maintenance', 'closure', 'general'];
const channels: CommunicationChannel[] = ['display_board', 'website', 'app', 'sms', 'whatsapp', 'email', 'social_media'];
const priorities = ['normal', 'high', 'urgent', 'crisis'];

export function AnnouncementModal({
  open,
  onOpenChange,
  announcement,
  onSave,
}: AnnouncementModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Announcement['category'],
    channels: [] as CommunicationChannel[],
    validityStart: '',
    validityEnd: '',
    priority: 'normal' as Announcement['priority'],
    autoExpire: true,
    contentTranslations: [] as { language: string; title: string; content: string }[],
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        channels: announcement.channels,
        validityStart: announcement.validityStart ? new Date(announcement.validityStart).toISOString().slice(0, 16) : '',
        validityEnd: announcement.validityEnd ? new Date(announcement.validityEnd).toISOString().slice(0, 16) : '',
        priority: announcement.priority,
        autoExpire: announcement.autoExpire,
        contentTranslations: announcement.contentTranslations || [],
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general',
        channels: [],
        validityStart: '',
        validityEnd: '',
        priority: 'normal',
        autoExpire: true,
        contentTranslations: [],
      });
    }
  }, [announcement, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      validityStart: formData.validityStart ? new Date(formData.validityStart).toISOString() : new Date().toISOString(),
      validityEnd: formData.validityEnd ? new Date(formData.validityEnd).toISOString() : new Date().toISOString(),
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

  const addTranslation = () => {
    setFormData({
      ...formData,
      contentTranslations: [
        ...formData.contentTranslations,
        { language: '', title: '', content: '' },
      ],
    });
  };

  const updateTranslation = (index: number, field: string, value: string) => {
    const updated = [...formData.contentTranslations];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, contentTranslations: updated });
  };

  const removeTranslation = (index: number) => {
    setFormData({
      ...formData,
      contentTranslations: formData.contentTranslations.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{announcement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="channels">Channels & Validity</TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Announcement['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Announcement['priority'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter announcement content"
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4 mt-4">
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
                        className="text-sm font-normal cursor-pointer capitalize"
                      >
                        {channel.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validityStart">Validity Start</Label>
                  <Input
                    id="validityStart"
                    type="datetime-local"
                    value={formData.validityStart}
                    onChange={(e) => setFormData({ ...formData, validityStart: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityEnd">Validity End</Label>
                  <Input
                    id="validityEnd"
                    type="datetime-local"
                    value={formData.validityEnd}
                    onChange={(e) => setFormData({ ...formData, validityEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoExpire"
                  checked={formData.autoExpire}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoExpire: checked as boolean })}
                />
                <Label htmlFor="autoExpire" className="text-sm font-normal cursor-pointer">
                  Auto-expire after validity period
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>Multilingual Content</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTranslation}>
                  Add Translation
                </Button>
              </div>

              {formData.contentTranslations.map((trans, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Translation {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTranslation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Language code (e.g., hi, te, ta)"
                      value={trans.language}
                      onChange={(e) => updateTranslation(index, 'language', e.target.value)}
                    />
                    <Input
                      placeholder="Translated title"
                      value={trans.title}
                      onChange={(e) => updateTranslation(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Translated content"
                      value={trans.content}
                      onChange={(e) => updateTranslation(index, 'content', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ))}

              {formData.contentTranslations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No translations added. Click "Add Translation" to add multilingual content.
                </p>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="outline">
              Save Draft
            </Button>
            <Button type="submit">
              Submit for Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
