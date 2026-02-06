import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'url';
  required?: boolean;
  placeholder?: string;
}

interface DropdownWithAddProps {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  // Minimal interface
  onAdd?: (newOption: string) => void;
  // Legacy interface (for backward compatibility)
  addButtonLabel?: string;
  quickAddConfig?: {
    title: string;
    fields: FormField[];
    onSave: (data: Record<string, any>) => Promise<string>;
  };
}

export function DropdownWithAdd({
  value,
  options,
  onValueChange,
  onAdd,
  placeholder,
  addButtonLabel,
  quickAddConfig,
}: DropdownWithAddProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [quickAddData, setQuickAddData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Use minimal interface if onAdd is provided
  const useMinimalInterface = !!onAdd;

  const handleAdd = () => {
    if (useMinimalInterface) {
      if (newOption.trim()) {
        onAdd!(newOption.trim());
        onValueChange(newOption.trim());
        setNewOption('');
        setIsDialogOpen(false);
      }
    } else {
      // Legacy interface
      handleQuickAdd();
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddConfig) return;
    
    setIsSaving(true);
    try {
      const newValue = await quickAddConfig.onSave(quickAddData);
      setIsDialogOpen(false);
      setQuickAddData({});
      onValueChange(newValue);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            <Textarea
              id={field.name}
              value={quickAddData[field.name] || ''}
              onChange={(e) =>
                setQuickAddData({ ...quickAddData, [field.name]: e.target.value })
              }
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={quickAddData[field.name] || ''}
              onChange={(e) =>
                setQuickAddData({ ...quickAddData, [field.name]: parseFloat(e.target.value) || 0 })
              }
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
      case 'email':
      case 'url':
      case 'text':
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={quickAddData[field.name] || ''}
              onChange={(e) =>
                setQuickAddData({ ...quickAddData, [field.name]: e.target.value })
              }
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
            </SelectItem>
          ))}
          <div className="border-t pt-1 mt-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-left font-normal h-auto py-2 px-2 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonLabel || 'Add New'}
            </Button>
          </div>
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{quickAddConfig?.title || 'Add New Option'}</DialogTitle>
            <DialogDescription>
              {useMinimalInterface 
                ? 'Add a new option that will be available immediately.'
                : quickAddConfig?.title || 'Add a new option that will be available immediately.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {useMinimalInterface ? (
              <div className="space-y-2">
                <Label htmlFor="newOption">Option Name</Label>
                <Input
                  id="newOption"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter option name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                />
              </div>
            ) : (
              quickAddConfig?.fields ? quickAddConfig.fields.map((field) => renderField(field)) : null
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewOption('');
                setQuickAddData({});
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={useMinimalInterface ? !newOption.trim() : isSaving}
            >
              {isSaving ? 'Saving...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
