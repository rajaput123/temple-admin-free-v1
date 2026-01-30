import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { validateRegistration } from '@/lib/registration-validation';

export function StepSubmission() {
  const navigate = useNavigate();
  const { registration, submit } = useRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; registration?: any; errors?: string[] } | null>(null);

  const validation = registration ? validateRegistration(registration) : { valid: false, errors: ['No registration data'] };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    const result = await submit();
    setSubmitResult(result);
    setIsSubmitting(false);
  };

  // Redirect to registration status page after successful submission
  useEffect(() => {
    if (submitResult?.success && submitResult.registration?.id) {
      const timer = setTimeout(() => {
        navigate(`/registration-status/${submitResult.registration.id}`);
      }, 2500); // Show success message for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [submitResult, navigate]);

  if (submitResult?.success) {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-lg bg-success/10 border border-success/20 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-success mb-2">Registration Submitted Successfully!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your temple admin registration has been submitted and is now pending review.
          </p>
          <div className="space-y-2 text-sm text-left bg-background p-4 rounded border">
            <p><strong>Registration ID:</strong> {submitResult.registration?.id}</p>
            <p><strong>Status:</strong> {submitResult.registration?.status}</p>
            {submitResult.registration?.status === 'KYC_PENDING' && (
              <p className="text-muted-foreground mt-2">
                Your documents are under review. You will be notified once the review is complete.
              </p>
            )}
            {submitResult.registration?.status === 'PENDING_APPROVAL' && (
              <p className="text-muted-foreground mt-2">
                Your request has been sent to the temple administrators for approval.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Redirecting to registration status page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Review Your Registration</h3>
        <p className="text-sm text-muted-foreground">
          Please review all information before submitting. You can go back to make changes.
        </p>
      </div>

      {registration && (
        <div className="space-y-4">
          {/* Personal Details */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Personal Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{registration.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-medium">+91 {registration.mobile}</span>
              </div>
              {registration.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{registration.email}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Temple Context */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Temple Context</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">
                  {registration.context === 'new_temple' ? 'Register New Temple' : 'Join Existing Temple'}
                </span>
              </div>
              {registration.context === 'new_temple' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temple Name:</span>
                    <span className="font-medium">{registration.templeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">
                      {registration.templeLocation?.city}, {registration.templeLocation?.state}
                    </span>
                  </div>
                </>
              )}
              {registration.context === 'join_existing' && registration.templeId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temple ID:</span>
                  <span className="font-medium">{registration.templeId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Consent */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Consents</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {registration.consentAccepted ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className={registration.consentAccepted ? 'text-success' : 'text-destructive'}>
                  {registration.consentAccepted ? 'All consents accepted' : 'Consents not accepted'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {registration.consents?.length || 0} of 5 consents accepted
              </p>
            </div>
          </Card>

          {/* KYC Documents */}
          {registration.context === 'new_temple' && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">KYC Documents</h4>
              <div className="space-y-2 text-sm">
                {registration.kycDocuments && registration.kycDocuments.length > 0 ? (
                  <div className="space-y-1">
                    {registration.kycDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{doc.type.toUpperCase()}: {doc.fileName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded</p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Validation Errors */}
      {!validation.valid && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h4 className="font-medium text-destructive">Please fix the following errors:</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {submitResult && !submitResult.success && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h4 className="font-medium text-destructive">Submission Failed</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
            {submitResult.errors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Go back to previous step
            window.history.back();
          }}
        >
          Go Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!validation.valid || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </div>
    </div>
  );
}
