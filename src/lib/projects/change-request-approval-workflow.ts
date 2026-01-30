import { ChangeRequest } from '@/types/projects';

export interface ChangeRequestApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface ChangeRequestWorkflowResult {
  levels: ChangeRequestApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determineChangeRequestApprovalWorkflow(
  changeRequest: ChangeRequest
): ChangeRequestWorkflowResult {
  const levels: ChangeRequestApprovalLevel[] = [];

  // Impact-based routing
  const costImpact = changeRequest.costImpact || 0;
  const timeImpact = changeRequest.timeImpact || 0;

  // Always require project manager approval
  levels.push({
    level: 1,
    approverRole: 'project_manager',
    status: 'pending',
  });

  // Cost impact threshold
  if (costImpact > 100000) {
    levels.push({
      level: 2,
      approverRole: 'finance',
      status: 'pending',
    });
  }

  // Significant time impact
  if (timeImpact > 30) {
    levels.push({
      level: levels.length + 1,
      approverRole: 'project_admin',
      status: 'pending',
    });
  }

  // High-value changes require trustee approval
  if (costImpact > 500000 || timeImpact > 90) {
    levels.push({
      level: levels.length + 1,
      approverRole: 'trustee',
      status: 'pending',
    });
  }

  return {
    levels,
    currentLevel: 1,
    canApprove: true,
  };
}

export function getNextChangeRequestApprovalLevel(
  workflowResult: ChangeRequestWorkflowResult,
  currentApprovals: ChangeRequestApprovalLevel[]
): ChangeRequestApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}
