import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Announcement, CommunicationChannel, AudienceType, CommunicationStatus } from '@/types/communications';
import { X, ArrowLeft, Save, Send, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ApprovalWorkflow } from '@/components/pr/ApprovalWorkflow';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import { useAuth } from '@/contexts/AuthContext';
import { canUserPerformAction, getNextStatus } from '@/lib/communication-approval-workflow';
import { triggerNotificationFromAnnouncement } from '@/lib/pr-integration-flows';

// These will be managed dynamically, starting with defaults
const defaultCategories = ['darshan', 'seva', 'festival', 'maintenance', 'closure', 'general'];
const defaultChannels: CommunicationChannel[] = ['display_board', 'website', 'app', 'sms', 'whatsapp', 'email', 'social_media'];
const defaultPriorities = ['normal', 'high', 'urgent', 'crisis'];
const defaultAudienceTypes: AudienceType[] = ['all', 'public', 'devotees', 'donors', 'volunteers', 'members', 'staff'];

// Dummy data for simulation (in a real app, this would come from an API)
const dummyAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Maha Shivaratri Preparations',
        content: 'Volunteers needed for decorations.',
        category: 'festival',
        priority: 'high',
        status: 'published',
        createdAt: '2024-02-15T10:00:00Z',
        channels: ['website', 'app'],
        audienceType: 'all',
        validityStart: '2024-02-15T10:00:00Z',
        validityEnd: '2024-03-08T23:59:00Z',
        autoExpire: true,
        mediaUrls: [],
        views: 1250,
        clicks: 45
    },
    // ... more items if needed for mock lookup
];

export default function AnnouncementEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Dynamic options (can be extended via quick-add)
    const [categories, setCategories] = useState<string[]>(defaultCategories);
    const [priorities, setPriorities] = useState<string[]>(defaultPriorities);
    const [audienceTypes, setAudienceTypes] = useState<string[]>(defaultAudienceTypes);
    const [channels, setChannels] = useState<CommunicationChannel[]>(defaultChannels);

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
        status: 'draft' as CommunicationStatus,
        customFields: [] as CustomField[],
    });

    useEffect(() => {
        if (id && id !== 'new') {
            // Simulate fetching data
            const announcement = dummyAnnouncements.find(a => a.id === id);
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
                    status: announcement.status,
                    customFields: (announcement as any).customFields || [],
                });
            }
        } else {
            // New announcement - set default status
            setFormData(prev => ({ ...prev, status: 'draft' }));
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent, action?: 'save' | 'submit') => {
        e.preventDefault();
        setIsLoading(true);
        
        if (action === 'submit' && user) {
            const nextStatus = getNextStatus(formData.status, 'submit', user.role);
            if (nextStatus) {
                handleStatusChange(nextStatus, 'submit');
                toast({ title: 'Submitted for Review', description: 'The announcement has been submitted for review.' });
            } else {
                toast({
                    title: 'Cannot Submit',
                    description: 'You do not have permission to submit this announcement.',
                    variant: 'destructive',
                });
            }
        }
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: id === 'new' ? 'Announcement Created' : 'Announcement Updated' });
            navigate('/pr/announcements');
        }, 1000);
    };

    const handleStatusChange = async (newStatus: CommunicationStatus, action: 'submit' | 'approve' | 'reject' | 'publish') => {
        setFormData(prev => ({ ...prev, status: newStatus }));
        
        // Show toast notifications for workflow transitions
        switch (action) {
            case 'submit':
                toast({ title: 'Submitted for Review', description: 'The announcement has been submitted for review.' });
                break;
            case 'approve':
                toast({ title: 'Approved', description: 'The announcement has been approved.' });
                break;
            case 'reject':
                toast({ title: 'Rejected', description: 'The announcement has been rejected and sent back to draft.', variant: 'destructive' });
                break;
            case 'publish':
                toast({ title: 'Published', description: 'The announcement has been published successfully.' });
                break;
        }
        
        if (action === 'publish' && newStatus === 'published') {
            const announcement: Announcement = {
                id: id || 'new',
                title: formData.title,
                content: formData.content,
                category: formData.category,
                audienceType: formData.audienceType,
                channels: formData.channels,
                mediaUrls: formData.mediaUrls,
                validityStart: formData.validityStart ? new Date(formData.validityStart).toISOString() : new Date().toISOString(),
                validityEnd: formData.validityEnd ? new Date(formData.validityEnd).toISOString() : new Date().toISOString(),
                status: newStatus,
                priority: formData.priority,
                createdBy: user?.id || '',
                createdAt: new Date().toISOString(),
                autoExpire: formData.autoExpire,
                contentTranslations: formData.contentTranslations,
            } as Announcement;

            // Auto-trigger notifications
            await triggerNotificationFromAnnouncement(announcement);
        }
    };

    const handleCustomFieldsChange = (fields: CustomField[]) => {
        setFormData(prev => ({ ...prev, customFields: fields }));
    };

    // Quick-add handlers
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

    // Check if user can publish directly (blocked by workflow)
    const canPublishDirectly = user && canUserPerformAction(user.role, formData.status, 'publish');

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
        <MainLayout>
            <PageHeader
                title={id === 'new' ? 'Create Announcement' : 'Edit Announcement'}
                description={id === 'new' ? 'Draft and publish a new announcement' : 'Update existing announcement details'}
                actions={
                    <Button variant="outline" onClick={() => navigate('/pr/announcements')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                }
            />

            <div className="p-6 max-w-5xl mx-auto pb-20">
                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="w-full space-y-6">
                        <TabsList className="grid w-full grid-cols-6 lg:w-[800px]">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="content">Content & Media</TabsTrigger>
                            <TabsTrigger value="channels">Channels & Validity</TabsTrigger>
                            <TabsTrigger value="translations">Translations</TabsTrigger>
                            <TabsTrigger value="workflow">Approval</TabsTrigger>
                            <TabsTrigger value="custom">Custom Fields</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic">
                            <Card>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Announcement Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Enter a clear, descriptive title"
                                            className="text-lg"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <Label htmlFor="priority">Priority Level</Label>
                                            <DropdownWithAdd
                                                value={formData.priority}
                                                options={priorities}
                                                onValueChange={(value) => setFormData({ ...formData, priority: value as Announcement['priority'] })}
                                                onAdd={handleAddPriority}
                                                placeholder="Select priority"
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
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="content">
                            <Card>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Content *</Label>
                                        <Textarea
                                            id="content"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Write your announcement details here..."
                                            rows={10}
                                            className="resize-y"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">Markdown formatting supported.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Media</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Paste image or video URL here and press Enter"
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
                                        {formData.mediaUrls.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                                {formData.mediaUrls.map((url, idx) => (
                                                    <div key={idx} className="relative group border rounded-lg overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
                                                        <img src={url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image')} />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, mediaUrls: formData.mediaUrls.filter((_, i) => i !== idx) })}
                                                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="channels">
                            <Card>
                                <CardContent className="space-y-8 pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base">Distribution Channels</Label>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {channels.map((channel) => (
                                                <div key={channel} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors pointer-events-none">
                                                    <Checkbox
                                                        id={channel}
                                                        checked={formData.channels.includes(channel)}
                                                        onCheckedChange={() => toggleChannel(channel)}
                                                        className="pointer-events-auto mt-0.5"
                                                    />
                                                    <div className="grid gap-1.5 leading-none pointer-events-auto">
                                                        <Label
                                                            htmlFor={channel}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                                                        >
                                                            {channel.replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-2">
                                            <DropdownWithAdd
                                                value=""
                                                options={channels}
                                                onValueChange={(value) => {
                                                    if (value && !formData.channels.includes(value as CommunicationChannel)) {
                                                        toggleChannel(value as CommunicationChannel);
                                                    }
                                                }}
                                                onAdd={handleAddChannel}
                                                placeholder="Add new channel..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label htmlFor="validityStart">Validity Start Date</Label>
                                            <Input
                                                id="validityStart"
                                                type="datetime-local"
                                                value={formData.validityStart}
                                                onChange={(e) => setFormData({ ...formData, validityStart: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="validityEnd">Validity End Date</Label>
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
                                            Automatically archive after validity period ends
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="translations">
                            <Card>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium">Multilingual Content</h3>
                                            <p className="text-sm text-gray-500">Provide translations for broader reach.</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={addTranslation}>
                                            <Plus className="h-4 w-4 mr-2" /> Add Language
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.contentTranslations.map((trans, index) => (
                                            <div key={index} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => removeTranslation(index)}
                                                    className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Language Code</Label>
                                                        <Input
                                                            placeholder="e.g. 'hi' for Hindi"
                                                            value={trans.language}
                                                            onChange={(e) => updateTranslation(index, 'language', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Translated Title</Label>
                                                        <Input
                                                            placeholder="Title in target language"
                                                            value={trans.title}
                                                            onChange={(e) => updateTranslation(index, 'title', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Translated Content</Label>
                                                    <Textarea
                                                        placeholder="Content in target language"
                                                        value={trans.content}
                                                        onChange={(e) => updateTranslation(index, 'content', e.target.value)}
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {formData.contentTranslations.length === 0 && (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
                                                <p>No translations added yet.</p>
                                                <Button type="button" variant="link" onClick={addTranslation}>
                                                    Add your first translation
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="workflow">
                            <Card>
                                <CardContent className="pt-6">
                                    <ApprovalWorkflow
                                        currentStatus={formData.status}
                                        onStatusChange={handleStatusChange}
                                        approvalHistory={[]}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="custom">
                            <CustomFields
                                fields={formData.customFields}
                                onChange={handleCustomFieldsChange}
                            />
                        </TabsContent>
                    </Tabs>

                    <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t flex justify-end items-center gap-4 z-50">
                        <Button type="button" variant="outline" onClick={() => navigate('/pr/announcements')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save className="h-4 w-4 mr-2" /> Save Draft
                                </>
                            )}
                        </Button>
                        {canPublishDirectly && formData.status === 'approved' && (
                            <Button 
                                type="button" 
                                variant="default" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusChange('published', 'publish')}
                            >
                                <Send className="h-4 w-4 mr-2" /> Publish Now
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
