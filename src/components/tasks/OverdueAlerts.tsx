import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar } from 'lucide-react';
import type { Task } from '@/types/tasks';
import { formatDistanceToNow } from 'date-fns';

interface OverdueAlertsProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  maxItems?: number;
}

export function OverdueAlerts({ tasks, onTaskClick, maxItems = 5 }: OverdueAlertsProps) {
  const overdue = tasks
    .filter((t) => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, maxItems);

  if (overdue.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-green-600" />
          Overdue Alerts
        </h3>
        <p className="text-sm text-muted-foreground">No overdue tasks</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-600" />
        Overdue Alerts ({overdue.length})
      </h3>
      <div className="space-y-3">
        {overdue.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{task.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                <span className="text-red-600 font-medium">{task.priority.toUpperCase()}</span>
              </div>
            </div>
            {onTaskClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskClick(task)}
                className="ml-2 flex-shrink-0"
              >
                View
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
