import { StockEntry } from '@/types/inventory';

export interface StockTransferApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface StockTransferWorkflowResult {
  levels: StockTransferApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determineStockTransferApprovalWorkflow(
  entry: StockEntry
): StockTransferWorkflowResult | null {
  // Transfers between godowns require approval
  if (entry.type === 'transfer') {
    return {
      levels: [
        {
          level: 1,
          approverRole: 'inventory_admin',
          status: 'pending',
        },
      ],
      currentLevel: 1,
      canApprove: true,
    };
  }

  // Adjustments require approval
  if (entry.type === 'adjustment') {
    return {
      levels: [
        {
          level: 1,
          approverRole: 'inventory_admin',
          status: 'pending',
        },
      ],
      currentLevel: 1,
      canApprove: true,
    };
  }

  // Negative stock issues require approval
  // This would need to check stock availability, but for now we'll return null
  // and let the component handle it based on approvalStatus field
  return null;
}

export function getNextStockTransferApprovalLevel(
  workflowResult: StockTransferWorkflowResult,
  currentApprovals: StockTransferApprovalLevel[]
): StockTransferApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}
