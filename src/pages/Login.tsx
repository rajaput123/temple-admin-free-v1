import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame } from 'lucide-react';

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      // Simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      setError('');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      // For demo: Accept any OTP
      // Map mobile to demo user (for demo purposes)
      const mobileToUser: Record<string, string> = {
        '9876543210': 'admin@temple.org',
        '9876543211': 'hr@temple.org',
        '9876543212': 'priest@temple.org',
      };
      
      const email = mobileToUser[mobileNumber] || 'admin@temple.org';
      const success = await login(email, 'password');
      
      if (success) {
        // Redirect based on user role - wait for state update
        setTimeout(() => {
          // Check user role after login completes
          // For super_admin, go to platform; others go to hub
          // Index.tsx will also handle this redirect
          navigate('/hub');
        }, 100);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCountdown(60);
      setOtp('');
      setError('');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30 p-6">
      {/* Login Content */}
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Temple Management System
          </h1>
          <p className="text-sm text-gray-600">
            Sacred Management System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-background/95 backdrop-blur border border-border rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="form-field">
                <Label htmlFor="mobileNumber" className="form-label">
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter mobile number"
                  className="h-11"
                />
               
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send you a 6-digit OTP
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-normal"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
                OTP sent to +91 {mobileNumber}
              </div>

              <div className="form-field">
                <Label htmlFor="otp" className="form-label">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter OTP"
                  className="h-11 text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Enter the 6-digit code sent to your mobile
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-normal"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setMobileNumber('');
                    setError('');
                    setCountdown(0);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Change mobile number
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Need help?{' '}
            <button type="button" className="text-primary hover:underline">
              Contact support
            </button>
          </p>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              New Temple Admin?{' '}
              <Link
                to="/register"
                className="text-sm font-medium text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Registration requires identity verification and approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
