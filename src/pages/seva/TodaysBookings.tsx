import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookingReceipt } from '@/components/seva/BookingReceipt';
import { useAuth } from '@/contexts/AuthContext';
import { dummyBookings } from '@/data/seva-bookings-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { dummyOfferings } from '@/data/rituals-data';
import { SevaBooking, BookingStatus, bookingStatusLabels } from '@/types/seva';
import { CheckCircle2, XCircle, Printer, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function TodaysBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<SevaBooking[]>(dummyBookings);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<SevaBooking | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const isAdmin = user?.role === 'super_admin' || user?.role === 'temple_administrator';

  // Filter bookings for today
  const todaysBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let filtered = bookings.filter(b => b.date === today);
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    return filtered;
  }, [bookings, statusFilter]);

  // Get sacred and offering for a booking
  const getBookingDetails = (booking: SevaBooking) => {
    const sacred = dummySacreds.find(s => s.id === booking.sacredId);
    const offering = dummyOfferings.find(o => o.id === booking.offeringId);
    return { sacred, offering };
  };

  // Handle mark complete
  const handleMarkComplete = (booking: SevaBooking) => {
    setBookings(bookings.map(b => 
      b.id === booking.id 
        ? { ...b, status: 'completed' as BookingStatus, completedAt: new Date().toISOString() }
        : b
    ));
    toast.success('Booking marked as completed');
  };

  // Handle print receipt
  const handlePrintReceipt = (booking: SevaBooking) => {
    setSelectedBooking(booking);
    setReceiptOpen(true);
  };

  // Handle cancel booking
  const handleCancelBooking = (booking: SevaBooking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  // Confirm cancellation
  const handleConfirmCancel = () => {
    if (!selectedBooking || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setBookings(bookings.map(b => 
      b.id === selectedBooking.id 
        ? { 
            ...b, 
            status: 'cancelled' as BookingStatus,
            paymentStatus: 'refunded',
            cancelledAt: new Date().toISOString(),
            cancellationReason: cancelReason.trim()
          }
        : b
    ));
    
    toast.success('Booking cancelled');
    setCancelDialogOpen(false);
    setCancelReason('');
    setSelectedBooking(null);
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
      key: 'slotStartTime',
      label: 'Time Slot',
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
      key: 'devoteeName',
      label: 'Devotee',
      sortable: true,
    },
    {
      key: 'paymentMode',
      label: 'Payment',
      render: (_value: unknown, row: SevaBooking) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {row.paymentMode.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground">
            ₹{row.amount.toLocaleString('en-IN')}
          </div>
        </div>
      ),
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
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Today's Bookings"
        description="Manage bookings for today"
        actions={
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mt-6">
        <DataTable
          data={todaysBookings}
          columns={columns}
          searchPlaceholder="Search bookings..."
          actions={(row) => (
            <>
              <DropdownMenuItem onClick={() => handlePrintReceipt(row)}>
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </DropdownMenuItem>
              {row.status === 'booked' && (
                <DropdownMenuItem onClick={() => handleMarkComplete(row)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              {isAdmin && row.status !== 'cancelled' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleCancelBooking(row)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        />
      </div>

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

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason <span className="text-destructive">*</span></Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="mt-2"
                rows={4}
              />
            </div>
            {selectedBooking && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium text-foreground">Booking Details:</p>
                <p className="text-muted-foreground mt-1">
                  Token: {selectedBooking.tokenNumber} | Amount: ₹{selectedBooking.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payment will be marked as refunded.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCancelDialogOpen(false);
              setCancelReason('');
              setSelectedBooking(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancel}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
