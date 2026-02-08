import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, AlertTriangle, Eye, Edit, FileText, Users, Clock } from 'lucide-react';
import type { Announcement, AnnouncementCategory, AnnouncementPriority, AudienceFilter } from '@/types/pr-communication';
import { RichTextEditor } from './RichTextEditor';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSave: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  viewMode?: boolean;
  onViewModeChange?: (viewMode: boolean) => void;
  templateId?: string | null;
}

export function AnnouncementForm({ announcement, onSave, onCancel, viewMode = false, onViewModeChange, templateId }: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('draft');
  const [publishDate, setPublishDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [audienceType, setAudienceType] = useState<'all' | 'donors' | 'volunteers' | 'custom'>('all');
  const [linkedEventId, setLinkedEventId] = useState<string>('');
  const [linkedDonationCampaignId, setLinkedDonationCampaignId] = useState<string>('');
  const [emergencyPublish, setEmergencyPublish] = useState(false);

  // Mock data for events and campaigns (in real app, fetch from respective modules)
  const mockEvents = [
    { id: 'EVT-001', name: 'Maha Shivaratri 2024', date: '2024-03-08' },
    { id: 'EVT-002', name: 'Krishna Janmashtami', date: '2024-08-26' },
  ];

  const mockCampaigns = [
    { id: 'DON-CAMP-001', name: 'Temple Renovation Fund', status: 'active' },
    { id: 'DON-CAMP-002', name: 'Education Support', status: 'active' },
  ];

  // Template definitions
  const templates: Record<string, Partial<{
    category: AnnouncementCategory;
    priority: AnnouncementPriority;
    audienceType: 'all' | 'donors' | 'volunteers' | 'custom';
    emergencyPublish: boolean;
    description: string;
  }>> = {
    festival: {
      category: 'festival',
      priority: 'high',
      audienceType: 'all',
      description: '<p>Join us for this special festival celebration...</p>',
    },
    emergency: {
      category: 'emergency',
      priority: 'urgent',
      audienceType: 'all',
      emergencyPublish: true,
      description: '<p><strong>URGENT NOTICE:</strong></p><p>Important information for all devotees...</p>',
    },
    donation: {
      category: 'general',
      priority: 'normal',
      audienceType: 'donors',
      description: '<p>Support our temple through your generous contributions...</p>',
    },
    general: {
      category: 'general',
      priority: 'normal',
      audienceType: 'all',
      description: '<p>General announcement for all devotees...</p>',
    },
  };

  useEffect(() => {
    if (announcement) {
      // Editing existing announcement
      setTitle(announcement.title);
      setCategory(announcement.category);
      setDescription(announcement.description);
      setPriority(announcement.priority);
      setStatus(announcement.status === 'archived' ? 'draft' : announcement.status);
      setPublishDate(announcement.publishDate || '');
      setExpiryDate(announcement.expiryDate || '');
      setRequiresApproval(announcement.requiresApproval);
      setAudienceType(announcement.audience.type);
      setLinkedEventId(announcement.linkedEventId || '');
      setLinkedDonationCampaignId(announcement.linkedDonationCampaignId || '');
      setEmergencyPublish(false);
    } else if (templateId && templates[templateId]) {
      // Apply template
      const template = templates[templateId];
      setTitle('');
      setCategory(template.category || 'general');
      setDescription(template.description || '');
      setPriority(template.priority || 'normal');
      setStatus('draft');
      setPublishDate('');
      setExpiryDate('');
      setRequiresApproval(!template.emergencyPublish);
      setAudienceType(template.audienceType || 'all');
      setLinkedEventId('');
      setLinkedDonationCampaignId('');
      setEmergencyPublish(template.emergencyPublish || false);
    } else {
      // Reset form when creating new announcement (no template)
      setTitle('');
      setCategory('general');
      setDescription('');
      setPriority('normal');
      setStatus('draft');
      setPublishDate('');
      setExpiryDate('');
      setRequiresApproval(false);
      setAudienceType('all');
      setLinkedEventId('');
      setLinkedDonationCampaignId('');
      setEmergencyPublish(false);
    }
  }, [announcement, templateId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const audience: AudienceFilter = {
      type: audienceType,
    };

    onSave({
      title,
      category,
      description,
      status: emergencyPublish ? 'published' : (status as Announcement['status']),
      priority,
      audience,
      publishDate: publishDate || undefined,
      expiryDate: expiryDate || undefined,
      attachments: announcement?.attachments || [],
      requiresApproval: emergencyPublish ? false : requiresApproval,
      linkedEventId: linkedEventId || undefined,
      linkedDonationCampaignId: linkedDonationCampaignId || undefined,
      createdBy: announcement?.createdBy || 'current-user',
    });
  };

  // Helper functions
  const getCategoryColor = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'festival': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'policy': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (pri: AnnouncementPriority) => {
    switch (pri) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Preview component
  const PreviewPanel = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Preview</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getCategoryColor(category)}>
            {category}
          </Badge>
          <Badge variant="outline" className={getPriorityColor(priority)}>
            {priority}
          </Badge>
        </div>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title || 'Announcement Title'}</h4>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: description || '<p class="text-muted-foreground">Description will appear here...</p>' }}
        />
      </div>
      {(publishDate || expiryDate) && (
        <div className="text-xs text-muted-foreground space-y-1">
          {publishDate && <div>Publish: {new Date(publishDate).toLocaleDateString()}</div>}
          {expiryDate && <div>Expires: {new Date(expiryDate).toLocaleDateString()}</div>}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        Audience: {audienceType === 'all' ? 'All Devotees' : audienceType}
      </div>
    </div>
  );

  // View Mode - only show if we have an announcement to view
  if (viewMode && announcement) {
    return (
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{announcement.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(announcement.status)} variant="outline">
                {announcement.status}
              </Badge>
              <Badge className={getPriorityColor(announcement.priority)} variant="outline">
                {announcement.priority}
              </Badge>
              <Badge className={getCategoryColor(announcement.category)} variant="outline">
                {announcement.category}
              </Badge>
            </div>
          </div>
          {onViewModeChange && (
            <Button variant="outline" size="sm" onClick={() => onViewModeChange(false)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: announcement.description }}
        />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Publish Date</div>
            <div className="text-sm font-medium">
              {announcement.publishDate ? new Date(announcement.publishDate).toLocaleDateString() : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Expiry Date</div>
            <div className="text-sm font-medium">
              {announcement.expiryDate ? new Date(announcement.expiryDate).toLocaleDateString() : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Audience</div>
            <div className="text-sm font-medium">
              {announcement.audience.type === 'all' ? 'All Devotees' : announcement.audience.type}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Created</div>
            <div className="text-sm font-medium">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Mode - always render when not in view mode

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="m-0 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Status Workflow Indicator */}
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="text-xs font-medium mb-3">Status Workflow</div>
                <div className="flex items-center gap-2">
                  {['draft', 'scheduled', 'published'].map((s, idx) => {
                    const statusIndex = ['draft', 'scheduled', 'published'].indexOf(status);
                    const isActive = status === s;
                    const isCompleted = statusIndex > idx;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                            isActive
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : isCompleted
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'border-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </span>
                        </div>
                        {idx < 2 && (
                          <div className={`flex-1 h-0.5 mx-2 ${
                            isCompleted ? 'bg-green-200' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {announcement?.requiresApproval && announcement.status === 'draft' && (
                  <div className="mt-3 p-2 rounded bg-blue-50 border border-blue-200 text-xs text-blue-800">
                    ⚠️ This announcement requires approval before publishing
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as AnnouncementPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'scheduled' | 'published')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {announcement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <PreviewPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="m-0 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter announcement description..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {announcement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <PreviewPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="m-0 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="approval">Requires Approval</Label>
                    <p className="text-xs text-muted-foreground">Enable approval workflow for this announcement</p>
                  </div>
                  <Switch
                    id="approval"
                    checked={requiresApproval}
                    onCheckedChange={setRequiresApproval}
                    disabled={emergencyPublish}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <Label htmlFor="emergency" className="font-medium">Emergency Publish</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Bypass approval and publish immediately</p>
                  </div>
                  <Switch
                    id="emergency"
                    checked={emergencyPublish}
                    onCheckedChange={(checked) => {
                      setEmergencyPublish(checked);
                      if (checked) {
                        setRequiresApproval(false);
                        setStatus('published');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {announcement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <PreviewPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="m-0 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Select 
                  value={audienceType} 
                  onValueChange={(v) => setAudienceType(v as 'all' | 'donors' | 'volunteers' | 'custom')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devotees</SelectItem>
                    <SelectItem value="donors">Donors</SelectItem>
                    <SelectItem value="volunteers">Volunteers</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedEvent">Link to Event (Optional)</Label>
                  <Select 
                    value={linkedEventId || 'none'} 
                    onValueChange={(v) => setLinkedEventId(v === 'none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {mockEvents.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{event.name}</span>
                            <span className="text-xs text-muted-foreground">({event.date})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedCampaign">Link to Donation Campaign (Optional)</Label>
                  <Select 
                    value={linkedDonationCampaignId || 'none'} 
                    onValueChange={(v) => setLinkedDonationCampaignId(v === 'none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {mockCampaigns.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            <span>{campaign.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {announcement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <PreviewPanel />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
