import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import type { MediaContact } from '@/types/communications';

interface MediaContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: MediaContact | null;
  onSave: (data: Partial<MediaContact>) => void;
}

const defaultOrganizations = ['Local News Daily', 'Regional TV', 'National Press', 'Online Media', 'Radio Station'];
const defaultDesignations = ['Senior Reporter', 'News Anchor', 'Correspondent', 'Editor', 'Photographer'];
const defaultBeats = ['Religious Affairs', 'Community Events', 'Local News', 'Culture', 'General'];

export function MediaContactModal({
  open,
  onOpenChange,
  contact,
  onSave,
}: MediaContactModalProps) {
  const [organizations, setOrganizations] = useState<string[]>(defaultOrganizations);
  const [designations, setDesignations] = useState<string[]>(defaultDesignations);
  const [beats, setBeats] = useState<string[]>(defaultBeats);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    designation: '',
    contactNumber: '',
    email: '',
    beat: '',
    notes: '',
    isVerified: false,
  });

  const handleAddOrganization = async (data: Record<string, any>): Promise<string> => {
    const newOrg = data.name?.trim();
    if (!newOrg || organizations.includes(newOrg)) {
      throw new Error('Organization already exists or invalid');
    }
    setOrganizations([...organizations, newOrg]);
    return newOrg;
  };

  const handleAddDesignation = async (data: Record<string, any>): Promise<string> => {
    const newDesig = data.name?.trim();
    if (!newDesig || designations.includes(newDesig)) {
      throw new Error('Designation already exists or invalid');
    }
    setDesignations([...designations, newDesig]);
    return newDesig;
  };

  const handleAddBeat = async (data: Record<string, any>): Promise<string> => {
    const newBeat = data.name?.trim();
    if (!newBeat || beats.includes(newBeat)) {
      throw new Error('Beat already exists or invalid');
    }
    setBeats([...beats, newBeat]);
    return newBeat;
  };

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        organization: contact.organization,
        designation: contact.designation,
        contactNumber: contact.contactNumber,
        email: contact.email,
        beat: contact.beat || '',
        notes: contact.notes || '',
        isVerified: contact.isVerified,
      });
      setCustomFields((contact as any).customFields || []);
    } else {
      setFormData({
        name: '',
        organization: '',
        designation: '',
        contactNumber: '',
        email: '',
        beat: '',
        notes: '',
        isVerified: false,
      });
      setCustomFields([]);
    }
  }, [contact, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      customFields: customFields as any,
      createdAt: contact?.createdAt || new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{contact ? 'Edit Media Contact' : 'Add New Media Contact'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <DropdownWithAdd
                  value={formData.organization}
                  options={organizations}
                  onValueChange={(value) => setFormData({ ...formData, organization: value })}
                  addButtonLabel="Add New Organization"
                  quickAddConfig={{
                    title: 'Add New Organization',
                    fields: [
                      { name: 'name', label: 'Organization Name', type: 'text', required: true, placeholder: 'e.g., News Channel' },
                    ],
                    onSave: handleAddOrganization,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <DropdownWithAdd
                  value={formData.designation}
                  options={designations}
                  onValueChange={(value) => setFormData({ ...formData, designation: value })}
                  addButtonLabel="Add New Designation"
                  quickAddConfig={{
                    title: 'Add New Designation',
                    fields: [
                      { name: 'name', label: 'Designation', type: 'text', required: true, placeholder: 'e.g., Senior Editor' },
                    ],
                    onSave: handleAddDesignation,
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beat">Beat/Coverage Area</Label>
                <DropdownWithAdd
                  value={formData.beat}
                  options={beats}
                  onValueChange={(value) => setFormData({ ...formData, beat: value })}
                  addButtonLabel="Add New Beat"
                  quickAddConfig={{
                    title: 'Add New Beat',
                    fields: [
                      { name: 'name', label: 'Beat Name', type: 'text', required: true, placeholder: 'e.g., Technology' },
                    ],
                    onSave: handleAddBeat,
                  }}
                  placeholder="Select or add beat"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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
              {contact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
