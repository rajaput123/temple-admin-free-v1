import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import type { Task } from '@/types/tasks';

interface TaskStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onStepAdd: (taskId: string, step: { title: string; description?: string }) => void;
}

export function TaskStepModal({ open, onOpenChange, task, onStepAdd }: TaskStepModalProps) {
  const [stepTitle, setStepTitle] = useState('');
  const [stepDescription, setStepDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !stepTitle) {
      return;
    }
    onStepAdd(task.id, {
      title: stepTitle,
      description: stepDescription || undefined,
    });
    setStepTitle('');
    setStepDescription('');
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Step to Task</DialogTitle>
          <DialogDescription>Add a sub-step or checklist item to this task</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stepTitle">Step Title *</Label>
              <Input
                id="stepTitle"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                placeholder="Enter step title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stepDescription">Description</Label>
              <Textarea
                id="stepDescription"
                value={stepDescription}
                onChange={(e) => setStepDescription(e.target.value)}
                placeholder="Enter step description (optional)"
                rows={3}
              />
            </div>
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="text-sm font-medium">Task: {task.title}</div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Step</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
