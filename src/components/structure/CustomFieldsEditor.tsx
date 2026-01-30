import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface CustomFieldsEditorProps {
  customFields?: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
}

export function CustomFieldsEditor({ customFields = {}, onChange }: CustomFieldsEditorProps) {
  const [fields, setFields] = useState<Array<{ key: string; value: string }>>(() => {
    return Object.entries(customFields).map(([key, value]) => ({ key, value }));
  });

  const addField = () => {
    const newFields = [...fields, { key: '', value: '' }];
    setFields(newFields);
    updateFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    updateFields(newFields);
  };

  const updateField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = fields.map((f, i) => i === index ? { ...f, [field]: value } : f);
    setFields(newFields);
    updateFields(newFields);
  };

  const updateFields = (newFields: Array<{ key: string; value: string }>) => {
    const fieldsObj: Record<string, string> = {};
    newFields.forEach(f => {
      if (f.key.trim()) {
        fieldsObj[f.key.trim()] = f.value;
      }
    });
    onChange(fieldsObj);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Custom Fields</Label>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          <Plus className="h-4 w-4 mr-1" />
          Add Field
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Field name"
            value={field.key}
            onChange={(e) => updateField(index, 'key', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={field.value}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeField(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No custom fields. Click "Add Field" to add one.</p>
      )}
    </div>
  );
}
