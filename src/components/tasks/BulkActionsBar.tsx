import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, UserCog, CheckCircle2, Download } from 'lucide-react';
import type { TaskStatus } from '@/types/tasks';

interface BulkActionsBarProps {
  selectedCount: number;
  onReassign: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onExport: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onReassign,
  onStatusChange,
  onExport,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
      <span className="text-sm font-medium">{selectedCount} task(s) selected</span>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onReassign}>
              <UserCog className="h-4 w-4 mr-2" />
              Reassign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('in_progress')}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('completed')}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
