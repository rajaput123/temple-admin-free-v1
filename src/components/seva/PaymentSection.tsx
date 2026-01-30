import { Offering } from '@/types/rituals';
import { PaymentMode, paymentModeLabels } from '@/types/seva';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentSectionProps {
  offering: Offering | null;
  paymentMode: PaymentMode;
  upiTransactionId: string;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onUpiTransactionIdChange: (id: string) => void;
}

export function PaymentSection({
  offering,
  paymentMode,
  upiTransactionId,
  onPaymentModeChange,
  onUpiTransactionIdChange,
}: PaymentSectionProps) {
  if (!offering) {
    return (
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Step 5: Payment</h3>
        <p className="text-sm text-muted-foreground">Please select an offering first</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Step 5: Payment</h3>
      <div className="space-y-4">
        {/* Amount (Read-only) */}
        <div>
          <Label className="text-xs text-muted-foreground">Amount</Label>
          <Input
            value={`₹${offering.amount.toLocaleString('en-IN')}`}
            readOnly
            className="mt-1 bg-muted font-semibold"
          />
        </div>

        {/* Payment Mode */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Payment Mode</Label>
          <RadioGroup value={paymentMode} onValueChange={(value) => onPaymentModeChange(value as PaymentMode)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="font-normal cursor-pointer">
                {paymentModeLabels.cash}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="font-normal cursor-pointer">
                {paymentModeLabels.upi}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="digital" id="digital" />
              <Label htmlFor="digital" className="font-normal cursor-pointer">
                {paymentModeLabels.digital}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* UPI Transaction ID (shown only for UPI/Digital) */}
        {(paymentMode === 'upi' || paymentMode === 'digital') && (
          <div>
            <Label htmlFor="upi-transaction-id" className="text-xs text-muted-foreground">
              Transaction ID (Optional)
            </Label>
            <Input
              id="upi-transaction-id"
              value={upiTransactionId}
              onChange={(e) => onUpiTransactionIdChange(e.target.value)}
              placeholder="Enter transaction ID"
              className="mt-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
