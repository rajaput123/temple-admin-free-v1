import { PurchaseOrder } from '@/types/inventory';

export interface POApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface POWorkflowResult {
  levels: POApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determinePOApprovalWorkflow(
  order: PurchaseOrder
): POWorkflowResult {
  const totalAmount = order.totalAmount;
  
  // Value threshold-based routing
  // < 10k: storekeeper only
  // 10k-50k: storekeeper + purchase manager
  // > 50k: storekeeper + purchase manager + finance
  
  const levels: POApprovalLevel[] = [];
  
  if (totalAmount < 10000) {
    levels.push({
      level: 1,
      approverRole: 'store_keeper',
      status: 'pending',
    });
  } else if (totalAmount < 50000) {
    levels.push(
      {
        level: 1,
        approverRole: 'store_keeper',
        status: 'pending',
      },
      {
        level: 2,
        approverRole: 'purchase_manager',
        status: 'pending',
      }
    );
  } else {
    levels.push(
      {
        level: 1,
        approverRole: 'store_keeper',
        status: 'pending',
      },
      {
        level: 2,
        approverRole: 'purchase_manager',
        status: 'pending',
      },
      {
        level: 3,
        approverRole: 'finance',
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

export function getNextPOApprovalLevel(
  workflowResult: POWorkflowResult,
  currentApprovals: POApprovalLevel[]
): POApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}
