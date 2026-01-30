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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrasadDistribution, PrasadMaster, PrasadInventory } from '@/types/prasad';

interface DistributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distribution?: PrasadDistribution | null;
  prasadMaster: PrasadMaster[];
  prasadInventory: PrasadInventory[];
  onSave: (distribution: Partial<PrasadDistribution>) => void;
}

export function DistributionModal({
  open,
  onOpenChange,
  distribution,
  prasadMaster,
  prasadInventory,
  onSave,
}: DistributionModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    channel: 'counter' as 'counter' | 'vip' | 'annadanam' | 'external_event' | 'sponsor',
    prasadId: '',
    prasadName: '',
    quantity: 0,
    packSize: 'medium' as 'small' | 'medium' | 'large' | 'custom',
  });

  useEffect(() => {
    if (distribution) {
      setFormData({
        date: distribution.date,
        channel: distribution.channel,
        prasadId: distribution.prasadId,
        prasadName: distribution.prasadName,
        quantity: distribution.quantity,
        packSize: distribution.packSize,
      });
    }
  }, [distribution, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const prasadOptions = prasadMaster.map(p => ({ value: p.id, label: p.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{distribution ? 'Edit Distribution' : 'Create Distribution'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel *</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value: any) => setFormData({ ...formData, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="counter">Counter</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="annadanam">Annadanam</SelectItem>
                    <SelectItem value="external_event">External Event</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prasad">Prasad *</Label>
              <SearchableSelect
                options={prasadOptions}
                value={formData.prasadId}
                onChange={(value) => {
                  const prasad = prasadMaster.find(p => p.id === value);
                  setFormData({
                    ...formData,
                    prasadId: value,
                    prasadName: prasad?.name || '',
                  });
                }}
                placeholder="Select prasad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size</Label>
                <Select
                  value={formData.packSize}
                  onValueChange={(value: any) => setFormData({ ...formData, packSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{distribution ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
