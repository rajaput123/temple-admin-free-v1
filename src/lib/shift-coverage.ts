import { Shift, ShiftSchedule } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format, parse, isWithinInterval, addMinutes, startOfDay, endOfDay } from 'date-fns';

export interface CoverageGap {
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  requiredStaff: number;
  assignedStaff: number;
  gap: number;
}

export interface CoverageAnalysis {
  date: string;
  department: string;
  timeSlots: {
    startTime: string;
    endTime: string;
    requiredStaff: number;
    assignedStaff: number;
    coverage: number; // percentage
  }[];
  overallCoverage: number;
  gaps: CoverageGap[];
}

export function analyzeCoverage(
  date: string,
  department: string,
  schedules: ShiftSchedule[],
  shifts: Shift[],
  employees: Employee[],
  minimumStaffing: number = 1
): CoverageAnalysis {
  const daySchedules = schedules.filter(s => s.date === date);
  const deptEmployees = employees.filter(emp => emp.department === department);
  const deptSchedules = daySchedules.filter(s =>
    deptEmployees.some(emp => emp.id === s.employeeId)
  );

  // Generate 30-minute time slots for the day
  const timeSlots: CoverageAnalysis['timeSlots'] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const endTime = minute === 30
        ? `${String(hour).padStart(2, '0')}:30`
        : `${String(hour + 1).padStart(2, '0')}:00`;

      // Count how many employees are scheduled during this time slot
      const assignedStaff = deptSchedules.filter(schedule => {
        const shift = shifts.find(s => s.id === schedule.shiftId);
        if (!shift) return false;

        const slotStart = parse(startTime, 'HH:mm', new Date());
        const slotEnd = parse(endTime, 'HH:mm', new Date());
        const shiftStart = parse(shift.startTime, 'HH:mm', new Date());
        const shiftEnd = parse(shift.endTime, 'HH:mm', new Date());

        return isWithinInterval(slotStart, { start: shiftStart, end: shiftEnd }) ||
               isWithinInterval(slotEnd, { start: shiftStart, end: shiftEnd });
      }).length;

      timeSlots.push({
        startTime,
        endTime,
        requiredStaff: minimumStaffing,
        assignedStaff,
        coverage: minimumStaffing > 0 ? (assignedStaff / minimumStaffing) * 100 : 100,
      });
    }
  }

  // Identify gaps
  const gaps: CoverageGap[] = [];
  timeSlots.forEach(slot => {
    if (slot.assignedStaff < slot.requiredStaff) {
      gaps.push({
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        department,
        requiredStaff: slot.requiredStaff,
        assignedStaff: slot.assignedStaff,
        gap: slot.requiredStaff - slot.assignedStaff,
      });
    }
  });

  const overallCoverage = timeSlots.length > 0
    ? timeSlots.reduce((sum, slot) => sum + slot.coverage, 0) / timeSlots.length
    : 100;

  return {
    date,
    department,
    timeSlots,
    overallCoverage,
    gaps,
  };
}

export function getCoverageSuggestions(
  gaps: CoverageGap[],
  employees: Employee[],
  shifts: Shift[]
): Array<{ employeeId: string; employeeName: string; shiftId: string; shiftName: string }> {
  const suggestions: Array<{ employeeId: string; employeeName: string; shiftId: string; shiftName: string }> = [];

  gaps.forEach(gap => {
    // Find available employees in the department
    const availableEmployees = employees.filter(emp => emp.department === gap.department);

    // Find shifts that cover the gap time
    const coveringShifts = shifts.filter(shift => {
      const gapStart = parse(gap.startTime, 'HH:mm', new Date());
      const gapEnd = parse(gap.endTime, 'HH:mm', new Date());
      const shiftStart = parse(shift.startTime, 'HH:mm', new Date());
      const shiftEnd = parse(shift.endTime, 'HH:mm', new Date());

      return isWithinInterval(gapStart, { start: shiftStart, end: shiftEnd }) ||
             isWithinInterval(gapEnd, { start: shiftStart, end: shiftEnd });
    });

    // Suggest employees and shifts
    availableEmployees.slice(0, gap.gap).forEach(emp => {
      coveringShifts.forEach(shift => {
        suggestions.push({
          employeeId: emp.id,
          employeeName: emp.name,
          shiftId: shift.id,
          shiftName: shift.name,
        });
      });
    });
  });

  return suggestions;
}
