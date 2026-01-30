// Seva Counter Booking Types

export type BookingStatus = 'pending' | 'collected' | 'completed' | 'no_show' | 'cancelled';
export type PaymentMode = 'cash' | 'upi' | 'card' | 'wallet';
export type PaymentStatus = 'paid' | 'refunded';
export type SettlementStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type NoShowReasonCode = 'not_arrived' | 'late_arrival' | 'cancelled_by_devotee' | 'other';

export interface DevoteeDetails {
  name: string;
  phone?: string;
  gotra?: string;
  numberOfDevotees: number;
  isRegularDevotee?: boolean;
}

export interface PaymentDetails {
  mode: PaymentMode;
  upiTransactionId?: string;
  cardLast4?: string;
  cardType?: 'debit' | 'credit';
  walletProvider?: string;
  amount: number;
  changeGiven?: number; // For cash payments
}

export interface BookingReceipt {
  receiptNumber: string; // Unique receipt number
  qrCode?: string; // QR code data
  printTimestamp?: string;
  reprintCount: number;
  reprintApprovals: Array<{
    requestedBy: string;
    requestedByName: string;
    requestedAt: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    reason?: string;
  }>;
}

export interface SevaBooking {
  id: string;
  tokenNumber: string; // Format: SB-{SACRED}-{OFFERING}-{XXX}
  receiptNumber: string; // Unique receipt number
  sacredId: string;
  offeringId: string;
  date: string; // YYYY-MM-DD
  slotStartTime: string; // HH:mm (30-min granularity)
  slotEndTime: string; // HH:mm
  devoteeDetails: DevoteeDetails;
  amount: number; // Read-only from offering
  paymentDetails: PaymentDetails;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  isWalkIn: boolean; // Walk-in priority over pre-bookings
  isBulkBooking: boolean; // Family/bulk booking
  counterId?: string; // Counter where booking was made
  counterOperatorId?: string; // User ID
  counterOperatorName?: string;
  bookedAt: string; // ISO timestamp
  collectedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  noShowReason?: NoShowReasonCode;
  noShowRemarks?: string;
  lateCollectionPenalty?: number;
  lateCollectionPenaltyWaived?: boolean;
  receipt: BookingReceipt;
  auditLog: Array<{
    action: string;
    changedBy: string;
    changedByName: string;
    changedAt: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SlotAvailability {
  offeringId: string;
  date: string;
  slotStartTime: string;
  slotEndTime: string;
  totalCapacity: number;
  bookedCount: number;
  availableCount: number;
  reservedCount: number; // Temporarily reserved during booking flow
  isAvailable: boolean;
  isClosed: boolean; // Festival/closed day
  walkInPriority: boolean; // Walk-in slots available
  preBookingAvailable: boolean; // Pre-booking slots available
}

export interface SlotReservation {
  id: string;
  offeringId: string;
  date: string;
  slotStartTime: string;
  reservedAt: string;
  expiresAt: string; // Reservation expires after 2 minutes
  reservedBy: string; // Counter operator ID
}

export interface CashDrawer {
  id: string;
  counterId: string;
  counterName: string;
  date: string;
  openingBalance: number; // Float/opening balance
  currentBalance: number; // Live balance
  closingBalance?: number;
  transactions: CashTransaction[];
  status: 'open' | 'closed';
  openedBy: string;
  openedByName: string;
  openedAt: string;
  closedBy?: string;
  closedByName?: string;
  closedAt?: string;
}

export interface CashTransaction {
  id: string;
  type: 'opening' | 'sale' | 'refund' | 'adjustment';
  amount: number;
  reason?: string;
  bookingId?: string; // For sale/refund transactions
  operatorId: string;
  operatorName: string;
  timestamp: string;
}

export interface CashReconciliation {
  id: string;
  settlementId: string;
  physicalCash: number;
  systemCash: number;
  variance: number;
  varianceReason?: string;
  reconciledBy: string;
  reconciledByName: string;
  reconciledAt: string;
  supervisorApproved: boolean;
  supervisorApprovedBy?: string;
  supervisorApprovedByName?: string;
  supervisorApprovedAt?: string;
}

export interface CounterSettlement {
  id: string;
  date: string;
  counterId: string;
  counterName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  operatorId: string;
  operatorName: string;
  // Bookings summary
  totalBookings: number;
  pendingBookings: number;
  collectedBookings: number;
  completedBookings: number;
  noShowBookings: number;
  cancelledBookings: number;
  // Revenue summary
  totalAmount: number;
  cashAmount: number;
  upiAmount: number;
  cardAmount: number;
  walletAmount: number;
  // Cash reconciliation
  cashReconciliation?: CashReconciliation;
  // Targets
  targetRevenue?: number;
  achievedRevenue: number;
  // Conversion rates
  slotUtilization: number; // Percentage
  bookingConversionRate: number; // Percentage
  noShowRate: number; // Percentage
  // Settlement
  status: SettlementStatus;
  submittedAt?: string;
  submittedBy?: string;
  submittedByName?: string;
  supervisorSignOff: boolean;
  supervisorSignOffBy?: string;
  supervisorSignOffByName?: string;
  supervisorSignOffAt?: string;
  financeApproval: boolean;
  financeApprovedBy?: string;
  financeApprovedByName?: string;
  financeApprovedAt?: string;
  financeRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CounterSummary {
  date: string;
  counterOperatorId: string;
  counterOperatorName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  totalBookings: number;
  totalAmount: number;
  cashAmount: number;
  digitalAmount: number;
  completedBookings: number;
  cancelledBookings: number;
  createdAt: string;
}

export interface BookingAuditLog {
  id: string;
  bookingId: string;
  action: string; // 'created', 'status_changed', 'payment_updated', 'cancelled', etc.
  changedBy: string;
  changedByName: string;
  changedAt: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
}

export interface NoShowLog {
  id: string;
  bookingId: string;
  reasonCode: NoShowReasonCode;
  reason: string;
  remarks?: string;
  slotResold: boolean;
  resoldBookingId?: string;
  markedBy: string;
  markedByName: string;
  markedAt: string;
}

// Display helpers
export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  collected: 'Collected',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

export const paymentModeLabels: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  wallet: 'Wallet',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: 'Paid',
  refunded: 'Refunded',
};

export const noShowReasonLabels: Record<NoShowReasonCode, string> = {
  not_arrived: 'Not Arrived',
  late_arrival: 'Late Arrival',
  cancelled_by_devotee: 'Cancelled by Devotee',
  other: 'Other',
};

export const settlementStatusLabels: Record<SettlementStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};
