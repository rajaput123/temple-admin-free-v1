import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Plus,
    Search,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    Ban,
    Printer,
    TrendingUp
} from 'lucide-react';
import { getTodayBookings, dummySevas } from '@/data/seva-booking-data';
import type { SevaBooking, BookingStatus } from '@/types/seva-booking';
import { format } from 'date-fns';

export default function TodaysSevaBookings() {
    const navigate = useNavigate();
    const [bookings] = useState<SevaBooking[]>(getTodayBookings());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
    const [filterSeva, setFilterSeva] = useState('ALL');

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.devotee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.devotee.phone.includes(searchQuery) ||
            booking.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;
        const matchesSeva = filterSeva === 'ALL' || booking.seva.id === filterSeva;

        return matchesSearch && matchesStatus && matchesSeva;
    });

    // Calculate summary
    const summary = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        collected: bookings.filter(b => b.status === 'COLLECTED').length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length,
        noShow: bookings.filter(b => b.status === 'NO_SHOW').length,
        revenue: bookings
            .filter(b => b.payment.status === 'COLLECTED')
            .reduce((sum, b) => sum + b.payment.amount, 0),
    };

    const getStatusIcon = (status: BookingStatus) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4" />;
            case 'COLLECTED': return <CheckCircle className="h-4 w-4" />;
            case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
            case 'NO_SHOW': return <XCircle className="h-4 w-4" />;
            case 'CANCELLED': return <Ban className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: BookingStatus) => {
        const variants: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            PENDING: 'secondary',
            COLLECTED: 'default',
            COMPLETED: 'default',
            NO_SHOW: 'destructive',
            CANCELLED: 'outline'
        };
        return variants[status];
    };

    const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
        // In real app, would call API to update status
        alert(`Status updated to: ${newStatus}`);
    };

    const handleReprint = (booking: SevaBooking) => {
        // In real app, would require supervisor approval
        const confirmed = window.confirm(`Reprint receipt for ${booking.receiptNumber}?\n\nThis action requires supervisor approval.`);
        if (confirmed) {
            alert(`Receipt ${booking.receiptNumber} sent to printer!`);
        }
    };

    return (
        <MainLayout>
            <PageHeader
                title="Today's Seva Bookings"
                description={format(new Date(), 'EEEE, MMMM dd, yyyy')}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={() => navigate('/seva/bookings/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Booking
                        </Button>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total</div>
                        <div className="text-2xl font-bold">{summary.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Pending</div>
                        <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Collected</div>
                        <div className="text-2xl font-bold text-blue-600">{summary.collected}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Completed</div>
                        <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">No-show</div>
                        <div className="text-2xl font-bold text-red-600">{summary.noShow}</div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Revenue</div>
                        <div className="text-2xl font-bold text-primary">₹{summary.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, or receipt number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as BookingStatus | 'ALL')}>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COLLECTED">Collected</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="NO_SHOW">No-show</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterSeva} onValueChange={setFilterSeva}>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by seva" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Sevas</SelectItem>
                        {dummySevas.map(seva => (
                            <SelectItem key={seva.id} value={seva.id}>{seva.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bookings List */}
            <div className="mt-6">
                <Tabs defaultValue="list" className="w-full">
                    <TabsList>
                        <TabsTrigger value="list">List View</TabsTrigger>
                        <TabsTrigger value="slots">By Slots</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-4 space-y-3">
                        {filteredBookings.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center text-muted-foreground">
                                    No bookings found
                                </CardContent>
                            </Card>
                        ) : (
                            filteredBookings.map(booking => (
                                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{booking.devotee.name}</h3>
                                                    <Badge variant={getStatusBadge(booking.status)} className="flex items-center gap-1">
                                                        {getStatusIcon(booking.status)}
                                                        {booking.status}
                                                    </Badge>
                                                    {booking.devotee.isRegular && (
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            Regular
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Receipt:</span>{' '}
                                                        <span className="font-medium">{booking.receiptNumber}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Phone:</span>{' '}
                                                        <span className="font-medium">{booking.devotee.phone}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Seva:</span>{' '}
                                                        <span className="font-medium">{booking.seva.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Time:</span>{' '}
                                                        <span className="font-medium">{booking.slot.startTime}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Payment:</span>{' '}
                                                        <Badge variant="outline" className="text-xs">
                                                            {booking.payment.mode}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Amount:</span>{' '}
                                                        <span className="font-semibold text-primary">₹{booking.payment.amount}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Devotees:</span>{' '}
                                                        <span className="font-medium">{booking.devotee.numberOfDevotees}</span>
                                                    </div>
                                                    {booking.devotee.gotra && (
                                                        <div>
                                                            <span className="text-muted-foreground">Gotra:</span>{' '}
                                                            <span className="font-medium">{booking.devotee.gotra}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Select
                                                    value={booking.status}
                                                    onValueChange={(v) => handleStatusChange(booking.id, v as BookingStatus)}
                                                >
                                                    <SelectTrigger className="w-40 h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Mark Pending</SelectItem>
                                                        <SelectItem value="COLLECTED">Mark Collected</SelectItem>
                                                        <SelectItem value="COMPLETED">Mark Completed</SelectItem>
                                                        <SelectItem value="NO_SHOW">Mark No-show</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReprint(booking)}
                                                    className="h-8"
                                                >
                                                    <Printer className="h-3 w-3 mr-1" />
                                                    Reprint
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="slots" className="mt-4">
                        <div className="space-y-6">
                            {/* Group bookings by slot time */}
                            {Object.entries(
                                filteredBookings.reduce((acc, booking) => {
                                    const key = `${booking.slot.startTime} - ${booking.slot.endTime}`;
                                    if (!acc[key]) acc[key] = [];
                                    acc[key].push(booking);
                                    return acc;
                                }, {} as Record<string, SevaBooking[]>)
                            ).map(([timeSlot, slotBookings]) => (
                                <Card key={timeSlot}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold">{timeSlot}</h3>
                                            <Badge variant="outline">{slotBookings.length} bookings</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {slotBookings.map(booking => (
                                                <div key={booking.id} className="p-3 border rounded-lg">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="font-medium">{booking.devotee.name}</div>
                                                        <Badge variant={getStatusBadge(booking.status)} className="text-xs">
                                                            {booking.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm space-y-1">
                                                        <div className="text-muted-foreground">{booking.seva.name}</div>
                                                        <div className="text-xs text-muted-foreground">{booking.receiptNumber}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
