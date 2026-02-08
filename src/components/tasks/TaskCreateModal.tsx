import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockStaff, mockTaskTypes, mockPriorities } from '@/data/task-mock-data';
import type { TaskType, TaskPriority } from '@/types/tasks';

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: {
    title: string;
    type: TaskType;
    priority: TaskPriority;
    assignedStaffId: string;
    dueDate: string;
    description?: string;
  }) => void;
}

export function TaskCreateModal({ open, onOpenChange, onTaskCreate }: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('cleaning');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedStaffId || !dueDate) {
      return;
    }
    onTaskCreate({
      title,
      type,
      priority,
      assignedStaffId,
      dueDate,
      description: description || undefined,
    });
    // Reset form
    setTitle('');
    setType('cleaning');
    setPriority('medium');
    setAssignedStaffId('');
    setDueDate('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task and assign it to an employee</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTaskTypes.map(taskType => (
                      <SelectItem key={taskType.id} value={taskType.id}>
                        {taskType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPriorities.map(priority => (
                      <SelectItem key={priority.id} value={priority.id}>
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To *</Label>
              <Select value={assignedStaffId} onValueChange={setAssignedStaffId} required>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
