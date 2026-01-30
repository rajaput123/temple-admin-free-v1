import { useState, useEffect } from 'react';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ConsentType } from '@/types/registration';

const consentTypes: Array<{ type: ConsentType; label: string; description: string }> = [
  {
    type: 'sole_responsibility',
    label: 'Sole Responsibility for Temple Administration',
    description: 'I acknowledge that I am solely responsible for all temple administration activities, decisions, and their consequences.',
  },
  {
    type: 'data_accuracy',
    label: 'Accuracy of Data & Financial Reporting',
    description: 'I commit to maintaining accurate data and financial records, and will be responsible for all reporting requirements.',
  },
  {
    type: 'legal_compliance',
    label: 'Legal and Regulatory Compliance',
    description: 'I understand and agree to comply with all applicable laws, regulations, and temple management guidelines.',
  },
  {
    type: 'terms_of_service',
    label: 'Terms of Service',
    description: 'I have read and agree to the Terms of Service governing the use of this platform.',
  },
  {
    type: 'privacy_policy',
    label: 'Data Privacy Policy',
    description: 'I have read and agree to the Data Privacy Policy regarding collection and use of personal information.',
  },
];

export function StepConsent() {
  const { registration, acceptConsents } = useRegistration();
  const [acceptedConsents, setAcceptedConsents] = useState<Set<ConsentType>>(
    new Set(registration?.consents?.map(c => c.type) || [])
  );

  useEffect(() => {
    if (acceptedConsents.size === consentTypes.length) {
      acceptConsents(Array.from(acceptedConsents));
    }
  }, [acceptedConsents, acceptConsents]);

  const handleConsentChange = (type: ConsentType, checked: boolean) => {
    const newSet = new Set(acceptedConsents);
    if (checked) {
      newSet.add(type);
    } else {
      newSet.delete(type);
    }
    setAcceptedConsents(newSet);
  };

  const allAccepted = acceptedConsents.size === consentTypes.length;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm font-medium text-primary mb-1">Important: Consent Required</p>
        <p className="text-xs text-muted-foreground">
          All consents must be accepted to proceed with temple admin registration. These consents are legally binding.
        </p>
      </div>

      <div className="space-y-4">
        {consentTypes.map((consent) => {
          const isAccepted = acceptedConsents.has(consent.type);
          return (
            <div key={consent.type} className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id={consent.type}
                checked={isAccepted}
                onCheckedChange={(checked) => handleConsentChange(consent.type, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={consent.type}
                  className="text-sm font-medium cursor-pointer"
                >
                  {consent.label} <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">{consent.description}</p>
                {(consent.type === 'terms_of_service' || consent.type === 'privacy_policy') && (
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // In production, open terms/privacy pages
                    }}
                  >
                    View {consent.type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allAccepted && (
        <div className="p-3 rounded-lg bg-success/10 text-success text-sm text-center">
          ✓ All consents accepted
        </div>
      )}
    </div>
  );
}
