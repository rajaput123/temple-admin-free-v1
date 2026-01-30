import type { Asset } from '@/types/assets';

export interface DisposalApprovalWorkflow {
  levels: Array<{
    level: number;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    approverId?: string;
    approverName?: string;
    approvedOn?: string;
    remarks?: string;
  }>;
  currentLevel: number;
}

/**
 * Determine disposal approval workflow
 * Disposal always requires Trustee approval for any asset
 */
export function determineDisposalApprovalWorkflow(asset: Asset): DisposalApprovalWorkflow {
  const levels = [];
  
  // Finance must verify valuation first
  levels.push({
    level: 1,
    approverRole: 'finance',
    status: 'pending',
  });
  
  // Trustee approval always required for disposal
  levels.push({
    level: 2,
    approverRole: 'trustee',
    status: 'pending',
  });
  
  // For sacred assets, additional trustee committee approval
  if (asset.sensitivity === 'sacred') {
    levels.push({
      level: 3,
      approverRole: 'trustee',
      status: 'pending',
    });
  }
  
  return {
    levels,
    currentLevel: 1,
  };
}

/**
 * Check if disposal can proceed
 */
export function canDisposalProceed(workflow: DisposalApprovalWorkflow): boolean {
  return workflow.levels.every(level => level.status === 'approved');
}

/**
 * Check if user can approve disposal
 */
export function canUserApproveDisposal(
  userRole: string,
  workflow: DisposalApprovalWorkflow
): boolean {
  const pendingLevel = workflow.levels.find(level => level.status === 'pending');
  
  if (!pendingLevel) {
    return false;
  }
  
  return pendingLevel.approverRole === userRole;
}

/**
 * Approve disposal at current level
 */
export function approveDisposalLevel(
  workflow: DisposalApprovalWorkflow,
  approverId: string,
  approverName: string,
  remarks?: string
): DisposalApprovalWorkflow {
  const pendingLevel = workflow.levels.find(level => level.status === 'pending');
  
  if (!pendingLevel) {
    return workflow;
  }
  
  const updatedLevels = workflow.levels.map(level => {
    if (level.level === pendingLevel.level) {
      return {
        ...level,
        status: 'approved' as const,
        approverId,
        approverName,
        approvedOn: new Date().toISOString(),
        remarks,
      };
    }
    return level;
  });
  
  return {
    ...workflow,
    levels: updatedLevels,
    currentLevel: pendingLevel.level + 1,
  };
}

/**
 * Reject disposal
 */
export function rejectDisposal(
  workflow: DisposalApprovalWorkflow,
  approverId: string,
  approverName: string,
  remarks: string
): DisposalApprovalWorkflow {
  const pendingLevel = workflow.levels.find(level => level.status === 'pending');
  
  if (!pendingLevel) {
    return workflow;
  }
  
  const updatedLevels = workflow.levels.map(level => {
    if (level.level === pendingLevel.level) {
      return {
        ...level,
        status: 'rejected' as const,
        approverId,
        approverName,
        approvedOn: new Date().toISOString(),
        remarks,
      };
    }
    return level;
  });
  
  return {
    ...workflow,
    levels: updatedLevels,
  };
}
