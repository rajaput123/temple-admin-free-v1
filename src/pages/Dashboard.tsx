import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
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
  TrendingUp,
  Calendar,
  IndianRupee,
  Clock
} from 'lucide-react';

const modules = [
  {
    id: 'hr',
    name: 'People / HR',
    description: 'Manage employees, attendance, payroll',
    icon: Users,
    href: '/hr/employees',
    color: 'bg-blue-500/10 text-blue-600',
    stats: '124 Employees',
  },
  {
    id: 'structure',
    name: 'Temple Structure',
    description: 'Mandirs, facilities, maintenance',
    icon: Building2,
    href: '/structure',
    color: 'bg-amber-500/10 text-amber-600',
    stats: '8 Mandirs',
  },
  {
    id: 'rituals',
    name: 'Rituals & Darshan',
    description: 'Daily schedules, events, priests',
    icon: Flame,
    href: '/rituals',
    color: 'bg-orange-500/10 text-orange-600',
    stats: '12 Today',
  },
  {
    id: 'inventory',
    name: 'Stock / Inventory',
    description: 'Items, stock entries, orders',
    icon: Package,
    href: '/inventory',
    color: 'bg-emerald-500/10 text-emerald-600',
    stats: '856 Items',
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Prasad',
    description: 'Menu planning, distribution',
    icon: UtensilsCrossed,
    href: '/kitchen',
    color: 'bg-rose-500/10 text-rose-600',
    stats: '3 Menus',
  },
  {
    id: 'assets',
    name: 'Asset Management',
    description: 'Asset register, maintenance log',
    icon: Landmark,
    href: '/assets',
    color: 'bg-purple-500/10 text-purple-600',
    stats: '342 Assets',
  },
  {
    id: 'pr',
    name: 'PR & Communication',
    description: 'Announcements, events calendar',
    icon: Megaphone,
    href: '/pr',
    color: 'bg-cyan-500/10 text-cyan-600',
    stats: '5 Active',
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Active projects, tasks',
    icon: FolderKanban,
    href: '/projects',
    color: 'bg-indigo-500/10 text-indigo-600',
    stats: '8 Projects',
  },
  {
    id: 'seva',
    name: 'Seva Counter',
    description: 'Bookings, seva types, reports',
    icon: Ticket,
    href: '/seva/bookings',
    color: 'bg-pink-500/10 text-pink-600',
    stats: '45 Today',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Devotees, donations, communications',
    icon: UserCheck,
    href: '/crm',
    color: 'bg-teal-500/10 text-teal-600',
    stats: '12.5K Devotees',
  },
];

const stats = [
  {
    label: "Today's Darshan",
    value: '2,847',
    change: '+12%',
    trend: 'up',
    icon: Users,
  },
  {
    label: "Today's Collection",
    value: '₹4,52,800',
    change: '+8%',
    trend: 'up',
    icon: IndianRupee,
  },
  {
    label: 'Active Sevas',
    value: '45',
    change: '+5',
    trend: 'up',
    icon: Calendar,
  },
  {
    label: 'Staff on Duty',
    value: '89',
    change: '92%',
    trend: 'neutral',
    icon: Clock,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        description="Here's an overview of your temple operations"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-xl border border-border bg-card hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">{stat.change}</span>
                <span className="text-sm text-muted-foreground">vs yesterday</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div className="mb-6">
        <h2 className="section-header mb-4">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className="module-card group"
                onClick={() => navigate(module.href)}
              >
                <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                <div className="text-xs font-medium text-muted-foreground">{module.stats}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New seva booking', detail: 'Abhishekam - Token #2847', time: '2 min ago', type: 'booking' },
              { action: 'Stock updated', detail: 'Ghee - 50L added', time: '15 min ago', type: 'inventory' },
              { action: 'Leave approved', detail: 'Ramesh Kumar - 2 days', time: '1 hour ago', type: 'hr' },
              { action: 'Donation received', detail: '₹25,000 - Annadanam', time: '2 hours ago', type: 'donation' },
              { action: 'Event scheduled', detail: 'Ekadashi - Tomorrow', time: '3 hours ago', type: 'event' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {[
              { time: '05:00 AM', name: 'Suprabhatam', status: 'completed' },
              { time: '06:00 AM', name: 'Archana', status: 'completed' },
              { time: '08:00 AM', name: 'Sahasranamam', status: 'in_progress' },
              { time: '12:00 PM', name: 'Madhyana Seva', status: 'upcoming' },
              { time: '06:00 PM', name: 'Sandhya Arati', status: 'upcoming' },
              { time: '08:00 PM', name: 'Ekantha Seva', status: 'upcoming' },
            ].map((event, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-mono text-muted-foreground w-20 shrink-0">
                  {event.time}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{event.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  event.status === 'completed' 
                    ? 'bg-success/10 text-success'
                    : event.status === 'in_progress'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {event.status === 'completed' ? 'Done' : event.status === 'in_progress' ? 'Now' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
