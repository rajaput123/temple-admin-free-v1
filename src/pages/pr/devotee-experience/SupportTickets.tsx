import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSupportTickets, updateSupportTicket } from '@/lib/pr-communication-store';
import type { SupportTicket, TicketStatus } from '@/types/pr-communication';
import { toast } from 'sonner';

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[SupportTickets] Component mounted');
    return () => {
      console.log('[SupportTickets] Component unmounted');
    };
  }, []);

  // Safe data fetching
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        console.log('[SupportTickets] Loading data...');
        const data = getSupportTickets();
        if (Array.isArray(data)) {
          setTickets(data);
          console.log('[SupportTickets] Data loaded successfully:', data.length);
        } else {
          console.warn('[SupportTickets] Invalid data structure, using empty array');
          setTickets([]);
        }
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('[SupportTickets] Error loading data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load support tickets');
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[SupportTickets] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[SupportTickets] Unhandled promise rejection:', e.reason);
      setHasError(true);
      setErrorMessage(e.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejection);
    
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejection);
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => 
      statusFilter === 'all' || ticket.status === statusFilter
    );
  }, [tickets, statusFilter]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'escalated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSLA = (dueDate?: string) => {
    if (!dueDate) return '—';
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diff < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (hours < 24) return { text: `${hours}h remaining`, color: 'text-orange-600' };
    return { text: `${Math.floor(hours / 24)}d remaining`, color: 'text-green-600' };
  };

  const columns = [
    {
      key: 'ticketNumber',
      label: 'Ticket',
      sortable: true,
      render: (_: unknown, row: SupportTicket) => (
        <div>
          <div className="font-medium">{row.ticketNumber}</div>
          <div className="text-xs text-muted-foreground">{row.subject}</div>
        </div>
      ),
    },
    {
      key: 'devoteeName',
      label: 'Devotee',
      render: (_: unknown, row: SupportTicket) => (
        <div className="text-sm">{row.devoteeName}</div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (_: unknown, row: SupportTicket) => (
        <Badge variant="outline" className="text-xs capitalize">
          {row.category}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: SupportTicket) => (
        <Badge className={`${getStatusColor(row.status)} text-xs`} variant="outline">
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (_: unknown, row: SupportTicket) => (
        <Badge className={`${getPriorityColor(row.priority)} text-xs`} variant="outline">
          {row.priority}
        </Badge>
      ),
    },
    {
      key: 'slaDueDate',
      label: 'SLA',
      render: (_: unknown, row: SupportTicket) => {
        const sla = formatSLA(row.slaDueDate);
        return (
          <div className={`text-xs font-medium ${sla.color}`}>
            {sla.text}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: SupportTicket) => (
        <Button variant="ghost" size="sm">
          View
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Support & Complaints"
        description="Manage devotee support tickets and complaints"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Devotee Experience', href: '/pr/devotee-experience' },
          { label: 'Support & Complaints', href: '/pr/devotee-experience/support' },
        ]}
      />

      <div className="space-y-4">
        {/* Filters */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <Button className="gap-2 ml-auto">
                <Plus className="h-4 w-4" />
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-0 pt-6">
            <DataTable
              data={filteredTickets}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search tickets..."
              emptyMessage="No support tickets found"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
