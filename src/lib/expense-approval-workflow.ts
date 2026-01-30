import { Expense } from '@/types/hr';
import { Employee } from '@/types/erp';
import { ApprovalWorkflow } from '@/types/hr';

export interface ExpenseApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface ExpenseWorkflowResult {
  workflow: ApprovalWorkflow;
  levels: ExpenseApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determineExpenseApprovalWorkflow(
  expense: Expense,
  employee: Employee,
  workflows: ApprovalWorkflow[]
): ExpenseWorkflowResult | null {
  // Find applicable workflow
  const applicableWorkflow = workflows.find(wf => {
    if (wf.type !== 'expense') return false;

    // Check conditions
    return wf.levels.some(level => {
      if (level.conditions?.amount && expense.amount > level.conditions.amount) return true;
      if (level.conditions?.category && level.conditions.category === expense.expenseType) return true;
      return !level.conditions; // No conditions means always applicable
    });
  });

  if (!applicableWorkflow) {
    // Default workflow: Direct Manager -> Department Head -> HR Manager -> Finance Manager
    const defaultWorkflow: ApprovalWorkflow = {
      id: 'default-expense',
      name: 'Default Expense Workflow',
      type: 'expense',
      levels: [
        { level: 1, approverRole: 'department_head' },
        { level: 2, approverRole: 'hr_manager' },
        { level: 3, approverRole: 'finance' },
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

  const levels: ExpenseApprovalLevel[] = applicableWorkflow.levels.map(l => ({
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

export function getNextExpenseApprovalLevel(
  workflowResult: ExpenseWorkflowResult,
  currentApprovals: ExpenseApprovalLevel[]
): ExpenseApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}

export function canAutoApproveExpense(
  workflowResult: ExpenseWorkflowResult,
  expense: Expense
): boolean {
  if (!workflowResult.workflow.escalationRules) return false;

  const daysSinceSubmission = Math.floor(
    (new Date().getTime() - new Date(expense.submittedOn || '').getTime()) / (1000 * 60 * 60 * 24)
  );
  const escalationHours = workflowResult.workflow.escalationRules.hours || 48;
  
  return daysSinceSubmission * 24 >= escalationHours && 
         workflowResult.workflow.escalationRules.action === 'auto_approve';
}
