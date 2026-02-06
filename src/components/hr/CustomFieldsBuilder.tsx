import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CustomFieldDefinition, CustomFieldType } from '@/types/custom-fields';

interface CustomFieldsBuilderProps {
  value?: CustomFieldDefinition[];
  onChange: (next: CustomFieldDefinition[]) => void;
}

export function CustomFieldsBuilder({ value, onChange }: CustomFieldsBuilderProps) {
  const stableValue = useMemo(() => value ?? [], [value]);
  const [fields, setFields] = useState<CustomFieldDefinition[]>(stableValue);

  useEffect(() => {
    setFields(stableValue);
  }, [stableValue]);

  const emit = (next: CustomFieldDefinition[]) => {
    setFields(next);
    onChange(next);
  };

  const addField = () => {
    emit([
      ...fields,
      { id: `cf-${Date.now()}`, label: '', type: 'text', options: [] },
    ]);
  };

  const removeField = (id: string) => {
    emit(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<CustomFieldDefinition>) => {
    emit(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const parseOptions = (raw: string): string[] => {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Custom Fields</Label>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          <Plus className="h-4 w-4 mr-1" />
          Add Custom Field
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No custom fields. Click “Add Custom Field” to add one.
        </p>
      )}

      {fields.map((field) => {
        const needsOptions = field.type === 'dropdown' || field.type === 'radio';
        return (
          <div key={field.id} className="rounded-md border border-border p-3 space-y-3">
            <div className="flex items-start gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="e.g., Uniform Size"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(nextType) => {
                      const type = nextType as CustomFieldType;
                      updateField(field.id, {
                        type,
                        options: type === 'dropdown' || type === 'radio' ? (field.options ?? []) : [],
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeField(field.id)}
                aria-label="Remove custom field"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {needsOptions && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Options (comma separated)</Label>
                <Input
                  value={(field.options ?? []).join(', ')}
                  onChange={(e) => updateField(field.id, { options: parseOptions(e.target.value) })}
                  placeholder="e.g., S, M, L, XL"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

