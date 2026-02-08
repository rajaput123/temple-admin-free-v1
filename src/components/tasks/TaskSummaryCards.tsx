import { Card } from '@/components/ui/card';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Hourglass, AlertTriangle } from 'lucide-react';
import type { Task } from '@/types/tasks';

interface TaskSummaryCardsProps {
  tasks: Task[];
}

export function TaskSummaryCards({ tasks }: TaskSummaryCardsProps) {
  const total = tasks.length;
  const open = tasks.filter((t) => t.status === 'open').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue = tasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pendingApproval = tasks.filter((t) => t.status === 'pending_approval').length;

  const cards = [
    { label: 'Total', value: total, icon: CheckSquare, color: 'text-primary', className: '' },
    { label: 'Open', value: open, icon: Clock, color: 'text-blue-600', className: 'medium' },
    { label: 'In Progress', value: inProgress, icon: Hourglass, color: 'text-orange-600', className: 'high' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-red-600', className: 'urgent' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-600', className: 'success' },
    { label: 'Pending Approval', value: pendingApproval, icon: AlertCircle, color: 'text-yellow-600', className: 'medium' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={`stat-card ${card.className}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 tracking-tight ${card.color}`}>{card.value}</p>
              </div>
              <Icon className={`h-8 w-8 ${card.color} opacity-60`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
