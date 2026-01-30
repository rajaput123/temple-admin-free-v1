import { useParams, Link } from 'react-router-dom';
import { RegistrationStatusDisplay } from '@/components/registration/RegistrationStatus';
import { dummyRegistrations } from '@/data/registration-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

export default function RegistrationStatus() {
  const { id } = useParams<{ id: string }>();
  const registration = dummyRegistrations.find(r => r.id === id);

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30 p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-4">
              <Flame className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              Registration Not Found
            </h1>
          </div>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Registration not found.</p>
            <Link to="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30 p-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Registration Status
          </h1>
          <p className="text-sm text-gray-600 text-center">
            View your temple admin registration status
          </p>
        </div>

        <Card className="p-6">
          <RegistrationStatusDisplay
            status={registration.status}
            registrationId={registration.id}
            rejectionReason={registration.rejectionReason}
            kycDocuments={registration.kycDocuments}
          />
        </Card>

        {registration.status !== 'APPROVED' && registration.status !== 'REJECTED' && (
          <div className="mt-6 text-center">
            <Link to="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
