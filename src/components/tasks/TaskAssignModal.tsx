import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockStaff } from '@/data/task-mock-data';
import type { Task } from '@/types/tasks';

interface TaskAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskAssign: (taskId: string, staffId: string) => void;
}

export function TaskAssignModal({ open, onOpenChange, task, onTaskAssign }: TaskAssignModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    if (task) {
      setSelectedStaffId(task.assignedStaffId);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !selectedStaffId) {
      return;
    }
    onTaskAssign(task.id, selectedStaffId);
    onOpenChange(false);
  };

  if (!task) return null;

  const selectedStaff = mockStaff.find(s => s.id === selectedStaffId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>Assign this task to an employee</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task</Label>
              <div className="p-3 rounded-lg border bg-muted/50">
                <div className="font-medium">{task.title}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To *</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId} required>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role} ({staff.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStaff && (
              <div className="p-3 rounded-lg border bg-muted/50">
                <div className="text-sm font-medium">{selectedStaff.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedStaff.role} • {selectedStaff.department}
                </div>
                <div className="text-xs text-muted-foreground">{selectedStaff.contact}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
