import { Sacred } from '@/types/temple-structure';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SacredSelectorProps {
  sacreds: Sacred[];
  selectedSacredId: string | null;
  onSelect: (sacredId: string) => void;
}

export function SacredSelector({ sacreds, selectedSacredId, onSelect }: SacredSelectorProps) {
  const activeSacreds = sacreds.filter(s => s.status === 'active');

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Step 1: Select Sacred</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeSacreds.map((sacred) => (
          <Card
            key={sacred.id}
            className={cn(
              "cursor-pointer transition-colors hover:border-primary",
              selectedSacredId === sacred.id
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
            onClick={() => onSelect(sacred.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{sacred.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {sacred.description}
                  </p>
                </div>
                {selectedSacredId === sacred.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {activeSacreds.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No active sacred items available
        </p>
      )}
    </div>
  );
}
