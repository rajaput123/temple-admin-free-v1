import type { AssetMovement, AssetMovementApproval, Asset } from '@/types/assets';

export interface MovementWorkflowResult {
  levels: AssetMovementApproval[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

/**
 * Determine approval workflow based on asset value and sensitivity
 */
export function determineMovementApprovalWorkflow(
  assets: Asset[]
): MovementWorkflowResult {
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValuation, 0);
  const hasSacredAsset = assets.some(asset => asset.sensitivity === 'sacred');
  const hasHighValueAsset = assets.some(asset => asset.sensitivity === 'high_value');
  
  const levels: AssetMovementApproval[] = [];
  
  // Base approval: Asset Manager always required
  levels.push({
    level: 1,
    approverRole: 'asset_manager',
    status: 'pending',
  });
  
  // High-value assets (>1L) require Finance approval
  if (totalValue > 100000 || hasHighValueAsset) {
    levels.push({
      level: 2,
      approverRole: 'finance',
      status: 'pending',
    });
  }
  
  // Sacred assets always require Trustee approval
  if (hasSacredAsset) {
    const trusteeLevel = totalValue > 100000 ? 3 : 2;
    levels.push({
      level: trusteeLevel,
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

/**
 * Get next approval level that needs action
 */
export function getNextMovementApprovalLevel(
  workflowResult: MovementWorkflowResult,
  currentApprovals: AssetMovementApproval[]
): AssetMovementApproval | null {
  // Find the first pending level that hasn't been approved
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && 
    !currentApprovals.some(ca => ca.level === level.level && ca.status === 'approved')
  );
  
  return pendingLevel || null;
}

/**
 * Check if movement can proceed (all approvals received)
 */
export function canMovementProceed(
  workflowResult: MovementWorkflowResult,
  currentApprovals: AssetMovementApproval[]
): boolean {
  // All required levels must be approved
  const requiredLevels = workflowResult.levels.length;
  const approvedLevels = currentApprovals.filter(ca => ca.status === 'approved').length;
  
  return approvedLevels >= requiredLevels;
}

/**
 * Check if user can approve at current level
 */
export function canUserApprove(
  userRole: string,
  workflowResult: MovementWorkflowResult,
  currentApprovals: AssetMovementApproval[]
): boolean {
  const nextLevel = getNextMovementApprovalLevel(workflowResult, currentApprovals);
  
  if (!nextLevel) {
    return false; // No pending approvals
  }
  
  // Check if user role matches the next approval level
  return nextLevel.approverRole === userRole;
}

/**
 * Approve movement at current level
 */
export function approveMovementLevel(
  movement: AssetMovement,
  approverId: string,
  approverName: string,
  remarks?: string
): AssetMovement {
  const workflowResult = determineMovementApprovalWorkflow(
    movement.assets.map(a => ({ 
      currentValuation: 0, 
      sensitivity: 'normal' 
    } as Asset)) // Simplified for workflow
  );
  
  const currentApprovals = movement.approvalWorkflow || [];
  const nextLevel = getNextMovementApprovalLevel(workflowResult, currentApprovals);
  
  if (!nextLevel) {
    return movement; // No pending approvals
  }
  
  const updatedApprovals = [...currentApprovals];
  const levelIndex = updatedApprovals.findIndex(a => a.level === nextLevel.level);
  
  if (levelIndex >= 0) {
    updatedApprovals[levelIndex] = {
      ...updatedApprovals[levelIndex],
      approverId,
      approverName,
      status: 'approved',
      approvedOn: new Date().toISOString(),
      remarks,
    };
  } else {
    updatedApprovals.push({
      level: nextLevel.level,
      approverRole: nextLevel.approverRole,
      approverId,
      approverName,
      status: 'approved',
      approvedOn: new Date().toISOString(),
      remarks,
    });
  }
  
  const allApproved = canMovementProceed(workflowResult, updatedApprovals);
  
  return {
    ...movement,
    approvalWorkflow: updatedApprovals,
    currentApprovalLevel: nextLevel.level + 1,
    status: allApproved ? 'approved' : 'pending_approval',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reject movement
 */
export function rejectMovement(
  movement: AssetMovement,
  approverId: string,
  approverName: string,
  remarks: string
): AssetMovement {
  const currentApprovals = movement.approvalWorkflow || [];
  const lastApproval = currentApprovals[currentApprovals.length - 1];
  
  const updatedApprovals = [...currentApprovals];
  if (lastApproval) {
    updatedApprovals[updatedApprovals.length - 1] = {
      ...lastApproval,
      approverId,
      approverName,
      status: 'rejected',
      approvedOn: new Date().toISOString(),
      remarks,
    };
  }
  
  return {
    ...movement,
    approvalWorkflow: updatedApprovals,
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  };
}
