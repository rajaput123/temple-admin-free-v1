import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Building2,
  Flame,
  Package,
  UtensilsCrossed,
  Landmark,
  Megaphone,
  FolderKanban,
  Ticket,
  UserCheck,
  LogOut,
  Settings,
  Bell,
  Search,
  CheckSquare,
  UsersRound,
  Briefcase,
  Crown,
  Calendar,
  UserPlus,
  GitBranch,
  School,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const modules = [
  {
    id: 'structure',
    name: 'Temple Structure',
    icon: Building2,
    href: '/structure',
  },
  {
    id: 'pr',
    name: 'PR & Communication',
    icon: Megaphone,
    href: '/pr/announcements',
  },
  {
    id: 'rituals',
    name: 'Rituals & Darshan',
    icon: Flame,
    href: '/rituals',
  },
  {
    id: 'hr',
    name: 'People / HR',
    icon: Users,
    href: '/hr/employees',
  },
  {
    id: 'tasks',
    name: 'Task Management',
    icon: CheckSquare,
    href: '/tasks',
  },
  {
    id: 'branch',
    name: 'Branch Management',
    icon: GitBranch,
    href: '/branch',
  },
  {
    id: 'institution',
    name: 'Institution',
    icon: School,
    href: '/institution',
  },
  {
    id: 'knowledge',
    name: 'Knowledge Management',
    icon: BookOpen,
    href: '/knowledge',
  },
  {
    id: 'assets',
    name: 'Asset Management',
    icon: Landmark,
    href: '/assets',
  },
  {
    id: 'inventory',
    name: 'Stock Management',
    icon: Package,
    href: '/inventory/items',
  },
  {
    id: 'crowd',
    name: 'Crowd & Capacity Management',
    icon: UsersRound,
    href: '/crowd',
  },
  {
    id: 'devotee',
    name: 'Devotee/Volunteer Management',
    icon: UserCheck,
    href: '/devotee',
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    icon: Briefcase,
    href: '/freelancer',
  },
  {
    id: 'vip',
    name: 'VIP Devotee Management',
    icon: Crown,
    href: '/vip',
  },
  {
    id: 'events',
    name: 'Event Management',
    icon: Calendar,
    href: '/events',
  },
  {
    id: 'projects',
    name: 'Projects & Initiatives',
    icon: FolderKanban,
    href: '/projects',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export default function Hub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30">
      {/* Header - Modern Design */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 relative shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-primary">TempleERP</h1>
              <p className="text-xs text-gray-600 leading-tight">{user?.templeName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mode Toggle - Only show for super_admin */}
            {user?.role === 'super_admin' && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                <Label htmlFor="mode-toggle" className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Temple
                </Label>
                <Switch
                  id="mode-toggle"
                  checked={isPlatformMode}
                  onCheckedChange={handleModeToggle}
                />
                <Label htmlFor="mode-toggle" className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Platform
                </Label>
              </div>
            )}

            <div className="h-6 w-px bg-border/50" />

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-border/50">
                <AvatarFallback className="bg-muted text-gray-900 text-sm font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Welcome, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-gray-600">
            Access all modules of the temple Management System
          </p>
        </div>

        {/* Module Grid - Compact Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 max-w-7xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.href)}
                className="group flex flex-col items-center p-3 bg-transparent
         hover:bg-background/80 hover:shadow-md hover:shadow-primary/10
         transition-all duration-200 ease-out
         rounded-xl
         active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-2
                              group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110
                              transition-all duration-200 shadow-sm">
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-medium text-center text-gray-900 group-hover:text-primary leading-tight transition-colors">
                  {module.name}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
