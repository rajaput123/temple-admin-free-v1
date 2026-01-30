import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { ShiftSchedule, Shift } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface ShiftSchedulerProps {
  shifts: Shift[];
  employees: Employee[];
  schedules: ShiftSchedule[];
  onSaveSchedule: (schedule: Partial<ShiftSchedule>) => void;
  viewMode?: 'week' | 'month';
}

export function ShiftScheduler({
  shifts,
  employees,
  schedules,
  onSaveSchedule,
  viewMode: initialViewMode = 'week',
}: ShiftSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>(initialViewMode);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const days = useMemo(() => {
    if (viewMode === 'week') {
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  }, [viewMode, weekStart, weekEnd, monthStart, monthEnd]);

  const filteredEmployees = useMemo(() => {
    return selectedEmployee === 'all'
      ? employees
      : employees.filter(emp => emp.id === selectedEmployee);
  }, [employees, selectedEmployee]);

  const getScheduleForDate = (employeeId: string, date: Date): ShiftSchedule | undefined => {
    return schedules.find(
      s => s.employeeId === employeeId && isSameDay(new Date(s.date), date)
    );
  };

  const handleAssignShift = (employeeId: string, date: Date, shiftId: string) => {
    const existing = getScheduleForDate(employeeId, date);
    if (existing) {
      onSaveSchedule({
        ...existing,
        shiftId,
        startTime: shifts.find(s => s.id === shiftId)?.startTime || '',
        endTime: shifts.find(s => s.id === shiftId)?.endTime || '',
      });
    } else {
      const shift = shifts.find(s => s.id === shiftId);
      if (shift) {
        onSaveSchedule({
          employeeId,
          date: format(date, 'yyyy-MM-dd'),
          shiftId,
          startTime: shift.startTime,
          endTime: shift.endTime,
          status: 'scheduled',
        });
      }
    }
  };

  const handleCopyWeek = () => {
    const previousWeek = subWeeks(currentDate, 1);
    const prevWeekStart = startOfWeek(previousWeek, { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(previousWeek, { weekStartsOn: 1 });
    const prevDays = eachDayOfInterval({ start: prevWeekStart, end: prevWeekEnd });

    prevDays.forEach(day => {
      filteredEmployees.forEach(emp => {
        const prevSchedule = getScheduleForDate(emp.id, day);
        if (prevSchedule) {
          const correspondingDay = addWeeks(day, 1);
          handleAssignShift(emp.id, correspondingDay, prevSchedule.shiftId);
        }
      });
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Shift Scheduler</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Schedule shifts for employees on a weekly or monthly basis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {viewMode === 'week' && (
            <Button variant="outline" size="sm" onClick={handleCopyWeek}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Previous Week
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[200px] text-center">
            {viewMode === 'week'
              ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card p-2 text-left text-xs font-medium text-muted-foreground min-w-[150px]">
                    Employee
                  </th>
                  {days.map(day => (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        "p-2 text-center text-xs font-medium text-muted-foreground min-w-[120px]",
                        isSameDay(day, new Date()) && "bg-accent"
                      )}
                    >
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-xs">{format(day, 'd MMM')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id} className="border-b hover:bg-muted/50">
                    <td className="sticky left-0 z-10 bg-card p-2 font-medium text-sm text-foreground">
                      {employee.name}
                    </td>
                    {days.map(day => {
                      const schedule = getScheduleForDate(employee.id, day);
                      const shift = schedule ? shifts.find(s => s.id === schedule.shiftId) : null;
                      return (
                        <td key={day.toISOString()} className="p-2">
                          {schedule ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left"
                                >
                                  <div className="flex flex-col items-start">
                                    <Badge variant="secondary" className="text-xs">
                                      {shift?.name || 'Unknown'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground mt-1">
                                      {schedule.startTime} - {schedule.endTime}
                                    </span>
                                  </div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="space-y-2">
                                  <Label>Change Shift</Label>
                                  <Select
                                    value={schedule.shiftId}
                                    onValueChange={(value) => handleAssignShift(employee.id, day, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {shifts.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                          {s.name} ({s.startTime} - {s.endTime})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setSelectedDate(day);
                                    setSelectedEmployee(employee.id);
                                  }}
                                >
                                  Assign
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="space-y-2">
                                  <Label>Select Shift</Label>
                                  <Select
                                    value={selectedShift}
                                    onValueChange={(value) => {
                                      handleAssignShift(employee.id, day, value);
                                      setSelectedShift('');
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {shifts.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                          {s.name} ({s.startTime} - {s.endTime})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
