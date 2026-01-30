import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Attendance } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';

interface AttendanceDashboardProps {
  attendance: Attendance[];
  employees: Employee[];
  selectedDate?: Date;
  onMarkAttendance?: (employeeId: string, date: string, status: Attendance['status'], checkIn?: string, checkOut?: string) => void;
}

export function AttendanceDashboard({
  attendance,
  employees,
  selectedDate = new Date(),
  onMarkAttendance,
}: AttendanceDashboardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');

  const todayAttendance = useMemo(() => {
    const today = format(selectedDate, 'yyyy-MM-dd');
    return attendance.filter(a => a.date === today);
  }, [attendance, selectedDate]);

  const filteredEmployees = useMemo(() => {
    return selectedDepartment === 'all'
      ? employees
      : employees.filter(emp => emp.department === selectedDepartment);
  }, [employees, selectedDepartment]);

  const stats = useMemo(() => {
    const present = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const onLeave = todayAttendance.filter(a => a.status === 'on_leave').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const earlyDepartures = todayAttendance.filter(a => a.checkOut && a.status === 'present').length; // Simplified

    const total = filteredEmployees.length;
    const marked = todayAttendance.length;

    return {
      total,
      marked,
      present,
      absent,
      onLeave,
      late,
      earlyDepartures,
      attendanceRate: total > 0 ? (present / total) * 100 : 0,
    };
  }, [todayAttendance, filteredEmployees]);

  const departmentBreakdown = useMemo(() => {
    const deptMap = new Map<string, { total: number; present: number; absent: number; onLeave: number }>();

    filteredEmployees.forEach(emp => {
      if (!deptMap.has(emp.department)) {
        deptMap.set(emp.department, { total: 0, present: 0, absent: 0, onLeave: 0 });
      }
      const dept = deptMap.get(emp.department)!;
      dept.total++;

      const empAttendance = todayAttendance.find(a => a.employeeId === emp.id);
      if (empAttendance) {
        if (empAttendance.status === 'present' || empAttendance.status === 'late') {
          dept.present++;
        } else if (empAttendance.status === 'absent') {
          dept.absent++;
        } else if (empAttendance.status === 'on_leave') {
          dept.onLeave++;
        }
      }
    });

    return Array.from(deptMap.entries()).map(([dept, stats]) => ({
      department: dept,
      ...stats,
      rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
    }));
  }, [filteredEmployees, todayAttendance]);

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as Attendance['status'];
        const variants: Record<string, 'success' | 'warning' | 'neutral' | 'destructive'> = {
          present: 'success',
          late: 'warning',
          absent: 'destructive',
          on_leave: 'neutral',
          half_day: 'warning',
          holiday: 'neutral',
        };
        const labels: Record<string, string> = {
          present: 'Present',
          late: 'Late',
          absent: 'Absent',
          on_leave: 'On Leave',
          half_day: 'Half Day',
          holiday: 'Holiday',
        };
        return <StatusBadge variant={variants[status] || 'neutral'}>{labels[status] || status}</StatusBadge>;
      },
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (value: unknown) => value ? format(new Date(`2000-01-01T${value}`), 'HH:mm') : '-',
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (value: unknown) => value ? format(new Date(`2000-01-01T${value}`), 'HH:mm') : '-',
    },
    {
      key: 'lateMinutes',
      label: 'Late',
      render: (value: unknown) => value ? `${value} min` : '-',
    },
    {
      key: 'overtimeHours',
      label: 'Overtime',
      render: (value: unknown) => value ? `${value} hrs` : '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Attendance Dashboard</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time attendance status and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {[...new Set(employees.map(e => e.department))].map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-foreground">{stats.present}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-foreground">{stats.absent}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">{stats.onLeave}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-foreground">
                {stats.attendanceRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={stats.attendanceRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentBreakdown.map(dept => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{dept.department}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.present} present, {dept.absent} absent, {dept.onLeave} on leave
                    </p>
                  </div>
                  <Badge variant={dept.rate >= 80 ? 'success' : dept.rate >= 60 ? 'warning' : 'destructive'}>
                    {dept.rate.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={dept.rate} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today's Attendance - {format(selectedDate, 'MMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={todayAttendance}
            columns={columns}
            searchable={false}
            viewToggle={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
