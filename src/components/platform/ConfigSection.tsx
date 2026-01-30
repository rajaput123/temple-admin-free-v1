import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfigSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ConfigSection({ title, description, children, onSave, onCancel }: ConfigSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {(onSave || onCancel) && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {onSave && (
              <Button onClick={onSave}>
                Save
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ConfigSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ConfigSwitch({ label, description, checked, onCheckedChange }: ConfigSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

interface ConfigInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  description?: string;
}

export function ConfigInput({ label, value, onChange, type = 'text', placeholder, description }: ConfigInputProps) {
  return (
    <div>
      <Label>{label}</Label>
      {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

interface ConfigSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  description?: string;
}

export function ConfigSelect({ label, value, onChange, options, description }: ConfigSelectProps) {
  return (
    <div>
      <Label>{label}</Label>
      {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
