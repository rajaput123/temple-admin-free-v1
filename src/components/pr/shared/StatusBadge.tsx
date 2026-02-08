import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 'published' | 'draft' | 'scheduled' | 'archived' | 'urgent' | 'live' | 'offline' | 'pending' | 'approved' | 'rejected' | 'reported' | 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  urgent: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  live: {
    label: 'Live',
    className: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
  },
  offline: {
    label: 'Offline',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  reported: {
    label: 'Reported',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  open: {
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  escalated: {
    label: 'Escalated',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
