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
import type { LeaveType } from '@/types/hr';

interface LeaveTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
  onSave: (leaveType: Partial<LeaveType>) => void;
}

export function LeaveTypeModal({
  open,
  onOpenChange,
  leaveType,
  onSave,
}: LeaveTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    annualQuota: 0,
    carryForward: false,
    maxCarryForward: 0,
    paid: true,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (leaveType) {
      setFormData({
        name: leaveType.name,
        code: leaveType.code,
        annualQuota: leaveType.annualQuota,
        carryForward: leaveType.carryForward,
        maxCarryForward: leaveType.maxCarryForward,
        paid: leaveType.paid,
        status: leaveType.status,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        annualQuota: 0,
        carryForward: false,
        maxCarryForward: 0,
        paid: true,
        status: 'active',
      });
    }
  }, [leaveType, open]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: leaveType?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {leaveType ? 'Edit Leave Type' : 'Add Leave Type'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="form-field">
            <Label className="form-label">
              Leave Type Name <span className="form-required">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Casual Leave"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <Label className="form-label">
                Code <span className="form-required">*</span>
              </Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., CL"
                maxLength={5}
              />
            </div>
            <div className="form-field">
              <Label className="form-label">Annual Quota (days)</Label>
              <Input
                type="number"
                min={0}
                value={formData.annualQuota}
                onChange={(e) => setFormData({ ...formData, annualQuota: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label className="form-label">Carry Forward</Label>
            <Switch
              checked={formData.carryForward}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                carryForward: checked,
                maxCarryForward: checked ? formData.maxCarryForward : 0,
              })}
            />
          </div>

          {formData.carryForward && (
            <div className="form-field">
              <Label className="form-label">Max Carry Forward (days)</Label>
              <Input
                type="number"
                min={0}
                value={formData.maxCarryForward}
                onChange={(e) => setFormData({ ...formData, maxCarryForward: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label className="form-label">Paid Leave</Label>
            <Switch
              checked={formData.paid}
              onCheckedChange={(checked) => setFormData({ ...formData, paid: checked })}
            />
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
            {leaveType ? 'Save Changes' : 'Add Leave Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
