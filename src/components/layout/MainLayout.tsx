import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Expanded by default

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content - No header */}
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen relative z-10",
          sidebarCollapsed ? "pl-16" : "pl-60"
        )}
      >
        <main className="p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
