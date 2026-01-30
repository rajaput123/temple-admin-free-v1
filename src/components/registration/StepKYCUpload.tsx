import { useState, useRef } from 'react';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import type { KYCDocument, KYCDocumentType } from '@/types/registration';
import { validateAadhaarFormat, validatePANFormat } from '@/lib/registration-validation';

const requiredDocuments: Array<{ type: KYCDocumentType; label: string; description: string; required: boolean }> = [
  {
    type: 'aadhaar',
    label: 'Aadhaar Card',
    description: 'Upload front side of Aadhaar card (PDF, JPG, PNG, max 5MB)',
    required: true,
  },
  {
    type: 'pan',
    label: 'PAN Card',
    description: 'Upload PAN card (PDF, JPG, PNG, max 5MB)',
    required: true,
  },
  {
    type: 'citizenship',
    label: 'Citizenship / Address Proof',
    description: 'Upload citizenship certificate or address proof (PDF, JPG, PNG, max 5MB)',
    required: true,
  },
  {
    type: 'selfie',
    label: 'Selfie / Face Verification',
    description: 'Optional: Upload a clear selfie for face verification (JPG, PNG, max 5MB)',
    required: false,
  },
];

export function StepKYCUpload() {
  const { registration, uploadKYCDocument, removeKYCDocument } = useRegistration();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const uploadedDocuments = registration?.kycDocuments || [];

  const handleFileUpload = (type: KYCDocumentType, file: File | null) => {
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, JPG, or PNG files only.');
      return;
    }

    const document: KYCDocument = {
      id: `doc-${Date.now()}-${type}`,
      type,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      ...(type === 'aadhaar' && aadhaarNumber ? { maskedValue: validateAadhaarFormat(aadhaarNumber).masked } : {}),
    };

    uploadKYCDocument(document);
  };

  const handleAadhaarNumberChange = (value: string) => {
    setAadhaarNumber(value);
    const validation = validateAadhaarFormat(value);
    if (validation.valid && validation.masked) {
      // Update existing aadhaar document if uploaded
      const existingDoc = uploadedDocuments.find(d => d.type === 'aadhaar');
      if (existingDoc) {
        uploadKYCDocument({ ...existingDoc, maskedValue: validation.masked });
      }
    }
  };

  const handlePANNumberChange = (value: string) => {
    setPanNumber(value);
    validatePANFormat(value);
  };

  const getDocumentStatus = (type: KYCDocumentType) => {
    const doc = uploadedDocuments.find(d => d.type === type);
    if (!doc) return 'not_uploaded';
    return doc.status;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm font-medium text-primary mb-1">KYC Document Upload</p>
        <p className="text-xs text-muted-foreground">
          Upload required identification documents. All documents will be verified before approval.
        </p>
      </div>

      {registration?.context === 'new_temple' && (
        <>
          {/* Aadhaar Section */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Aadhaar Number <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 12-digit Aadhaar number
                </p>
              </div>
              {getDocumentStatus('aadhaar') === 'uploaded' && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <Input
              type="text"
              value={aadhaarNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                handleAadhaarNumberChange(value);
              }}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={12}
              className="h-11"
            />
            {aadhaarNumber.length === 12 && (
              <p className="text-xs text-muted-foreground">
                Masked: {validateAadhaarFormat(aadhaarNumber).masked}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input
                ref={(el) => (fileInputRefs.current['aadhaar'] = el)}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('aadhaar', e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current['aadhaar']?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Aadhaar
              </Button>
              {uploadedDocuments.find(d => d.type === 'aadhaar') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{uploadedDocuments.find(d => d.type === 'aadhaar')?.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const doc = uploadedDocuments.find(d => d.type === 'aadhaar');
                      if (doc) removeKYCDocument(doc.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* PAN Section */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  PAN Number <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 10-character PAN number
                </p>
              </div>
              {getDocumentStatus('pan') === 'uploaded' && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <Input
              type="text"
              value={panNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                handlePANNumberChange(value);
              }}
              placeholder="ABCDE1234F"
              maxLength={10}
              className="h-11"
            />
            <div className="flex items-center gap-2">
              <Input
                ref={(el) => (fileInputRefs.current['pan'] = el)}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('pan', e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current['pan']?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PAN
              </Button>
              {uploadedDocuments.find(d => d.type === 'pan') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{uploadedDocuments.find(d => d.type === 'pan')?.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const doc = uploadedDocuments.find(d => d.type === 'pan');
                      if (doc) removeKYCDocument(doc.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Citizenship Section */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Citizenship / Address Proof <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload citizenship certificate or address proof document
                </p>
              </div>
              {getDocumentStatus('citizenship') === 'uploaded' && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                ref={(el) => (fileInputRefs.current['citizenship'] = el)}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('citizenship', e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current['citizenship']?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              {uploadedDocuments.find(d => d.type === 'citizenship') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{uploadedDocuments.find(d => d.type === 'citizenship')?.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const doc = uploadedDocuments.find(d => d.type === 'citizenship');
                      if (doc) removeKYCDocument(doc.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Optional Selfie */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Selfie / Face Verification (Optional)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a clear selfie for face verification
                </p>
              </div>
              {getDocumentStatus('selfie') === 'uploaded' && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                ref={(el) => (fileInputRefs.current['selfie'] = el)}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('selfie', e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current['selfie']?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Selfie
              </Button>
              {uploadedDocuments.find(d => d.type === 'selfie') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{uploadedDocuments.find(d => d.type === 'selfie')?.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const doc = uploadedDocuments.find(d => d.type === 'selfie');
                      if (doc) removeKYCDocument(doc.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {registration?.context === 'join_existing' && (
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            KYC documents are not required for joining existing temples. The temple administrator will review your request.
          </p>
        </div>
      )}
    </div>
  );
}
