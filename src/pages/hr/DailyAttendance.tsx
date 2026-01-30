import { useState, useMemo, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, UserCheck, Save } from 'lucide-react';
import { employees, holidays, leaveApplications } from '@/data/hr-dummy-data';
import type { Attendance } from '@/types/hr';
import { format } from 'date-fns';

export default function DailyAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // Get employees for selected date
  const employeesForDate = useMemo(() => {
    let filtered = employees.filter(emp => emp.status === 'active');
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }
    return filtered;
  }, [selectedDepartment]);

  // Get holidays for selected date
  const holidayForDate = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dateStr && h.published);
  }, [selectedDate]);

  // Get approved leaves for selected date
  const leavesForDate = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return leaveApplications.filter(la => 
      la.status === 'approved' &&
      dateStr >= la.fromDate &&
      dateStr <= la.toDate
    );
  }, [selectedDate]);

  // Initialize attendance records
  const initializeAttendance = () => {
    const records: Attendance[] = employeesForDate.map(emp => {
      // Check if on leave
      const onLeave = leavesForDate.find(l => l.employeeId === emp.id);
      if (onLeave) {
        return {
          id: `${emp.id}-${format(selectedDate, 'yyyy-MM-dd')}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status: 'on_leave',
          markedBy: 'System',
          markedOn: format(new Date(), 'yyyy-MM-dd'),
        };
      }
      // Check if holiday
      if (holidayForDate) {
        return {
          id: `${emp.id}-${format(selectedDate, 'yyyy-MM-dd')}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status: 'holiday',
          markedBy: 'System',
          markedOn: format(new Date(), 'yyyy-MM-dd'),
        };
      }
      // Default to absent
      return {
        id: `${emp.id}-${format(selectedDate, 'yyyy-MM-dd')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: 'absent',
        markedBy: 'Current User',
        markedOn: format(new Date(), 'yyyy-MM-dd'),
      };
    });
    setAttendanceRecords(records);
  };

  useEffect(() => {
    initializeAttendance();
  }, [selectedDate, selectedDepartment, employeesForDate, leavesForDate, holidayForDate]);

  const handleStatusChange = (employeeId: string, status: Attendance['status']) => {
    setAttendanceRecords(prev => prev.map(record => 
      record.employeeId === employeeId
        ? { ...record, status }
        : record
    ));
  };

  const handleBulkStatusChange = (status: Attendance['status']) => {
    const selectedIds = Array.from(selectedEmployees);
    setAttendanceRecords(prev => prev.map(record => 
      selectedIds.includes(record.employeeId)
        ? { ...record, status }
        : record
    ));
    setSelectedEmployees(new Set());
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts);
  }, []);

  const statusCounts = useMemo(() => {
    const counts = {
      present: 0,
      absent: 0,
      on_leave: 0,
      holiday: 0,
      half_day: 0,
      late: 0,
    };
    attendanceRecords.forEach(record => {
      if (record.status in counts) {
        counts[record.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [attendanceRecords]);

  const columns = [
    {
      key: 'select',
      label: '',
      width: '50px',
      render: (_: unknown, row: Attendance) => (
        <Checkbox
          checked={selectedEmployees.has(row.employeeId)}
          onCheckedChange={() => toggleEmployeeSelection(row.employeeId)}
          onClick={(e) => e.stopPropagation()}
          disabled={row.status === 'holiday' || row.status === 'on_leave'}
        />
      ),
    },
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: unknown, row: Attendance) => {
        const emp = employees.find(e => e.id === row.employeeId);
        return emp?.department || '-';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as Attendance['status'];
        const variants: Record<string, 'success' | 'warning' | 'destructive' | 'neutral' | 'primary'> = {
          present: 'success',
          absent: 'destructive',
          half_day: 'warning',
          late: 'warning',
          on_leave: 'primary',
          holiday: 'neutral',
        };
        const labels: Record<string, string> = {
          present: 'Present',
          absent: 'Absent',
          half_day: 'Half Day',
          late: 'Late',
          on_leave: 'On Leave',
          holiday: 'Holiday',
        };
        return (
          <StatusBadge variant={variants[status] || 'neutral'}>
            {labels[status] || status}
          </StatusBadge>
        );
      },
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (value: unknown) => value || '-',
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (value: unknown) => value || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Attendance) => {
        if (row.status === 'holiday' || row.status === 'on_leave') {
          return <span className="text-xs text-muted-foreground">Auto-marked</span>;
        }
        return (
          <Select
            value={row.status}
            onValueChange={(value) => handleStatusChange(row.employeeId, value as Attendance['status'])}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="half_day">Half Day</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Date and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <Label className="mb-2 block">Select Date</Label>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                setSelectedDate(new Date(e.target.value));
                initializeAttendance();
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex-1">
          <Label className="mb-2 block">Department</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={initializeAttendance}>
          <Save className="h-4 w-4 mr-2" />
          Save Attendance
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.present}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.absent}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">Half Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.half_day}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">On Leave</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.on_leave}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-4 w-4 text-neutral" />
            <span className="text-sm text-muted-foreground">Holiday</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.holiday}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{attendanceRecords.length}</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEmployees.size > 0 && (
        <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange('present')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange('absent')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark Absent
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange('half_day')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Mark Half Day
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedEmployees(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Holiday Notice */}
      {holidayForDate && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">
            📅 {holidayForDate.name} - All employees will be marked as Holiday
          </p>
        </div>
      )}

      {/* Attendance Table */}
      <DataTable
        data={attendanceRecords}
        columns={columns}
        searchable={false}
        viewToggle={false}
      />
    </div>
  );
}
