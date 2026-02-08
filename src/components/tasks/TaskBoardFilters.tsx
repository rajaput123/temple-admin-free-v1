import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Filter, User, Building2, AlertTriangle, Timer } from 'lucide-react';
import type { TaskPriority } from '@/types/tasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskBoardFiltersProps {
  assigneeFilter: string | 'all';
  departmentFilter: string | 'all';
  priorityFilter: TaskPriority | 'all';
  slaFilter: 'all' | 'on-time' | 'at-risk' | 'breached';
  onAssigneeChange: (assignee: string | 'all') => void;
  onDepartmentChange: (department: string | 'all') => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onSlaChange: (sla: 'all' | 'on-time' | 'at-risk' | 'breached') => void;
  assignees: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const slaOptions = [
  { value: 'all', label: 'All Tasks' },
  { value: 'on-time', label: 'On-Time' },
  { value: 'at-risk', label: 'At-Risk' },
  { value: 'breached', label: 'SLA Breached' },
];

export function TaskBoardFilters({
  assigneeFilter,
  departmentFilter,
  priorityFilter,
  slaFilter,
  onAssigneeChange,
  onDepartmentChange,
  onPriorityChange,
  onSlaChange,
  assignees,
  departments,
}: TaskBoardFiltersProps) {
  const hasActiveFilters =
    assigneeFilter !== 'all' ||
    departmentFilter !== 'all' ||
    priorityFilter !== 'all' ||
    slaFilter !== 'all';

  const clearFilters = () => {
    onAssigneeChange('all');
    onDepartmentChange('all');
    onPriorityChange('all');
    onSlaChange('all');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Assignee Filter */}
      <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-[180px] h-9">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Assignee" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {assignees.map((assignee) => (
            <SelectItem key={assignee.id} value={assignee.id}>
              {assignee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Department Filter */}
      <Select value={departmentFilter} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-[180px] h-9">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Department" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* SLA Filter */}
      <Select value={slaFilter} onValueChange={onSlaChange}>
        <SelectTrigger className="w-[160px] h-9">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="SLA Status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {slaOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
