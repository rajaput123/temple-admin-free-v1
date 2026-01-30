import { Attendance } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format, differenceInMinutes } from 'date-fns';

export interface ProxyViolation {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  violationType: 'same_location' | 'simultaneous' | 'unusual_timing' | 'pattern';
  details: string;
  severity: 'low' | 'medium' | 'high';
  relatedEmployees?: string[];
  confidence: number; // 0-100
}

export function detectProxyViolations(
  attendance: Attendance[],
  employees: Employee[]
): ProxyViolation[] {
  const violations: ProxyViolation[] = [];

  // Group attendance by date
  const attendanceByDate = new Map<string, Attendance[]>();
  attendance.forEach(a => {
    if (!attendanceByDate.has(a.date)) {
      attendanceByDate.set(a.date, []);
    }
    attendanceByDate.get(a.date)!.push(a);
  });

  attendanceByDate.forEach((dayAttendance, date) => {
    // Check for simultaneous clock-in/out (within 1 minute)
    for (let i = 0; i < dayAttendance.length; i++) {
      for (let j = i + 1; j < dayAttendance.length; j++) {
        const a1 = dayAttendance[i];
        const a2 = dayAttendance[j];

        if (a1.checkIn && a2.checkIn) {
          const timeDiff = Math.abs(
            differenceInMinutes(
              new Date(`2000-01-01T${a1.checkIn}`),
              new Date(`2000-01-01T${a2.checkIn}`)
            )
          );
          if (timeDiff <= 1) {
            const emp1 = employees.find(e => e.id === a1.employeeId);
            const emp2 = employees.find(e => e.id === a2.employeeId);
            violations.push({
              id: `simultaneous-${a1.id}-${a2.id}`,
              employeeId: a1.employeeId,
              employeeName: emp1?.name || 'Unknown',
              date,
              violationType: 'simultaneous',
              details: `Simultaneous clock-in with ${emp2?.name || 'Unknown'} (${timeDiff} min difference)`,
              severity: 'medium',
              relatedEmployees: [a2.employeeId],
              confidence: 70,
            });
          }
        }
      }
    }

    // Check for unusual timing patterns
    dayAttendance.forEach(a => {
      if (a.checkIn) {
        const checkInTime = new Date(`2000-01-01T${a.checkIn}`);
        const hour = checkInTime.getHours();
        const minute = checkInTime.getMinutes();

        // Unusual if clock-in is exactly on the hour or half-hour (suspicious pattern)
        if (minute === 0 || minute === 30) {
          const emp = employees.find(e => e.id === a.employeeId);
          violations.push({
            id: `timing-${a.id}`,
            employeeId: a.employeeId,
            employeeName: emp?.name || 'Unknown',
            date,
            violationType: 'unusual_timing',
            details: `Unusual timing pattern: Clock-in at exactly ${a.checkIn}`,
            severity: 'low',
            confidence: 40,
          });
        }
      }
    });
  });

  // Pattern detection: Same employee clocking in at exact same times multiple days
  const employeePatterns = new Map<string, Map<string, number>>();
  attendance.forEach(a => {
    if (a.checkIn) {
      if (!employeePatterns.has(a.employeeId)) {
        employeePatterns.set(a.employeeId, new Map());
      }
      const patterns = employeePatterns.get(a.employeeId)!;
      patterns.set(a.checkIn, (patterns.get(a.checkIn) || 0) + 1);
    }
  });

  employeePatterns.forEach((patterns, employeeId) => {
    patterns.forEach((count, time) => {
      if (count >= 5) {
        const emp = employees.find(e => e.id === employeeId);
        violations.push({
          id: `pattern-${employeeId}-${time}`,
          employeeId,
          employeeName: emp?.name || 'Unknown',
          date: 'multiple',
          violationType: 'pattern',
          details: `Repeated clock-in at exact same time (${time}) on ${count} days`,
          severity: 'high',
          confidence: 85,
        });
      }
    });
  });

  return violations;
}

export function analyzeProxyPatterns(
  violations: ProxyViolation[]
): {
  totalViolations: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  topEmployees: Array<{ employeeId: string; employeeName: string; count: number }>;
} {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const employeeCounts = new Map<string, { name: string; count: number }>();

  violations.forEach(v => {
    byType[v.violationType] = (byType[v.violationType] || 0) + 1;
    bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;

    const existing = employeeCounts.get(v.employeeId);
    if (existing) {
      existing.count++;
    } else {
      employeeCounts.set(v.employeeId, { name: v.employeeName, count: 1 });
    }
  });

  const topEmployees = Array.from(employeeCounts.entries())
    .map(([id, data]) => ({ employeeId: id, employeeName: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalViolations: violations.length,
    byType,
    bySeverity,
    topEmployees,
  };
}
