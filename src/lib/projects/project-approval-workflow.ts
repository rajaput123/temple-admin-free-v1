import { Project, RegulatorySensitivity } from '@/types/projects';

export interface ProjectApprovalLevel {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedOn?: string;
  remarks?: string;
}

export interface ProjectApprovalWorkflowResult {
  levels: ProjectApprovalLevel[];
  currentLevel: number;
  canApprove: boolean;
  nextApprover?: string;
}

export function determineProjectApprovalWorkflow(
  project: Project
): ProjectApprovalWorkflowResult {
  const levels: ProjectApprovalLevel[] = [];

  // Regulatory sensitivity-based routing
  if (project.regulatorySensitivity === 'heritage') {
    levels.push({
      level: 1,
      approverRole: 'heritage_officer',
      status: 'pending',
    });
  }

  if (project.regulatorySensitivity === 'government_approval_required') {
    levels.push({
      level: 1,
      approverRole: 'government_officer',
      status: 'pending',
    });
  }

  // Standard project approval
  levels.push(
    {
      level: levels.length + 1,
      approverRole: 'project_manager',
      status: 'pending',
    },
    {
      level: levels.length + 2,
      approverRole: 'finance',
      status: 'pending',
    }
  );

  return {
    levels,
    currentLevel: 1,
    canApprove: true,
  };
}

export function getNextProjectApprovalLevel(
  workflowResult: ProjectApprovalWorkflowResult,
  currentApprovals: ProjectApprovalLevel[]
): ProjectApprovalLevel | null {
  const pendingLevel = workflowResult.levels.find(
    level => level.status === 'pending' && !currentApprovals.some(ca => ca.level === level.level)
  );
  return pendingLevel || null;
}
