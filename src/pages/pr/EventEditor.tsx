import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ApprovalWorkflow } from '@/components/pr/ApprovalWorkflow';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import { useAuth } from '@/contexts/AuthContext';
import { useEventAnnouncementIntegration, useEventReminderScheduling } from '@/lib/pr-integration-flows';
import { sendVolunteerEventAssignmentNotification } from '@/lib/pr-integration-flows';
import type { TempleEvent, EventCategory, MessagePriority, CommunicationStatus, CommunicationApproval } from '@/types/communications';

// Dynamic options (can be extended via quick-add)
const defaultEventCategories: EventCategory[] = [
    'festival',
    'seva',
    'cultural',
    'religious',
    'other',
];

const defaultPriorities: MessagePriority[] = ['normal', 'high', 'urgent', 'crisis'];
const defaultLocations = ['Main Hall', 'Temple Complex', 'Prayer Hall', 'Outdoor Area', 'Admin Block'];

// Dummy data for simulation
const dummyEvents: TempleEvent[] = [
    {
        id: '1',
        title: 'Maha Shivaratri',
        description: 'Annual grand celebration of Maha Shivaratri with all-night vigil.',
        category: 'festival',
        startTime: '2024-03-08T18:00:00Z',
        endTime: '2024-03-09T06:00:00Z',
        capacity: 5000,
        rsvpEnabled: true,
        rsvpCount: 1200,
        location: 'Main Temple Complex',
        status: 'published',
        priority: 'high',
        createdBy: 'admin',
        createdAt: '2023-12-01T10:00:00Z',
    },
];

export default function EventEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const { createAnnouncement } = useEventAnnouncementIntegration(id || 'new', formData.autoCreateAnnouncement);
    const { scheduleReminders } = useEventReminderScheduling(id || 'new', formData.rsvpEnabled);

    // Dynamic options
    const [eventCategories, setEventCategories] = useState<string[]>(defaultEventCategories);
    const [priorities, setPriorities] = useState<string[]>(defaultPriorities);
    const [locations, setLocations] = useState<string[]>(defaultLocations);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'religious' as EventCategory,
        startTime: '',
        endTime: '',
        capacity: 0,
        rsvpEnabled: false,
        location: '',
        priority: 'normal' as MessagePriority,
        status: 'draft' as CommunicationStatus,
        customFields: [] as CustomField[],
        approvals: [] as CommunicationApproval[],
        autoCreateAnnouncement: false,
    });

    useEffect(() => {
        if (id && id !== 'new') {
            const event = dummyEvents.find(e => e.id === id);
            if (event) {
                setFormData({
                    title: event.title,
                    description: event.description,
                    category: event.category,
                    startTime: event.startTime.slice(0, 16),
                    endTime: event.endTime.slice(0, 16),
                    capacity: event.capacity,
                    rsvpEnabled: event.rsvpEnabled,
                    location: event.location || '',
                    priority: event.priority,
                    status: event.status || 'draft',
                    customFields: (event as any).customFields || [],
                    approvals: (event as any).approvals || [],
                    autoCreateAnnouncement: (event as any).autoCreateAnnouncement || false,
                });
            }
        } else {
            // Defaults for new event
            setFormData(prev => ({
                ...prev,
                startTime: new Date().toISOString().slice(0, 16),
                endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // +1 hour
                capacity: 100,
                location: 'Main Hall'
            }))
        }
    }, [id]);

    const handleAddCategory = async (data: Record<string, any>): Promise<string> => {
        const newCategory = data.name?.toLowerCase().trim();
        if (!newCategory || eventCategories.includes(newCategory)) {
            throw new Error('Category already exists or invalid');
        }
        setEventCategories([...eventCategories, newCategory]);
        return newCategory;
    };

    const handleAddPriority = async (data: Record<string, any>): Promise<string> => {
        const newPriority = data.name?.toLowerCase().trim();
        if (!newPriority || priorities.includes(newPriority)) {
            throw new Error('Priority already exists or invalid');
        }
        setPriorities([...priorities, newPriority]);
        return newPriority;
    };

    const handleAddLocation = async (data: Record<string, any>): Promise<string> => {
        const newLocation = data.name?.trim();
        if (!newLocation || locations.includes(newLocation)) {
            throw new Error('Location already exists or invalid');
        }
        setLocations([...locations, newLocation]);
        return newLocation;
    };

    const handleStatusChange = async (newStatus: CommunicationStatus, action: 'submit' | 'approve' | 'reject' | 'publish') => {
        setFormData(prev => ({ ...prev, status: newStatus }));
        
        if (action === 'publish') {
            const eventData: TempleEvent = {
                id: id || 'new',
                title: formData.title,
                description: formData.description,
                category: formData.category,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                capacity: formData.capacity,
                rsvpEnabled: formData.rsvpEnabled,
                rsvpCount: 0,
                location: formData.location,
                status: newStatus,
                priority: formData.priority,
                createdBy: user?.id || '',
                createdAt: new Date().toISOString(),
                autoCreateAnnouncement: formData.autoCreateAnnouncement,
            } as TempleEvent;

            // Auto-create announcement if enabled
            if (formData.autoCreateAnnouncement) {
                await createAnnouncement(eventData);
            }

            // Schedule reminders if RSVP enabled
            if (formData.rsvpEnabled) {
                await scheduleReminders(eventData);
            }

            // Send volunteer assignment notifications if volunteers are assigned
            // In a real app, this would come from the Volunteer module integration
            if (eventData.volunteersAssigned && eventData.volunteersAssigned.length > 0) {
                for (const volunteerId of eventData.volunteersAssigned) {
                    await sendVolunteerEventAssignmentNotification(volunteerId, eventData);
                }
            }
        }
        
        // In a real app, this would save to backend
        // For now, we'll just update local state
    };

    const handleSave = (newStatus: CommunicationStatus) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: id === 'new' ? 'Event Created' : 'Event Updated', description: `Status: ${newStatus}` });
            setFormData(prev => ({ ...prev, status: newStatus }));
            navigate('/pr/calendar');
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave(formData.status);
    };

    return (
        <MainLayout>
            <PageHeader
                title={id === 'new' ? 'Create Event' : 'Edit Event'}
                description={id === 'new' ? 'Schedule a new temple event' : 'Update event details and schedule'}
                actions={
                    <Button variant="outline" onClick={() => navigate('/pr/calendar')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Calendar
                    </Button>
                }
            />

            <div className="max-w-4xl mx-auto pb-20">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent className="space-y-8 pt-6">
                            {/* Basic Info Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-base">Event Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="text-lg"
                                        placeholder="e.g. Maha Shivaratri Celebration"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <DropdownWithAdd
                                            value={formData.category}
                                            options={eventCategories}
                                            onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}
                                            addButtonLabel="Add New Category"
                                            quickAddConfig={{
                                                title: 'Add New Event Category',
                                                fields: [
                                                    { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g., Workshop' },
                                                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                                ],
                                                onSave: handleAddCategory,
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <DropdownWithAdd
                                            value={formData.priority}
                                            options={priorities}
                                            onValueChange={(value) => setFormData({ ...formData, priority: value as MessagePriority })}
                                            addButtonLabel="Add New Priority"
                                            quickAddConfig={{
                                                title: 'Add New Priority Level',
                                                fields: [
                                                    { name: 'name', label: 'Priority Name', type: 'text', required: true, placeholder: 'e.g., Critical' },
                                                ],
                                                onSave: handleAddPriority,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium flex items-center gap-2 text-gray-700">
                                        <CalendarIcon className="h-4 w-4" /> Schedule
                                    </h3>
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startTime">Start Time *</Label>
                                            <Input
                                                id="startTime"
                                                type="datetime-local"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endTime">End Time *</Label>
                                            <Input
                                                id="endTime"
                                                type="datetime-local"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium flex items-center gap-2 text-gray-700">
                                        <MapPin className="h-4 w-4" /> Location & logistics
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Venue / Location</Label>
                                            <DropdownWithAdd
                                                value={formData.location}
                                                options={locations}
                                                onValueChange={(value) => setFormData({ ...formData, location: value })}
                                                addButtonLabel="Add New Location"
                                                quickAddConfig={{
                                                    title: 'Add New Location',
                                                    fields: [
                                                        { name: 'name', label: 'Location Name', type: 'text', required: true, placeholder: 'e.g., Meditation Hall' },
                                                        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                                    ],
                                                    onSave: handleAddLocation,
                                                }}
                                                placeholder="Select or add location"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="capacity">Capacity</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    value={formData.capacity}
                                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2 pt-8">
                                                <Checkbox
                                                    id="rsvp"
                                                    checked={formData.rsvpEnabled}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, rsvpEnabled: checked as boolean })}
                                                />
                                                <Label htmlFor="rsvp">Enable RSVP</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6 space-y-2">
                                <Label htmlFor="description">Event Description *</Label>
                                <Textarea
                                    id="description"
                                    className="min-h-[200px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    placeholder="Provide detailed information about the event..."
                                />
                            </div>

                            <div className="border-t pt-6 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="autoCreateAnnouncement"
                                        checked={formData.autoCreateAnnouncement}
                                        onCheckedChange={(checked) => setFormData({ ...formData, autoCreateAnnouncement: checked as boolean })}
                                    />
                                    <Label htmlFor="autoCreateAnnouncement">Auto-create announcement when published</Label>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <CustomFields
                            initialCustomFields={formData.customFields}
                            onCustomFieldsChange={(fields) => setFormData(prev => ({ ...prev, customFields: fields }))}
                        />
                    </div>

                    <div className="mt-6">
                        <ApprovalWorkflow
                            currentStatus={formData.status}
                            onStatusChange={handleStatusChange}
                            approvalHistory={formData.approvals.map((a, idx) => ({
                                level: idx + 1,
                                status: a.status === 'approved' ? 'approved' : 'pending_review',
                                reviewedBy: a.reviewedBy || user?.id || 'Unknown',
                                reviewedAt: a.reviewedAt || new Date().toISOString(),
                                comments: a.comments,
                            }))}
                        />
                    </div>

                    <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t flex justify-end items-center gap-4 z-50">
                        <Button type="button" variant="outline" onClick={() => navigate('/pr/calendar')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save className="h-4 w-4 mr-2" /> Save Event
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
