import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'destructive' | 'neutral' | 'primary';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-muted text-muted-foreground',
  warning: 'bg-muted text-muted-foreground',
  destructive: 'bg-muted text-foreground',
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
