import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, Send, CheckCircle } from 'lucide-react';
import { determineCommunicationApprovalWorkflow, getNextStatus } from '@/lib/communication-approval-workflow';
import type { CommunicationStatus } from '@/types/communications';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ApprovalWorkflowProps {
  currentStatus: CommunicationStatus;
  onStatusChange: (newStatus: CommunicationStatus, action: 'submit' | 'approve' | 'reject' | 'publish') => void;
  approvalHistory?: Array<{
    level: number;
    status: CommunicationStatus;
    reviewedBy: string;
    reviewedAt: string;
    comments?: string;
  }>;
}

const statusColors: Record<CommunicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  pending_approval: 'bg-orange-100 text-orange-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function ApprovalWorkflow({
  currentStatus,
  onStatusChange,
  approvalHistory = [],
}: ApprovalWorkflowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const workflow = useMemo(() => {
    if (!user) return null;
    return determineCommunicationApprovalWorkflow(currentStatus, user.role);
  }, [currentStatus, user]);

  if (!workflow || !user) return null;

  const handleAction = (action: 'submit' | 'approve' | 'reject' | 'publish') => {
    if (action === 'reject') {
      setRejectDialogOpen(true);
      return;
    }

    const nextStatus = getNextStatus(currentStatus, action, user.role);
    if (nextStatus) {
      onStatusChange(nextStatus, action);
      toast({
        title: action === 'submit' ? 'Submitted for Review' : 
               action === 'approve' ? 'Approved' : 
               action === 'publish' ? 'Published' : 'Action Completed',
      });
    }
  };

  const handleReject = () => {
    const nextStatus = getNextStatus(currentStatus, 'reject', user.role);
    if (nextStatus) {
      onStatusChange(nextStatus, 'reject');
      toast({
        title: 'Rejected',
        description: 'Communication has been rejected and returned to draft.',
      });
      setRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const getStatusIcon = (status: CommunicationStatus, isCurrent: boolean) => {
    if (status === 'published') return <CheckCircle2 className="h-4 w-4" />;
    if (status === 'approved') return <CheckCircle className="h-4 w-4" />;
    if (isCurrent) return <Clock className="h-4 w-4 animate-pulse" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workflow Steps */}
        <div className="space-y-3">
          {workflow.workflowSteps.map((step, index) => {
            const isCompleted = ['draft', 'pending_review', 'pending_approval', 'approved', 'published']
              .indexOf(step.status) < ['draft', 'pending_review', 'pending_approval', 'approved', 'published']
              .indexOf(currentStatus);
            const isCurrent = step.status === currentStatus;
            const isPending = ['pending_review', 'pending_approval'].includes(step.status) && 
                             ['pending_review', 'pending_approval'].includes(currentStatus) &&
                             step.status === currentStatus;

            return (
              <div
                key={step.level}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isCurrent ? 'bg-blue-50 border-blue-200' : 
                  isCompleted ? 'bg-green-50 border-green-200' : 
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {getStatusIcon(step.status, isCurrent)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[step.status]}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm font-medium">{step.description}</span>
                  </div>
                  {isPending && (
                    <p className="text-xs text-gray-500 mt-1">
                      Waiting for {step.approverRole.replace('_', ' ')} approval
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {workflow.canSubmit && (
            <Button
              type="button"
              onClick={() => handleAction('submit')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          )}
          
          {workflow.canApprove && (
            <Button
              type="button"
              onClick={() => handleAction('approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          
          {workflow.canReject && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleAction('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}
          
          {workflow.canPublish && (
            <Button
              type="button"
              onClick={() => handleAction('publish')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
        </div>

        {/* Approval History */}
        {approvalHistory.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Approval History</h4>
            <div className="space-y-2">
              {approvalHistory.map((history, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>
                    {history.status.replace('_', ' ')} by {history.reviewedBy} on{' '}
                    {new Date(history.reviewedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Communication</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection. This will return the communication to draft status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectReason.trim()}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
