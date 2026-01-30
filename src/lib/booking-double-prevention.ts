import type { SevaBooking, SlotReservation } from '@/types/seva';

/**
 * Check for duplicate bookings across all counters
 */
export function checkDuplicateBooking(
  devoteePhone: string,
  date: string,
  slotStartTime: string,
  offeringId: string,
  existingBookings: SevaBooking[]
): { isDuplicate: boolean; existingBooking?: SevaBooking } {
  if (!devoteePhone) return { isDuplicate: false };

  const duplicate = existingBookings.find(b => 
    b.devoteeDetails.phone === devoteePhone &&
    b.date === date &&
    b.slotStartTime === slotStartTime &&
    b.offeringId === offeringId &&
    b.status !== 'cancelled' &&
    b.status !== 'no_show'
  );

  return {
    isDuplicate: !!duplicate,
    existingBooking: duplicate,
  };
}

/**
 * Reserve a slot temporarily during booking flow
 */
export function createSlotReservation(
  offeringId: string,
  date: string,
  slotStartTime: string,
  reservedBy: string,
  existingReservations: SlotReservation[] = []
): SlotReservation {
  const reservationId = `reservation-${Date.now()}`;
  const reservedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 minutes

  return {
    id: reservationId,
    offeringId,
    date,
    slotStartTime,
    reservedAt,
    expiresAt,
    reservedBy,
  };
}

/**
 * Check if slot is reserved
 */
export function isSlotReserved(
  offeringId: string,
  date: string,
  slotStartTime: string,
  reservations: SlotReservation[]
): boolean {
  const now = new Date();
  return reservations.some(r => 
    r.offeringId === offeringId &&
    r.date === date &&
    r.slotStartTime === slotStartTime &&
    new Date(r.expiresAt) > now
  );
}

/**
 * Clean expired reservations
 */
export function cleanExpiredReservations(
  reservations: SlotReservation[]
): SlotReservation[] {
  const now = new Date();
  return reservations.filter(r => new Date(r.expiresAt) > now);
}
