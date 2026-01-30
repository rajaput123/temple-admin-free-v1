import type { SevaBooking } from '@/types/seva';

/**
 * Check if devotee is regular (threshold-based)
 * Regular devotee: 5+ bookings in last 90 days
 */
export function isRegularDevotee(
  phone: string,
  bookings: SevaBooking[],
  threshold: number = 5,
  daysWindow: number = 90
): boolean {
  if (!phone) return false;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysWindow);

  const recentBookings = bookings.filter(b =>
    b.devoteeDetails.phone === phone &&
    new Date(b.bookedAt) >= cutoffDate &&
    b.status !== 'cancelled'
  );

  return recentBookings.length >= threshold;
}

/**
 * Get devotee booking frequency
 */
export function getDevoteeBookingFrequency(
  phone: string,
  bookings: SevaBooking[]
): {
  totalBookings: number;
  last90Days: number;
  last30Days: number;
  lastBookingDate?: string;
  isRegular: boolean;
} {
  if (!phone) {
    return {
      totalBookings: 0,
      last90Days: 0,
      last30Days: 0,
      isRegular: false,
    };
  }

  const devoteeBookings = bookings.filter(
    b => b.devoteeDetails.phone === phone && b.status !== 'cancelled'
  );

  const now = new Date();
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const bookingsLast90Days = devoteeBookings.filter(
    b => new Date(b.bookedAt) >= last90Days
  ).length;

  const bookingsLast30Days = devoteeBookings.filter(
    b => new Date(b.bookedAt) >= last30Days
  ).length;

  const lastBooking = devoteeBookings.sort(
    (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
  )[0];

  return {
    totalBookings: devoteeBookings.length,
    last90Days: bookingsLast90Days,
    last30Days: bookingsLast30Days,
    lastBookingDate: lastBooking?.bookedAt,
    isRegular: bookingsLast90Days >= 5,
  };
}
