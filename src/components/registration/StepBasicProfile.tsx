import { useState, useEffect } from 'react';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function StepBasicProfile() {
  const { registration, updatePersonalDetails } = useRegistration();
  const [fullName, setFullName] = useState(registration?.fullName || '');
  const [email, setEmail] = useState(registration?.email || '');

  useEffect(() => {
    updatePersonalDetails(fullName, email || undefined);
  }, [fullName, email, updatePersonalDetails]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          required
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Enter your legal name as it appears on official documents
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Used for important notifications and account recovery
        </p>
      </div>
    </div>
  );
}
