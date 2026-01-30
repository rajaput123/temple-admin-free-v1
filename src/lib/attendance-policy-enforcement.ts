import { Attendance, AttendancePolicy } from '@/types/hr';
import { Employee } from '@/types/erp';
import { parse, differenceInMinutes, differenceInHours } from 'date-fns';

export interface PolicyViolation {
  id: string;
  employeeId: string;
  date: string;
  violationType: 'late' | 'early_departure' | 'half_day' | 'absent' | 'overtime';
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export function applyAttendancePolicy(
  attendance: Attendance,
  employee: Employee,
  policy: AttendancePolicy
): PolicyViolation[] {
  const violations: PolicyViolation[] = [];

  if (attendance.status === 'present' || attendance.status === 'late') {
    // Check late arrival
    if (attendance.checkIn) {
      // Assuming shift starts at 09:00 (in real app, get from employee's shift)
      const shiftStart = parse('09:00', 'HH:mm', new Date());
      const checkInTime = parse(attendance.checkIn, 'HH:mm', new Date());
      const lateMinutes = differenceInMinutes(checkInTime, shiftStart);

      if (lateMinutes > policy.lateArrivalGraceMinutes) {
        violations.push({
          id: `late-${attendance.id}`,
          employeeId: attendance.employeeId,
          date: attendance.date,
          violationType: 'late',
          details: `Late arrival by ${lateMinutes - policy.lateArrivalGraceMinutes} minutes`,
          severity: lateMinutes > 30 ? 'high' : lateMinutes > 15 ? 'medium' : 'low',
        });
      }
    }

    // Check early departure
    if (attendance.checkOut && policy.earlyDepartureAllowed === false) {
      // Assuming shift ends at 18:00
      const shiftEnd = parse('18:00', 'HH:mm', new Date());
      const checkOutTime = parse(attendance.checkOut, 'HH:mm', new Date());
      const earlyMinutes = differenceInMinutes(shiftEnd, checkOutTime);

      if (earlyMinutes > 0) {
        violations.push({
          id: `early-${attendance.id}`,
          employeeId: attendance.employeeId,
          date: attendance.date,
          violationType: 'early_departure',
          details: `Early departure by ${earlyMinutes} minutes`,
          severity: earlyMinutes > 60 ? 'high' : earlyMinutes > 30 ? 'medium' : 'low',
        });
      }
    }

    // Check half-day
    if (attendance.checkIn && attendance.checkOut) {
      const workHours = differenceInHours(
        parse(attendance.checkOut, 'HH:mm', new Date()),
        parse(attendance.checkIn, 'HH:mm', new Date())
      );

      if (workHours < policy.workHoursPerDay && !policy.halfDayAllowed) {
        violations.push({
          id: `halfday-${attendance.id}`,
          employeeId: attendance.employeeId,
          date: attendance.date,
          violationType: 'half_day',
          details: `Worked only ${workHours} hours (required: ${policy.workHoursPerDay} hours)`,
          severity: 'medium',
        });
      }
    }
  } else if (attendance.status === 'absent') {
    violations.push({
      id: `absent-${attendance.id}`,
      employeeId: attendance.employeeId,
      date: attendance.date,
      violationType: 'absent',
      details: 'Absent from work',
      severity: 'high',
    });
  }

  return violations;
}

export function trackAbsenteeism(
  attendanceRecords: Attendance[],
  employeeId: string,
  threshold: number = 3
): {
  consecutiveDays: number;
  monthlyCount: number;
  pattern: 'normal' | 'irregular' | 'chronic';
} {
  const employeeRecords = attendanceRecords
    .filter(a => a.employeeId === employeeId && a.status === 'absent')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate consecutive absent days
  let consecutiveDays = 0;
  let maxConsecutive = 0;
  let currentConsecutive = 0;

  employeeRecords.forEach((record, index) => {
    if (index === 0) {
      currentConsecutive = 1;
    } else {
      const prevDate = new Date(employeeRecords[index - 1].date);
      const currDate = new Date(record.date);
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        currentConsecutive++;
      } else {
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        currentConsecutive = 1;
      }
    }
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
  });

  consecutiveDays = maxConsecutive;

  // Calculate monthly count (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyCount = employeeRecords.filter(a => new Date(a.date) >= thirtyDaysAgo).length;

  // Determine pattern
  let pattern: 'normal' | 'irregular' | 'chronic' = 'normal';
  if (monthlyCount >= threshold * 2) {
    pattern = 'chronic';
  } else if (monthlyCount >= threshold) {
    pattern = 'irregular';
  }

  return {
    consecutiveDays,
    monthlyCount,
    pattern,
  };
}
