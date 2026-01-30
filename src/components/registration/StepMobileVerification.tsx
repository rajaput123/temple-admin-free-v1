import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkMobileExists } from '@/lib/mobile-verification';

export function StepMobileVerification() {
  const navigate = useNavigate();
  const {
    mobile,
    otp,
    otpSent,
    otpVerified,
    countdown,
    setMobile,
    sendOTPToMobile,
    verifyOTPCode,
    resendOTP,
  } = useRegistration();

  const [localMobile, setLocalMobile] = useState(mobile);
  const [localOtp, setLocalOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        // Timer is managed by context
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!localMobile || localMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Check if mobile exists
    if (checkMobileExists(localMobile)) {
      setError('This mobile number is already registered. Please login instead.');
      setTimeout(() => {
        navigate('/login', { state: { mobile: localMobile } });
      }, 2000);
      return;
    }

    setIsLoading(true);
    setMobile(localMobile);
    
    const result = await sendOTPToMobile();
    
    if (!result.success) {
      setError(result.message || 'Failed to send OTP. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!localOtp || localOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    const result = await verifyOTPCode(localOtp);
    
    if (!result.success) {
      setError(result.message || 'Invalid OTP. Please try again.');
    } else if (result.shouldRedirect) {
      setError('This mobile number is already registered. Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { mobile: localMobile } });
      }, 2000);
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    setIsLoading(true);
    await resendOTP();
    setLocalOtp('');
    setIsLoading(false);
  };

  if (otpVerified) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-primary/10 text-primary text-sm text-center">
          ✓ Mobile number verified: +91 {mobile}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!otpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={localMobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setLocalMobile(value);
                setError('');
              }}
              placeholder="Enter 10-digit mobile number"
              required
              className="h-11"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              We'll send you a 6-digit OTP for verification
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || localMobile.length !== 10}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm text-center">
            OTP sent to +91 {mobile}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">
              Enter OTP <span className="text-destructive">*</span>
            </Label>
            <Input
              id="otp"
              type="text"
              value={localOtp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setLocalOtp(value);
                setError('');
              }}
              placeholder="000000"
              required
              className="h-11 text-center text-2xl tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code sent to your mobile
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || localOtp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setLocalMobile('');
                setLocalOtp('');
                setError('');
                setMobile('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Change mobile number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
