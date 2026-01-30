import type { Recipe, RecipeVersion, RecipeApproval } from '@/types/kitchen';
import type { UserRole } from '@/types/erp';

export interface RecipeApprovalLevel {
  level: number;
  approverRole: UserRole;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface RecipeWorkflowResult {
  levels: RecipeApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determineRecipeApprovalWorkflow(
  recipe: Recipe,
  recipeVersion: RecipeVersion
): RecipeWorkflowResult {
  // Recipe approval requires kitchen_admin approval
  const levels: RecipeApprovalLevel[] = [
    {
      level: 1,
      approverRole: 'kitchen_admin',
      status: 'pending',
    },
  ];

  return {
    levels,
    currentLevel: 1,
    canApprove: true,
  };
}

export function getNextRecipeApprovalLevel(
  workflowResult: RecipeWorkflowResult,
  currentApprovals: RecipeApprovalLevel[]
): RecipeApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}

export function canApproveRecipe(
  workflowResult: RecipeWorkflowResult,
  currentApprovals: RecipeApprovalLevel[],
  userRole: UserRole
): boolean {
  const nextLevel = getNextRecipeApprovalLevel(workflowResult, currentApprovals);
  if (!nextLevel) return false;
  return nextLevel.approverRole === userRole;
}
