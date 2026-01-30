import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const platformMenuItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/platform',
  },
  {
    id: 'applications',
    name: 'Applications',
    icon: Building2,
    href: '/platform/applications',
  },
  {
    id: 'onboarding',
    name: 'Temple Onboarding',
    icon: Users,
    href: '/platform/onboarding',
  },
  {
    id: 'information',
    name: 'Information Management',
    icon: Info,
    href: '/platform/information',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: CreditCard,
    href: '/platform/subscriptions',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    href: '/platform/analytics',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    href: '/platform/settings',
  },
];

export function PlatformSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold">Platform</h2>
      </div>
      <nav className="p-2">
        {platformMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== '/platform' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
