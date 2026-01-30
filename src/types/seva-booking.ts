/**
 * Seva Counter Booking System - Type Definitions
 * Production-grade types for temple counter operations
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export type SevaType = 'ARCHANA' | 'ABHISHEKAM' | 'DARSHAN' | 'SPECIAL_PUJA' | 'DONATION';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'MIXED';
export type PaymentStatus = 'PENDING' | 'COLLECTED' | 'REFUNDED';
export type BookingStatus = 'PENDING' | 'COLLECTED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
export type BookingType = 'WALK_IN' | 'PRE_BOOKED' | 'ONLINE';
export type SlotStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED';
export type SettlementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type Shift = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type RefundStatus = 'PENDING' | 'APPROVED' | 'COMPLETED';

// ═══════════════════════════════════════════════════════════════════════════
// CORE MODELS
// ═══════════════════════════════════════════════════════════════════════════

export interface DevoteeInfo {
    name: string;
    phone: string;
    email?: string;
    gotra?: string;
    numberOfDevotees: number;
    isRegular: boolean;
}

export interface SevaInfo {
    id: string;
    name: string;
    type: SevaType;
    price: number;
    duration: number; // Minutes
}

export interface SlotInfo {
    id: string;
    date: string; // ISO date
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    capacity: number;
    bookedCount: number;
    isPriority: boolean;
}

export interface PaymentInfo {
    amount: number;
    mode: PaymentMode;
    cashAmount?: number;
    digitalAmount?: number;
    transactionId?: string;
    status: PaymentStatus;
    collectedAt?: Date;
    collectedBy?: string;
}

export interface CounterInfo {
    id: string;
    name: string;
}

export interface AuditEntry {
    timestamp: Date;
    action: string;
    userId: string;
    reason?: string;
    oldValue?: any;
    newValue?: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEVA BOOKING
// ═══════════════════════════════════════════════════════════════════════════

export interface SevaBooking {
    // Identity
    id: string;
    receiptNumber: string;
    qrCode: string;

    // Devotee Information
    devotee: DevoteeInfo;

    // Seva Details
    seva: SevaInfo;

    // Slot Management
    slot: SlotInfo;

    // Payment
    payment: PaymentInfo;

    // Lifecycle
    status: BookingStatus;
    bookingType: BookingType;

    // Tracking
    counter: CounterInfo;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;

    // Special Flags
    isLateCollection: boolean;
    lateFeeApplied?: number;
    isReprint: boolean;
    reprintReason?: string;
    reprintApprovedBy?: string;

    // No-show tracking
    noShowReason?: string;
    noShowMarkedBy?: string;
    noShowMarkedAt?: Date;

    // Cancellation
    cancellationReason?: string;
    cancelledBy?: string;
    cancelledAt?: Date;
    refundStatus?: RefundStatus;

    // Audit
    auditLog: AuditEntry[];
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME SLOT
// ═══════════════════════════════════════════════════════════════════════════

export interface TimeSlot {
    id: string;
    sevaId: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    walkInReserved: number;
    availableCount: number;

    // Optimistic locking
    version: number;
    lockedBy?: string;
    lockedAt?: Date;
    lockExpiry?: Date;

    // Status
    status: SlotStatus;

    // Override
    isOverrideAllowed: boolean;
    overrideBy?: string;
    overrideReason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER SETTLEMENT
// ═══════════════════════════════════════════════════════════════════════════

export interface CounterSettlement {
    id: string;
    counterId: string;
    counterName: string;
    date: string;
    shift?: Shift;

    // Cash Flow
    openingBalance: number;
    closingBalance: number;
    systemCashTotal: number;
    variance: number;
    varianceReason?: string;

    // Digital Payments
    upiTotal: number;
    cardTotal: number;
    digitalTotal: number;

    // Bookings Summary
    totalBookings: number;
    cashBookings: number;
    digitalBookings: number;
    totalRevenue: number;
    targetRevenue?: number;
    achievementPercentage?: number;

    // No-shows
    noShowCount: number;
    noShowRevenueLoss: number;

    // Status
    status: SettlementStatus;

    // Workflow
    submittedBy: string;
    submittedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;

    // Finance Handover
    financeReceivedBy?: string;
    financeReceivedAt?: Date;

    // Immutability
    isLocked: boolean;
    lockedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEVA MASTER
// ═══════════════════════════════════════════════════════════════════════════

export interface TimeSlotConfig {
    startTime: string;
    endTime: string;
}

export interface SevaMaster {
    id: string;
    name: string;
    nameHindi?: string;
    type: SevaType;
    price: number;
    duration: number;
    capacity: number;

    // Scheduling
    availableDays: number[];
    availableTimeSlots: TimeSlotConfig[];

    // Restrictions
    minDevotees: number;
    maxDevotees: number;
    requiresGotra: boolean;
    requiresAdvanceBooking: boolean;
    advanceBookingDays?: number;

    // Walk-in
    walkInAllowed: boolean;
    walkInPercentage?: number;

    // Status
    isActive: boolean;
    isPriority: boolean;

    // Metadata
    description?: string;
    benefits?: string[];
    category?: string;
    iconUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateBookingRequest {
    devotee: DevoteeInfo;
    sevaId: string;
    slotId: string;
    numberOfDevotees: number;
    paymentMode: PaymentMode;
    cashAmount?: number;
    digitalAmount?: number;
    transactionId?: string;
}

export interface CreateBookingResponse {
    booking: SevaBooking;
    receiptUrl: string;
    qrCode: string;
}

export interface AvailableSlotsResponse {
    slots: TimeSlot[];
    walkInAvailable: boolean;
}

export interface LockSlotRequest {
    bookingId: string;
}

export interface LockSlotResponse {
    locked: boolean;
    expiresAt: Date;
}

export interface UpdateBookingStatusRequest {
    status: BookingStatus;
    reason?: string;
    approvedBy?: string;
}

export interface ReprintReceiptRequest {
    reason: string;
    approvedBy: string;
}

export interface CounterSummaryResponse {
    openingBalance: number;
    currentCash: number;
    currentDigital: number;
    totalRevenue: number;
    bookingCount: number;
    pendingBookings: number;
}

export interface SubmitSettlementRequest {
    counterId: string;
    date: string;
    closingBalance: number;
    variance: number;
    varianceReason?: string;
}

export interface ApproveSettlementRequest {
    approvedBy: string;
    notes?: string;
}

export interface HandoverSettlementRequest {
    financeReceivedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RevenueMetrics {
    target: number;
    achieved: number;
    percentage: number;
    cash: number;
    digital: number;
}

export interface BookingMetrics {
    total: number;
    completed: number;
    pending: number;
    noShows: number;
    conversionRate: number;
}

export interface SlotMetrics {
    utilized: number;
    available: number;
    utilizationPercentage: number;
}

export interface TopSeva {
    name: string;
    bookings: number;
    revenue: number;
}

export interface TopDevotee {
    name: string;
    phone: string;
    bookingCount: number;
    totalSpent: number;
}

export interface HourlyTrend {
    hour: string;
    bookings: number;
    revenue: number;
}

export interface CounterDashboard {
    today: {
        revenue: RevenueMetrics;
        bookings: BookingMetrics;
        slots: SlotMetrics;
    };
    topSevas: TopSeva[];
    topDevotees: TopDevotee[];
    hourlyTrend: HourlyTrend[];
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER & SEARCH TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BookingFilters {
    startDate?: string;
    endDate?: string;
    counterId?: string;
    sevaType?: SevaType;
    paymentMode?: PaymentMode;
    status?: BookingStatus;
    search?: string; // Devotee name/phone
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════

export type EntityType = 'BOOKING' | 'SETTLEMENT' | 'PAYMENT' | 'SLOT';
export type AuditAction =
    | 'CREATED'
    | 'UPDATED'
    | 'STATUS_CHANGED'
    | 'PAYMENT_COLLECTED'
    | 'REPRINTED'
    | 'CANCELLED'
    | 'NO_SHOW_MARKED'
    | 'SETTLEMENT_SUBMITTED'
    | 'SETTLEMENT_APPROVED'
    | 'SETTLEMENT_REJECTED';

export interface AuditLog {
    id: string;
    entityType: EntityType;
    entityId: string;
    action: AuditAction;
    userId: string;
    userName: string;
    timestamp: Date;
    ipAddress: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    approvedBy?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════

export type Permission =
    | 'booking:create'
    | 'booking:update'
    | 'booking:view_today'
    | 'booking:view_all'
    | 'booking:cancel'
    | 'booking:reprint'
    | 'booking:no_show'
    | 'payment:collect'
    | 'settlement:submit'
    | 'settlement:approve'
    | 'settlement:handover'
    | 'refund:approve'
    | 'reports:view_counter'
    | 'reports:view_all'
    | 'reports:view_assigned'
    | 'audit_log:view';

export type Role =
    | 'COUNTER_ADMIN'
    | 'COUNTER_SUPERVISOR'
    | 'CASHIER'
    | 'FINANCE'
    | 'AUDIT'
    | 'REPORT_VIEWER';

export const RolePermissions: Record<Role, Permission[]> = {
    COUNTER_ADMIN: [
        'booking:create',
        'booking:update',
        'booking:cancel',
        'settlement:submit',
        'settlement:approve',
        'reports:view_all',
    ],
    COUNTER_SUPERVISOR: [
        'booking:create',
        'booking:update',
        'booking:reprint',
        'booking:no_show',
        'reports:view_counter',
    ],
    CASHIER: [
        'booking:create',
        'booking:view_today',
        'payment:collect',
    ],
    FINANCE: [
        'settlement:approve',
        'settlement:handover',
        'reports:view_all',
        'refund:approve',
    ],
    AUDIT: [
        'booking:view_all',
        'reports:view_all',
        'audit_log:view',
    ],
    REPORT_VIEWER: [
        'reports:view_assigned',
    ],
};
