import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import { useFeedbackResponseNotification } from '@/lib/pr-integration-flows';
import type { FeedbackTicket, MessagePriority } from '@/types/communications';

const defaultCategories = ['suggestion', 'complaint', 'appreciation', 'inquiry', 'technical', 'other'];
const defaultPriorities: MessagePriority[] = ['normal', 'high', 'urgent', 'crisis'];

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: FeedbackTicket | null;
    onSave: (data: Partial<FeedbackTicket>) => void;
}

export function FeedbackModal({
    open,
    onOpenChange,
    ticket,
    onSave,
}: FeedbackModalProps) {
    const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved'>('open');
    const [priority, setPriority] = useState<MessagePriority>('normal');
    const [adminNotes, setAdminNotes] = useState('');
    const [response, setResponse] = useState('');
    const [categories, setCategories] = useState<string[]>(defaultCategories);
    const [priorities, setPriorities] = useState<string[]>(defaultPriorities);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const { sendResponse } = useFeedbackResponseNotification(ticket?.id || '', status);

    const handleAddCategory = async (data: Record<string, any>): Promise<string> => {
        const newCategory = data.name?.toLowerCase().trim();
        if (!newCategory || categories.includes(newCategory)) {
            throw new Error('Category already exists or invalid');
        }
        setCategories([...categories, newCategory]);
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

    useEffect(() => {
        if (ticket) {
            setStatus(ticket.status);
            setPriority(ticket.priority);
            setAdminNotes(ticket.adminNotes || '');
            setResponse(ticket.response || '');
            setCustomFields((ticket as any).customFields || []);
        } else {
            setCustomFields([]);
        }
    }, [ticket, open]);

    const handleSave = async () => {
        const wasResolved = ticket?.status === 'resolved';
        const isNowResolved = status === 'resolved';
        
        onSave({
            status,
            priority,
            adminNotes,
            response,
            updatedAt: new Date().toISOString(),
            resolvedAt: isNowResolved && !wasResolved ? new Date().toISOString() : ticket?.resolvedAt,
            customFields: customFields as any,
        });

        // Auto-send notification when status changes to resolved
        if (isNowResolved && !wasResolved && ticket && response) {
            await sendResponse(ticket, response);
        }
        
        onOpenChange(false);
    };

    if (!ticket) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Feedback Ticket #{ticket.id.slice(0, 8)}</SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    {/* Read-only Ticket Info */}
                    <div className="grid gap-4 bg-muted/30 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Category</Label>
                                <div className="font-medium capitalize">{ticket.category}</div>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Submitted By</Label>
                                <div className="font-medium">{ticket.userName || 'Anonymous'}</div>
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <p className="text-sm mt-1 leading-relaxed">{ticket.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <DropdownWithAdd
                                value={priority}
                                options={priorities}
                                onValueChange={(v) => setPriority(v as MessagePriority)}
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

                    <div className="grid gap-2">
                        <Label htmlFor="response">Response to Devotee</Label>
                        <Textarea
                            id="response"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your reply here..."
                            rows={4}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Internal Admin Notes</Label>
                        <Textarea
                            id="notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Internal tracking notes..."
                            rows={3}
                            className="bg-yellow-50/50 min-h-[80px]"
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
                        Update Ticket
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
