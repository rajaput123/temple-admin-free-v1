import { Offering, FestivalEvent } from '@/types/rituals';
import { SevaBooking, SlotAvailability } from '@/types/seva';
import { format, parse, addMinutes, isWithinInterval, isSameDay } from 'date-fns';

export interface Slot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  isClosed: boolean;
  bookedCount: number;
  availableCount: number;
}

/**
 * Calculate 30-minute slots for an offering on a specific date
 */
export function calculateSlots(
  offering: Offering,
  date: string,
  bookings: SevaBooking[],
  festivals: FestivalEvent[] = []
): Slot[] {
  if (!offering.startTime || !offering.endTime) {
    return [];
  }

  // Check if date is in offering's applicable days
  const dateObj = parse(date, 'yyyy-MM-dd', new Date());
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  if (!offering.applicableDays.includes('all') && !offering.applicableDays.includes(dayOfWeek)) {
    return [];
  }

  // Check if date is a festival/closed day
  const isFestivalDay = festivals.some(f => {
    const start = parse(f.startDate, 'yyyy-MM-dd', new Date());
    const end = parse(f.endDate, 'yyyy-MM-dd', new Date());
    return isWithinInterval(dateObj, { start, end }) || isSameDay(dateObj, start) || isSameDay(dateObj, end);
  });

  // Parse time window
  const [startHour, startMin] = offering.startTime.split(':').map(Number);
  const [endHour, endMin] = offering.endTime.split(':').map(Number);
  
  const startDateTime = parse(`${date} ${offering.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const endDateTime = parse(`${date} ${offering.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

  const slots: Slot[] = [];
  let currentTime = startDateTime;
  const capacity = offering.capacity || 999; // Default to high capacity if not specified

  while (currentTime < endDateTime) {
    const slotStart = format(currentTime, 'HH:mm');
    const slotEnd = format(addMinutes(currentTime, 30), 'HH:mm');
    
    // Don't create slot if it extends beyond offering end time
    if (addMinutes(currentTime, 30) > endDateTime) {
      break;
    }

    // Count bookings for this slot
    const slotBookings = bookings.filter(b => 
      b.offeringId === offering.id &&
      b.date === date &&
      b.slotStartTime === slotStart &&
      b.status !== 'cancelled'
    );

    const bookedCount = slotBookings.length;
    const availableCount = Math.max(0, capacity - bookedCount);
    const isAvailable = availableCount > 0 && !isFestivalDay && offering.status === 'active';

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable,
      isClosed: isFestivalDay || offering.status !== 'active',
      bookedCount,
      availableCount,
    });

    currentTime = addMinutes(currentTime, 30);
  }

  return slots;
}

/**
 * Get slot availability for a specific offering, date, and slot time
 */
export function getSlotAvailability(
  offeringId: string,
  date: string,
  slotStartTime: string,
  offering: Offering,
  bookings: SevaBooking[]
): SlotAvailability {
  const capacity = offering.capacity || 999;
  const slotBookings = bookings.filter(b => 
    b.offeringId === offeringId &&
    b.date === date &&
    b.slotStartTime === slotStartTime &&
    b.status !== 'cancelled'
  );

  const bookedCount = slotBookings.length;
  const availableCount = Math.max(0, capacity - bookedCount);
  
  // Calculate slot end time (30 minutes after start)
  const [hour, min] = slotStartTime.split(':').map(Number);
  const slotStart = parse(`${date} ${slotStartTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const slotEnd = addMinutes(slotStart, 30);
  const slotEndTime = format(slotEnd, 'HH:mm');

  return {
    offeringId,
    date,
    slotStartTime,
    slotEndTime,
    totalCapacity: capacity,
    bookedCount,
    availableCount,
    isAvailable: availableCount > 0 && offering.status === 'active',
    isClosed: offering.status !== 'active',
  };
}

/**
 * Check if a slot can be booked
 */
export function canBookSlot(
  offering: Offering,
  date: string,
  slotStartTime: string,
  bookings: SevaBooking[],
  festivals: FestivalEvent[] = []
): { canBook: boolean; reason?: string } {
  // Check offering status
  if (offering.status !== 'active') {
    return { canBook: false, reason: 'Offering is not active' };
  }

  // Check date applicability
  const dateObj = parse(date, 'yyyy-MM-dd', new Date());
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  if (!offering.applicableDays.includes('all') && !offering.applicableDays.includes(dayOfWeek)) {
    return { canBook: false, reason: 'Offering not available on this day' };
  }

  // Check if past date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    return { canBook: false, reason: 'Cannot book past dates' };
  }

  // Check if date is a festival/closed day
  const isFestivalDay = festivals.some(f => {
    const start = parse(f.startDate, 'yyyy-MM-dd', new Date());
    const end = parse(f.endDate, 'yyyy-MM-dd', new Date());
    return isWithinInterval(dateObj, { start, end }) || isSameDay(dateObj, start) || isSameDay(dateObj, end);
  });

  if (isFestivalDay) {
    return { canBook: false, reason: 'Temple closed on this date (Festival)' };
  }

  // Check time window
  if (!offering.startTime || !offering.endTime) {
    return { canBook: false, reason: 'Offering has no time window defined' };
  }

  const slotStart = parse(`${date} ${slotStartTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const offeringStart = parse(`${date} ${offering.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const offeringEnd = parse(`${date} ${offering.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

  if (slotStart < offeringStart || slotStart >= offeringEnd) {
    return { canBook: false, reason: 'Slot time is outside offering time window' };
  }

  // Check capacity
  const availability = getSlotAvailability(offering.id, date, slotStartTime, offering, bookings);
  if (!availability.isAvailable) {
    return { canBook: false, reason: 'Slot is full or unavailable' };
  }

  return { canBook: true };
}
