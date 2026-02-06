import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CustomFieldDefinition } from '@/types/custom-fields';

interface CustomFieldsRendererProps {
  definitions: CustomFieldDefinition[];
  values: Record<string, string>;
  onChange: (nextValues: Record<string, string>) => void;
}

export function CustomFieldsRenderer({ definitions, values, onChange }: CustomFieldsRendererProps) {
  if (!definitions.length) return null;

  const update = (id: string, value: string) => {
    onChange({ ...values, [id]: value });
  };

  return (
    <div className="space-y-4">
      {definitions.map((def) => {
        const value = values[def.id] ?? '';

        if (def.type === 'dropdown' || def.type === 'radio') {
          const options = def.options ?? [];
          return (
            <div key={def.id} className="form-field">
              <Label className="form-label">{def.label}</Label>
              <Select value={value} onValueChange={(v) => update(def.id, v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={def.id} className="form-field">
            <Label className="form-label">{def.label}</Label>
            <Input value={value} onChange={(e) => update(def.id, e.target.value)} placeholder="Enter value" />
          </div>
        );
      })}
    </div>
  );
}

