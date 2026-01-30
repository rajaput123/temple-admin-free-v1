import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegistrationProvider, useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { StepMobileVerification } from '@/components/registration/StepMobileVerification';
import { StepBasicProfile } from '@/components/registration/StepBasicProfile';
import { StepTempleContext } from '@/components/registration/StepTempleContext';
import { StepConsent } from '@/components/registration/StepConsent';
import { StepKYCUpload } from '@/components/registration/StepKYCUpload';
import { StepSubmission } from '@/components/registration/StepSubmission';

const steps = [
  { id: 0, name: 'Mobile Verification', component: StepMobileVerification },
  { id: 1, name: 'Basic Profile', component: StepBasicProfile },
  { id: 2, name: 'Temple Context', component: StepTempleContext },
  { id: 3, name: 'Consent', component: StepConsent },
  { id: 4, name: 'KYC Documents', component: StepKYCUpload },
  { id: 5, name: 'Review & Submit', component: StepSubmission },
];

function RegisterContent() {
  const navigate = useNavigate();
  const { currentStep, registration, nextStep, previousStep, goToStep, otpVerified } = useRegistration();
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    // Determine if user can proceed to next step
    if (currentStep === 0) {
      setCanProceed(otpVerified);
    } else if (currentStep === 1) {
      setCanProceed(!!registration?.fullName);
    } else if (currentStep === 2) {
      if (registration?.context === 'new_temple') {
        setCanProceed(!!(registration.templeName && registration.templeLocation?.city && registration.templeLocation?.state));
      } else {
        setCanProceed(!!registration?.templeId);
      }
    } else if (currentStep === 3) {
      setCanProceed(registration?.consentAccepted || false);
    } else if (currentStep === 4) {
      // KYC is optional for join_existing, required for new_temple
      if (registration?.context === 'join_existing') {
        setCanProceed(true);
      } else {
        const requiredDocs = ['aadhaar', 'pan', 'citizenship'];
        const uploadedDocs = registration?.kycDocuments?.map(d => d.type) || [];
        setCanProceed(requiredDocs.every(doc => uploadedDocs.includes(doc)));
      }
    } else {
      setCanProceed(true);
    }
  }, [currentStep, registration, otpVerified]);

  const CurrentStepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30 p-6">
      <div className="w-full max-w-2xl">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Temple Admin Registration
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Register as a temple administrator. Identity verification and approval required.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep
                        ? 'bg-success text-success-foreground'
                        : index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.id + 1
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 text-center ${
                      index === currentStep ? 'font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      index < currentStep ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form Card */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1">
              {steps[currentStep].name}
            </h2>
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          <div className="min-h-[300px]">
            <CurrentStepComponent />
          </div>

          {/* Navigation Buttons */}
          {!isLastStep && (
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isFirstStep) {
                    navigate('/login');
                  } else {
                    previousStep();
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {isFirstStep ? 'Back to Login' : 'Previous'}
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <RegistrationProvider>
      <RegisterContent />
    </RegistrationProvider>
  );
}
