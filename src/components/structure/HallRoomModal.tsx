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
import { HallRoom, Zone, hallRoomTypeLabels, StructureStatus } from '@/types/temple-structure';
import { CustomFieldsEditor } from './CustomFieldsEditor';

interface HallRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hallRoom?: HallRoom | null;
  zones: Zone[];
  onSave: (hallRoom: Partial<HallRoom>) => void;
}

export function HallRoomModal({ 
  open, 
  onOpenChange, 
  hallRoom, 
  zones,
  onSave 
}: HallRoomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'hall' as HallRoom['type'],
    zoneId: '',
    capacity: 0,
    description: '',
    status: 'active' as StructureStatus,
    roomType: 'other' as 'marriage_hall' | 'kalyana_mantapam' | 'meeting_room' | 'prayer_room' | 'other',
    isBookable: false,
    bookingRates: { hourly: 0, daily: 0, special: 0 },
    hasAC: false,
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (hallRoom) {
      setFormData({
        name: hallRoom.name,
        type: hallRoom.type,
        zoneId: hallRoom.zoneId,
        capacity: hallRoom.capacity,
        description: hallRoom.description,
        status: hallRoom.status,
        roomType: hallRoom.roomType || 'other',
        isBookable: hallRoom.isBookable || false,
        bookingRates: hallRoom.bookingRates || { hourly: 0, daily: 0, special: 0 },
        hasAC: hallRoom.hasAC || false,
        customFields: hallRoom.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        type: 'hall',
        zoneId: zones[0]?.id || '',
        capacity: 0,
        description: '',
        status: 'active',
        roomType: 'other',
        isBookable: false,
        bookingRates: { hourly: 0, daily: 0, special: 0 },
        hasAC: false,
        customFields: {},
      });
    }
  }, [hallRoom, zones, open]);
  
  const zoneOptions = zones.map(z => ({ value: z.id, label: z.name }));
  const handleAddNewZone = async (name: string) => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name,
      zoneType: 'public',
      associatedTempleId: '',
      associatedTempleType: 'temple',
      description: '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    zones.push(newZone);
    return { value: newZone.id, label: newZone.name };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...hallRoom,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hallRoom ? 'Edit Hall / Room' : 'Add Hall / Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter hall/room name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <SearchableSelect
                    options={Object.entries(hallRoomTypeLabels).map(([value, label]) => ({ value, label }))}
                    value={formData.type}
                    onChange={(value) => setFormData({ ...formData, type: value as HallRoom['type'] })}
                    placeholder="Select type"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={0}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zone">Zone / Area *</Label>
                <SearchableSelect
                  options={zoneOptions}
                  value={formData.zoneId}
                  onChange={(value) => setFormData({ ...formData, zoneId: value })}
                  placeholder="Select zone"
                  addNewLabel="+ Add New Zone"
                  onAddNew={handleAddNewZone}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <select
                  id="roomType"
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="marriage_hall">Marriage Hall</option>
                  <option value="kalyana_mantapam">Kalyana Mantapam</option>
                  <option value="meeting_room">Meeting Room</option>
                  <option value="prayer_room">Prayer Room</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Bookable</Label>
                  <Switch
                    checked={formData.isBookable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBookable: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Has AC</Label>
                  <Switch
                    checked={formData.hasAC}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasAC: checked })}
                  />
                </div>
              </div>
              
              {formData.isBookable && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.bookingRates.hourly}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookingRates: { ...formData.bookingRates, hourly: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={formData.bookingRates.daily}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookingRates: { ...formData.bookingRates, daily: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialRate">Special Rate (₹)</Label>
                    <Input
                      id="specialRate"
                      type="number"
                      value={formData.bookingRates.special}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookingRates: { ...formData.bookingRates, special: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
              
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
              {hallRoom ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
