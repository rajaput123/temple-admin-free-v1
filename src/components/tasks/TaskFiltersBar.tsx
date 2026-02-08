import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Filter, Calendar } from 'lucide-react';
import type { TaskStatus, TaskPriority, TaskModuleTag } from '@/types/tasks';

interface TaskFiltersBarProps {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  moduleFilter: TaskModuleTag | 'all';
  branchFilter: string | 'all';
  dateRange?: { start?: string; end?: string };
  onStatusChange: (status: TaskStatus | 'all') => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onModuleChange: (module: TaskModuleTag | 'all') => void;
  onBranchChange: (branch: string | 'all') => void;
  onDateRangeChange: (range: { start?: string; end?: string }) => void;
  branches: string[];
}

const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const moduleOptions: { value: TaskModuleTag | 'all'; label: string }[] = [
  { value: 'all', label: 'All Modules' },
  { value: 'hr', label: 'HR' },
  { value: 'rituals', label: 'Rituals' },
  { value: 'seva', label: 'Seva' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'prasad', label: 'Prasad' },
  { value: 'assets', label: 'Assets' },
  { value: 'projects', label: 'Projects' },
  { value: 'pr', label: 'PR' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'general', label: 'General' },
];

export function TaskFiltersBar({
  statusFilter,
  priorityFilter,
  moduleFilter,
  branchFilter,
  dateRange,
  onStatusChange,
  onPriorityChange,
  onModuleChange,
  onBranchChange,
  onDateRangeChange,
  branches,
}: TaskFiltersBarProps) {
  const hasActiveFilters =
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    moduleFilter !== 'all' ||
    branchFilter !== 'all' ||
    dateRange?.start ||
    dateRange?.end;

  const clearFilters = () => {
    onStatusChange('all');
    onPriorityChange('all');
    onModuleChange('all');
    onBranchChange('all');
    onDateRangeChange({});
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status Filter */}
      <div className="flex items-center gap-1">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'all')}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-1">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Module Filter */}
      <div className="flex items-center gap-1">
        <select
          value={moduleFilter}
          onChange={(e) => onModuleChange(e.target.value as TaskModuleTag | 'all')}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {moduleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* More Filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={hasActiveFilters ? 'border-primary' : ''}>
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Branch</Label>
              <select
                value={branchFilter}
                onChange={(e) => onBranchChange(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Date Range</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange?.start || ''}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={dateRange?.end || ''}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
