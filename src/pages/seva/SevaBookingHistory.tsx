import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Download,
    Search,
    Filter,
    Calendar,
    TrendingUp,
    FileText
} from 'lucide-react';
import { dummySevaBookings, dummySevas } from '@/data/seva-booking-data';
import type { SevaBooking, BookingStatus, PaymentMode } from '@/types/seva-booking';
import { format, subDays } from 'date-fns';

export default function SevaBookingHistory() {
    const [startDate, setStartDate] = useState(subDays(new Date(), 7).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
    const [filterPaymentMode, setFilterPaymentMode] = useState<PaymentMode | 'ALL'>('ALL');
    const [filterSeva, setFilterSeva] = useState('ALL');

    // Mock data - in real app would fetch from API with date range
    const [bookings] = useState<SevaBooking[]>(dummySevaBookings);

    // Apply filters
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.devotee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.devotee.phone.includes(searchQuery) ||
            booking.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;
        const matchesPaymentMode = filterPaymentMode === 'ALL' || booking.payment.mode === filterPaymentMode;
        const matchesSeva = filterSeva === 'ALL' || booking.seva.id === filterSeva;

        return matchesSearch && matchesStatus && matchesPaymentMode && matchesSeva;
    });

    // Calculate analytics
    const analytics = {
        totalBookings: filteredBookings.length,
        totalRevenue: filteredBookings
            .filter(b => b.payment.status === 'COLLECTED')
            .reduce((sum, b) => sum + b.payment.amount, 0),
        cashRevenue: filteredBookings
            .filter(b => b.payment.mode === 'CASH' && b.payment.status === 'COLLECTED')
            .reduce((sum, b) => sum + b.payment.amount, 0),
        digitalRevenue: filteredBookings
            .filter(b => (b.payment.mode === 'UPI' || b.payment.mode === 'CARD') && b.payment.status === 'COLLECTED')
            .reduce((sum, b) => sum + b.payment.amount, 0),
        noShowCount: filteredBookings.filter(b => b.status === 'NO_SHOW').length,
        cancelledCount: filteredBookings.filter(b => b.status === 'CANCELLED').length,
    };

    // Find regular devotees
    const devoteeFrequency: Record<string, { name: string; phone: string; count: number; totalSpent: number }> = {};
    filteredBookings.forEach(booking => {
        const key = booking.devotee.phone;
        if (!devoteeFrequency[key]) {
            devoteeFrequency[key] = {
                name: booking.devotee.name,
                phone: booking.devotee.phone,
                count: 0,
                totalSpent: 0,
            };
        }
        devoteeFrequency[key].count++;
        if (booking.payment.status === 'COLLECTED') {
            devoteeFrequency[key].totalSpent += booking.payment.amount;
        }
    });

    const regularDevotees = Object.values(devoteeFrequency)
        .filter(d => d.count >= 3)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    const handleExport = () => {
        alert('Exporting data to CSV...\n\nIn production, this would generate a CSV file with all booking details for finance and donor programs.');
    };

    const getStatusBadgeVariant = (status: BookingStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
        const variants: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            PENDING: 'secondary',
            COLLECTED: 'default',
            COMPLETED: 'default',
            NO_SHOW: 'destructive',
            CANCELLED: 'outline'
        };
        return variants[status];
    };

    return (
        <MainLayout>
            <PageHeader
                title="Seva Booking History"
                description="Complete audit trail with advanced filtering"
                actions={
                    <Button onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export to CSV
                    </Button>
                }
            />

            {/* Summary Analytics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total Bookings</div>
                        <div className="text-2xl font-bold">{analytics.totalBookings}</div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                        <div className="text-2xl font-bold text-primary">₹{analytics.totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Cash Revenue</div>
                        <div className="text-xl font-bold text-green-600">₹{analytics.cashRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Digital Revenue</div>
                        <div className="text-xl font-bold text-blue-600">₹{analytics.digitalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">No-shows</div>
                        <div className="text-2xl font-bold text-red-600">{analytics.noShowCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Cancelled</div>
                        <div className="text-2xl font-bold text-orange-600">{analytics.cancelledCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mt-6">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5" />
                        <h3 className="font-semibold text-lg">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="col-span-1">
                            <Label htmlFor="startDate" className="text-sm flex items-center gap-1 mb-2">
                                <Calendar className="h-3 w-3" />
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9"
                            />
                        </div>

                        <div className="col-span-1">
                            <Label htmlFor="endDate" className="text-sm flex items-center gap-1 mb-2">
                                <Calendar className="h-3 w-3" />
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="h-9"
                            />
                        </div>

                        <div className="col-span-1">
                            <Label className="text-sm mb-2 block">Status</Label>
                            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as BookingStatus | 'ALL')}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="COLLECTED">Collected</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="NO_SHOW">No-show</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-1">
                            <Label className="text-sm mb-2 block">Payment Mode</Label>
                            <Select value={filterPaymentMode} onValueChange={(v) => setFilterPaymentMode(v as PaymentMode | 'ALL')}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Modes</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-1">
                            <Label className="text-sm mb-2 block">Seva Type</Label>
                            <Select value={filterSeva} onValueChange={setFilterSeva}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Sevas</SelectItem>
                                    {dummySevas.map(seva => (
                                        <SelectItem key={seva.id} value={seva.id}>{seva.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-1">
                            <Label className="text-sm mb-2 block">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name/Phone/Receipt"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Regular Devotees */}
            {regularDevotees.length > 0 && (
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">Top Regular Devotees</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {regularDevotees.map((devotee, index) => (
                                <div key={devotee.phone} className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline">#{index + 1}</Badge>
                                        <span className="font-semibold text-sm">{devotee.name}</span>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <div className="text-muted-foreground">{devotee.phone}</div>
                                        <div>Bookings: <span className="font-semibold">{devotee.count}</span></div>
                                        <div className="text-primary font-semibold">₹{devotee.totalSpent.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bookings Table */}
            <Card className="mt-6">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-semibold text-lg">Booking Records</h3>
                        </div>
                        <Badge variant="secondary">{filteredBookings.length} results</Badge>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr className="text-left text-sm">
                                    <th className="p-3">Receipt #</th>
                                    <th className="p-3">Date & Time</th>
                                    <th className="p-3">Devotee</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3">Seva</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Payment</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-muted-foreground">
                                            No bookings found matching the selected filters
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map(booking => (
                                        <tr key={booking.id} className="hover:bg-muted/50 text-sm">
                                            <td className="p-3 font-mono text-xs">{booking.receiptNumber}</td>
                                            <td className="p-3">
                                                <div>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {booking.slot.startTime}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">{booking.devotee.name}</div>
                                                {booking.devotee.isRegular && (
                                                    <Badge variant="outline" className="text-xs mt-1">Regular</Badge>
                                                )}
                                            </td>
                                            <td className="p-3">{booking.devotee.phone}</td>
                                            <td className="p-3">{booking.seva.name}</td>
                                            <td className="p-3 font-semibold text-primary">₹{booking.payment.amount}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="text-xs">
                                                    {booking.payment.mode}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs">
                                                    {booking.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
