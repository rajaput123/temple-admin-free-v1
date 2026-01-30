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
import { Project, ProjectBudget, FundingSource } from '@/types/projects';

interface BudgetAllocationModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  budget: ProjectBudget;
  onSave: (budget: ProjectBudget) => void;
}

export function BudgetAllocationModal({
  open,
  onClose,
  project,
  budget,
  onSave,
}: BudgetAllocationModalProps) {
  const [formData, setFormData] = useState({
    approvedBudget: budget.approvedBudget,
    overrunThreshold: budget.overrunThreshold,
  });

  useEffect(() => {
    setFormData({
      approvedBudget: budget.approvedBudget,
      overrunThreshold: budget.overrunThreshold,
    });
  }, [budget]);

  const handleSave = () => {
    const updatedBudget: ProjectBudget = {
      ...budget,
      approvedBudget: formData.approvedBudget,
      overrunThreshold: formData.overrunThreshold,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedBudget);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Budget Allocation - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Approved Budget (₹)</Label>
            <Input
              type="number"
              value={formData.approvedBudget}
              onChange={(e) => setFormData({ ...formData, approvedBudget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Overrun Threshold (%)</Label>
            <Input
              type="number"
              value={formData.overrunThreshold}
              onChange={(e) => setFormData({ ...formData, overrunThreshold: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              Alert will be triggered when actual spending exceeds this percentage of approved budget
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Total Spent:</span>
              <span className="font-semibold">₹{budget.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Committed:</span>
              <span className="font-semibold">₹{budget.totalCommitted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Available Budget:</span>
              <span className="font-semibold">₹{budget.availableBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
