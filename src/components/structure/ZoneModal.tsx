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
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zone, Temple, ChildTemple, zoneTypeLabels, StructureStatus } from '@/types/temple-structure';
import { CustomFieldsEditor } from './CustomFieldsEditor';

interface ZoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: Zone | null;
  temples: Temple[];
  childTemples: ChildTemple[];
  onSave: (zone: Partial<Zone>) => void;
}

export function ZoneModal({ 
  open, 
  onOpenChange, 
  zone, 
  temples,
  childTemples,
  onSave 
}: ZoneModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    zoneType: 'public' as Zone['zoneType'],
    associatedTempleId: '',
    associatedTempleType: 'temple' as Zone['associatedTempleType'],
    description: '',
    status: 'active' as StructureStatus,
    capacity: 0,
    queueLengthLimit: 0,
    pradakshinaSequence: 0,
    accessRestrictions: [] as Array<'vip' | 'general' | 'disabled' | 'staff'>,
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name,
        zoneType: zone.zoneType,
        associatedTempleId: zone.associatedTempleId,
        associatedTempleType: zone.associatedTempleType,
        description: zone.description,
        status: zone.status,
        capacity: zone.capacity || 0,
        queueLengthLimit: zone.queueLengthLimit || 0,
        pradakshinaSequence: zone.pradakshinaSequence || 0,
        accessRestrictions: zone.accessRestrictions || [],
        customFields: zone.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        zoneType: 'public',
        associatedTempleId: temples[0]?.id || '',
        associatedTempleType: 'temple',
        description: '',
        status: 'active',
        capacity: 0,
        queueLengthLimit: 0,
        pradakshinaSequence: 0,
        accessRestrictions: [],
        customFields: {},
      });
    }
  }, [zone, temples, open]);
  
  const allTempleOptions = [
    ...temples.map(t => ({ value: `temple:${t.id}`, label: t.name })),
    ...childTemples.map(t => ({ value: `child_temple:${t.id}`, label: `${t.name} (Sub-Temple)` })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...zone,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{zone ? 'Edit Zone / Area' : 'Add Zone / Area'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Zone Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter zone name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoneType">Zone Type *</Label>
                <SearchableSelect
                  options={Object.entries(zoneTypeLabels).map(([value, label]) => ({ value, label }))}
                  value={formData.zoneType}
                  onChange={(value) => setFormData({ ...formData, zoneType: value as Zone['zoneType'] })}
                  placeholder="Select type"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="associatedTemple">Associated Temple *</Label>
                <SearchableSelect
                  options={allTempleOptions}
                  value={`${formData.associatedTempleType}:${formData.associatedTempleId}`}
                  onChange={(value) => {
                    const [type, id] = value.split(':');
                    setFormData({ 
                      ...formData, 
                      associatedTempleType: type as Zone['associatedTempleType'],
                      associatedTempleId: id 
                    });
                  }}
                  placeholder="Select temple"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="queueLimit">Queue Limit</Label>
                  <Input
                    id="queueLimit"
                    type="number"
                    value={formData.queueLengthLimit}
                    onChange={(e) => setFormData({ ...formData, queueLengthLimit: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                  }
                />
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
            <Button type="submit">
              {zone ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
