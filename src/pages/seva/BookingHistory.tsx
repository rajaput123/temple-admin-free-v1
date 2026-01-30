import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingReceipt } from '@/components/seva/BookingReceipt';
import { dummyBookings } from '@/data/seva-bookings-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { dummyOfferings } from '@/data/rituals-data';
import { SevaBooking, BookingStatus, PaymentMode, bookingStatusLabels, paymentModeLabels } from '@/types/seva';
import { Download, Eye, Printer } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export default function BookingHistory() {
  const [bookings] = useState<SevaBooking[]>(dummyBookings);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<PaymentMode | 'all'>('all');
  const [sacredFilter, setSacredFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedBooking, setSelectedBooking] = useState<SevaBooking | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= dateRange.from! && bookingDate <= dateRange.to!;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Payment mode filter
    if (paymentModeFilter !== 'all') {
      filtered = filtered.filter(b => b.paymentMode === paymentModeFilter);
    }

    // Sacred filter
    if (sacredFilter !== 'all') {
      filtered = filtered.filter(b => b.sacredId === sacredFilter);
    }

    return filtered;
  }, [bookings, statusFilter, paymentModeFilter, sacredFilter, dateRange]);

  // Get sacred and offering for a booking
  const getBookingDetails = (booking: SevaBooking) => {
    const sacred = dummySacreds.find(s => s.id === booking.sacredId);
    const offering = dummyOfferings.find(o => o.id === booking.offeringId);
    return { sacred, offering };
  };

  // Handle export
  const handleExport = () => {
    // Simple CSV export
    const headers = ['Token Number', 'Date', 'Time Slot', 'Sacred', 'Offering', 'Devotee', 'Amount', 'Payment Mode', 'Status'];
    const rows = filteredBookings.map(b => {
      const sacred = dummySacreds.find(s => s.id === b.sacredId);
      const offering = dummyOfferings.find(o => o.id === b.offeringId);
      return [
        b.tokenNumber,
        format(new Date(b.date), 'yyyy-MM-dd'),
        `${b.slotStartTime} - ${b.slotEndTime}`,
        sacred?.name || '',
        offering?.name || '',
        b.devoteeName,
        b.amount.toString(),
        paymentModeLabels[b.paymentMode],
        bookingStatusLabels[b.status],
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle view details
  const handleViewDetails = (booking: SevaBooking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  // Handle print receipt
  const handlePrintReceipt = (booking: SevaBooking) => {
    setSelectedBooking(booking);
    setReceiptOpen(true);
  };

  const columns = [
    {
      key: 'tokenNumber',
      label: 'Token Number',
      sortable: true,
      render: (value: unknown) => (
        <span className="font-mono text-sm font-medium text-foreground">{value as string}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (_value: unknown, row: SevaBooking) => (
        <div>
          <div className="font-medium text-foreground">
            {format(new Date(row.date), 'dd MMM yyyy')}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.slotStartTime} - {row.slotEndTime}
          </div>
        </div>
      ),
    },
    {
      key: 'sacredId',
      label: 'Sacred',
      render: (_value: unknown, row: SevaBooking) => {
        const sacred = dummySacreds.find(s => s.id === row.sacredId);
        return <span className="text-foreground">{sacred?.name || 'Unknown'}</span>;
      },
    },
    {
      key: 'offeringId',
      label: 'Offering',
      render: (_value: unknown, row: SevaBooking) => {
        const offering = dummyOfferings.find(o => o.id === row.offeringId);
        return <span className="text-foreground">{offering?.name || 'Unknown'}</span>;
      },
    },
    {
      key: 'devoteeName',
      label: 'Devotee',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium text-foreground">
          ₹{(value as number).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      label: 'Payment Mode',
      render: (value: unknown) => (
        <span className="text-sm text-foreground">{paymentModeLabels[value as PaymentMode]}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as BookingStatus;
        const variants: Record<BookingStatus, 'success' | 'warning' | 'destructive' | 'neutral'> = {
          booked: 'warning',
          completed: 'success',
          cancelled: 'destructive',
        };
        return <StatusBadge variant={variants[status]}>{bookingStatusLabels[status]}</StatusBadge>;
      },
    },
    {
      key: 'counterOperatorName',
      label: 'Operator',
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{value as string || '-'}</span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Booking History"
        description="View and export booking history"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Date Range</Label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Status</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Payment Mode</Label>
          <Select value={paymentModeFilter} onValueChange={(value) => setPaymentModeFilter(value as PaymentMode | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Sacred</Label>
          <Select value={sacredFilter} onValueChange={setSacredFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sacred</SelectItem>
              {dummySacreds.map(sacred => (
                <SelectItem key={sacred.id} value={sacred.id}>{sacred.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredBookings}
        columns={columns}
        searchPlaceholder="Search bookings..."
        actions={(row) => (
          <>
            <DropdownMenuItem onClick={() => handleViewDetails(row)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintReceipt(row)}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </DropdownMenuItem>
          </>
        )}
      />

      {/* Details Dialog */}
      {selectedBooking && (() => {
        const { sacred, offering } = getBookingDetails(selectedBooking);
        if (!sacred || !offering) return null;
        
        return (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Token Number</Label>
                    <p className="font-mono font-medium text-foreground mt-1">{selectedBooking.tokenNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p className="font-medium text-foreground mt-1">
                      {format(new Date(selectedBooking.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Time Slot</Label>
                    <p className="font-medium text-foreground mt-1">
                      {selectedBooking.slotStartTime} - {selectedBooking.slotEndTime}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p className="font-medium text-foreground mt-1">
                      {bookingStatusLabels[selectedBooking.status]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sacred</Label>
                    <p className="font-medium text-foreground mt-1">{sacred.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Offering</Label>
                    <p className="font-medium text-foreground mt-1">{offering.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Devotee Name</Label>
                    <p className="font-medium text-foreground mt-1">{selectedBooking.devoteeName}</p>
                  </div>
                  {selectedBooking.devoteeMobile && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Mobile</Label>
                      <p className="font-medium text-foreground mt-1">{selectedBooking.devoteeMobile}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <p className="font-medium text-foreground mt-1">
                      ₹{selectedBooking.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                    <p className="font-medium text-foreground mt-1">
                      {paymentModeLabels[selectedBooking.paymentMode]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Booked At</Label>
                    <p className="font-medium text-foreground mt-1">
                      {format(new Date(selectedBooking.bookedAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  {selectedBooking.counterOperatorName && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Counter Operator</Label>
                      <p className="font-medium text-foreground mt-1">{selectedBooking.counterOperatorName}</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Receipt Dialog */}
      {selectedBooking && (() => {
        const { sacred, offering } = getBookingDetails(selectedBooking);
        if (!sacred || !offering) return null;
        
        return (
          <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
            <DialogContent className="max-w-md print:max-w-none">
              <DialogHeader>
                <DialogTitle>Booking Receipt</DialogTitle>
              </DialogHeader>
              <BookingReceipt
                booking={selectedBooking}
                sacred={sacred}
                offering={offering}
              />
            </DialogContent>
          </Dialog>
        );
      })()}
    </MainLayout>
  );
}
