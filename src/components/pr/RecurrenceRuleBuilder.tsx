import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import type { RecurrenceRule } from '@/types/pr-communication';

interface RecurrenceRuleBuilderProps {
  value?: RecurrenceRule;
  onChange: (rule: RecurrenceRule | null) => void;
}

export function RecurrenceRuleBuilder({ value, onChange }: RecurrenceRuleBuilderProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>(value?.type || 'daily');
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek || []);
  const [dayOfMonth, setDayOfMonth] = useState(value?.dayOfMonth || 1);
  const [endDate, setEndDate] = useState(value?.endDate || '');
  const [occurrenceCount, setOccurrenceCount] = useState(value?.endAfter || 0);
  const [endType, setEndType] = useState<'never' | 'date' | 'count'>(value?.endDate ? 'date' : value?.endAfter ? 'count' : 'never');

  const handleFrequencyChange = (freq: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom') => {
    setFrequency(freq);
    updateRule(freq, interval, daysOfWeek, dayOfMonth, endType, endDate, occurrenceCount);
  };

  const handleIntervalChange = (int: number) => {
    setInterval(int);
    updateRule(frequency, int, daysOfWeek, dayOfMonth, endType, endDate, occurrenceCount);
  };

  const handleDayToggle = (day: number) => {
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter(d => d !== day)
      : [...daysOfWeek, day].sort();
    setDaysOfWeek(newDays);
    updateRule(frequency, interval, newDays, dayOfMonth, endType, endDate, occurrenceCount);
  };

  const handleEndTypeChange = (type: 'never' | 'date' | 'count') => {
    setEndType(type);
    updateRule(frequency, interval, daysOfWeek, dayOfMonth, type, endDate, occurrenceCount);
  };

  const updateRule = (
    freq: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    int: number,
    days: number[],
    day: number,
    end: 'never' | 'date' | 'count',
    date: string,
    count: number
  ) => {
    const rule: RecurrenceRule = {
      type: freq,
      interval: int,
      ...(freq === 'weekly' && days.length > 0 && { daysOfWeek: days }),
      ...(freq === 'monthly' && { dayOfMonth: day }),
      ...(end === 'date' && date && { endDate: date }),
      ...(end === 'count' && count > 0 && { endAfter: count }),
    };
    onChange(rule);
  };

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  // Calculate next occurrences preview
  const getNextOccurrences = (): string[] => {
    const occurrences: string[] = [];
    const today = new Date();
    let current = new Date(today);
    let count = 0;
    const maxPreview = 5;

    while (count < maxPreview) {
      if (frequency === 'daily') {
        current.setDate(current.getDate() + interval);
      } else if (frequency === 'weekly') {
        if (daysOfWeek.length > 0) {
          const nextDay = daysOfWeek.find(d => d > current.getDay()) || daysOfWeek[0];
          const daysToAdd = nextDay > current.getDay() 
            ? nextDay - current.getDay() 
            : 7 - current.getDay() + nextDay;
          current.setDate(current.getDate() + daysToAdd);
        } else {
          current.setDate(current.getDate() + (7 * interval));
        }
      } else if (frequency === 'monthly') {
        current.setMonth(current.getMonth() + interval);
        current.setDate(dayOfMonth);
      } else if (frequency === 'yearly') {
        current.setFullYear(current.getFullYear() + interval);
      }

      if (endType === 'date' && endDate && current > new Date(endDate)) break;
      if (endType === 'count' && occurrenceCount > 0 && count >= occurrenceCount) break;

      occurrences.push(current.toLocaleDateString());
      count++;
    }

    return occurrences;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">Recurrence Rule</CardTitle>
        <CardDescription>Configure how often this message should be sent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repeat Every</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground capitalize">
                {frequency === 'daily' ? 'day(s)' : 
                 frequency === 'weekly' ? 'week(s)' :
                 frequency === 'monthly' ? 'month(s)' : 'year(s)'}
              </span>
            </div>
          </div>
        </div>

        {frequency === 'weekly' && (
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={daysOfWeek.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label.slice(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {frequency === 'monthly' && (
          <div className="space-y-2">
            <Label>Day of Month</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => {
                const day = parseInt(e.target.value) || 1;
                setDayOfMonth(day);
                updateRule(frequency, interval, daysOfWeek, day, endType, endDate, occurrenceCount);
              }}
              className="w-32"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Ends</Label>
          <Select value={endType} onValueChange={handleEndTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="date">On Date</SelectItem>
              <SelectItem value="count">After Occurrences</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {endType === 'date' && (
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                updateRule(frequency, interval, daysOfWeek, dayOfMonth, endType, e.target.value, occurrenceCount);
              }}
            />
          </div>
        )}

        {endType === 'count' && (
          <div className="space-y-2">
            <Label>Number of Occurrences</Label>
            <Input
              type="number"
              min="1"
              value={occurrenceCount}
              onChange={(e) => {
                const count = parseInt(e.target.value) || 0;
                setOccurrenceCount(count);
                updateRule(frequency, interval, daysOfWeek, dayOfMonth, endType, endDate, count);
              }}
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Next Occurrences Preview</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {getNextOccurrences().map((date, idx) => (
              <Badge key={idx} variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {date}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
