import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { LeaveApplication } from '@/types/hr';
import { Employee } from '@/types/erp';
import { Department } from '@/types/hr';
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Label } from '@/components/ui/label';

interface CoverageImpactAnalysisProps {
  leaveApplication: LeaveApplication;
  employees: Employee[];
  departments: Department[];
  leaveApplications: LeaveApplication[];
  onRecommendation?: (recommendation: 'approve' | 'reject' | 'review') => void;
}

interface CoverageAnalysis {
  date: string;
  department: string;
  totalEmployees: number;
  onLeave: number;
  available: number;
  coverage: number; // percentage
  criticalRolesAffected: number;
  workloadRedistribution: string[];
}

export function CoverageImpactAnalysis({
  leaveApplication,
  employees,
  departments,
  leaveApplications,
  onRecommendation,
}: CoverageImpactAnalysisProps) {
  const [selectedDate, setSelectedDate] = useState<string>(leaveApplication.fromDate);

  const employee = employees.find(e => e.id === leaveApplication.employeeId);
  const department = departments.find(d => d.name === employee?.department);

  const leaveDates = useMemo(() => {
    const start = new Date(leaveApplication.fromDate);
    const end = new Date(leaveApplication.toDate);
    return eachDayOfInterval({ start, end });
  }, [leaveApplication.fromDate, leaveApplication.toDate]);

  const coverageAnalysis = useMemo(() => {
    const analysis: CoverageAnalysis[] = [];

    leaveDates.forEach(date => {
      const deptEmployees = employees.filter(emp => emp.department === employee?.department);
      const totalEmployees = deptEmployees.length;

      // Count employees on leave on this date
      const onLeave = leaveApplications
        .filter(app => {
          if (app.status !== 'approved') return false;
          const appStart = new Date(app.fromDate);
          const appEnd = new Date(app.toDate);
          return isWithinInterval(date, { start: appStart, end: appEnd });
        })
        .filter(app => {
          const appEmp = employees.find(e => e.id === app.employeeId);
          return appEmp?.department === employee?.department;
        }).length;

      const available = totalEmployees - onLeave;
      const coverage = totalEmployees > 0 ? (available / totalEmployees) * 100 : 100;

      // Identify critical roles (simplified - in real app, would check designation/role)
      const criticalRolesAffected = onLeave; // Simplified

      analysis.push({
        date: format(date, 'yyyy-MM-dd'),
        department: employee?.department || '',
        totalEmployees,
        onLeave,
        available,
        coverage,
        criticalRolesAffected,
        workloadRedistribution: available < totalEmployees * 0.7
          ? ['Consider temporary reassignment', 'Cross-train team members']
          : [],
      });
    });

    return analysis;
  }, [leaveDates, employees, employee, leaveApplications]);

  const overallCoverage = useMemo(() => {
    if (coverageAnalysis.length === 0) return 100;
    return coverageAnalysis.reduce((sum, a) => sum + a.coverage, 0) / coverageAnalysis.length;
  }, [coverageAnalysis]);

  const minCoverage = useMemo(() => {
    return Math.min(...coverageAnalysis.map(a => a.coverage));
  }, [coverageAnalysis]);

  const recommendation = useMemo(() => {
    if (overallCoverage >= 80 && minCoverage >= 70) {
      return { action: 'approve' as const, message: 'Coverage is adequate. Safe to approve.' };
    } else if (overallCoverage >= 60 && minCoverage >= 50) {
      return { action: 'review' as const, message: 'Coverage may be tight. Review workload distribution.' };
    } else {
      return { action: 'reject' as const, message: 'Insufficient coverage. Consider alternative dates.' };
    }
  }, [overallCoverage, minCoverage]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Coverage Impact Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Analyze department coverage impact before approving leave
        </p>
      </div>

      {/* Overall Coverage Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Coverage Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Average Coverage</span>
              <span className="text-lg font-bold text-foreground">
                {overallCoverage.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallCoverage} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Minimum Coverage</span>
              <span className="text-lg font-bold text-foreground">
                {minCoverage.toFixed(1)}%
              </span>
            </div>
            <Progress value={minCoverage} className="h-2" />
          </div>

          <Alert variant={recommendation.action === 'approve' ? 'default' : recommendation.action === 'review' ? 'warning' : 'destructive'}>
            {recommendation.action === 'approve' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{recommendation.message}</AlertDescription>
          </Alert>

          {onRecommendation && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={recommendation.action === 'approve' ? 'default' : 'outline'}
                onClick={() => onRecommendation('approve')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant={recommendation.action === 'review' ? 'default' : 'outline'}
                onClick={() => onRecommendation('review')}
              >
                Review
              </Button>
              <Button
                size="sm"
                variant={recommendation.action === 'reject' ? 'destructive' : 'outline'}
                onClick={() => onRecommendation('reject')}
              >
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Coverage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Coverage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coverageAnalysis.map(analysis => (
              <div key={analysis.date} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {format(new Date(analysis.date), 'MMM d, yyyy (EEE)')}
                    </p>
                    <p className="text-xs text-muted-foreground">{analysis.department}</p>
                  </div>
                  <Badge variant={analysis.coverage >= 80 ? 'success' : analysis.coverage >= 60 ? 'warning' : 'destructive'}>
                    {analysis.coverage.toFixed(0)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">{analysis.totalEmployees}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available: </span>
                    <span className="font-medium text-success">{analysis.available}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">On Leave: </span>
                    <span className="font-medium text-warning">{analysis.onLeave}</span>
                  </div>
                </div>
                {analysis.workloadRedistribution.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Suggestions:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {analysis.workloadRedistribution.map((suggestion, idx) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Department</Label>
              <p className="font-medium text-foreground">{employee?.department || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Total Employees</Label>
              <p className="font-medium text-foreground">
                {coverageAnalysis[0]?.totalEmployees || 0}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Leave Duration</Label>
              <p className="font-medium text-foreground">
                {leaveApplication.days} day{leaveApplication.days !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Critical Roles Affected</Label>
              <p className="font-medium text-foreground">
                {coverageAnalysis.reduce((sum, a) => sum + a.criticalRolesAffected, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
