import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  addNewLabel?: string;
  onAddNew?: (name: string) => Promise<Option> | Option;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  addNewLabel = "Add New",
  onAddNew,
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleAddNew = async () => {
    if (!newItemName.trim() || !onAddNew) return;
    
    setIsAdding(true);
    try {
      const newOption = await onAddNew(newItemName.trim());
      onChange(newOption.value);
      setAddModalOpen(false);
      setNewItemName('');
      setOpen(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              className
            )}
          >
            <span className="truncate">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <ScrollArea className="max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent"
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 text-left">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {onAddNew && (
            <div className="border-t p-1">
              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => {
                  setAddModalOpen(true);
                  setNewItemName(search);
                }}
              >
                <Plus className="h-4 w-4" />
                {addNewLabel}
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Add New Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{addNewLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="form-field">
              <Label htmlFor="new-item-name">Name</Label>
              <Input
                id="new-item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter name..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNew}
              disabled={!newItemName.trim() || isAdding}
            >
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
