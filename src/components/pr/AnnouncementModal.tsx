import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import type { Announcement, CommunicationChannel, AudienceType } from '@/types/communications';
import { X } from 'lucide-react';

interface AnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onSave: (data: Partial<Announcement>) => void;
}

const defaultCategories = ['darshan', 'seva', 'festival', 'maintenance', 'closure', 'general'];
const defaultChannels: CommunicationChannel[] = ['display_board', 'website', 'app', 'sms', 'whatsapp', 'email', 'social_media'];
const defaultPriorities = ['normal', 'high', 'urgent', 'crisis'];
const defaultAudienceTypes: AudienceType[] = ['all', 'public', 'devotees', 'donors', 'volunteers', 'members', 'staff'];

export function AnnouncementModal({
  open,
  onOpenChange,
  announcement,
  onSave,
}: AnnouncementModalProps) {
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [priorities, setPriorities] = useState<string[]>(defaultPriorities);
  const [audienceTypes, setAudienceTypes] = useState<string[]>(defaultAudienceTypes);
  const [channels, setChannels] = useState<CommunicationChannel[]>(defaultChannels);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Announcement['category'],
    audienceType: 'all' as AudienceType,
    channels: [] as CommunicationChannel[],
    mediaUrls: [] as string[],
    validityStart: '',
    validityEnd: '',
    priority: 'normal' as Announcement['priority'],
    autoExpire: true,
    contentTranslations: [] as { language: string; title: string; content: string }[],
  });

  const handleAddCategory = (newCategory: string) => {
    const category = newCategory.toLowerCase().trim();
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const handleAddPriority = (newPriority: string) => {
    const priority = newPriority.toLowerCase().trim();
    if (priority && !priorities.includes(priority)) {
      setPriorities([...priorities, priority]);
    }
  };

  const handleAddAudience = (newAudience: string) => {
    const audience = newAudience.toLowerCase().trim();
    if (audience && !audienceTypes.includes(audience)) {
      setAudienceTypes([...audienceTypes, audience]);
    }
  };

  const handleAddChannel = (newChannel: string) => {
    const channel = newChannel.toLowerCase().trim().replace(' ', '_') as CommunicationChannel;
    if (channel && !channels.includes(channel)) {
      setChannels([...channels, channel]);
    }
  };

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        audienceType: announcement.audienceType || 'all',
        channels: announcement.channels,
        mediaUrls: announcement.mediaUrls || [],
        validityStart: announcement.validityStart ? new Date(announcement.validityStart).toISOString().slice(0, 16) : '',
        validityEnd: announcement.validityEnd ? new Date(announcement.validityEnd).toISOString().slice(0, 16) : '',
        priority: announcement.priority,
        autoExpire: announcement.autoExpire,
        contentTranslations: announcement.contentTranslations || [],
      });
      setCustomFields((announcement as any).customFields || []);
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general',
        audienceType: 'all',
        channels: [],
        mediaUrls: [],
        validityStart: '',
        validityEnd: '',
        priority: 'normal',
        autoExpire: true,
        contentTranslations: [],
      });
      setCustomFields([]);
    }
  }, [announcement, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      validityStart: formData.validityStart ? new Date(formData.validityStart).toISOString() : new Date().toISOString(),
      validityEnd: formData.validityEnd ? new Date(formData.validityEnd).toISOString() : new Date().toISOString(),
      customFields: customFields as any,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{announcement ? 'Edit Announcement' : 'New Announcement'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="py-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="channels">Channels & Validity</TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
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
                  <DropdownWithAdd
                    value={formData.category}
                    options={categories}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Announcement['category'] })}
                    onAdd={handleAddCategory}
                    placeholder="Select category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <DropdownWithAdd
                    value={formData.audienceType}
                    options={audienceTypes}
                    onValueChange={(value) => setFormData({ ...formData, audienceType: value as AudienceType })}
                    onAdd={handleAddAudience}
                    placeholder="Select audience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <DropdownWithAdd
                    value={formData.priority}
                    options={priorities}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Announcement['priority'] })}
                    onAdd={handleAddPriority}
                    placeholder="Select priority"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-6">
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

              <div className="space-y-2">
                <Label>Media URLs (Images/Videos)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image or video URL and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value;
                        if (val) {
                          setFormData({ ...formData, mediaUrls: [...formData.mediaUrls, val] });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-2 mt-2">
                  {formData.mediaUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded bg-gray-50 text-sm">
                      <span className="flex-1 truncate">{url}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        setFormData({ ...formData, mediaUrls: formData.mediaUrls.filter((_, i) => i !== idx) });
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4 mt-6">
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

            <TabsContent value="translations" className="space-y-4 mt-6">
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

          <div className="mt-8 pt-6 border-t">
            <CustomFields
              initialCustomFields={customFields}
              onCustomFieldsChange={setCustomFields}
            />
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" className="ml-2">
              Save Draft
            </Button>
            <Button type="submit" className="ml-2">
              Submit for Review
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
