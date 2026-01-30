import type { SevaBooking, SlotAvailability } from '@/types/seva';
import { format } from 'date-fns';

/**
 * Check if booking is walk-in (same day booking)
 */
export function isWalkInBooking(date: string): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return date === today;
}

/**
 * Calculate walk-in priority slots
 * Walk-ins get priority over pre-bookings for same-day slots
 */
export function calculateWalkInPriority(
  offeringId: string,
  date: string,
  slotStartTime: string,
  bookings: SevaBooking[],
  totalCapacity: number
): { walkInAvailable: number; preBookingAvailable: number } {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isToday = date === today;

  if (!isToday) {
    // For future dates, all slots are pre-booking
    const bookedCount = bookings.filter(b =>
      b.offeringId === offeringId &&
      b.date === date &&
      b.slotStartTime === slotStartTime &&
      b.status !== 'cancelled' &&
      b.status !== 'no_show'
    ).length;
    return {
      walkInAvailable: 0,
      preBookingAvailable: Math.max(0, totalCapacity - bookedCount),
    };
  }

  // For today, separate walk-ins and pre-bookings
  const slotBookings = bookings.filter(b =>
    b.offeringId === offeringId &&
    b.date === date &&
    b.slotStartTime === slotStartTime &&
    b.status !== 'cancelled' &&
    b.status !== 'no_show'
  );

  const walkInBookings = slotBookings.filter(b => b.isWalkIn).length;
  const preBookingBookings = slotBookings.filter(b => !b.isWalkIn).length;

  // Reserve some slots for walk-ins (e.g., 30% of capacity)
  const walkInReserved = Math.floor(totalCapacity * 0.3);
  const preBookingCapacity = totalCapacity - walkInReserved;

  const walkInAvailable = Math.max(0, walkInReserved - walkInBookings);
  const preBookingAvailable = Math.max(0, preBookingCapacity - preBookingBookings);

  return { walkInAvailable, preBookingAvailable };
}

/**
 * Check if slot can be booked as walk-in
 */
export function canBookAsWalkIn(
  offeringId: string,
  date: string,
  slotStartTime: string,
  bookings: SevaBooking[],
  totalCapacity: number
): boolean {
  const { walkInAvailable } = calculateWalkInPriority(
    offeringId,
    date,
    slotStartTime,
    bookings,
    totalCapacity
  );
  return walkInAvailable > 0;
}
