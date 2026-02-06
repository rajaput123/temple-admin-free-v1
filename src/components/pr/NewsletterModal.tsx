import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import type { Newsletter, AudienceType } from '@/types/communications';

const defaultAudienceTypes: AudienceType[] = ['all', 'public', 'devotees', 'donors', 'volunteers', 'members', 'staff'];

interface NewsletterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    newsletter: Newsletter | null;
    onSave: (data: Partial<Newsletter>) => void;
}

export function NewsletterModal({
    open,
    onOpenChange,
    newsletter,
    onSave,
}: NewsletterModalProps) {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [audienceType, setAudienceType] = useState<AudienceType>('all');
    const [scheduledAt, setScheduledAt] = useState('');
    const [audienceTypes, setAudienceTypes] = useState<string[]>(defaultAudienceTypes);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    const handleAddAudience = async (data: Record<string, any>): Promise<string> => {
        const newAudience = data.name?.toLowerCase().trim();
        if (!newAudience || audienceTypes.includes(newAudience)) {
            throw new Error('Audience type already exists or invalid');
        }
        setAudienceTypes([...audienceTypes, newAudience]);
        return newAudience;
    };

    useEffect(() => {
        if (newsletter) {
            setSubject(newsletter.subject);
            setContent(newsletter.content);
            setAudienceType(newsletter.audienceType);
            setScheduledAt(newsletter.scheduledAt || '');
            setCustomFields((newsletter as any).customFields || []);
        } else {
            setSubject('');
            setContent('');
            setAudienceType('all');
            setScheduledAt('');
            setCustomFields([]);
        }
    }, [newsletter, open]);

    const handleSave = () => {
        onSave({
            subject,
            content,
            audienceType,
            scheduledAt: scheduledAt || undefined,
            status: scheduledAt ? 'scheduled' : 'draft',
            customFields: customFields as any,
        });
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-[800px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{newsletter ? 'Edit Newsletter' : 'Create Newsletter'}</SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Newsletter Subject"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="audience">Audience</Label>
                        <DropdownWithAdd
                            value={audienceType}
                            options={audienceTypes}
                            onValueChange={(v) => setAudienceType(v as AudienceType)}
                            addButtonLabel="Add New Audience"
                            quickAddConfig={{
                                title: 'Add New Audience Type',
                                fields: [
                                    { name: 'name', label: 'Audience Name', type: 'text', required: true, placeholder: 'e.g., Regular Devotees' },
                                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                ],
                                onSave: handleAddAudience,
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your newsletter content here..."
                            className="min-h-[400px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            * Rich Text Editor will be integrated here.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="schedule">Schedule Sending (Optional)</Label>
                        <Input
                            id="schedule"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                    </div>
                    <div className="pt-4 border-t">
                        <CustomFields
                            initialCustomFields={customFields}
                            onCustomFieldsChange={setCustomFields}
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        {newsletter ? 'Update' : 'Create & Save'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
