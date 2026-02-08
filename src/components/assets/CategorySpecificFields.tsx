import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import type { CategoryFieldConfig } from '@/lib/assets/category-field-config';

interface CategorySpecificFieldsProps {
  fields: CategoryFieldConfig[];
  values: Record<string, string | number | File>;
  onChange: (key: string, value: string | number | File | '') => void;
}

export function CategorySpecificFields({
  fields,
  values,
  onChange,
}: CategorySpecificFieldsProps) {
  if (fields.length === 0) return null;

  const renderField = (field: CategoryFieldConfig) => {
    const value = values[field.key] || '';

    switch (field.type) {
      case 'number':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.unit && <span className="text-xs text-muted-foreground ml-1">({field.unit})</span>}
            </Label>
            <Input
              id={field.key}
              type="number"
              value={value}
              onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.key}
              type="date"
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => onChange(field.key, val)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={String(value)}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              required={field.required}
            />
          </div>
        );

      case 'file':
        const fileValue = value instanceof File ? value : (typeof value === 'string' && value ? 'uploaded' : '');
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={field.key}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(field.key, file);
                  }
                }}
                className="flex-1"
              />
              {fileValue && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {value instanceof File ? value.name : 'Uploaded'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onChange(field.key, '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.unit && <span className="text-xs text-muted-foreground ml-1">({field.unit})</span>}
            </Label>
            <Input
              id={field.key}
              type="text"
              value={String(value)}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <Label className="text-sm font-medium">Category-Specific Details</Label>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}
