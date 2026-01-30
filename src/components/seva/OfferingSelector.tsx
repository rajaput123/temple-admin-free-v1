import { Offering } from '@/types/rituals';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Clock, Users } from 'lucide-react';
import { offeringTypeLabels } from '@/types/rituals';

interface OfferingSelectorProps {
  offerings: Offering[];
  selectedOfferingId: string | null;
  onSelect: (offeringId: string) => void;
}

export function OfferingSelector({ offerings, selectedOfferingId, onSelect }: OfferingSelectorProps) {
  const activeOfferings = offerings.filter(o => o.status === 'active');

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Step 2: Select Offering</h3>
      {activeOfferings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No offerings available for selected sacred
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeOfferings.map((offering) => (
            <Card
              key={offering.id}
              className={cn(
                "cursor-pointer transition-colors hover:border-primary",
                selectedOfferingId === offering.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
              onClick={() => onSelect(offering.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{offering.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {offeringTypeLabels[offering.type]}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {offering.startTime && offering.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{offering.startTime} - {offering.endTime}</span>
                        </div>
                      )}
                      {offering.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Capacity: {offering.capacity}</span>
                        </div>
                      )}
                      <div className="font-medium text-foreground mt-2">
                        Amount: ₹{offering.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  {selectedOfferingId === offering.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
