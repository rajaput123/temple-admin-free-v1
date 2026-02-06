import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LayoutList, Kanban, Clock, MessageCircle, MoreVertical } from 'lucide-react';
import type { FeedbackTicket } from '@/types/communications';
import { FeedbackModal } from '@/components/pr/FeedbackModal';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const dummyTickets: FeedbackTicket[] = [
    {
        id: 'tkt-1',
        userId: 'u1',
        userName: 'Ramesh Gupta',
        category: 'facilities',
        description: 'Drinking water tap near North Gate is broken.',
        status: 'open',
        priority: 'high',
        createdAt: '2026-02-04T10:00:00Z',
        updatedAt: '2026-02-04T10:00:00Z',
    },
    {
        id: 'tkt-2',
        userId: 'u2',
        userName: 'Anonymous',
        category: 'prasadam',
        description: 'Prasadam counter line is very slow during lunch.',
        status: 'in_progress',
        priority: 'normal',
        adminNotes: 'Discussed with manager, adding extra counter.',
        createdAt: '2026-02-03T14:00:00Z',
        updatedAt: '2026-02-04T09:00:00Z',
    },
    {
        id: 'tkt-3',
        userId: 'u3',
        userName: 'Priya S',
        category: 'rituals',
        description: 'Appreciated the fast darshan queue management.',
        status: 'resolved',
        priority: 'normal',
        response: 'Thank you for your kind words!',
        createdAt: '2026-02-01T11:00:00Z',
        updatedAt: '2026-02-02T10:00:00Z',
        resolvedAt: '2026-02-02T10:00:00Z',
    }
];

function FeedbackTicketCard({ ticket, onClick }: { ticket: FeedbackTicket; onClick: () => void }) {
    return (
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all bg-white border-transparent shadow-sm group" onClick={onClick}>
            <div className="flex justify-between items-start mb-3">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">{ticket.category}</Badge>
                {ticket.priority === 'urgent' || ticket.priority === 'high' ? (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5 shadow-sm animate-pulse">Critical</Badge>
                ) : null}
            </div>
            <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-4 leading-relaxed group-hover:text-primary transition-colors">
                {ticket.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">
                        {ticket.userName?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-gray-600 truncate max-w-[80px]">{ticket.userName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
            </div>
        </Card>
    );
}

export default function Feedback() {
    const [tickets, setTickets] = useState<FeedbackTicket[]>(dummyTickets);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const { toast } = useToast();

    const handleUpdate = (data: Partial<FeedbackTicket>) => {
        if (selectedTicket) {
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, ...data, updatedAt: new Date().toISOString() } as FeedbackTicket : t));
            toast({ title: 'Ticket updated' });
        }
        setSelectedTicket(null);
        setIsModalOpen(false);
    };

    const updateStatus = (id: string, newStatus: FeedbackTicket['status']) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
        toast({ title: `Status updated to ${newStatus}` });
    };

    const columns = [
        {
            key: 'description',
            label: 'Issue Details',
            render: (value: unknown, row: FeedbackTicket) => (
                <div className="max-w-md py-1">
                    <div className="font-medium text-gray-900 line-clamp-1">{row.description}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="font-semibold uppercase tracking-tighter bg-gray-100 px-1 rounded">{row.category}</span>
                        <span>•</span>
                        <span>{new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'userName',
            label: 'Submitted By',
            render: (value: unknown, row: FeedbackTicket) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {row.userName?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm">{row.userName}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value: unknown, row: FeedbackTicket) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select value={row.status} onValueChange={(val) => updateStatus(row.id, val as FeedbackTicket['status'])}>
                        <SelectTrigger className="w-[130px] h-8 text-[11px] font-semibold uppercase tracking-wider">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">
                                <span className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" /> Open
                                </span>
                            </SelectItem>
                            <SelectItem value="in_progress">
                                <span className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> In Progress
                                </span>
                            </SelectItem>
                            <SelectItem value="resolved">
                                <span className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Resolved
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ),
        },
        {
            key: 'priority',
            label: 'Priority',
            render: (value: unknown, row: FeedbackTicket) => (
                <Badge variant="outline" className={`h-6 text-[10px] uppercase font-bold border-gray-200 ${row.priority === 'urgent' || row.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'text-gray-500'
                    }`}>
                    {row.priority}
                </Badge>
            ),
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Feedback & Grievances"
                description="Manage community feedback, complaints, and appreciation"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1 rounded-lg flex items-center border">
                            <Button
                                variant={viewMode === 'list' ? 'outline' : 'ghost'}
                                size="sm"
                                className={`px-2 h-7 ${viewMode === 'list' ? 'shadow-sm bg-white' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'board' ? 'outline' : 'ghost'}
                                size="sm"
                                className={`px-2 h-7 ${viewMode === 'board' ? 'shadow-sm bg-white' : ''}`}
                                onClick={() => setViewMode('board')}
                            >
                                <Kanban className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                }
            />

            <div className="p-6">
                {viewMode === 'list' ? (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <DataTable
                            data={tickets}
                            columns={columns}
                            onRowClick={(row) => { setSelectedTicket(row); setIsModalOpen(true); }}
                        />
                    </div>
                ) : (
                    <div className="h-[calc(100vh-220px)] overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-4">
                            {/* Column 1: Open */}
                            <div className="flex flex-col bg-gray-100/40 rounded-2xl border border-gray-200/50 h-full">
                                <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-gray-100/60 backdrop-blur-sm rounded-t-2xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm ring-4 ring-red-100" />
                                        <span className="font-bold text-gray-800 text-sm uppercase tracking-tight">Open Issues</span>
                                    </div>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 shadow-sm border border-gray-100">
                                        {tickets.filter(t => t.status === 'open').length}
                                    </span>
                                </div>
                                <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
                                    {tickets.filter(t => t.status === 'open').map(ticket => (
                                        <FeedbackTicketCard key={ticket.id} ticket={ticket} onClick={() => { setSelectedTicket(ticket); setIsModalOpen(true); }} />
                                    ))}
                                </div>
                            </div>

                            {/* Column 2: In Progress */}
                            <div className="flex flex-col bg-gray-100/40 rounded-2xl border border-gray-200/50 h-full">
                                <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-gray-100/60 backdrop-blur-sm rounded-t-2xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-2 w-2 rounded-full bg-amber-500 shadow-sm ring-4 ring-amber-100" />
                                        <span className="font-bold text-gray-800 text-sm uppercase tracking-tight">In Progress</span>
                                    </div>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 shadow-sm border border-gray-100">
                                        {tickets.filter(t => t.status === 'in_progress').length}
                                    </span>
                                </div>
                                <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
                                    {tickets.filter(t => t.status === 'in_progress').map(ticket => (
                                        <FeedbackTicketCard key={ticket.id} ticket={ticket} onClick={() => { setSelectedTicket(ticket); setIsModalOpen(true); }} />
                                    ))}
                                </div>
                            </div>

                            {/* Column 3: Resolved */}
                            <div className="flex flex-col bg-gray-100/40 rounded-2xl border border-gray-200/50 h-full">
                                <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-gray-100/60 backdrop-blur-sm rounded-t-2xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm ring-4 ring-emerald-100" />
                                        <span className="font-bold text-gray-800 text-sm uppercase tracking-tight">Resolved</span>
                                    </div>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 shadow-sm border border-gray-100">
                                        {tickets.filter(t => t.status === 'resolved').length}
                                    </span>
                                </div>
                                <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
                                    {tickets.filter(t => t.status === 'resolved').map(ticket => (
                                        <FeedbackTicketCard key={ticket.id} ticket={ticket} onClick={() => { setSelectedTicket(ticket); setIsModalOpen(true); }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <FeedbackModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                ticket={selectedTicket}
                onSave={handleUpdate}
            />
        </MainLayout>
    );
}
