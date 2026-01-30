import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { dummyBookings } from '@/data/seva-bookings-data';
import { dummyCounterSummaries } from '@/data/seva-bookings-data';
import { CounterSummary as CounterSummaryType } from '@/types/seva';
import { SevaBooking } from '@/types/seva';
import { format } from 'date-fns';
import { Download, Printer } from 'lucide-react';
import { dummySacreds } from '@/data/temple-structure-data';
import { dummyOfferings } from '@/data/rituals-data';
import { paymentModeLabels } from '@/types/seva';

export default function CounterSummary() {
  const { user } = useAuth();
  const [bookings] = useState<SevaBooking[]>(dummyBookings);
  const [summaries] = useState<CounterSummaryType[]>(dummyCounterSummaries);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Get summary for selected date and current user
  const summary = useMemo(() => {
    return summaries.find(
      s => s.date === selectedDate && s.counterOperatorId === user?.id
    ) || null;
  }, [summaries, selectedDate, user?.id]);

  // Get bookings for selected date and current user
  const dateBookings = useMemo(() => {
    return bookings.filter(
      b => b.date === selectedDate && b.counterOperatorId === user?.id
    );
  }, [bookings, selectedDate, user?.id]);

  // Calculate summary if not found
  const calculatedSummary = useMemo(() => {
    if (summary) return summary;

    const totalBookings = dateBookings.length;
    const totalAmount = dateBookings.reduce((sum, b) => sum + b.amount, 0);
    const cashAmount = dateBookings
      .filter(b => b.paymentMode === 'cash')
      .reduce((sum, b) => sum + b.amount, 0);
    const digitalAmount = dateBookings
      .filter(b => b.paymentMode === 'upi' || b.paymentMode === 'digital')
      .reduce((sum, b) => sum + b.amount, 0);
    const completedBookings = dateBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = dateBookings.filter(b => b.status === 'cancelled').length;

    return {
      date: selectedDate,
      counterOperatorId: user?.id || '',
      counterOperatorName: user?.name || '',
      shiftStartTime: '06:00',
      shiftEndTime: '20:00',
      totalBookings,
      totalAmount,
      cashAmount,
      digitalAmount,
      completedBookings,
      cancelledBookings,
      createdAt: new Date().toISOString(),
    };
  }, [summary, dateBookings, selectedDate, user]);

  // Handle export
  const handleExport = () => {
    const headers = ['Token Number', 'Time Slot', 'Sacred', 'Offering', 'Devotee', 'Amount', 'Payment Mode', 'Status'];
    const rows = dateBookings.map(b => {
      const sacred = dummySacreds.find(s => s.id === b.sacredId);
      const offering = dummyOfferings.find(o => o.id === b.offeringId);
      return [
        b.tokenNumber,
        `${b.slotStartTime} - ${b.slotEndTime}`,
        sacred?.name || '',
        offering?.name || '',
        b.devoteeName,
        b.amount.toString(),
        paymentModeLabels[b.paymentMode],
        b.status,
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `counter-summary-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      key: 'tokenNumber',
      label: 'Token Number',
      render: (value: unknown) => (
        <span className="font-mono text-sm font-medium text-foreground">{value as string}</span>
      ),
    },
    {
      key: 'slotStartTime',
      label: 'Time Slot',
      render: (_value: unknown, row: SevaBooking) => (
        <span className="text-foreground">
          {row.slotStartTime} - {row.slotEndTime}
        </span>
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
    },
    {
      key: 'amount',
      label: 'Amount',
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
        <span className="text-sm text-foreground">{paymentModeLabels[value as keyof typeof paymentModeLabels]}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <span className="text-sm text-foreground capitalize">{value as string}</span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Counter Summary"
        description="End-of-day settlement and summary"
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </>
        }
      />

      {/* Date Selector */}
      <div className="mt-6 mb-6">
        <Label htmlFor="summary-date" className="text-xs text-muted-foreground mb-2 block">
          Select Date
        </Label>
        <Input
          id="summary-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-[200px]"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{calculatedSummary.totalBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ₹{calculatedSummary.totalAmount.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ₹{calculatedSummary.cashAmount.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Digital Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ₹{calculatedSummary.digitalAmount.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{calculatedSummary.completedBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{calculatedSummary.cancelledBookings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Operator Info */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Counter Operator</Label>
            <p className="font-medium text-foreground mt-1">{calculatedSummary.counterOperatorName}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Shift Timing</Label>
            <p className="font-medium text-foreground mt-1">
              {calculatedSummary.shiftStartTime} - {calculatedSummary.shiftEndTime}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            <p className="font-medium text-foreground mt-1">
              {format(new Date(selectedDate), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Booking Details</h3>
        <DataTable
          data={dateBookings}
          columns={columns}
          searchPlaceholder="Search bookings..."
        />
      </div>
    </MainLayout>
  );
}
