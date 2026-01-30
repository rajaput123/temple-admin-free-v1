import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, User } from 'lucide-react';
import { ShiftSchedule, Shift } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format, parse, addMinutes, isWithinInterval, differenceInMinutes } from 'date-fns';

export interface ShiftConflict {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  conflictType: 'overlapping' | 'insufficient_rest' | 'double_booking';
  conflictingSchedules: ShiftSchedule[];
  details: string;
  severity: 'low' | 'medium' | 'high';
}

interface ShiftConflictResolverProps {
  schedules: ShiftSchedule[];
  shifts: Shift[];
  employees: Employee[];
  onResolve?: (conflictId: string, resolution: string) => void;
}

export function ShiftConflictResolver({
  schedules,
  shifts,
  employees,
  onResolve,
}: ShiftConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<ShiftConflict | null>(null);

  const conflicts = useMemo(() => {
    const detectedConflicts: ShiftConflict[] = [];
    const employeeSchedules = new Map<string, ShiftSchedule[]>();

    // Group schedules by employee
    schedules.forEach(schedule => {
      if (!employeeSchedules.has(schedule.employeeId)) {
        employeeSchedules.set(schedule.employeeId, []);
      }
      employeeSchedules.get(schedule.employeeId)!.push(schedule);
    });

    // Check for conflicts per employee
    employeeSchedules.forEach((empSchedules, employeeId) => {
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) return;

      // Check for overlapping shifts on the same day
      empSchedules.forEach((schedule1, index) => {
        empSchedules.slice(index + 1).forEach(schedule2 => {
          if (schedule1.date === schedule2.date) {
            const shift1 = shifts.find(s => s.id === schedule1.shiftId);
            const shift2 = shifts.find(s => s.id === schedule2.shiftId);
            if (!shift1 || !shift2) return;

            const start1 = parse(shift1.startTime, 'HH:mm', new Date());
            const end1 = parse(shift1.endTime, 'HH:mm', new Date());
            const start2 = parse(shift2.startTime, 'HH:mm', new Date());
            const end2 = parse(shift2.endTime, 'HH:mm', new Date());

            if (isWithinInterval(start1, { start: start2, end: end2 }) ||
                isWithinInterval(end1, { start: start2, end: end2 }) ||
                isWithinInterval(start2, { start: start1, end: end1 })) {
              detectedConflicts.push({
                id: `conflict-${schedule1.id}-${schedule2.id}`,
                employeeId,
                employeeName: employee.name,
                date: schedule1.date,
                conflictType: 'overlapping',
                conflictingSchedules: [schedule1, schedule2],
                details: `Overlapping shifts: ${shift1.name} (${shift1.startTime}-${shift1.endTime}) and ${shift2.name} (${shift2.startTime}-${shift2.endTime})`,
                severity: 'high',
              });
            }
          }
        });
      });

      // Check for insufficient rest between shifts on consecutive days
      empSchedules.forEach((schedule1, index) => {
        empSchedules.slice(index + 1).forEach(schedule2 => {
          const date1 = new Date(schedule1.date);
          const date2 = new Date(schedule2.date);
          const daysDiff = Math.abs((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            const shift1 = shifts.find(s => s.id === schedule1.shiftId);
            const shift2 = shifts.find(s => s.id === schedule2.shiftId);
            if (!shift1 || !shift2) return;

            const end1 = parse(shift1.endTime, 'HH:mm', date1);
            const start2 = parse(shift2.startTime, 'HH:mm', date2);
            const restHours = differenceInMinutes(start2, end1) / 60;

            if (restHours < 11) {
              detectedConflicts.push({
                id: `rest-${schedule1.id}-${schedule2.id}`,
                employeeId,
                employeeName: employee.name,
                date: schedule1.date,
                conflictType: 'insufficient_rest',
                conflictingSchedules: [schedule1, schedule2],
                details: `Insufficient rest: Only ${restHours.toFixed(1)} hours between shifts (minimum 11 hours required)`,
                severity: restHours < 8 ? 'high' : 'medium',
              });
            }
          }
        });
      });
    });

    return detectedConflicts;
  }, [schedules, shifts, employees]);

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (_: unknown, row: ShiftConflict) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.employeeName}</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: unknown) => format(new Date(value as string), 'MMM d, yyyy'),
    },
    {
      key: 'conflictType',
      label: 'Conflict Type',
      render: (value: unknown) => {
        const type = value as string;
        const labels: Record<string, string> = {
          overlapping: 'Overlapping Shifts',
          insufficient_rest: 'Insufficient Rest',
          double_booking: 'Double Booking',
        };
        return <span className="text-sm">{labels[type] || type}</span>;
      },
    },
    {
      key: 'details',
      label: 'Details',
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value: unknown) => {
        const severity = value as string;
        const variant = severity === 'high' ? 'destructive' : severity === 'medium' ? 'warning' : 'neutral';
        return (
          <StatusBadge variant={variant}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </StatusBadge>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Shift Conflicts</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Detect and view shift scheduling conflicts (informational only)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={conflicts.length > 0 ? 'warning' : 'success'}>
            {conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''}
          </StatusBadge>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">No Conflicts Detected</p>
              <p className="text-xs text-muted-foreground">
                All shift schedules are conflict-free
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected in the schedule.
              Review and resolve conflicts as needed.
            </AlertDescription>
          </Alert>

          <DataTable
            data={conflicts}
            columns={columns}
            searchable={false}
            viewToggle={false}
            onRowClick={(row) => setSelectedConflict(row)}
          />
        </>
      )}

      {/* Conflict Details */}
      {selectedConflict && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conflict Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Employee</Label>
              <p className="text-sm font-medium text-foreground">{selectedConflict.employeeName}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(selectedConflict.date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Conflict Type</Label>
              <p className="text-sm font-medium text-foreground capitalize">
                {selectedConflict.conflictType.replace('_', ' ')}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Details</Label>
              <p className="text-sm text-foreground">{selectedConflict.details}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Conflicting Schedules</Label>
              <div className="mt-2 space-y-2">
                {selectedConflict.conflictingSchedules.map(schedule => {
                  const shift = shifts.find(s => s.id === schedule.shiftId);
                  return (
                    <div key={schedule.id} className="p-2 border rounded text-sm">
                      <p className="font-medium">{shift?.name || 'Unknown Shift'}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedConflict(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
