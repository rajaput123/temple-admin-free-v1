import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, QualityCheck, QualityStatus } from '@/types/projects';
import { useAuth } from '@/contexts/AuthContext';

interface QualityCheckModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSave: (data: Partial<QualityCheck>) => void;
}

export function QualityCheckModal({
  open,
  onClose,
  project,
  onSave,
}: QualityCheckModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    checkDate: new Date().toISOString().split('T')[0],
    checkType: 'quality' as 'quality' | 'safety' | 'heritage' | 'government_inspection',
    safetyCompliant: true,
    safetyViolations: '',
  });

  const handleSave = () => {
    onSave({
      ...formData,
      safetyCompliance: {
        compliant: formData.safetyCompliant,
        violations: formData.safetyViolations ? formData.safetyViolations.split(',').map(v => v.trim()) : undefined,
      },
      conductedBy: user?.id || 'user-1',
      conductedByName: user?.name || 'User',
    });
    setFormData({
      checkDate: new Date().toISOString().split('T')[0],
      checkType: 'quality',
      safetyCompliant: true,
      safetyViolations: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quality Check - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check Date *</Label>
              <Input
                type="date"
                value={formData.checkDate}
                onChange={(e) => setFormData({ ...formData, checkDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Check Type *</Label>
              <Select
                value={formData.checkType}
                onValueChange={(value) => setFormData({ ...formData, checkType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="heritage">Heritage</SelectItem>
                  <SelectItem value="government_inspection">Government Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Safety Compliance</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.safetyCompliant}
                onChange={(e) => setFormData({ ...formData, safetyCompliant: e.target.checked })}
              />
              <span className="text-sm">Compliant</span>
            </div>
            {!formData.safetyCompliant && (
              <Textarea
                value={formData.safetyViolations}
                onChange={(e) => setFormData({ ...formData, safetyViolations: e.target.value })}
                placeholder="Enter violations (comma-separated)"
                rows={3}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Quality Check
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
