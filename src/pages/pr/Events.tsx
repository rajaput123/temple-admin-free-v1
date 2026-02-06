import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Calendar as CalendarIcon, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TempleEvent, CommunicationStatus } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

const statusColors: Record<CommunicationStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    pending_approval: 'bg-orange-100 text-orange-700',
    approved: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
};

const dummyEvents: TempleEvent[] = [
    {
        id: '1',
        title: 'Maha Shivaratri',
        description: 'Annual grand celebration',
        category: 'festival',
        startTime: '2026-03-08T18:00:00Z',
        endTime: '2026-03-09T06:00:00Z',
        capacity: 5000,
        rsvpEnabled: true,
        rsvpCount: 1250,
        status: 'published',
        priority: 'high',
        createdBy: 'admin',
        createdAt: '2026-01-15T10:00:00Z',
    },
    {
        id: '2',
        title: 'Volunteer Meeting',
        description: 'Weekly coordination meet',
        category: 'other',
        startTime: '2026-02-10T10:00:00Z',
        endTime: '2026-02-10T11:00:00Z',
        capacity: 50,
        rsvpEnabled: true,
        rsvpCount: 35,
        status: 'published',
        priority: 'normal',
        createdBy: 'pr_manager',
        createdAt: '2026-02-01T10:00:00Z',
    }
];

export default function Events() {
    const { checkWriteAccess } = usePermissions();
    const navigate = useNavigate();
    const [events] = useState<TempleEvent[]>(dummyEvents);
    const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const canWrite = checkWriteAccess('communications');

    // Calendar Calculations
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const columns = [
        {
            key: 'title',
            label: 'Event Title',
            sortable: true,
            render: (value: unknown, row: TempleEvent) => (
                <div className="max-w-md">
                    <div className="font-medium text-gray-900 truncate">{row.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">{row.category}</div>
                </div>
            ),
        },
        {
            key: 'startTime',
            label: 'Date & Time',
            sortable: true,
            render: (value: unknown, row: TempleEvent) => {
                const start = new Date(row.startTime);
                return (
                    <div className="text-sm">
                        <div>{format(start, 'PPP')}</div>
                        <div className="text-xs text-gray-500">{format(start, 'p')}</div>
                    </div>
                );
            },
        },
        {
            key: 'location',
            label: 'Location',
            render: (value: unknown, row: TempleEvent) => (
                <span className="text-sm text-gray-600">{row.location || 'N/A'}</span>
            ),
        },
        {
            key: 'capacity',
            label: 'RSVP Status',
            render: (value: unknown, row: TempleEvent) => (
                <div className="text-sm">
                    {row.rsvpEnabled ? (
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${Math.min((row.rsvpCount / row.capacity) * 100, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium">{row.rsvpCount}/{row.capacity}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400 text-xs italic">Not Enabled</span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: unknown, row: TempleEvent) => (
                <Badge className={statusColors[row.status]}>
                    {row.status.replace('_', ' ')}
                </Badge>
            ),
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Events Calendar"
                description="Manage temple events, festivals, and seva schedules"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1 rounded-lg flex items-center border">
                            <Button
                                variant={viewMode === 'calendar' ? 'outline' : 'ghost'}
                                size="sm"
                                className={`px-2 h-7 ${viewMode === 'calendar' ? 'shadow-sm bg-white' : ''}`}
                                onClick={() => setViewMode('calendar')}
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'outline' : 'ghost'}
                                size="sm"
                                className={`px-2 h-7 ${viewMode === 'table' ? 'shadow-sm bg-white' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                        </div>
                        {canWrite && (
                            <Button onClick={() => navigate('/pr/calendar/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Event
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="space-y-4">
                {viewMode === 'calendar' ? (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="font-medium">
                                    Today
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                            {/* Weekday Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="bg-gray-50/80 backdrop-blur-sm p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}

                            {/* Days */}
                            {calendarDays.map((day) => {
                                const dayEvents = events.filter(evt => isSameDay(new Date(evt.startTime), day));
                                return (
                                    <div
                                        key={day.toString()}
                                        className={`min-h-[140px] bg-white p-3 flex flex-col gap-2 transition-all hover:bg-gray-50/50 group relative ${!isSameMonth(day, currentMonth) ? 'bg-gray-50/30 text-gray-300' : ''
                                            } ${isSameDay(day, new Date()) ? 'bg-orange-50/30 ring-1 ring-inset ring-orange-200/50' : ''}`}
                                    >
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isSameDay(day, new Date()) ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-700'
                                            }`}>
                                            {format(day, 'd')}
                                        </span>

                                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[90px] scrollbar-hide">
                                            {dayEvents.map(evt => (
                                                <div
                                                    key={evt.id}
                                                    onClick={() => navigate(`/pr/calendar/${evt.id}`)}
                                                    className={`text-[11px] font-medium px-2 py-1 rounded-md truncate cursor-pointer border shadow-sm transition-transform active:scale-95 ${evt.status === 'published' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' :
                                                            evt.status === 'draft' ? 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100' :
                                                                'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                                                        }`}
                                                    title={`${format(new Date(evt.startTime), 'p')} - ${evt.title}`}
                                                >
                                                    <span className="opacity-60 mr-1 font-normal">{format(new Date(evt.startTime), 'HH:mm')}</span>
                                                    {evt.title}
                                                </div>
                                            ))}
                                        </div>

                                        {canWrite && (
                                            <button
                                                onClick={() => navigate('/pr/calendar/new')}
                                                className="absolute bottom-2 right-2 p-1 rounded-full bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <DataTable
                            data={events}
                            columns={columns}
                            actions={(row) => (
                                <div className="flex items-center gap-2">
                                    {canWrite && (
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/pr/calendar/${row.id}`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
