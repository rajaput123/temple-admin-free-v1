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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { TempleEvent, EventCategory, MessagePriority } from '@/types/communications';

interface EventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: TempleEvent | null;
    onSave: (event: Partial<TempleEvent>) => void;
}

const eventCategories: EventCategory[] = [
    'festival',
    'seva',
    'cultural',
    'religious',
    'other',
];

export function EventModal({
    open,
    onOpenChange,
    event,
    onSave,
}: EventModalProps) {
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
        customFields: [] as CustomField[],
    });

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

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                category: event.category,
                startTime: event.startTime.slice(0, 16), // Format for datetime-local
                endTime: event.endTime.slice(0, 16),
                capacity: event.capacity,
                rsvpEnabled: event.rsvpEnabled,
                location: event.location || '',
                priority: event.priority,
                customFields: (event as any).customFields || [],
            });
        } else {
            setFormData({
                title: '',
                description: '',
                category: 'religious',
                startTime: new Date().toISOString().slice(0, 16),
                endTime: new Date().toISOString().slice(0, 16),
                capacity: 100,
                rsvpEnabled: true,
                location: 'Main Hall',
                priority: 'normal',
                customFields: [],
            });
        }
    }, [event, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
            customFields: formData.customFields as any,
        });
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{event ? 'Edit Event' : 'New Event'}</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="e.g. Maha Shivaratri"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
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

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pb-2">
                            <Checkbox
                                id="rsvp"
                                checked={formData.rsvpEnabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, rsvpEnabled: checked as boolean })}
                            />
                            <Label htmlFor="rsvp">Enable RSVP</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            className="min-h-[150px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Event details..."
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <CustomFields
                            initialCustomFields={formData.customFields}
                            onCustomFieldsChange={(fields) => setFormData({ ...formData, customFields: fields })}
                        />
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Event</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
