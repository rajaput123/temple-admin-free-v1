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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Offering, OfferingType, OfferingStatus, offeringTypeLabels, dayLabels, SevaType, DarshanType, DayType, DevoteeCategory } from '@/types/rituals';
import { Sacred } from '@/types/temple-structure';
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';

interface OfferingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering?: Offering | null;
  sacreds: Sacred[];
  onSave: (offering: Partial<Offering>) => void;
}

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function OfferingModal({
  open,
  onOpenChange,
  offering,
  sacreds,
  onSave,
}: OfferingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'seva' as OfferingType,
    sevaType: undefined as SevaType | undefined,
    darshanType: undefined as DarshanType | undefined,
    sacredId: '',
    applicableDays: ['all'] as string[],
    startTime: '',
    endTime: '',
    amount: 0,
    isFree: false,
    capacity: undefined as number | undefined,
    status: 'active' as OfferingStatus,
    pricingByTimeSlot: [] as Array<{ timeRange: string; amount: number }>,
    pricingByDayType: {} as Record<DayType, number>,
    festivalPricing: undefined as number | undefined,
    capacityPerBatch: undefined as number | undefined,
    capacityPerTimeSlot: undefined as number | undefined,
    eligibilityRules: {
      minAge: undefined as number | undefined,
      maxAge: undefined as number | undefined,
      genderRestriction: 'all' as 'male' | 'female' | 'all',
      devoteeCategories: [] as DevoteeCategory[],
    },
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (offering) {
      setFormData({
        name: offering.name,
        type: offering.type,
        sevaType: offering.sevaType,
        darshanType: offering.darshanType,
        sacredId: offering.sacredId,
        applicableDays: offering.applicableDays,
        startTime: offering.startTime || '',
        endTime: offering.endTime || '',
        amount: offering.amount,
        isFree: offering.amount === 0,
        capacity: offering.capacity,
        status: offering.status,
        pricingByTimeSlot: offering.pricingByTimeSlot || [],
        pricingByDayType: offering.pricingByDayType || {},
        festivalPricing: offering.festivalPricing,
        capacityPerBatch: offering.capacityPerBatch,
        capacityPerTimeSlot: offering.capacityPerTimeSlot,
        eligibilityRules: offering.eligibilityRules || {
          minAge: undefined,
          maxAge: undefined,
          genderRestriction: 'all',
          devoteeCategories: [],
        },
        customFields: offering.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        type: 'seva',
        sevaType: undefined,
        darshanType: undefined,
        sacredId: sacreds[0]?.id || '',
        applicableDays: ['all'],
        startTime: '',
        endTime: '',
        amount: 0,
        isFree: false,
        capacity: undefined,
        status: 'active',
        pricingByTimeSlot: [],
        pricingByDayType: {},
        festivalPricing: undefined,
        capacityPerBatch: undefined,
        capacityPerTimeSlot: undefined,
        eligibilityRules: {
          minAge: undefined,
          maxAge: undefined,
          genderRestriction: 'all',
          devoteeCategories: [],
        },
        customFields: {},
      });
    }
  }, [offering, sacreds, open]);
  
  const sacredOptions = sacreds.filter(s => s.status === 'active').map(s => ({ value: s.id, label: s.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<Offering> = {
      ...offering,
      name: formData.name,
      type: formData.type,
      sevaType: formData.sevaType,
      darshanType: formData.darshanType,
      sacredId: formData.sacredId,
      applicableDays: formData.applicableDays,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      amount: formData.isFree ? 0 : formData.amount,
      capacity: formData.capacity,
      status: formData.status,
      pricingByTimeSlot: formData.pricingByTimeSlot.length > 0 ? formData.pricingByTimeSlot : undefined,
      pricingByDayType: Object.keys(formData.pricingByDayType).length > 0 ? formData.pricingByDayType : undefined,
      festivalPricing: formData.festivalPricing,
      capacityPerBatch: formData.capacityPerBatch,
      capacityPerTimeSlot: formData.capacityPerTimeSlot,
      eligibilityRules: formData.eligibilityRules,
      customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
    };
    onSave(data);
    onOpenChange(false);
  };

  const toggleDay = (day: string) => {
    if (day === 'all') {
      setFormData({ ...formData, applicableDays: ['all'] });
    } else {
      const newDays = formData.applicableDays.includes(day)
        ? formData.applicableDays.filter(d => d !== day)
        : [...formData.applicableDays.filter(d => d !== 'all'), day];
      setFormData({ ...formData, applicableDays: newDays.length > 0 ? newDays : ['all'] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offering ? 'Edit Offering' : 'Add Offering'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="capacity">Capacity</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Offering Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter offering name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Offering Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: OfferingType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(offeringTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          
          {formData.type === 'seva' && (
            <div className="space-y-2">
              <Label htmlFor="sevaType">Seva Type</Label>
              <select
                id="sevaType"
                value={formData.sevaType || ''}
                onChange={(e) => setFormData({ ...formData, sevaType: e.target.value as SevaType })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                <option value="archana">Archana</option>
                <option value="abhishekam">Abhishekam</option>
                <option value="special_darshan">Special Darshan</option>
                <option value="kumkumarchana">Kumkumarchana</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
          
          {formData.type === 'darshan' && (
            <div className="space-y-2">
              <Label htmlFor="darshanType">Darshan Type</Label>
              <select
                id="darshanType"
                value={formData.darshanType || ''}
                onChange={(e) => setFormData({ ...formData, darshanType: e.target.value as DarshanType })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                <option value="mukh_darshan">Mukh Darshan</option>
                <option value="padha_darshan">Padha Darshan</option>
                <option value="vip_darshan">VIP Darshan</option>
                <option value="general">General</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Applicable Days</Label>
            <div className="space-y-2 border rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-days"
                  checked={formData.applicableDays.includes('all')}
                  onCheckedChange={() => toggleDay('all')}
                />
                <Label htmlFor="all-days" className="font-normal cursor-pointer">
                  All Days
                </Label>
              </div>
              {weekdays.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={formData.applicableDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                    disabled={formData.applicableDays.includes('all')}
                  />
                  <Label htmlFor={day} className="font-normal cursor-pointer">
                    {dayLabels[day]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status</Label>
            </div>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, status: checked ? 'active' : 'paused' })
              }
            />
          </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFree: checked as boolean, amount: checked ? 0 : formData.amount })
                    }
                  />
                  <Label htmlFor="isFree" className="font-normal cursor-pointer">
                    Free
                  </Label>
                </div>
                {!formData.isFree && (
                  <div>
                    <Label htmlFor="amount">Base Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      placeholder="Enter amount"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Pricing by Day Type (₹)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Weekday</Label>
                    <Input
                      type="number"
                      value={formData.pricingByDayType.weekday || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricingByDayType: { ...formData.pricingByDayType, weekday: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weekend</Label>
                    <Input
                      type="number"
                      value={formData.pricingByDayType.weekend || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricingByDayType: { ...formData.pricingByDayType, weekend: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Festival</Label>
                    <Input
                      type="number"
                      value={formData.festivalPricing || ''}
                      onChange={(e) => setFormData({ ...formData, festivalPricing: parseFloat(e.target.value) || undefined })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="capacity" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Enter capacity"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacityPerBatch">Capacity per Batch</Label>
                  <Input
                    id="capacityPerBatch"
                    type="number"
                    min="1"
                    value={formData.capacityPerBatch || ''}
                    onChange={(e) => setFormData({ ...formData, capacityPerBatch: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacityPerTimeSlot">Capacity per Time Slot</Label>
                  <Input
                    id="capacityPerTimeSlot"
                    type="number"
                    min="1"
                    value={formData.capacityPerTimeSlot || ''}
                    onChange={(e) => setFormData({ ...formData, capacityPerTimeSlot: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Eligibility Rules</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Min Age</Label>
                    <Input
                      type="number"
                      value={formData.eligibilityRules.minAge || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityRules: { ...formData.eligibilityRules, minAge: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Age</Label>
                    <Input
                      type="number"
                      value={formData.eligibilityRules.maxAge || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityRules: { ...formData.eligibilityRules, maxAge: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Gender Restriction</Label>
                  <select
                    value={formData.eligibilityRules.genderRestriction}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibilityRules: { ...formData.eligibilityRules, genderRestriction: e.target.value as 'male' | 'female' | 'all' }
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
              </div>
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
            <Button type="submit">{offering ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
