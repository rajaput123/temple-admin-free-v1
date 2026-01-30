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
import type { Department } from '@/types/hr';

interface DepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  departments: Department[];
  onSave: (department: Partial<Department>) => void;
}

export function DepartmentModal({
  open,
  onOpenChange,
  department,
  departments,
  onSave,
}: DepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headEmployee: '',
    parentDepartmentId: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code,
        headEmployee: department.headEmployee || '',
        parentDepartmentId: department.parentDepartmentId || '',
        status: department.status,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        headEmployee: '',
        parentDepartmentId: '',
        status: 'active',
      });
    }
  }, [department, open]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: department?.id,
    });
    onOpenChange(false);
  };

  // Build hierarchical options with path display
  const buildDepartmentPath = (dept: Department, allDepts: Department[]): string => {
    if (!dept.parentDepartmentId) return dept.name;
    const parent = allDepts.find(d => d.id === dept.parentDepartmentId);
    if (!parent) return dept.name;
    return `${buildDepartmentPath(parent, allDepts)} > ${dept.name}`;
  };

  const parentOptions = departments
    .filter(d => d.id !== department?.id)
    .map(d => ({ 
      value: d.id, 
      label: buildDepartmentPath(d, departments)
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="form-field">
            <Label className="form-label">
              Department Name <span className="form-required">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Rituals"
            />
          </div>

          <div className="form-field">
            <Label className="form-label">
              Department Code <span className="form-required">*</span>
            </Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., RTL"
              maxLength={5}
            />
          </div>

          <div className="form-field">
            <Label className="form-label">Department Head</Label>
            <Input
              value={formData.headEmployee}
              onChange={(e) => setFormData({ ...formData, headEmployee: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          <div className="form-field">
            <Label className="form-label">Parent Department</Label>
            <SearchableSelect
              options={parentOptions}
              value={formData.parentDepartmentId}
              onChange={(value) => setFormData({ ...formData, parentDepartmentId: value })}
              placeholder="Select parent (optional)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Create sub-departments by selecting a parent department
            </p>
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
            {department ? 'Save Changes' : 'Add Department'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
