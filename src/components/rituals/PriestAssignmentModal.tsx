import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriestAssignment, PriestRole, priestRoleLabels } from '@/types/rituals';
import { Sacred } from '@/types/temple-structure';
import { Offering } from '@/types/rituals';
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';

interface PriestAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: PriestAssignment | null;
  sacreds: Sacred[];
  offerings: Offering[];
  onSave: (assignment: Partial<PriestAssignment>) => void;
}

export function PriestAssignmentModal({
  open,
  onOpenChange,
  assignment,
  sacreds,
  offerings,
  onSave,
}: PriestAssignmentModalProps) {
  const [formData, setFormData] = useState({
    priestId: '',
    priestName: '',
    sacredId: '',
    offeringId: '',
    startDate: '',
    endDate: '',
    role: 'main' as PriestRole,
    shift: '',
    isSubstitute: false,
    originalPriestId: '',
    customFields: {} as Record<string, string>,
  });

  const [filteredOfferings, setFilteredOfferings] = useState<Offering[]>([]);

  useEffect(() => {
    if (assignment) {
      setFormData({
        priestId: assignment.priestId || '',
        priestName: assignment.priestName,
        sacredId: assignment.sacredId,
        offeringId: assignment.offeringId,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        role: assignment.role,
        shift: assignment.shift || '',
        isSubstitute: assignment.isSubstitute || false,
        originalPriestId: assignment.originalPriestId || '',
        customFields: assignment.customFields || {},
      });
    } else {
      setFormData({
        priestId: '',
        priestName: '',
        sacredId: sacreds[0]?.id || '',
        offeringId: '',
        startDate: '',
        endDate: '',
        role: 'main',
        shift: '',
        isSubstitute: false,
        originalPriestId: '',
        customFields: {},
      });
    }
  }, [assignment, sacreds, open]);
  
  const sacredOptions = sacreds.filter(s => s.status === 'active').map(s => ({ value: s.id, label: s.name }));

  useEffect(() => {
    if (formData.sacredId) {
      const filtered = offerings.filter((o) => o.sacredId === formData.sacredId);
      setFilteredOfferings(filtered);
      // Reset offeringId if current selection is invalid for new sacred
      if (formData.offeringId && !filtered.find((o) => o.id === formData.offeringId)) {
        setFormData((prev) => ({ ...prev, offeringId: '' }));
      }
    } else {
      setFilteredOfferings([]);
    }
  }, [formData.sacredId, formData.offeringId, offerings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<PriestAssignment> = {
      ...assignment,
      priestId: formData.priestId,
      priestName: formData.priestName,
      sacredId: formData.sacredId,
      offeringId: formData.offeringId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      role: formData.role,
      shift: formData.shift || undefined,
      isSubstitute: formData.isSubstitute || undefined,
      originalPriestId: formData.isSubstitute ? formData.originalPriestId : undefined,
      customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
    };
    onSave(data);
    onOpenChange(false);
  };
  
  const offeringOptions = filteredOfferings.map(o => ({ value: o.id, label: o.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Edit Priest Assignment' : 'Add Priest Assignment'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="priestName">Priest Name *</Label>
                <Input
                  id="priestName"
                  value={formData.priestName}
                  onChange={(e) => setFormData({ ...formData, priestName: e.target.value })}
                  placeholder="Enter priest name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sacred">Sacred *</Label>
                <SearchableSelect
                  options={sacredOptions}
                  value={formData.sacredId}
                  onChange={(value) => setFormData({ ...formData, sacredId: value, offeringId: '' })}
                  placeholder="Select sacred"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offering">Offering / Ritual *</Label>
                <SearchableSelect
                  options={offeringOptions}
                  value={formData.offeringId}
                  onChange={(value) => setFormData({ ...formData, offeringId: value })}
                  placeholder="Select offering"
                  disabled={!formData.sacredId || filteredOfferings.length === 0}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as PriestRole })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Object.entries(priestRoleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift</Label>
                  <Input
                    id="shift"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    placeholder="e.g., Morning, Evening"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSubstitute"
                  checked={formData.isSubstitute}
                  onChange={(e) => setFormData({ ...formData, isSubstitute: e.target.checked })}
                />
                <Label htmlFor="isSubstitute" className="font-normal cursor-pointer">
                  Is Substitute
                </Label>
              </div>
              
              {formData.isSubstitute && (
                <div className="space-y-2">
                  <Label htmlFor="originalPriestId">Original Priest ID</Label>
                  <Input
                    id="originalPriestId"
                    value={formData.originalPriestId}
                    onChange={(e) => setFormData({ ...formData, originalPriestId: e.target.value })}
                    placeholder="Enter original priest ID"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="custom" className="mt-4">
              <CustomFieldsEditor
                customFields={formData.customFields}
                onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{assignment ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
