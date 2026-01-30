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
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FestivalEvent } from '@/types/rituals';
import { Sacred } from '@/types/temple-structure';
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';

interface FestivalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  festival?: FestivalEvent | null;
  sacreds: Sacred[];
  onSave: (festival: Partial<FestivalEvent>) => void;
}

export function FestivalModal({
  open,
  onOpenChange,
  festival,
  sacreds,
  onSave,
}: FestivalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sacredId: '',
    startDate: '',
    endDate: '',
    notes: '',
    scheduleOverrideRules: {
      overrideRegularSchedule: false,
      overrideStartDate: '',
      overrideEndDate: '',
    },
    specialOfferings: [] as string[],
    pricingAdjustments: {} as Record<string, number>,
    capacityAdjustments: {} as Record<string, number>,
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (festival) {
      setFormData({
        name: festival.name,
        sacredId: festival.sacredId,
        startDate: festival.startDate,
        endDate: festival.endDate,
        notes: festival.notes || '',
        scheduleOverrideRules: festival.scheduleOverrideRules || {
          overrideRegularSchedule: false,
          overrideStartDate: '',
          overrideEndDate: '',
        },
        specialOfferings: festival.specialOfferings || [],
        pricingAdjustments: festival.pricingAdjustments || {},
        capacityAdjustments: festival.capacityAdjustments || {},
        customFields: festival.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        sacredId: sacreds[0]?.id || '',
        startDate: '',
        endDate: '',
        notes: '',
        scheduleOverrideRules: {
          overrideRegularSchedule: false,
          overrideStartDate: '',
          overrideEndDate: '',
        },
        specialOfferings: [],
        pricingAdjustments: {},
        capacityAdjustments: {},
        customFields: {},
      });
    }
  }, [festival, sacreds, open]);
  
  const sacredOptions = sacreds.filter(s => s.status === 'active').map(s => ({ value: s.id, label: s.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const data: Partial<FestivalEvent> = {
      ...festival,
      name: formData.name,
      sacredId: formData.sacredId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
      duration,
      scheduleOverrideRules: formData.scheduleOverrideRules.overrideRegularSchedule ? formData.scheduleOverrideRules : undefined,
      specialOfferings: formData.specialOfferings.length > 0 ? formData.specialOfferings : undefined,
      pricingAdjustments: Object.keys(formData.pricingAdjustments).length > 0 ? formData.pricingAdjustments : undefined,
      capacityAdjustments: Object.keys(formData.capacityAdjustments).length > 0 ? formData.capacityAdjustments : undefined,
      customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
    };
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{festival ? 'Edit Festival Event' : 'Add Festival Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="overrides">Overrides</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sacred">Sacred *</Label>
                <SearchableSelect
                  options={sacredOptions}
                  value={formData.sacredId}
                  onChange={(value) => setFormData({ ...formData, sacredId: value })}
                  placeholder="Select sacred"
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter notes about this festival"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="overrides" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overrideSchedule"
                  checked={formData.scheduleOverrideRules.overrideRegularSchedule}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduleOverrideRules: {
                      ...formData.scheduleOverrideRules,
                      overrideRegularSchedule: e.target.checked
                    }
                  })}
                />
                <Label htmlFor="overrideSchedule" className="font-normal cursor-pointer">
                  Override Regular Schedule
                </Label>
              </div>
              
              {formData.scheduleOverrideRules.overrideRegularSchedule && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overrideStart">Override Start Date</Label>
                    <Input
                      id="overrideStart"
                      type="date"
                      value={formData.scheduleOverrideRules.overrideStartDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        scheduleOverrideRules: {
                          ...formData.scheduleOverrideRules,
                          overrideStartDate: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overrideEnd">Override End Date</Label>
                    <Input
                      id="overrideEnd"
                      type="date"
                      value={formData.scheduleOverrideRules.overrideEndDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        scheduleOverrideRules: {
                          ...formData.scheduleOverrideRules,
                          overrideEndDate: e.target.value
                        }
                      })}
                    />
                  </div>
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
            <Button type="submit">{festival ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
