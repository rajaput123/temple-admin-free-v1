import type { SevaBooking } from '@/types/seva';
import { parse, differenceInMinutes } from 'date-fns';

/**
 * Calculate late collection penalty
 * Grace period: 15 minutes
 * Penalty: 10% of booking amount after grace period
 */
export function calculateLateCollectionPenalty(
  booking: SevaBooking,
  gracePeriodMinutes: number = 15,
  penaltyPercent: number = 10
): { isLate: boolean; penalty: number; minutesLate: number } {
  if (booking.status !== 'pending' && booking.status !== 'collected') {
    return { isLate: false, penalty: 0, minutesLate: 0 };
  }

  const slotStartTime = parse(
    `${booking.date} ${booking.slotStartTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  );
  const now = new Date();
  const minutesLate = differenceInMinutes(now, slotStartTime);

  if (minutesLate <= gracePeriodMinutes) {
    return { isLate: false, penalty: 0, minutesLate };
  }

  const penalty = Math.round((booking.amount * penaltyPercent) / 100);

  return {
    isLate: true,
    penalty,
    minutesLate,
  };
}

/**
 * Check if booking is within grace period
 */
export function isWithinGracePeriod(
  booking: SevaBooking,
  gracePeriodMinutes: number = 15
): boolean {
  const slotStartTime = parse(
    `${booking.date} ${booking.slotStartTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  );
  const now = new Date();
  const minutesLate = differenceInMinutes(now, slotStartTime);

  return minutesLate <= gracePeriodMinutes;
}
