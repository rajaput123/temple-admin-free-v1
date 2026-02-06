import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

// Backward compatible CustomField interface
export interface CustomField {
  id: string;
  name: string;
  value: string;
  // Legacy properties (optional for backward compatibility)
  type?: 'text' | 'number' | 'date' | 'boolean' | 'dropdown' | 'url' | 'email';
  required?: boolean;
  options?: string[];
}

interface CustomFieldsProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  // Legacy props for backward compatibility
  initialCustomFields?: CustomField[];
  onCustomFieldsChange?: (fields: CustomField[]) => void;
}

export function CustomFields({ 
  fields: propsFields, 
  onChange: propsOnChange,
  initialCustomFields,
  onCustomFieldsChange 
}: CustomFieldsProps) {
  // Support both prop patterns
  const fields = propsFields || initialCustomFields || [];
  const onChange = propsOnChange || onCustomFieldsChange || (() => {});

  const addField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      name: '',
      value: '',
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onChange(
      fields.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
          <p className="text-sm mb-2">No custom fields added</p>
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Field
          </Button>
        </div>
      )}

      {fields.map((field) => (
        <div
          key={field.id}
          className="p-4 border rounded-lg bg-gray-50/50 space-y-3 relative group"
        >
          <button
            type="button"
            onClick={() => removeField(field.id)}
            className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Name</Label>
              <Input
                value={field.name || ''}
                onChange={(e) => updateField(field.id, { name: e.target.value })}
                placeholder="e.g., Related Festival ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Field Value</Label>
              <Input
                value={field.value || ''}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                placeholder="Enter value"
              />
            </div>
          </div>
        </div>
      ))}

      {fields.length > 0 && (
        <Button type="button" variant="outline" onClick={addField} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      )}
    </div>
  );
}
