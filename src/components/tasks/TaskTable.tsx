import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, TaskStatus, TaskPriority } from '@/types/tasks';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  selectedRows: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onRowClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
};

const statusColors: Record<TaskStatus, string> = {
  open: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  pending_approval: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function TaskTable({
  tasks,
  selectedRows,
  onSelectionChange,
  onRowClick,
  onStatusChange,
  onPriorityChange,
}: TaskTableProps) {
  const navigate = useNavigate();
  
  const columns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Task Title',
        sortable: true,
        render: (_: unknown, row: Task) => (
          <div>
            <div className="font-medium">{row.title}</div>
            {row.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{row.description}</div>
            )}
          </div>
        ),
      },
      {
        key: 'module',
        label: 'Module',
        sortable: true,
        render: (_: unknown, row: Task) => (
          <Badge variant="outline" className="text-xs">
            {row.module.toUpperCase()}
          </Badge>
        ),
      },
      {
        key: 'assigneeName',
        label: 'Assignee',
        sortable: true,
        render: (_: unknown, row: Task) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">{row.assigneeName}</span>
            {row.assigneeId && (
              <ExternalLink 
                className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/hr/employees/${row.assigneeId}`);
                }}
              />
            )}
          </div>
        ),
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        sortable: true,
        render: (_: unknown, row: Task) => {
          const dueDate = new Date(row.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isOverdue = dueDate < today && row.status !== 'completed' && row.status !== 'cancelled';
          return (
            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              {format(dueDate, 'MMM dd, yyyy')}
            </span>
          );
        },
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        render: (_: unknown, row: Task) => (
          <Select
            value={row.priority}
            onValueChange={(value: TaskPriority) => onPriorityChange(row.id, value)}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectTrigger className="w-28 h-7 border-0 p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (_: unknown, row: Task) => (
          <Select
            value={row.status}
            onValueChange={(value: TaskStatus) => onStatusChange(row.id, value)}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectTrigger className="w-36 h-7 border-0 p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
    ],
    [onStatusChange, onPriorityChange, navigate]
  );

  return (
    <DataTable
      data={tasks}
      columns={columns}
      selectedRows={selectedRows}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      searchable={false}
    />
  );
}
