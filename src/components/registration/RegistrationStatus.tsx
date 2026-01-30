import { useMemo } from 'react';
import type { RegistrationStatus as RegStatus } from '@/types/registration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegistrationStatusProps {
  status: RegStatus;
  registrationId?: string;
  rejectionReason?: string;
  kycDocuments?: Array<{ type: string; status: string; fileName: string }>;
}

export function RegistrationStatusDisplay({
  status,
  registrationId,
  rejectionReason,
  kycDocuments = [],
}: RegistrationStatusProps) {
  const navigate = useNavigate();

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'KYC_PENDING':
        return {
          icon: Clock,
          title: 'KYC Verification Pending',
          message: 'Your documents are under review. You will be notified once the verification is complete.',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
        };
      case 'PENDING_APPROVAL':
        return {
          icon: Clock,
          title: 'Pending Approval',
          message: 'Your request has been sent to the temple administrators for approval.',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
        };
      case 'UNDER_REVIEW':
        return {
          icon: FileText,
          title: 'Under Review',
          message: 'Your registration is currently being reviewed by our team.',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
        };
      case 'APPROVED':
        return {
          icon: CheckCircle2,
          title: 'Registration Approved',
          message: 'Congratulations! Your registration has been approved. You can now access the system.',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          title: 'Registration Rejected',
          message: rejectionReason || 'Your registration has been rejected. Please review the reason and reapply if needed.',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
        };
      case 'SUSPENDED':
        return {
          icon: AlertCircle,
          title: 'Registration Suspended',
          message: 'Your registration has been suspended. Please contact support for more information.',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
        };
      default:
        return {
          icon: Clock,
          title: 'Processing',
          message: 'Your registration is being processed.',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50',
          borderColor: 'border-border',
        };
    }
  }, [status, rejectionReason]);

  const Icon = statusConfig.icon;

  return (
    <div className="space-y-4">
      <Card className={`p-6 ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
        <div className="flex items-start gap-4">
          <Icon className={`h-8 w-8 ${statusConfig.color} flex-shrink-0`} />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${statusConfig.color} mb-2`}>
              {statusConfig.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {statusConfig.message}
            </p>
            {registrationId && (
              <p className="text-xs text-muted-foreground">
                Registration ID: <span className="font-mono">{registrationId}</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {status === 'KYC_PENDING' && kycDocuments.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Document Status</h4>
          <div className="space-y-2">
            {kycDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{doc.type.toUpperCase()}</span>
                <span className={`font-medium ${
                  doc.status === 'verified' ? 'text-success' :
                  doc.status === 'rejected' ? 'text-destructive' :
                  'text-warning'
                }`}>
                  {doc.status === 'verified' ? 'Verified' :
                   doc.status === 'rejected' ? 'Rejected' :
                   'Pending Review'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {status === 'APPROVED' && (
        <div className="flex justify-center">
          <Button onClick={() => navigate('/login')}>
            Proceed to Login
          </Button>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/register')}>
            Reapply
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      )}
    </div>
  );
}
