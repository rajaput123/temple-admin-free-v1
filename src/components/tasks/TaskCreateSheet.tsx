import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import type { TaskPriority, TaskModuleTag, TaskStatus } from '@/types/tasks';
import { useState, useMemo, useEffect } from 'react';
import { createTask } from '@/lib/task-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getEmployees } from '@/lib/hr-employee-store';
import type { Employee } from '@/types/erp';

interface TaskCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: string[];
}

export function TaskCreateSheet({ open, onOpenChange, branches }: TaskCreateSheetProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [module, setModule] = useState<TaskModuleTag>('general');
  
  // Advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Get employees from HR module
  const employees = useMemo(() => getEmployees().filter(emp => emp.status === 'active'), []);
  
  // Get selected employee details
  const selectedEmployee = useMemo(() => {
    return employees.find(emp => emp.id === assigneeId);
  }, [employees, assigneeId]);

  // Auto-populate department when assignee is selected
  useEffect(() => {
    if (selectedEmployee?.department) {
      // Department will be automatically set from employee
    }
  }, [selectedEmployee]);

  const handleSubmit = () => {
    if (!title.trim() || !assigneeId || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const assignee = employees.find((a) => a.id === assigneeId);
    const branch = branches.find((b) => b === branchId);

    createTask(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        status: approvalRequired ? 'pending_approval' : 'open',
        priority,
        assigneeId,
        assigneeName: assignee?.name || 'Unknown',
        dueDate,
        module,
        branchId: branchId || undefined,
        branchName: branch || undefined,
        // Auto-populate from employee record
        departmentId: assignee?.department || undefined,
        departmentName: assignee?.department || undefined,
        approvalRequired: approvalRequired || undefined,
        recurring: recurring
          ? {
              frequency: recurringFrequency,
              interval: 1,
            }
          : undefined,
      },
      user?.email || 'admin',
      user?.name || 'Admin'
    );

    // Reset form
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setDueDate('');
    setPriority('medium');
    setModule('general');
    setBranchId('');
    setRecurring(false);
    setApprovalRequired(false);
    setShowAdvanced(false);

    toast.success('Task created successfully');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Task</SheetTitle>
          <SheetDescription>Fill in the required fields to create a new task</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Required Fields */}
          <div className="space-y-4">
            <div>
              <Label className="form-label">
                Title <span className="form-required">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label className="form-label">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="form-label">
                  Assignee <span className="form-required">*</span>
                </Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="form-label">
                  Due Date <span className="form-required">*</span>
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="form-label">Priority</Label>
                <Select value={priority} onValueChange={(v: TaskPriority) => setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="form-label">Module</Label>
                <Select value={module} onValueChange={(v: TaskModuleTag) => setModule(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="rituals">Rituals</SelectItem>
                    <SelectItem value="seva">Seva</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="prasad">Prasad</SelectItem>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="pr">PR</SelectItem>
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger>Advanced Settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="form-label">Branch</Label>
                      <Select value={branchId} onValueChange={setBranchId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedEmployee?.department && (
                    <div>
                      <Label className="form-label">Department</Label>
                        <Input
                          value={selectedEmployee.department}
                          disabled
                          className="bg-muted"
                          readOnly
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Auto-populated from employee record
                        </p>
                    </div>
                    )}
                  </div>
                  
                  {selectedEmployee && (
                    <div className="p-3 bg-muted rounded-lg space-y-2">
                      <p className="text-sm font-medium">Employee Details (Auto-populated)</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {selectedEmployee.designation && (
                          <div>
                            <span className="text-muted-foreground">Designation:</span>
                            <span className="ml-1 font-medium">{selectedEmployee.designation}</span>
                          </div>
                        )}
                        {selectedEmployee.email && (
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-1 font-medium">{selectedEmployee.email}</span>
                          </div>
                        )}
                        {selectedEmployee.phone && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="ml-1 font-medium">{selectedEmployee.phone}</span>
                          </div>
                        )}
                        {selectedEmployee.employeeCode && (
                          <div>
                            <span className="text-muted-foreground">Employee Code:</span>
                            <span className="ml-1 font-medium">{selectedEmployee.employeeCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={recurring}
                        onCheckedChange={(checked) => setRecurring(checked === true)}
                      />
                      <Label htmlFor="recurring" className="cursor-pointer">
                        Recurring Task
                      </Label>
                    </div>

                    {recurring && (
                      <div>
                        <Label className="form-label">Frequency</Label>
                        <Select
                          value={recurringFrequency}
                          onValueChange={(v: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
                            setRecurringFrequency(v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approval"
                        checked={approvalRequired}
                        onCheckedChange={(checked) => setApprovalRequired(checked === true)}
                      />
                      <Label htmlFor="approval" className="cursor-pointer">
                        Requires Approval
                      </Label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !assigneeId || !dueDate}>
              Create Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
