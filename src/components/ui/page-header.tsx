import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const showBack = breadcrumbs && breadcrumbs.length > 0;

  return (
    <div className={cn("mb-6 -mt-2", className)}>
      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          {showBack && (
            <button
              onClick={() => {
                const backHref = breadcrumbs?.[breadcrumbs.length - 2]?.href;
                if (backHref) {
                  navigate(backHref);
                } else {
                  navigate(-1);
                }
              }}
              className="mt-0.5 p-1.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors shrink-0"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-gray-900" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
