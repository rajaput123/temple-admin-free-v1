import { ProjectPayment } from '@/types/projects';

export interface PaymentApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface PaymentWorkflowResult {
  levels: PaymentApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determinePaymentApprovalWorkflow(
  payment: ProjectPayment
): PaymentWorkflowResult {
  const levels: PaymentApprovalLevel[] = [];

  // Value-based routing
  const amount = payment.netPayableAmount;

  // Bill verification first
  levels.push({
    level: 1,
    approverRole: 'site_engineer',
    status: 'pending',
  });

  // Payment approval based on amount
  if (amount < 50000) {
    levels.push({
      level: 2,
      approverRole: 'project_manager',
      status: 'pending',
    });
  } else if (amount < 200000) {
    levels.push(
      {
        level: 2,
        approverRole: 'project_manager',
        status: 'pending',
      },
      {
        level: 3,
        approverRole: 'finance',
        status: 'pending',
      }
    );
  } else {
    levels.push(
      {
        level: 2,
        approverRole: 'project_manager',
        status: 'pending',
      },
      {
        level: 3,
        approverRole: 'finance',
        status: 'pending',
      },
      {
        level: 4,
        approverRole: 'trustee',
        status: 'pending',
      }
    );
  }

  return {
    levels,
    currentLevel: 1,
    canApprove: true,
  };
}

export function getNextPaymentApprovalLevel(
  workflowResult: PaymentWorkflowResult,
  currentApprovals: PaymentApprovalLevel[]
): PaymentApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}
