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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Holiday } from '@/types/hr';

interface HolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday?: Holiday | null;
  onSave: (holiday: Partial<Holiday>) => void;
}

export function HolidayModal({
  open,
  onOpenChange,
  holiday,
  onSave,
}: HolidayModalProps) {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'religious' as 'national' | 'religious' | 'optional',
    year: currentYear,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type,
        year: holiday.year,
        status: holiday.status,
      });
    } else {
      setFormData({
        name: '',
        date: '',
        type: 'religious',
        year: currentYear,
        status: 'active',
      });
    }
  }, [holiday, open, currentYear]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: holiday?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {holiday ? 'Edit Holiday' : 'Add Holiday'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="form-field">
            <Label className="form-label">
              Holiday Name <span className="form-required">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Diwali"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <Label className="form-label">
                Date <span className="form-required">*</span>
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  const date = e.target.value;
                  const year = date ? new Date(date).getFullYear() : currentYear;
                  setFormData({ ...formData, date, year });
                }}
              />
            </div>
            <div className="form-field">
              <Label className="form-label">Year</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || currentYear })}
                min={currentYear}
                max={currentYear + 2}
              />
            </div>
          </div>

          <div className="form-field">
            <Label className="form-label">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'national' | 'religious' | 'optional') => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national">National Holiday</SelectItem>
                <SelectItem value="religious">Religious Holiday</SelectItem>
                <SelectItem value="optional">Optional Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="form-label">Active Status</Label>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.date}>
            {holiday ? 'Save Changes' : 'Add Holiday'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
