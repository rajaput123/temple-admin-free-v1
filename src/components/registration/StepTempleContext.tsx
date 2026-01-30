import { useState, useEffect } from 'react';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { dummyTemples } from '@/data/temple-structure-data';
import type { Temple } from '@/types/temple-structure';

export function StepTempleContext() {
  const { registration, updateTempleContext } = useRegistration();
  const [context, setContext] = useState<'new_temple' | 'join_existing'>(registration?.context || 'new_temple');
  const [templeName, setTempleName] = useState(registration?.templeName || '');
  const [city, setCity] = useState(registration?.templeLocation?.city || '');
  const [state, setState] = useState(registration?.templeLocation?.state || '');
  const [selectedTempleId, setSelectedTempleId] = useState(registration?.templeId || '');

  const templeOptions = dummyTemples
    .filter(t => t.status === 'active')
    .map(t => ({
      value: t.id,
      label: `${t.name} - ${t.location}`,
    }));

  const selectedTemple = dummyTemples.find(t => t.id === selectedTempleId);

  useEffect(() => {
    if (context === 'new_temple') {
      updateTempleContext('new_temple', {
        templeName,
        templeLocation: { city, state },
      });
    } else {
      updateTempleContext('join_existing', {
        templeId: selectedTempleId,
      });
    }
  }, [context, templeName, city, state, selectedTempleId, updateTempleContext]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-medium">Temple Context <span className="text-destructive">*</span></Label>
        <RadioGroup value={context} onValueChange={(value) => setContext(value as 'new_temple' | 'join_existing')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new_temple" id="new_temple" />
            <Label htmlFor="new_temple" className="font-normal cursor-pointer">
              Register New Temple
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="join_existing" id="join_existing" />
            <Label htmlFor="join_existing" className="font-normal cursor-pointer">
              Join Existing Temple
            </Label>
          </div>
        </RadioGroup>
      </div>

      {context === 'new_temple' ? (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="templeName" className="text-sm font-medium">
              Temple Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="templeName"
              type="text"
              value={templeName}
              onChange={(e) => setTempleName(e.target.value)}
              placeholder="Enter temple name"
              required
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                State <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state"
                required
                className="h-11"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The temple will be created in DRAFT status and activated after approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Select Temple <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={templeOptions}
              value={selectedTempleId}
              onChange={(value) => setSelectedTempleId(value)}
              placeholder="Search and select temple"
            />
          </div>

          {selectedTemple && (
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-sm font-medium">{selectedTemple.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedTemple.location}</p>
              {selectedTemple.deity && (
                <p className="text-xs text-muted-foreground mt-1">Deity: {selectedTemple.deity}</p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Your request will be sent to existing temple administrators for approval.
          </p>
        </div>
      )}
    </div>
  );
}
