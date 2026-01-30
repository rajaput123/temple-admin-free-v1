import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit, MessageSquare } from 'lucide-react';
import { CrowdsourcedInfo, InfoStatus } from '@/data/crowdsourced-info';

interface InformationValidationProps {
  info: CrowdsourcedInfo;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string) => void;
  onEdit: (id: string) => void;
  onRequestMore: (id: string, message: string) => void;
}

export function InformationValidation({
  info,
  onApprove,
  onReject,
  onEdit,
  onRequestMore,
}: InformationValidationProps) {
  const [validationNotes, setValidationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  const getStatusBadge = (status: InfoStatus) => {
    const variants: Record<InfoStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      needs_review: 'outline',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      devotee: 'bg-blue-100 text-blue-800',
      admin: 'bg-green-100 text-green-800',
      public: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[source] || 'bg-gray-100 text-gray-800'}>{source}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{info.templeName}</CardTitle>
            <CardDescription>{info.location}</CardDescription>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(info.status)}
            {getSourceBadge(info.source)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Information Type</Label>
          <p className="text-sm text-muted-foreground capitalize">{info.infoType.replace('_', ' ')}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Submitted Data</Label>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(info.data, null, 2)}
            </pre>
          </div>
        </div>

        {info.contributorName && (
          <div>
            <Label className="text-sm font-medium">Contributor</Label>
            <p className="text-sm text-muted-foreground">
              {info.contributorName}
              {info.contributorEmail && ` (${info.contributorEmail})`}
            </p>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Submitted At</Label>
          <p className="text-sm text-muted-foreground">
            {new Date(info.submittedAt).toLocaleString()}
          </p>
        </div>

        {info.status === 'pending' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="validationNotes">Validation Notes (Optional)</Label>
              <Textarea
                id="validationNotes"
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder="Add notes about this validation..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onApprove(info.id, validationNotes)}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(info.id)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={2}
              />
              <Button
                variant="destructive"
                onClick={() => onReject(info.id, rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="mt-2 w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>

            <div>
              <Label htmlFor="requestMessage">Request More Information</Label>
              <Textarea
                id="requestMessage"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="What additional information is needed?"
                rows={2}
              />
              <Button
                variant="outline"
                onClick={() => onRequestMore(info.id, requestMessage)}
                disabled={!requestMessage.trim()}
                className="mt-2 w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request More Info
              </Button>
            </div>
          </div>
        )}

        {info.status === 'approved' && info.validationNotes && (
          <div>
            <Label className="text-sm font-medium">Validation Notes</Label>
            <p className="text-sm text-muted-foreground">{info.validationNotes}</p>
          </div>
        )}

        {info.status === 'rejected' && info.rejectionReason && (
          <div>
            <Label className="text-sm font-medium">Rejection Reason</Label>
            <p className="text-sm text-destructive">{info.rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
