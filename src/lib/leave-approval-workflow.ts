import { LeaveApplication } from '@/types/hr';
import { Employee } from '@/types/erp';
import { ApprovalWorkflow } from '@/types/hr';
import { differenceInDays } from 'date-fns';

export interface ApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface WorkflowResult {
  workflow: ApprovalWorkflow;
  levels: ApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determineApprovalWorkflow(
  application: LeaveApplication,
  employee: Employee,
  workflows: ApprovalWorkflow[]
): WorkflowResult | null {
  // Find applicable workflow
  const applicableWorkflow = workflows.find(wf => {
    if (wf.type !== 'leave') return false;

    // Check conditions
    const days = differenceInDays(new Date(application.toDate), new Date(application.fromDate)) + 1;
    
    return wf.levels.some(level => {
      if (level.conditions?.duration && days > level.conditions.duration) return true;
      if (level.conditions?.leaveType && level.conditions.leaveType === application.leaveType) return true;
      return !level.conditions; // No conditions means always applicable
    });
  });

  if (!applicableWorkflow) {
    // Default workflow: Direct Manager -> Department Head -> HR Manager
    const defaultWorkflow: ApprovalWorkflow = {
      id: 'default',
      name: 'Default Leave Workflow',
      type: 'leave',
      levels: [
        { level: 1, approverRole: 'department_head' },
        { level: 2, approverRole: 'hr_manager' },
      ],
      status: 'active',
    };
    return {
      workflow: defaultWorkflow,
      levels: defaultWorkflow.levels.map(l => ({
        level: l.level,
        approverRole: l.approverRole,
        status: 'pending' as const,
      })),
      currentLevel: 1,
      canApprove: true,
    };
  }

  const levels: ApprovalLevel[] = applicableWorkflow.levels.map(l => ({
    level: l.level,
    approverRole: l.approverRole,
    status: 'pending' as const,
  }));

  return {
    workflow: applicableWorkflow,
    levels,
    currentLevel: 1,
    canApprove: true,
  };
}

export function getNextApprovalLevel(
  workflowResult: WorkflowResult,
  currentApprovals: ApprovalLevel[]
): ApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}

export function canAutoApprove(
  workflowResult: WorkflowResult,
  application: LeaveApplication
): boolean {
  if (!workflowResult.workflow.escalationRules) return false;

  const daysSinceApplication = differenceInDays(new Date(), new Date(application.appliedOn));
  const escalationHours = workflowResult.workflow.escalationRules.hours || 48;
  
  return daysSinceApplication * 24 >= escalationHours && 
         workflowResult.workflow.escalationRules.action === 'auto_approve';
}

export function routeToApprover(
  level: ApprovalLevel,
  employee: Employee,
  employees: Employee[]
): Employee | null {
  // In a real app, this would look up the actual reporting manager
  // For now, return a placeholder
  return employees.find(emp => 
    emp.department === employee.department && 
    emp.designation.toLowerCase().includes('manager')
  ) || null;
}
