import { ProjectBudget, BudgetItem } from '@/types/projects';

export interface BudgetOverrunAlert {
  itemId?: string;
  itemName?: string;
  threshold: number;
  actualPercentage: number;
  overrunAmount: number;
  severity: 'warning' | 'critical';
  requiresApproval: boolean;
}

export function detectBudgetOverrun(
  budget: ProjectBudget
): BudgetOverrunAlert[] {
  const alerts: BudgetOverrunAlert[] = [];

  // Check overall budget overrun
  const overallSpentPercentage = (budget.totalSpent / budget.approvedBudget) * 100;
  if (overallSpentPercentage > budget.overrunThreshold) {
    const overrunAmount = budget.totalSpent - budget.approvedBudget;
    alerts.push({
      threshold: budget.overrunThreshold,
      actualPercentage: overallSpentPercentage,
      overrunAmount,
      severity: overallSpentPercentage > budget.overrunThreshold * 1.5 ? 'critical' : 'warning',
      requiresApproval: true,
    });
  }

  // Check individual budget items
  budget.budgetItems.forEach(item => {
    if (item.actualAmount && item.estimatedAmount) {
      const itemSpentPercentage = (item.actualAmount / item.estimatedAmount) * 100;
      const itemThreshold = item.overrunThreshold || budget.overrunThreshold;
      
      if (itemSpentPercentage > itemThreshold) {
        const overrunAmount = item.actualAmount - item.estimatedAmount;
        alerts.push({
          itemId: item.id,
          itemName: item.itemName,
          threshold: itemThreshold,
          actualPercentage: itemSpentPercentage,
          overrunAmount,
          severity: itemSpentPercentage > itemThreshold * 1.5 ? 'critical' : 'warning',
          requiresApproval: itemSpentPercentage > itemThreshold * 1.2,
        });
      }
    }
  });

  return alerts;
}

export function requiresBudgetApproval(budget: ProjectBudget): boolean {
  const alerts = detectBudgetOverrun(budget);
  return alerts.some(alert => alert.requiresApproval);
}
