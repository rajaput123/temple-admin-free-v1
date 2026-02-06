import type { CommunicationStatus, ApprovalLevel } from '@/types/communications';
import type { UserRole } from '@/types/erp';

export interface CommunicationWorkflowResult {
  currentStatus: CommunicationStatus;
  nextStatus: CommunicationStatus | null;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canPublish: boolean;
  requiredRole: UserRole | null;
  workflowSteps: ApprovalStep[];
}

export interface ApprovalStep {
  level: number;
  status: CommunicationStatus;
  approverRole: UserRole;
  description: string;
}

/**
 * Determines the approval workflow for communications
 * Workflow: Draft → pending_review → pending_approval → approved → published
 */
export function determineCommunicationApprovalWorkflow(
  currentStatus: CommunicationStatus,
  userRole: UserRole
): CommunicationWorkflowResult {
  const workflowSteps: ApprovalStep[] = [
    {
      level: 1,
      status: 'draft',
      approverRole: 'content_editor',
      description: 'Content Editor creates draft',
    },
    {
      level: 2,
      status: 'pending_review',
      approverRole: 'pr_manager',
      description: 'PR Manager reviews content',
    },
    {
      level: 3,
      status: 'pending_approval',
      approverRole: 'temple_administrator',
      description: 'Temple Admin approves',
    },
    {
      level: 4,
      status: 'approved',
      approverRole: 'pr_admin',
      description: 'Ready to publish',
    },
    {
      level: 5,
      status: 'published',
      approverRole: 'pr_admin',
      description: 'Published',
    },
  ];

  let canSubmit = false;
  let canApprove = false;
  let canReject = false;
  let canPublish = false;
  let nextStatus: CommunicationStatus | null = null;
  let requiredRole: UserRole | null = null;

  // Super admin and temple admin can do everything
  if (userRole === 'super_admin' || userRole === 'temple_administrator') {
    canSubmit = currentStatus === 'draft';
    canApprove = ['pending_review', 'pending_approval'].includes(currentStatus);
    canReject = ['pending_review', 'pending_approval'].includes(currentStatus);
    canPublish = currentStatus === 'approved';
    
    if (currentStatus === 'draft') nextStatus = 'pending_review';
    else if (currentStatus === 'pending_review') nextStatus = 'pending_approval';
    else if (currentStatus === 'pending_approval') nextStatus = 'approved';
    else if (currentStatus === 'approved') nextStatus = 'published';
  }
  // PR Admin can approve and publish
  else if (userRole === 'pr_admin') {
    canSubmit = currentStatus === 'draft';
    canApprove = ['pending_review', 'pending_approval'].includes(currentStatus);
    canReject = ['pending_review', 'pending_approval'].includes(currentStatus);
    canPublish = currentStatus === 'approved';
    
    if (currentStatus === 'draft') nextStatus = 'pending_review';
    else if (currentStatus === 'pending_review') nextStatus = 'pending_approval';
    else if (currentStatus === 'pending_approval') nextStatus = 'approved';
    else if (currentStatus === 'approved') nextStatus = 'published';
  }
  // PR Manager can review and approve
  else if (userRole === 'pr_manager') {
    canSubmit = currentStatus === 'draft';
    canApprove = currentStatus === 'pending_review';
    canReject = currentStatus === 'pending_review';
    canPublish = false;
    
    if (currentStatus === 'draft') nextStatus = 'pending_review';
    else if (currentStatus === 'pending_review') nextStatus = 'pending_approval';
  }
  // Content Editor can only submit for review
  else if (userRole === 'content_editor') {
    canSubmit = currentStatus === 'draft';
    canApprove = false;
    canReject = false;
    canPublish = false;
    
    if (currentStatus === 'draft') nextStatus = 'pending_review';
  }

  // Determine required role for next step
  if (currentStatus === 'draft') requiredRole = 'content_editor';
  else if (currentStatus === 'pending_review') requiredRole = 'pr_manager';
  else if (currentStatus === 'pending_approval') requiredRole = 'temple_administrator';
  else if (currentStatus === 'approved') requiredRole = 'pr_admin';

  return {
    currentStatus,
    nextStatus,
    canSubmit,
    canApprove,
    canReject,
    canPublish,
    requiredRole,
    workflowSteps,
  };
}

/**
 * Check if user can perform action on communication
 */
export function canUserPerformAction(
  userRole: UserRole,
  currentStatus: CommunicationStatus,
  action: 'submit' | 'approve' | 'reject' | 'publish'
): boolean {
  const workflow = determineCommunicationApprovalWorkflow(currentStatus, userRole);
  
  switch (action) {
    case 'submit':
      return workflow.canSubmit;
    case 'approve':
      return workflow.canApprove;
    case 'reject':
      return workflow.canReject;
    case 'publish':
      return workflow.canPublish;
    default:
      return false;
  }
}

/**
 * Get next status when action is performed
 */
export function getNextStatus(
  currentStatus: CommunicationStatus,
  action: 'submit' | 'approve' | 'reject' | 'publish',
  userRole: UserRole
): CommunicationStatus | null {
  const workflow = determineCommunicationApprovalWorkflow(currentStatus, userRole);
  
  if (action === 'reject') {
    return 'draft'; // Reject goes back to draft
  }
  
  if (action === 'submit' && workflow.canSubmit) {
    return workflow.nextStatus;
  }
  
  if (action === 'approve' && workflow.canApprove) {
    return workflow.nextStatus;
  }
  
  if (action === 'publish' && workflow.canPublish) {
    return 'published';
  }
  
  return null;
}
