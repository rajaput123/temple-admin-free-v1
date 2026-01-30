import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText } from 'lucide-react';
import { employees } from '@/data/hr-dummy-data';
import { attendanceRecords } from '@/data/hr-dummy-data';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import type { AttendanceReport } from '@/types/hr';

export default function AttendanceReports() {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
  const monthEnd = endOfMonth(new Date(selectedMonth + '-01'));
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Generate attendance reports
  const reports: AttendanceReport[] = useMemo(() => {
    let filteredEmployees = employees.filter(emp => emp.status === 'active');
    
    if (selectedDepartment !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === selectedDepartment);
    }
    
    if (selectedEmployee !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.id === selectedEmployee);
    }

    return filteredEmployees.map(emp => {
      const empAttendance = attendanceRecords.filter(a => 
        a.employeeId === emp.id &&
        a.date >= format(monthStart, 'yyyy-MM-dd') &&
        a.date <= format(monthEnd, 'yyyy-MM-dd')
      );

      const presentDays = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const absentDays = empAttendance.filter(a => a.status === 'absent').length;
      const leaveDays = empAttendance.filter(a => a.status === 'on_leave').length;
      const lateArrivals = empAttendance.filter(a => a.status === 'late').length;
      const overtimeHours = empAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        month: selectedMonth,
        totalDays: monthDays.length,
        presentDays,
        absentDays,
        leaveDays,
        lateArrivals,
        overtimeHours,
      };
    });
  }, [selectedMonth, selectedDepartment, selectedEmployee, monthStart, monthEnd, monthDays]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts);
  }, []);

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: unknown, row: AttendanceReport) => {
        const emp = employees.find(e => e.id === row.employeeId);
        return emp?.department || '-';
      },
    },
    {
      key: 'totalDays',
      label: 'Total Days',
      sortable: true,
    },
    {
      key: 'presentDays',
      label: 'Present',
      sortable: true,
      render: (value: unknown, row: AttendanceReport) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value as number}</span>
          <span className="text-xs text-muted-foreground">
            ({((value as number / row.totalDays) * 100).toFixed(1)}%)
          </span>
        </div>
      ),
    },
    {
      key: 'absentDays',
      label: 'Absent',
      sortable: true,
    },
    {
      key: 'leaveDays',
      label: 'On Leave',
      sortable: true,
    },
    {
      key: 'lateArrivals',
      label: 'Late Arrivals',
      sortable: true,
    },
    {
      key: 'overtimeHours',
      label: 'Overtime (hrs)',
      sortable: true,
      render: (value: unknown) => (value as number).toFixed(1),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label className="mb-2 block">Month</Label>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
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
        <div className="flex-1">
          <Label className="mb-2 block">Employee</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees
                .filter(emp => selectedDepartment === 'all' || emp.department === selectedDepartment)
                .map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Avg. Present Days</p>
          <p className="text-2xl font-bold text-gray-900">
            {reports.length > 0 
              ? (reports.reduce((sum, r) => sum + r.presentDays, 0) / reports.length).toFixed(1)
              : '0'
            }
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Absent Days</p>
          <p className="text-2xl font-bold text-gray-900">
            {reports.reduce((sum, r) => sum + r.absentDays, 0)}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Overtime</p>
          <p className="text-2xl font-bold text-gray-900">
            {reports.reduce((sum, r) => sum + r.overtimeHours, 0).toFixed(1)} hrs
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <DataTable
        data={reports}
        columns={columns}
        searchable={false}
        viewToggle={false}
      />
    </div>
  );
}
