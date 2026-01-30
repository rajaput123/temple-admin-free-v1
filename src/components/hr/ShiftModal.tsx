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
import type { Shift, Department } from '@/types/hr';

interface ShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  departments: Department[];
  onSave: (shift: Partial<Shift>) => void;
}

export function ShiftModal({
  open,
  onOpenChange,
  shift,
  departments,
  onSave,
}: ShiftModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    applicableDepartments: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        code: shift.code,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakDuration: shift.breakDuration,
        applicableDepartments: shift.applicableDepartments,
        status: shift.status,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        applicableDepartments: [],
        status: 'active',
      });
    }
  }, [shift, open]);

  const calculateWorkingHours = () => {
    const start = formData.startTime.split(':').map(Number);
    const end = formData.endTime.split(':').map(Number);
    
    let hours = end[0] - start[0];
    let minutes = end[1] - start[1];
    
    if (hours < 0) hours += 24; // Handle overnight shifts
    
    const totalMinutes = hours * 60 + minutes - formData.breakDuration;
    return (totalMinutes / 60).toFixed(1);
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: shift?.id,
      workingHours: parseFloat(calculateWorkingHours()),
    });
    onOpenChange(false);
  };

  const toggleDepartment = (deptName: string) => {
    setFormData(prev => ({
      ...prev,
      applicableDepartments: prev.applicableDepartments.includes(deptName)
        ? prev.applicableDepartments.filter(d => d !== deptName)
        : [...prev.applicableDepartments, deptName],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {shift ? 'Edit Shift' : 'Add Shift'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <Label className="form-label">
                Shift Name <span className="form-required">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Shift"
              />
            </div>
            <div className="form-field">
              <Label className="form-label">
                Code <span className="form-required">*</span>
              </Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., MS"
                maxLength={5}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-field">
              <Label className="form-label">Start Time</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="form-field">
              <Label className="form-label">End Time</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="form-field">
              <Label className="form-label">Break (mins)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={formData.breakDuration}
                onChange={(e) => setFormData({ ...formData, breakDuration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Working Hours: </span>
            <span className="text-sm font-semibold">{calculateWorkingHours()} hours</span>
          </div>

          <div className="form-field">
            <Label className="form-label">Applicable Departments</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
              {departments.filter(d => d.status === 'active').map((dept) => (
                <label
                  key={dept.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={formData.applicableDepartments.includes(dept.name)}
                    onCheckedChange={() => toggleDepartment(dept.name)}
                  />
                  <span className="text-sm">{dept.name}</span>
                </label>
              ))}
            </div>
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
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
            {shift ? 'Save Changes' : 'Add Shift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
