import { SevaBooking } from '@/types/seva';
import { Sacred } from '@/types/temple-structure';
import { Offering } from '@/types/rituals';
import { paymentModeLabels } from '@/types/seva';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingReceiptProps {
  booking: SevaBooking;
  sacred: Sacred;
  offering: Offering;
  onPrint?: () => void;
}

export function BookingReceipt({ booking, sacred, offering, onPrint }: BookingReceiptProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="print:max-w-[80mm] print:p-4">
      {/* Print button - hidden when printing */}
      <div className="mb-4 print:hidden">
        <Button onClick={handlePrint} size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
      </div>

      {/* Receipt Content */}
      <div className="bg-white p-6 rounded-lg border print:border-0 print:shadow-none">
        {/* Header */}
        <div className="text-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-foreground">Sri Sringeri Sharadamba Temple</h2>
          <p className="text-sm text-muted-foreground mt-1">Seva Counter Booking Receipt</p>
        </div>

        {/* Token Number */}
        <div className="mb-4 text-center">
          <p className="text-xs text-muted-foreground">Token Number</p>
          <p className="text-2xl font-mono font-bold text-foreground mt-1">{booking.tokenNumber}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium text-foreground">
              {format(new Date(booking.date), 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time Slot:</span>
            <span className="font-medium text-foreground">
              {booking.slotStartTime} - {booking.slotEndTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sacred:</span>
            <span className="font-medium text-foreground">{sacred.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Offering:</span>
            <span className="font-medium text-foreground">{offering.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Devotee:</span>
            <span className="font-medium text-foreground">{booking.devoteeName}</span>
          </div>
          {booking.devoteeMobile && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile:</span>
              <span className="font-medium text-foreground">{booking.devoteeMobile}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="border-t border-b py-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-foreground">Amount:</span>
            <span className="text-2xl font-bold text-foreground">
              ₹{booking.amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">Payment Mode:</span>
            <span className="text-xs font-medium text-foreground">
              {paymentModeLabels[booking.paymentMode]}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Booked on: {format(new Date(booking.bookedAt), 'dd MMM yyyy, hh:mm a')}</p>
          {booking.counterOperatorName && (
            <p>Counter Operator: {booking.counterOperatorName}</p>
          )}
          <p className="mt-3 pt-3 border-t">Thank you for your seva</p>
        </div>
      </div>
    </div>
  );
}
