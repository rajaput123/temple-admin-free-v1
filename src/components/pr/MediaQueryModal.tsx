import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import type { MediaQuery, MediaQueryStatus, MessagePriority } from '@/types/communications';

interface MediaQueryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: MediaQuery | null;
  mediaContacts: Array<{ id: string; name: string }>;
  onSave: (data: Partial<MediaQuery>) => void;
}

const defaultStatuses: MediaQueryStatus[] = ['pending', 'responded', 'escalated', 'closed'];
const defaultPriorities: MessagePriority[] = ['normal', 'high', 'urgent', 'crisis'];

export function MediaQueryModal({
  open,
  onOpenChange,
  query,
  mediaContacts,
  onSave,
}: MediaQueryModalProps) {
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses);
  const [priorities, setPriorities] = useState<string[]>(defaultPriorities);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [formData, setFormData] = useState({
    queryText: '',
    mediaContactId: '',
    status: 'pending' as MediaQueryStatus,
    priority: 'normal' as MessagePriority,
    responseText: '',
    notes: '',
  });

  const handleAddStatus = async (data: Record<string, any>): Promise<string> => {
    const newStatus = data.name?.toLowerCase().trim();
    if (!newStatus || statuses.includes(newStatus)) {
      throw new Error('Status already exists or invalid');
    }
    setStatuses([...statuses, newStatus]);
    return newStatus;
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
    if (query) {
      setFormData({
        queryText: query.queryText,
        mediaContactId: query.mediaContactId,
        status: query.status,
        priority: query.priority,
        responseText: query.responseText || '',
        notes: query.notes || '',
      });
      setCustomFields((query as any).customFields || []);
    } else {
      setFormData({
        queryText: '',
        mediaContactId: '',
        status: 'pending',
        priority: 'normal',
        responseText: '',
        notes: '',
      });
      setCustomFields([]);
    }
  }, [query, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      customFields: customFields as any,
      receivedAt: query?.receivedAt || new Date().toISOString(),
      respondedAt: formData.status === 'responded' && !query?.respondedAt ? new Date().toISOString() : query?.respondedAt,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{query ? 'Edit Media Query' : 'New Media Query'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mediaContact">Media Contact *</Label>
              <DropdownWithAdd
                value={formData.mediaContactId}
                options={mediaContacts.map(c => c.id)}
                onValueChange={(value) => setFormData({ ...formData, mediaContactId: value })}
                addButtonLabel="Add New Contact"
                quickAddConfig={{
                  title: 'Add New Media Contact',
                  fields: [
                    { name: 'name', label: 'Contact Name', type: 'text', required: true, placeholder: 'e.g., John Doe' },
                    { name: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'e.g., News Channel' },
                  ],
                  onSave: async (data) => {
                    // In a real app, this would create a contact and return the ID
                    const newId = `mc-${Date.now()}`;
                    return newId;
                  },
                }}
                placeholder="Select media contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="queryText">Query Text *</Label>
              <Textarea
                id="queryText"
                value={formData.queryText}
                onChange={(e) => setFormData({ ...formData, queryText: e.target.value })}
                rows={4}
                required
                placeholder="Enter the media inquiry..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <DropdownWithAdd
                  value={formData.status}
                  options={statuses}
                  onValueChange={(value) => setFormData({ ...formData, status: value as MediaQueryStatus })}
                  addButtonLabel="Add New Status"
                  quickAddConfig={{
                    title: 'Add New Status',
                    fields: [
                      { name: 'name', label: 'Status Name', type: 'text', required: true, placeholder: 'e.g., In Review' },
                    ],
                    onSave: handleAddStatus,
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

            <div className="space-y-2">
              <Label htmlFor="responseText">Response Text</Label>
              <Textarea
                id="responseText"
                value={formData.responseText}
                onChange={(e) => setFormData({ ...formData, responseText: e.target.value })}
                rows={4}
                placeholder="Enter your response to the media query..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Internal tracking notes..."
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <CustomFields
              initialCustomFields={customFields}
              onCustomFieldsChange={setCustomFields}
            />
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {query ? 'Update Query' : 'Save Query'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
