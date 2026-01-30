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
import { Project, ProjectProgress } from '@/types/projects';
import { useAuth } from '@/contexts/AuthContext';

interface ProgressUpdateModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSave: (data: Partial<ProjectProgress>) => void;
}

export function ProgressUpdateModal({
  open,
  onClose,
  project,
  onSave,
}: ProgressUpdateModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    progressDate: new Date().toISOString().split('T')[0],
    progressType: 'daily' as 'daily' | 'weekly' | 'milestone',
    completionPercentage: 0,
    workDescription: '',
    delayReason: '',
  });

  const handleSave = () => {
    onSave({
      ...formData,
      updatedBy: user?.id || 'user-1',
      updatedByName: user?.name || 'User',
    });
    setFormData({
      progressDate: new Date().toISOString().split('T')[0],
      progressType: 'daily',
      completionPercentage: 0,
      workDescription: '',
      delayReason: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Progress Update - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Progress Date *</Label>
              <Input
                type="date"
                value={formData.progressDate}
                onChange={(e) => setFormData({ ...formData, progressDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Progress Type *</Label>
              <Select
                value={formData.progressType}
                onValueChange={(value) => setFormData({ ...formData, progressType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Completion Percentage (%) *</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.completionPercentage}
              onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) || 0 })}
              placeholder="Enter completion percentage"
            />
          </div>

          <div className="space-y-2">
            <Label>Work Description *</Label>
            <Textarea
              value={formData.workDescription}
              onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
              placeholder="Describe the work completed"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Delay Reason (if applicable)</Label>
            <Textarea
              value={formData.delayReason}
              onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })}
              placeholder="Enter delay reason if any"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
