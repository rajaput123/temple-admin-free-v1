import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Camera, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/types/erp';
import { Attendance } from '@/types/hr';

interface ClockInOutProps {
  employees: Employee[];
  attendance: Attendance[];
  onMarkAttendance?: (employeeId: string, date: string, status: Attendance['status'], checkIn?: string, checkOut?: string) => void;
}

export function ClockInOut({ employees, attendance, onMarkAttendance }: ClockInOutProps) {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedEmp = employees.find(e => e.id === selectedEmployee);
  const todayAttendance = attendance.find(a => a.employeeId === selectedEmployee && a.date === selectedDate);
  
  const canClockIn = !todayAttendance || !todayAttendance.checkIn;
  const canClockOut = todayAttendance?.checkIn && !todayAttendance.checkOut;

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Location capture failed - no validation, just continue
          setLocation(null);
        }
      );
    }
  };

  const capturePhoto = () => {
    // In a real app, this would use camera API
    // For now, simulate photo capture
    setPhoto('photo-captured');
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) {
      toast({
        title: 'Select Employee',
        description: 'Please select an employee first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    captureLocation();
    capturePhoto();

    const time = checkInTime || format(new Date(), 'HH:mm');
    setTimeout(() => {
      if (onMarkAttendance) {
        onMarkAttendance(selectedEmployee, selectedDate, 'present', time);
      }
      toast({
        title: 'Clock In Recorded',
        description: `${selectedEmp?.name || 'Employee'} clocked in at ${time}`,
      });
      setIsProcessing(false);
      setCheckInTime('');
    }, 500);
  };

  const handleClockOut = async () => {
    if (!selectedEmployee) {
      toast({
        title: 'Select Employee',
        description: 'Please select an employee first',
        variant: 'destructive',
      });
      return;
    }

    if (!todayAttendance?.checkIn) {
      toast({
        title: 'No Clock In',
        description: 'Employee must clock in first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    captureLocation();
    capturePhoto();

    const time = checkOutTime || format(new Date(), 'HH:mm');
    setTimeout(() => {
      if (onMarkAttendance) {
        onMarkAttendance(selectedEmployee, selectedDate, todayAttendance.status, todayAttendance.checkIn, time);
      }
      toast({
        title: 'Clock Out Recorded',
        description: `${selectedEmp?.name || 'Employee'} clocked out at ${time}`,
      });
      setIsProcessing(false);
      setCheckOutTime('');
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mark Attendance (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Employee</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Date</Label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>

        {selectedEmployee && (
          <>
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-medium text-foreground">{selectedEmp?.name}</span>
              </div>
              {todayAttendance && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={todayAttendance.status === 'present' ? 'success' : 'neutral'}>
                      {todayAttendance.status}
                    </Badge>
                  </div>
                  {todayAttendance.checkIn && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Check In:</span>
                      <span className="font-medium text-foreground">{todayAttendance.checkIn}</span>
                    </div>
                  )}
                  {todayAttendance.checkOut && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Check Out:</span>
                      <span className="font-medium text-foreground">{todayAttendance.checkOut}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check In Time</Label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="HH:mm"
                />
              </div>
              <div>
                <Label>Check Out Time</Label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="HH:mm"
                  disabled={!todayAttendance?.checkIn}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleClockIn}
                disabled={!canClockIn || isProcessing}
              >
                <Clock className="h-5 w-5 mr-2" />
                Mark Clock In
              </Button>
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                onClick={handleClockOut}
                disabled={!canClockOut || isProcessing}
              >
                <Clock className="h-5 w-5 mr-2" />
                Mark Clock Out
              </Button>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              </div>
            )}

            {photo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>Photo captured</span>
              </div>
            )}
          </>
        )}

        {!selectedEmployee && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select an employee to mark attendance</p>
          </div>
        )}

        <div className="pt-2 text-xs text-muted-foreground text-center">
          <p>Admin-level attendance marking</p>
          <p>Biometric and location data can be captured</p>
        </div>
      </CardContent>
    </Card>
  );
}
