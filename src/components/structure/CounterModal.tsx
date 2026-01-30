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
import { Counter, HallRoom, counterTypeLabels, StructureStatus } from '@/types/temple-structure';
import { CustomFieldsEditor } from './CustomFieldsEditor';

interface CounterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counter?: Counter | null;
  hallRooms: HallRoom[];
  onSave: (counter: Partial<Counter>) => void;
}

export function CounterModal({ 
  open, 
  onOpenChange, 
  counter, 
  hallRooms,
  onSave 
}: CounterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    counterType: 'seva' as Counter['counterType'],
    hallRoomId: '',
    description: '',
    status: 'active' as StructureStatus,
    servicePricing: { baseRate: 0, specialRate: 0, currency: 'INR' },
    queueLengthLimit: 0,
    paymentMethods: [] as Array<'cash' | 'card' | 'digital' | 'upi'>,
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (counter) {
      setFormData({
        name: counter.name,
        counterType: counter.counterType,
        hallRoomId: counter.hallRoomId,
        description: counter.description,
        status: counter.status,
        servicePricing: counter.servicePricing || { baseRate: 0, specialRate: 0, currency: 'INR' },
        queueLengthLimit: counter.queueLengthLimit || 0,
        paymentMethods: counter.paymentMethods || [],
        customFields: counter.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        counterType: 'seva',
        hallRoomId: hallRooms[0]?.id || '',
        description: '',
        status: 'active',
        servicePricing: { baseRate: 0, specialRate: 0, currency: 'INR' },
        queueLengthLimit: 0,
        paymentMethods: [],
        customFields: {},
      });
    }
  }, [counter, hallRooms, open]);
  
  const hallRoomOptions = hallRooms.map(h => ({ value: h.id, label: h.name }));
  const handleAddNewHallRoom = async (name: string) => {
    const newHallRoom: HallRoom = {
      id: `hall-${Date.now()}`,
      name,
      type: 'hall',
      zoneId: '',
      capacity: 0,
      description: '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    hallRooms.push(newHallRoom);
    return { value: newHallRoom.id, label: newHallRoom.name };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...counter,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{counter ? 'Edit Counter' : 'Add Counter'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Counter Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter counter name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="counterType">Counter Type *</Label>
                <SearchableSelect
                  options={Object.entries(counterTypeLabels).map(([value, label]) => ({ value, label }))}
                  value={formData.counterType}
                  onChange={(value) => setFormData({ ...formData, counterType: value as Counter['counterType'] })}
                  placeholder="Select type"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hallRoom">Hall / Room *</Label>
                <SearchableSelect
                  options={hallRoomOptions}
                  value={formData.hallRoomId}
                  onChange={(value) => setFormData({ ...formData, hallRoomId: value })}
                  placeholder="Select hall/room"
                  addNewLabel="+ Add New Hall/Room"
                  onAddNew={handleAddNewHallRoom}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate (₹)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    value={formData.servicePricing.baseRate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      servicePricing: { ...formData.servicePricing, baseRate: parseFloat(e.target.value) || 0 }
                    })}
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
                <Label>Payment Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {['cash', 'card', 'digital', 'upi'].map((method) => (
                    <label key={method} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.includes(method as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ 
                              ...formData, 
                              paymentMethods: [...formData.paymentMethods, method as any]
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              paymentMethods: formData.paymentMethods.filter(m => m !== method)
                            });
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{method}</span>
                    </label>
                  ))}
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
              {counter ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
