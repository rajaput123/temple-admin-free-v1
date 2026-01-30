import { useState } from 'react';
import { Offering } from '@/types/rituals';
import { Slot } from '@/lib/slot-availability';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { canBookSlot } from '@/lib/slot-availability';
import { FestivalEvent } from '@/types/rituals';
import { SevaBooking } from '@/types/seva';

interface DateSlotSelectorProps {
  offering: Offering | null;
  selectedDate: Date | undefined;
  selectedSlot: { startTime: string; endTime: string } | null;
  slots: Slot[];
  bookings: SevaBooking[];
  festivals: FestivalEvent[];
  onDateSelect: (date: Date | undefined) => void;
  onSlotSelect: (slot: { startTime: string; endTime: string } | null) => void;
}

export function DateSlotSelector({
  offering,
  selectedDate,
  selectedSlot,
  slots,
  bookings,
  festivals,
  onDateSelect,
  onSlotSelect,
}: DateSlotSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!offering) {
    return (
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Step 3: Select Date & Slot</h3>
        <p className="text-sm text-muted-foreground">Please select an offering first</p>
      </div>
    );
  }

  const handleSlotClick = (slot: Slot) => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const validation = canBookSlot(offering, dateStr, slot.startTime, bookings, festivals);
    
    if (validation.canBook) {
      onSlotSelect({ startTime: slot.startTime, endTime: slot.endTime });
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Step 3: Select Date & Slot</h3>
      
      {/* Date Picker */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-2 block">Select Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateSelect(date);
                setCalendarOpen(false);
              }}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Slots Grid */}
      {selectedDate ? (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Available Slots</Label>
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No slots available for this date
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {slots.map((slot, index) => {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const validation = canBookSlot(offering, dateStr, slot.startTime, bookings, festivals);
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const isDisabled = !slot.isAvailable || !validation.canBook;

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSlotClick(slot)}
                    className={cn(
                      "p-3 rounded-lg border text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : isDisabled
                        ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                        : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                    )}
                  >
                    <div className="font-medium">{slot.startTime}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {slot.availableCount} / {slot.totalCapacity}
                    </div>
                    {slot.isClosed && (
                      <div className="text-xs text-destructive mt-1">Closed</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Please select a date first
        </p>
      )}
    </div>
  );
}
