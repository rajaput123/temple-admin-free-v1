import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {Icon && (
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-amber-600" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 max-w-md mb-4">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="bg-amber-500 hover:bg-amber-600">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
