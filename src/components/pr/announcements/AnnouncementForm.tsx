import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Heart, FileText, Upload } from 'lucide-react';
import type { Announcement, AnnouncementCategory, AnnouncementPriority, AudienceFilter } from '@/types/pr-communication';
import { RichTextEditor } from '@/components/pr/RichTextEditor';
import { StepIndicator } from '@/components/pr/shared/StepIndicator';
import { StatusBadge } from '@/components/pr/shared/StatusBadge';
import { ConfirmationModal } from '@/components/pr/shared/ConfirmationModal';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSave: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const steps = [
  { id: 'content', label: 'Content' },
  { id: 'audience', label: 'Audience' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
];

export function AnnouncementForm({ announcement, onSave, onCancel }: AnnouncementFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [audienceType, setAudienceType] = useState<'all' | 'donors' | 'volunteers' | 'custom'>('all');
  const [publishNow, setPublishNow] = useState(true);
  const [publishDate, setPublishDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setCategory(announcement.category);
      setDescription(announcement.description);
      setAudienceType(announcement.audience.type);
      setPublishDate(announcement.publishDate || '');
      setExpiryDate(announcement.expiryDate || '');
      setPriority(announcement.priority);
      setPublishNow(announcement.status === 'published');
    }
  }, [announcement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    const audience: AudienceFilter = {
      type: audienceType,
    };

    const announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      category,
      description,
      status: publishNow ? 'published' : (publishDate ? 'scheduled' : 'draft'),
      priority,
      audience,
      publishDate: publishDate || undefined,
      expiryDate: expiryDate || undefined,
      attachments: [], // TODO: Handle file uploads
      requiresApproval: false,
      createdBy: announcement?.createdBy || 'current-user',
    };

    onSave(announcementData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return title.trim() !== '' && description.trim() !== '';
      case 1: return true;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const mockEvents = [
    { id: 'EVT-001', name: 'Maha Shivaratri 2024', date: '2024-03-08' },
    { id: 'EVT-002', name: 'Krishna Janmashtami', date: '2024-08-26' },
  ];

  const mockCampaigns = [
    { id: 'DON-CAMP-001', name: 'Temple Renovation Fund', status: 'active' },
    { id: 'DON-CAMP-002', name: 'Education Support', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Step 1: Content */}
      {currentStep === 0 && (
        <Card className="pr-card">
          <CardContent className="p-6 space-y-6">
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
              <Label htmlFor="description">Description *</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter announcement description..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm text-amber-600 hover:text-amber-700">Click to upload</span>
                  <span className="text-sm text-gray-500"> or drag and drop</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {attachments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">{attachments.length} file(s) selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Audience */}
      {currentStep === 1 && (
        <Card className="pr-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="audience">Audience *</Label>
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
                  <SelectItem value="custom">Custom Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Link to Event (Optional)</Label>
              <Select value="none" onValueChange={() => {}}>
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
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Link to Donation Campaign (Optional)</Label>
              <Select value="none" onValueChange={() => {}}>
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
          </CardContent>
        </Card>
      )}

      {/* Step 3: Schedule */}
      {currentStep === 2 && (
        <Card className="pr-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-amber-50/30">
              <div className="space-y-0.5">
                <Label htmlFor="publishNow" className="font-medium">Publish Now</Label>
                <p className="text-xs text-gray-600">Publish immediately or schedule for later</p>
              </div>
              <Switch
                id="publishNow"
                checked={publishNow}
                onCheckedChange={setPublishNow}
              />
            </div>

            {!publishNow && (
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date & Time</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {currentStep === 3 && (
        <Card className="pr-card">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg">Review & Confirm</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">Title</Label>
                <p className="font-medium">{title || '—'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  <p className="font-medium">{category}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Priority</Label>
                  <StatusBadge status={priority === 'urgent' ? 'urgent' : 'draft'} />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <div 
                  className="prose prose-sm max-w-none mt-2"
                  dangerouslySetInnerHTML={{ __html: description || '<p class="text-gray-400">No description</p>' }}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Audience</Label>
                <p className="font-medium">
                  {audienceType === 'all' ? 'All Devotees' : audienceType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Publish</Label>
                  <p className="font-medium">
                    {publishNow ? 'Immediately' : (publishDate ? new Date(publishDate).toLocaleString() : 'Draft')}
                  </p>
                </div>
                {expiryDate && (
                  <div>
                    <Label className="text-xs text-gray-500">Expires</Label>
                    <p className="font-medium">{new Date(expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={currentStep === 0 ? onCancel : handlePrevious}>
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={() => setShowConfirmModal(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {announcement ? 'Update' : 'Confirm & Publish'}
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={handleSubmit}
        title={announcement ? 'Update Announcement?' : 'Publish Announcement?'}
        description={announcement 
          ? 'Are you sure you want to update this announcement?'
          : 'This announcement will be published and visible to all selected audience members.'}
        confirmText={announcement ? 'Update' : 'Publish'}
        variant="default"
      />
    </div>
  );
}
