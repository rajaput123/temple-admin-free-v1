import { useState } from 'react';
import type { TempleAdminRegistration, RegistrationStatus } from '@/types/registration';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { dummyTemples } from '@/data/temple-structure-data';

interface RegistrationReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: TempleAdminRegistration;
  onApprovalChange: (registrationId: string, newStatus: RegistrationStatus) => void;
}

export function RegistrationReviewModal({
  open,
  onOpenChange,
  registration,
  onApprovalChange,
}: RegistrationReviewModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTemple = registration.templeId 
    ? dummyTemples.find(t => t.id === registration.templeId)
    : null;

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onApprovalChange(registration.id, 'APPROVED');
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onApprovalChange(registration.id, 'REJECTED');
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Registration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Details */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Personal Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{registration.fullName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mobile</Label>
                <p className="font-medium">+91 {registration.mobile}</p>
              </div>
              {registration.email && (
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{registration.email}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Temple Context */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Temple Context</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Type:</Label>
                <StatusBadge variant={registration.context === 'new_temple' ? 'primary' : 'neutral'}>
                  {registration.context === 'new_temple' ? 'New Temple' : 'Join Existing'}
                </StatusBadge>
              </div>
              {registration.context === 'new_temple' && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Temple Name:</Label>
                    <p className="font-medium">{registration.templeName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location:</Label>
                    <p className="font-medium">
                      {registration.templeLocation?.city}, {registration.templeLocation?.state}
                    </p>
                  </div>
                </>
              )}
              {registration.context === 'join_existing' && selectedTemple && (
                <div>
                  <Label className="text-muted-foreground">Temple:</Label>
                  <p className="font-medium">{selectedTemple.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTemple.location}</p>
                </div>
              )}
            </div>
          </Card>

          {/* KYC Documents */}
          {registration.kycDocuments && registration.kycDocuments.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">KYC Documents</h4>
              <div className="space-y-2">
                {registration.kycDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.type.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                        {doc.maskedValue && (
                          <p className="text-xs text-muted-foreground">Masked: {doc.maskedValue}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge variant={doc.status === 'verified' ? 'success' : 'warning'}>
                      {doc.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Consent */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Consents</h4>
            <div className="space-y-1">
              {registration.consents?.map((consent) => (
                <div key={consent.type} className="flex items-center gap-2 text-sm">
                  {consent.accepted ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>{consent.type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Rejection Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isProcessing}
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
