import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  AlertCircle, 
  Loader2,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import type { SocialPlatform } from '@/types/pr-communication';
import '@/styles/pr-communication.css';

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    platform: SocialPlatform;
    accountName: string;
    accountHandle: string;
    isOfficial: boolean;
  }) => void;
}

const platformOptions: { value: SocialPlatform; label: string; icon: any }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
];

export function CreateChannelModal({ open, onOpenChange, onSave }: CreateChannelModalProps) {
  const [platform, setPlatform] = useState<SocialPlatform | ''>('');
  const [accountName, setAccountName] = useState('');
  const [accountHandle, setAccountHandle] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [errors, setErrors] = useState<{
    platform?: string;
    accountName?: string;
    accountHandle?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  const selectedPlatform = platformOptions.find(p => p.value === platform);
  const PlatformIcon = selectedPlatform?.icon || Share2;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!platform) {
      newErrors.platform = 'Please select a platform';
    }

    if (!accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (!accountHandle.trim()) {
      newErrors.accountHandle = 'Account handle is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

    onSave({
      platform: platform as SocialPlatform,
      accountName: accountName.trim(),
      accountHandle: accountHandle.trim(),
      isOfficial,
    });

    // Reset form
    setPlatform('');
    setAccountName('');
    setAccountHandle('');
    setIsOfficial(false);
    setErrors({});
    setIsSaving(false);
  };

  const handleClose = () => {
    if (!isSaving) {
      setPlatform('');
      setAccountName('');
      setAccountHandle('');
      setIsOfficial(false);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Create Channel
          </DialogTitle>
          <DialogDescription>
            Add a new social media channel to manage your presence
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Platform <span className="text-destructive">*</span>
            </Label>
            <Select
              value={platform}
              onValueChange={(value) => {
                setPlatform(value as SocialPlatform);
                if (errors.platform) {
                  setErrors(prev => ({ ...prev, platform: undefined }));
                }
              }}
            >
              <SelectTrigger className={`w-full ${errors.platform ? 'border-destructive' : ''}`}>
                <div className="flex items-center gap-2">
                  <PlatformIcon className="h-4 w-4" />
                  <SelectValue placeholder="Select a platform..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.platform && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.platform}</span>
              </div>
            )}
          </div>

          {/* Account Name */}
          <div className="space-y-3">
            <Label htmlFor="accountName" className="text-base font-semibold">
              Account Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                if (errors.accountName) {
                  setErrors(prev => ({ ...prev, accountName: undefined }));
                }
              }}
              placeholder="e.g., Temple Harmony Official"
              className={errors.accountName ? 'border-destructive' : ''}
            />
            {errors.accountName && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.accountName}</span>
              </div>
            )}
          </div>

          {/* Account Handle */}
          <div className="space-y-3">
            <Label htmlFor="accountHandle" className="text-base font-semibold">
              Account Handle <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              <Input
                id="accountHandle"
                value={accountHandle}
                onChange={(e) => {
                  setAccountHandle(e.target.value);
                  if (errors.accountHandle) {
                    setErrors(prev => ({ ...prev, accountHandle: undefined }));
                  }
                }}
                placeholder="e.g., @templeharmony or templeharmony"
                className={errors.accountHandle ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Enter the username or handle for this account (with or without @)
              </p>
            </div>
            {errors.accountHandle && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.accountHandle}</span>
              </div>
            )}
          </div>

          {/* Official Account Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Account Type
              </Label>
              <Badge variant={isOfficial ? 'default' : 'secondary'}>
                {isOfficial ? 'Official' : 'Regular'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOfficial(!isOfficial)}
                className={`flex items-center gap-2 p-4 border-2 rounded-lg transition-all flex-1 ${
                  isOfficial
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  isOfficial ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                }`}>
                  {isOfficial && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="font-medium">Mark as Official Account</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Official accounts are verified and have special permissions
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !platform || !accountName.trim() || !accountHandle.trim()}
            className="gap-2 min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Create Channel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
