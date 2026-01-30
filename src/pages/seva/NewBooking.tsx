import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SacredSelector } from '@/components/seva/SacredSelector';
import { OfferingSelector } from '@/components/seva/OfferingSelector';
import { DateSlotSelector } from '@/components/seva/DateSlotSelector';
import { DevoteeForm } from '@/components/seva/DevoteeForm';
import { PaymentSection } from '@/components/seva/PaymentSection';
import { BookingReceipt } from '@/components/seva/BookingReceipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { dummySacreds } from '@/data/temple-structure-data';
import { dummyOfferings, dummyFestivals } from '@/data/rituals-data';
import { dummyBookings } from '@/data/seva-bookings-data';
import { calculateSlots, canBookSlot } from '@/lib/slot-availability';
import { generateTokenNumber } from '@/lib/token-generator';
import { SevaBooking, PaymentMode } from '@/types/seva';
import { Sacred } from '@/types/temple-structure';
import { Offering } from '@/types/rituals';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewBooking() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<SevaBooking[]>(dummyBookings);
  
  // Step 1: Sacred selection
  const [selectedSacredId, setSelectedSacredId] = useState<string | null>(null);
  
  // Step 2: Offering selection
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);
  
  // Step 3: Date & Slot selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  
  // Step 4: Devotee details
  const [devoteeName, setDevoteeName] = useState('');
  const [devoteeMobile, setDevoteeMobile] = useState('');
  
  // Step 5: Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  
  // Booking confirmation
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [newBooking, setNewBooking] = useState<SevaBooking | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter offerings by selected sacred
  const filteredOfferings = useMemo(() => {
    if (!selectedSacredId) return [];
    return dummyOfferings.filter(o => o.sacredId === selectedSacredId && o.status === 'active');
  }, [selectedSacredId]);

  // Get selected offering
  const selectedOffering = useMemo(() => {
    if (!selectedOfferingId) return null;
    return dummyOfferings.find(o => o.id === selectedOfferingId) || null;
  }, [selectedOfferingId]);

  // Get selected sacred
  const selectedSacred = useMemo(() => {
    if (!selectedSacredId) return null;
    return dummySacreds.find(s => s.id === selectedSacredId) || null;
  }, [selectedSacredId]);

  // Calculate slots for selected offering and date
  const slots = useMemo(() => {
    if (!selectedOffering || !selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return calculateSlots(selectedOffering, dateStr, bookings, dummyFestivals);
  }, [selectedOffering, selectedDate, bookings]);

  // Reset offering when sacred changes
  useEffect(() => {
    setSelectedOfferingId(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
  }, [selectedSacredId]);

  // Reset date/slot when offering changes
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
  }, [selectedOfferingId]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedSacredId) {
      newErrors.sacred = 'Please select a sacred';
    }
    if (!selectedOfferingId) {
      newErrors.offering = 'Please select an offering';
    }
    if (!selectedDate) {
      newErrors.date = 'Please select a date';
    }
    if (!selectedSlot) {
      newErrors.slot = 'Please select a time slot';
    }
    if (!devoteeName.trim()) {
      newErrors.devoteeName = 'Please enter devotee name';
    }
    if (!selectedOffering) {
      newErrors.offering = 'Offering not found';
    }

    // Validate slot availability
    if (selectedOffering && selectedDate && selectedSlot) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const validation = canBookSlot(selectedOffering, dateStr, selectedSlot.startTime, bookings, dummyFestivals);
      if (!validation.canBook) {
        newErrors.slot = validation.reason || 'Slot is not available';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!validate()) {
      toast.error('Please fix the errors before confirming');
      return;
    }

    if (!selectedSacred || !selectedOffering || !selectedDate || !selectedSlot) {
      toast.error('Missing required information');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Generate token number
    const tokenNumber = generateTokenNumber(selectedSacred, selectedOffering, bookings);

    // Create booking
    const booking: SevaBooking = {
      id: `booking-${Date.now()}`,
      tokenNumber,
      sacredId: selectedSacred.id,
      offeringId: selectedOffering.id,
      date: dateStr,
      slotStartTime: selectedSlot.startTime,
      slotEndTime: selectedSlot.endTime,
      devoteeName: devoteeName.trim(),
      devoteeMobile: devoteeMobile.trim() || undefined,
      amount: selectedOffering.amount,
      paymentMode,
      paymentStatus: 'paid',
      status: 'booked',
      counterOperatorId: user?.id,
      counterOperatorName: user?.name,
      bookedAt: new Date().toISOString(),
      receiptPrinted: false,
      createdAt: new Date().toISOString(),
    };

    // Add to bookings
    setBookings([...bookings, booking]);
    setNewBooking(booking);
    setBookingSuccess(true);
    toast.success('Booking confirmed successfully!');

    // Reset form after a delay
    setTimeout(() => {
      handleReset();
    }, 3000);
  };

  // Reset form
  const handleReset = () => {
    setSelectedSacredId(null);
    setSelectedOfferingId(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setDevoteeName('');
    setDevoteeMobile('');
    setPaymentMode('cash');
    setUpiTransactionId('');
    setErrors({});
    setBookingSuccess(false);
    setNewBooking(null);
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    setReceiptOpen(true);
  };

  return (
    <MainLayout>
      <PageHeader
        title="New Booking"
        description="Create a new seva counter booking"
      />

      {bookingSuccess && newBooking && selectedSacred && selectedOffering && (
        <Alert className="mb-6 border-success bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Booking confirmed! Token Number: <strong>{newBooking.tokenNumber}</strong>
            <Button
              variant="link"
              size="sm"
              className="ml-2 h-auto p-0 text-success underline"
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Steps 1-3 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <SacredSelector
                sacreds={dummySacreds}
                selectedSacredId={selectedSacredId}
                onSelect={setSelectedSacredId}
              />
              {errors.sacred && (
                <p className="text-xs text-destructive mt-2">{errors.sacred}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <OfferingSelector
                offerings={filteredOfferings}
                selectedOfferingId={selectedOfferingId}
                onSelect={setSelectedOfferingId}
              />
              {errors.offering && (
                <p className="text-xs text-destructive mt-2">{errors.offering}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <DateSlotSelector
                offering={selectedOffering}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                slots={slots}
                bookings={bookings}
                festivals={dummyFestivals}
                onDateSelect={setSelectedDate}
                onSlotSelect={setSelectedSlot}
              />
              {errors.date && (
                <p className="text-xs text-destructive mt-2">{errors.date}</p>
              )}
              {errors.slot && (
                <p className="text-xs text-destructive mt-2">{errors.slot}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Steps 4-6 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <DevoteeForm
                devoteeName={devoteeName}
                devoteeMobile={devoteeMobile}
                onNameChange={setDevoteeName}
                onMobileChange={setDevoteeMobile}
              />
              {errors.devoteeName && (
                <p className="text-xs text-destructive mt-2">{errors.devoteeName}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <PaymentSection
                offering={selectedOffering}
                paymentMode={paymentMode}
                upiTransactionId={upiTransactionId}
                onPaymentModeChange={setPaymentMode}
                onUpiTransactionIdChange={setUpiTransactionId}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Step 6: Confirm Booking</h3>
              <div className="space-y-4">
                {selectedOffering && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Offering:</span>
                        <span className="font-medium text-foreground">{selectedOffering.name}</span>
                      </div>
                      {selectedDate && selectedSlot && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium text-foreground">
                              {format(selectedDate, 'dd MMM yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium text-foreground">
                              {selectedSlot.startTime} - {selectedSlot.endTime}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium text-foreground">
                          ₹{selectedOffering.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleConfirmBooking}
                  className="w-full"
                  size="lg"
                  disabled={bookingSuccess}
                >
                  Confirm Booking
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                  disabled={bookingSuccess}
                >
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      {newBooking && selectedSacred && selectedOffering && (
        <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
          <DialogContent className="max-w-md print:max-w-none">
            <DialogHeader>
              <DialogTitle>Booking Receipt</DialogTitle>
            </DialogHeader>
            <BookingReceipt
              booking={newBooking}
              sacred={selectedSacred}
              offering={selectedOffering}
            />
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}
