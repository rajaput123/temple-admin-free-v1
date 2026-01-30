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
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Designation, Department, GradePay } from '@/types/hr';

interface DesignationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designation?: Designation | null;
  departments: Department[];
  gradePays: GradePay[];
  onSave: (designation: Partial<Designation>) => void;
}

export function DesignationModal({
  open,
  onOpenChange,
  designation,
  departments,
  gradePays,
  onSave,
}: DesignationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    grade: '',
    level: 1,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (designation) {
      setFormData({
        name: designation.name,
        department: designation.department || '',
        grade: designation.grade || '',
        level: designation.level,
        status: designation.status,
      });
    } else {
      setFormData({
        name: '',
        department: '',
        grade: '',
        level: 1,
        status: 'active',
      });
    }
  }, [designation, open]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: designation?.id,
    });
    onOpenChange(false);
  };

  const departmentOptions = departments.map(d => ({ value: d.name, label: d.name }));
  const gradeOptions = gradePays.map(g => ({ value: g.name, label: g.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {designation ? 'Edit Designation' : 'Add Designation'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="form-field">
            <Label className="form-label">
              Designation Name <span className="form-required">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Head Priest"
            />
          </div>

          <div className="form-field">
            <Label className="form-label">Department</Label>
            <SearchableSelect
              options={departmentOptions}
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value })}
              placeholder="Select department"
            />
          </div>

          <div className="form-field">
            <Label className="form-label">Grade Pay</Label>
            <SearchableSelect
              options={gradeOptions}
              value={formData.grade}
              onChange={(value) => setFormData({ ...formData, grade: value })}
              placeholder="Select grade"
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
          <Button onClick={handleSubmit} disabled={!formData.name}>
            {designation ? 'Save Changes' : 'Add Designation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
