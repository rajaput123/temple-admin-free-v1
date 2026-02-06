import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';
import type { CrisisAlert, CrisisType, MessagePriority, CommunicationChannel } from '@/types/communications';

const defaultCrisisTypes: CrisisType[] = ['crowd_control', 'delay', 'incident', 'weather', 'emergency', 'other'];
const defaultPriorities: MessagePriority[] = ['normal', 'high', 'urgent', 'crisis'];
const defaultChannels: CommunicationChannel[] = ['display_board', 'website', 'app', 'sms', 'whatsapp', 'email', 'social_media'];

interface CrisisAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: CrisisAlert | null;
  onSave: (data: Partial<CrisisAlert>) => void;
}

export function CrisisAlertModal({
  open,
  onOpenChange,
  alert,
  onSave,
}: CrisisAlertModalProps) {
  const [crisisTypes, setCrisisTypes] = useState<string[]>(defaultCrisisTypes);
  const [priorities, setPriorities] = useState<string[]>(defaultPriorities);
  const [channels, setChannels] = useState<CommunicationChannel[]>(defaultChannels);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [formData, setFormData] = useState({
    crisisType: 'emergency' as CrisisType,
    title: '',
    content: '',
    priority: 'urgent' as MessagePriority,
    channels: [] as CommunicationChannel[],
    geoTargeted: false,
    geoLocation: '',
    isEmergencyOverride: false,
  });

  const handleAddCrisisType = async (data: Record<string, any>): Promise<string> => {
    const newType = data.name?.toLowerCase().trim().replace(' ', '_') as CrisisType;
    if (!newType || crisisTypes.includes(newType)) {
      throw new Error('Crisis type already exists or invalid');
    }
    setCrisisTypes([...crisisTypes, newType]);
    return newType;
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
    if (alert) {
      setFormData({
        crisisType: alert.crisisType,
        title: alert.title,
        content: alert.content,
        priority: alert.priority,
        channels: alert.channels || [],
        geoTargeted: alert.geoTargeted || false,
        geoLocation: alert.geoLocation || '',
        isEmergencyOverride: alert.isEmergencyOverride || false,
      });
      setCustomFields((alert as any).customFields || []);
    } else {
      setFormData({
        crisisType: 'emergency',
        title: '',
        content: '',
        priority: 'urgent',
        channels: [],
        geoTargeted: false,
        geoLocation: '',
        isEmergencyOverride: false,
      });
      setCustomFields([]);
    }
  }, [alert, open]);

  const toggleChannel = (channel: CommunicationChannel) => {
    setFormData({
      ...formData,
      channels: formData.channels.includes(channel)
        ? formData.channels.filter(c => c !== channel)
        : [...formData.channels, channel],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      customFields: customFields as any,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-red-600">
            {alert ? 'Edit Crisis Alert' : 'New Crisis Alert'}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Crisis alerts bypass normal approval workflows and are published immediately. Use with caution.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crisisType" className="font-bold">Crisis Type *</Label>
              <DropdownWithAdd
                value={formData.crisisType}
                options={crisisTypes}
                onValueChange={(value) => setFormData({ ...formData, crisisType: value as CrisisType })}
                addButtonLabel="Add New Crisis Type"
                quickAddConfig={{
                  title: 'Add New Crisis Type',
                  fields: [
                    { name: 'name', label: 'Crisis Type Name', type: 'text', required: true, placeholder: 'e.g., Security Breach' },
                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                  ],
                  onSave: handleAddCrisisType,
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold">Alert Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Emergency: Temple Temporarily Closed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="font-bold">Alert Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Provide detailed information about the crisis..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="font-bold">Priority *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="geoLocation">Geo Location (Optional)</Label>
                <Input
                  id="geoLocation"
                  value={formData.geoLocation}
                  onChange={(e) => setFormData({ ...formData, geoLocation: e.target.value })}
                  placeholder="e.g., Main Temple Complex"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Distribution Channels *</Label>
              <div className="grid grid-cols-2 gap-2">
                {channels.map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel}
                      checked={formData.channels.includes(channel)}
                      onCheckedChange={() => toggleChannel(channel)}
                    />
                    <Label htmlFor={channel} className="text-sm font-normal cursor-pointer capitalize">
                      {channel.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="geoTargeted"
                  checked={formData.geoTargeted}
                  onCheckedChange={(checked) => setFormData({ ...formData, geoTargeted: checked as boolean })}
                />
                <Label htmlFor="geoTargeted" className="text-sm font-normal cursor-pointer">
                  Geo-targeted alert (only for specific location)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergencyOverride"
                  checked={formData.isEmergencyOverride}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEmergencyOverride: checked as boolean })}
                />
                <Label htmlFor="emergencyOverride" className="text-sm font-normal cursor-pointer">
                  Emergency override (bypass all approvals)
                </Label>
              </div>
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
            <Button type="submit" variant="destructive" className="bg-red-600 hover:bg-red-700">
              {alert ? 'Update Alert' : 'Publish Crisis Alert'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
