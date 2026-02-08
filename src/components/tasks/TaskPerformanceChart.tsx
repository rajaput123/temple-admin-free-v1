import { Card } from '@/components/ui/card';
import type { Task } from '@/types/tasks';

interface TaskPerformanceChartProps {
  tasks: Task[];
  groupBy?: 'department' | 'branch' | 'module';
}

export function TaskPerformanceChart({ tasks, groupBy = 'department' }: TaskPerformanceChartProps) {
  // Group tasks by the selected dimension
  const grouped = tasks.reduce((acc, task) => {
    let key = 'Unassigned';
    if (groupBy === 'department' && task.departmentName) {
      key = task.departmentName;
    } else if (groupBy === 'branch' && task.branchName) {
      key = task.branchName;
    } else if (groupBy === 'module') {
      key = task.module.toUpperCase();
    }
    if (!acc[key]) {
      acc[key] = { total: 0, completed: 0 };
    }
    acc[key].total++;
    if (task.status === 'completed') {
      acc[key].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const entries = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...entries.map(([, data]) => data.total), 1);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Performance by {groupBy === 'department' ? 'Department' : groupBy === 'branch' ? 'Branch' : 'Module'}
      </h3>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          entries.map(([key, data]) => {
            const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{key}</span>
                  <span className="text-muted-foreground">
                    {data.completed}/{data.total} ({Math.round(completionRate)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(data.total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
