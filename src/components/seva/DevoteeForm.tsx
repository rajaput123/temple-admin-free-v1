import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DevoteeFormProps {
  devoteeName: string;
  devoteeMobile: string;
  onNameChange: (name: string) => void;
  onMobileChange: (mobile: string) => void;
}

export function DevoteeForm({
  devoteeName,
  devoteeMobile,
  onNameChange,
  onMobileChange,
}: DevoteeFormProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Step 4: Devotee Details</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="devotee-name" className="text-xs text-muted-foreground">
            Devotee Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="devotee-name"
            value={devoteeName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter devotee name"
            className="mt-1"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="devotee-mobile" className="text-xs text-muted-foreground">
            Mobile Number (Optional)
          </Label>
          <Input
            id="devotee-mobile"
            value={devoteeMobile}
            onChange={(e) => onMobileChange(e.target.value)}
            placeholder="+91 98765 43210"
            className="mt-1"
            type="tel"
          />
        </div>
      </div>
    </div>
  );
}
