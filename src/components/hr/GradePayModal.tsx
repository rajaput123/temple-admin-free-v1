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
import type { GradePay } from '@/types/hr';

interface GradePayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradePay?: GradePay | null;
  onSave: (gradePay: Partial<GradePay>) => void;
}

export function GradePayModal({
  open,
  onOpenChange,
  gradePay,
  onSave,
}: GradePayModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    minSalary: 0,
    maxSalary: 0,
    allowances: 0,
    level: 1,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (gradePay) {
      setFormData({
        name: gradePay.name,
        code: gradePay.code,
        minSalary: gradePay.minSalary,
        maxSalary: gradePay.maxSalary,
        allowances: gradePay.allowances,
        level: gradePay.level,
        status: gradePay.status,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        minSalary: 0,
        maxSalary: 0,
        allowances: 0,
        level: 1,
        status: 'active',
      });
    }
  }, [gradePay, open]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: gradePay?.id,
    });
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {gradePay ? 'Edit Grade Pay' : 'Add Grade Pay'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="form-field">
            <Label className="form-label">
              Grade Name <span className="form-required">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grade A - Executive"
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
                placeholder="e.g., GA"
                maxLength={5}
              />
            </div>
            <div className="form-field">
              <Label className="form-label">Level</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <Label className="form-label">Minimum Salary</Label>
              <Input
                type="number"
                value={formData.minSalary}
                onChange={(e) => setFormData({ ...formData, minSalary: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <span className="helper-text">{formatCurrency(formData.minSalary)}</span>
            </div>
            <div className="form-field">
              <Label className="form-label">Maximum Salary</Label>
              <Input
                type="number"
                value={formData.maxSalary}
                onChange={(e) => setFormData({ ...formData, maxSalary: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <span className="helper-text">{formatCurrency(formData.maxSalary)}</span>
            </div>
          </div>

          <div className="form-field">
            <Label className="form-label">Allowances</Label>
            <Input
              type="number"
              value={formData.allowances}
              onChange={(e) => setFormData({ ...formData, allowances: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
            <span className="helper-text">{formatCurrency(formData.allowances)}</span>
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
            {gradePay ? 'Save Changes' : 'Add Grade Pay'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
