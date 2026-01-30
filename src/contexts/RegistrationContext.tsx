import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { 
  TempleAdminRegistration, 
  Devotee, 
  ConsentType,
  KYCDocument,
  RegistrationStatus,
} from '@/types/registration';
import { sendOTP, verifyOTP, checkMobileExists, checkMobileRegistration } from '@/lib/mobile-verification';
import { 
  createDevoteeProfile, 
  submitRegistration, 
  recordConsent,
  getClientIP,
  handleMobileCheck,
} from '@/lib/registration-workflow';
import { validateRegistration } from '@/lib/registration-validation';
import { dummyRegistrations } from '@/data/registration-data';

interface RegistrationContextType {
  // Registration state
  registration: Partial<TempleAdminRegistration> | null;
  currentStep: number;
  devotee: Devotee | null;
  
  // Mobile verification
  mobile: string;
  otp: string;
  otpSent: boolean;
  otpVerified: boolean;
  countdown: number;
  
  // Actions
  setMobile: (mobile: string) => void;
  sendOTPToMobile: () => Promise<{ success: boolean; message?: string }>;
  verifyOTPCode: (otp: string) => Promise<{ success: boolean; message?: string; shouldRedirect?: boolean }>;
  resendOTP: () => Promise<void>;
  
  // Registration steps
  updatePersonalDetails: (name: string, email?: string) => void;
  updateTempleContext: (context: 'new_temple' | 'join_existing', data: any) => void;
  acceptConsents: (consentTypes: ConsentType[]) => void;
  uploadKYCDocument: (document: KYCDocument) => void;
  removeKYCDocument: (documentId: string) => void;
  
  // Submission
  submit: () => Promise<{ success: boolean; registration?: TempleAdminRegistration; errors?: string[] }>;
  
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Reset
  reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<Partial<TempleAdminRegistration> | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [devotee, setDevotee] = useState<Devotee | null>(null);
  
  const [mobile, setMobileState] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Set mobile and check if exists
  const setMobile = useCallback((newMobile: string) => {
    setMobileState(newMobile);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
  }, []);

  // Send OTP
  const sendOTPToMobile = useCallback(async () => {
    const result = await sendOTP(mobile);
    
    if (result.success) {
      setOtpSent(true);
      setCountdown(60);
    }
    
    return result;
  }, [mobile]);

  // Verify OTP
  const verifyOTPCode = useCallback(async (otpCode: string) => {
    const result = await verifyOTP(mobile, otpCode);
    
    if (result.success) {
      setOtpVerified(true);
      setOtp(otpCode);
      
      // Check if mobile exists
      const mobileCheck = handleMobileCheck(mobile);
      if (mobileCheck.shouldRedirect) {
        return { ...result, shouldRedirect: true };
      }
      
      
      // Get or create devotee
      const currentDevotee = existingDevotee || createDevoteeProfile(mobile);
      setDevotee(currentDevotee);
      
      // Initialize registration
      setRegistration({
        mobile,
        otpVerified: true,
        otpVerifiedAt: new Date().toISOString(),
        status: 'OTP_VERIFIED',
        statusHistory: [
          {
            status: 'NEW',
            timestamp: new Date().toISOString(),
          },
          {
            status: 'OTP_VERIFIED',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        devoteeId: currentDevotee.id,
      });
      
      // Move to next step
      setCurrentStep(1);
    }
    
    return result;
  }, [mobile, devotee]);

  // Resend OTP
  const resendOTP = useCallback(async () => {
    if (countdown > 0) return;
    
    await sendOTPToMobile();
  }, [countdown, sendOTPToMobile]);

  // Update personal details
  const updatePersonalDetails = useCallback((name: string, email?: string) => {
    setRegistration(prev => ({
      ...prev,
      fullName: name,
      email,
      devoteeId: devotee?.id || prev?.devoteeId || '',
    }));
  }, [devotee]);

  // Update temple context
  const updateTempleContext = useCallback((context: 'new_temple' | 'join_existing', data: any) => {
    setRegistration(prev => ({
      ...prev,
      context,
      ...(context === 'new_temple' ? {
        templeName: data.templeName,
        templeLocation: data.templeLocation,
      } : {
        templeId: data.templeId,
      }),
    }));
  }, []);

  // Accept consents
  const acceptConsents = useCallback((consentTypes: ConsentType[]) => {
    const ipAddress = getClientIP();
    const consents = recordConsent(consentTypes, ipAddress);
    
    setRegistration(prev => ({
      ...prev,
      consents,
      consentAccepted: true,
      consentAcceptedAt: new Date().toISOString(),
      status: 'CONSENT_ACCEPTED',
      statusHistory: [
        ...(prev?.statusHistory || []),
        {
          status: 'CONSENT_ACCEPTED',
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  // Upload KYC document
  const uploadKYCDocument = useCallback((document: KYCDocument) => {
    setRegistration(prev => {
      const existingDocs = prev?.kycDocuments || [];
      const updatedDocs = [...existingDocs.filter(d => d.type !== document.type), document];
      
      return {
        ...prev,
        kycDocuments: updatedDocs,
      };
    });
  }, []);

  // Remove KYC document
  const removeKYCDocument = useCallback((documentId: string) => {
    setRegistration(prev => ({
      ...prev,
      kycDocuments: (prev?.kycDocuments || []).filter(d => d.id !== documentId),
    }));
  }, []);

  // Submit registration
  const submit = useCallback(async () => {
    if (!registration) {
      return { success: false, errors: ['Registration data not found'] };
    }
    
    // Validate
    const validation = validateRegistration(registration);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    
    // Ensure devotee ID is set
    if (!registration.devoteeId && devotee) {
      registration.devoteeId = devotee.id;
    }
    
    // Submit
    const submittedRegistration = submitRegistration(registration);
    
    // Store in dummy data (in production, this would be an API call)
    dummyRegistrations.push(submittedRegistration);
    
    setRegistration(submittedRegistration);
    
    return { success: true, registration: submittedRegistration };
  }, [registration, devotee]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  // Reset
  const reset = useCallback(() => {
    setRegistration(null);
    setCurrentStep(0);
    setDevotee(null);
    setMobileState('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setCountdown(0);
  }, []);

  return (
    <RegistrationContext.Provider
      value={{
        registration,
        currentStep,
        devotee,
        mobile,
        otp,
        otpSent,
        otpVerified,
        countdown,
        setMobile,
        sendOTPToMobile,
        verifyOTPCode,
        resendOTP,
        updatePersonalDetails,
        updateTempleContext,
        acceptConsents,
        uploadKYCDocument,
        removeKYCDocument,
        submit,
        goToStep,
        nextStep,
        previousStep,
        reset,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}
