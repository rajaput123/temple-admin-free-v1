import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlatformSidebar } from './PlatformSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export function PlatformLayout({ children }: PlatformLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPlatformMode = location.pathname.startsWith('/platform');

  const handleModeToggle = (checked: boolean) => {
    if (checked) {
      // Switch to Platform
      navigate('/platform');
    } else {
      // Switch to Temple
      navigate('/hub');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <PlatformSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Keehoo Platform</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Mode Toggle - Only show for super_admin */}
              {user?.role === 'super_admin' && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <Label htmlFor="platform-mode-toggle" className="text-sm font-medium text-muted-foreground cursor-pointer">
                    Temple
                  </Label>
                  <Switch
                    id="platform-mode-toggle"
                    checked={isPlatformMode}
                    onCheckedChange={handleModeToggle}
                  />
                  <Label htmlFor="platform-mode-toggle" className="text-sm font-medium text-muted-foreground cursor-pointer">
                    Platform
                  </Label>
                </div>
              )}

              {user && (
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
