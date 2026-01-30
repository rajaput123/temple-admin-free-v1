import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, User, CreditCard, Receipt, Clock } from 'lucide-react';
import { dummySevas, dummyTimeSlots, getAvailableSlots } from '@/data/seva-booking-data';
import type { SevaMaster, TimeSlot, PaymentMode } from '@/types/seva-booking';

export default function NewSevaBooking() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedSeva, setSelectedSeva] = useState<SevaMaster | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    // Devotee form
    const [devotee, setDevotee] = useState({
        name: '',
        phone: '',
        gotra: '',
        numberOfDevotees: 1,
    });

    // Payment
    const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
    const [cashTendered, setCashTendered] = useState('');
    const [transactionId, setTransactionId] = useState('');

    // Timer for speed tracking
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (selectedSeva) {
            const slots = getAvailableSlots(selectedSeva.id, selectedDate);
            setAvailableSlots(slots);
        }
    }, [selectedSeva, selectedDate]);

    // Keyboard shortcuts for seva selection (1-9)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (step === 1 && e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (index < dummySevas.length) {
                    handleSevaSelect(dummySevas[index]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [step]);

    const handleSevaSelect = (seva: SevaMaster) => {
        setSelectedSeva(seva);
        setStep(2);
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        setStep(3);
    };

    const handleDevoteeSubmit = () => {
        setStep(4);
    };

    const handlePaymentSubmit = () => {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(0);

        // Create booking (in real app, would call API)
        const booking = {
            id: `booking-${Date.now()}`,
            receiptNumber: `C01-2024-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
            devotee: {
                ...devotee,
                isRegular: false,
            },
            seva: {
                id: selectedSeva!.id,
                name: selectedSeva!.name,
                type: selectedSeva!.type,
                price: selectedSeva!.price,
                duration: selectedSeva!.duration,
            },
            slot: selectedSlot!,
            payment: {
                amount: selectedSeva!.price,
                mode: paymentMode,
                status: 'COLLECTED' as const,
            },
            elapsedTime: parseInt(elapsedTime),
        };

        // Show success and navigate
        alert(`✅ Booking completed in ${elapsedTime} seconds!\nReceipt: ${booking.receiptNumber}`);
        navigate('/seva/bookings/today');
    };

    const calculateChange = () => {
        if (paymentMode === 'CASH' && cashTendered && selectedSeva) {
            const change = parseFloat(cashTendered) - selectedSeva.price;
            return change >= 0 ? change : 0;
        }
        return 0;
    };

    return (
        <MainLayout>
            <PageHeader
                title="New Seva Booking"
                description="Fast counter-grade booking system"
                actions={
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {((Date.now() - startTime) / 1000).toFixed(0)}s
                        </Badge>
                        <Button variant="outline" onClick={() => navigate('/seva/bookings/today')}>
                            View Today's Bookings
                        </Button>
                    </div>
                }
            />

            <div className="mt-6 max-w-5xl">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-6">
                    {['Select Seva', 'Choose Slot', 'Devotee Info', 'Payment'].map((label, index) => (
                        <div key={label} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step > index + 1 ? 'bg-green-500' : step === index + 1 ? 'bg-primary' : 'bg-muted'
                                } text-white font-semibold`}>
                                {step > index + 1 ? '✓' : index + 1}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${step === index + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {label}
                            </span>
                            {index < 3 && <div className="w-16 h-0.5 bg-muted mx-4" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Seva */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Select Seva (Press 1-{dummySevas.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dummySevas.map((seva, index) => (
                                <Card
                                    key={seva.id}
                                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                                    onClick={() => handleSevaSelect(seva)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-lg font-bold">
                                                    {index + 1}
                                                </Badge>
                                                <h3 className="font-semibold text-lg">{seva.name}</h3>
                                            </div>
                                            {seva.isPriority && (
                                                <Badge variant="default">VIP</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{seva.nameHindi}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-primary">₹{seva.price}</span>
                                            <span className="text-sm text-muted-foreground">{seva.duration} min</span>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Capacity: {seva.capacity} • {seva.category}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Choose Slot */}
                {step === 2 && selectedSeva && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Choose Time Slot
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => setStep(1)}>Back</Button>
                        </div>

                        <Card className="mb-4 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedSeva.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedSeva.nameHindi}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">₹{selectedSeva.price}</div>
                                    <div className="text-sm text-muted-foreground">{selectedSeva.duration} minutes</div>
                                </div>
                            </div>
                        </Card>

                        <div className="mb-4">
                            <Label htmlFor="date">Select Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="max-w-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableSlots.map(slot => (
                                <Card
                                    key={slot.id}
                                    className={`cursor-pointer transition-all ${slot.status === 'FULL' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:border-primary'
                                        }`}
                                    onClick={() => slot.status !== 'FULL' && handleSlotSelect(slot)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="text-lg font-bold">{slot.startTime}</div>
                                        <div className="text-xs text-muted-foreground mb-2">to {slot.endTime}</div>
                                        <Badge variant={
                                            slot.status === 'AVAILABLE' ? 'default' :
                                                slot.status === 'LIMITED' ? 'warning' : 'destructive'
                                        } className="text-xs">
                                            {slot.availableCount}/{slot.capacity}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Devotee Information */}
                {step === 3 && selectedSeva && selectedSlot && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Devotee Information
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => setStep(2)}>Back</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                            <div className="col-span-2">
                                <Label htmlFor="name">Devotee Name *</Label>
                                <Input
                                    id="name"
                                    value={devotee.name}
                                    onChange={(e) => setDevotee({ ...devotee, name: e.target.value })}
                                    placeholder="Enter full name"
                                    autoFocus
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={devotee.phone}
                                    onChange={(e) => setDevotee({ ...devotee, phone: e.target.value })}
                                    placeholder="10-digit mobile number"
                                    className="h-11"
                                />
                            </div>

                            {selectedSeva.requiresGotra && (
                                <div>
                                    <Label htmlFor="gotra">Gotra *</Label>
                                    <Select value={devotee.gotra} onValueChange={(value) => setDevotee({ ...devotee, gotra: value })}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select gotra" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bharadwaja">Bharadwaja</SelectItem>
                                            <SelectItem value="Kashyapa">Kashyapa</SelectItem>
                                            <SelectItem value="Atri">Atri</SelectItem>
                                            <SelectItem value="Vishwamitra">Vishwamitra</SelectItem>
                                            <SelectItem value="Gautama">Gautama</SelectItem>
                                            <SelectItem value="Jamadagni">Jamadagni</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className={selectedSeva.requiresGotra ? '' : 'col-span-2'}>
                                <Label htmlFor="numberOfDevotees">Number of Devotees</Label>
                                <Input
                                    id="numberOfDevotees"
                                    type="number"
                                    min={selectedSeva.minDevotees}
                                    max={selectedSeva.maxDevotees}
                                    value={devotee.numberOfDevotees}
                                    onChange={(e) => setDevotee({ ...devotee, numberOfDevotees: parseInt(e.target.value) || 1 })}
                                    className="h-11"
                                />
                            </div>

                            <div className="col-span-2 pt-4">
                                <Button
                                    onClick={handleDevoteeSubmit}
                                    disabled={!devotee.name || !devotee.phone || (selectedSeva.requiresGotra && !devotee.gotra)}
                                    className="w-full h-12 text-lg"
                                >
                                    Proceed to Payment →
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment */}
                {step === 4 && selectedSeva && selectedSlot && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Collection
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => setStep(3)}>Back</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Booking Summary</h3>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Seva</dt>
                                        <dd className="font-semibold">{selectedSeva.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Date & Time</dt>
                                        <dd className="font-semibold">{selectedSlot.date} • {selectedSlot.startTime}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Devotee</dt>
                                        <dd className="font-semibold">{devotee.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Phone</dt>
                                        <dd className="font-semibold">{devotee.phone}</dd>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t">
                                        <dt className="text-lg font-semibold">Total Amount</dt>
                                        <dd className="text-2xl font-bold text-primary">₹{selectedSeva.price}</dd>
                                    </div>
                                </dl>
                            </Card>

                            <div>
                                <Label className="text-base mb-3">Payment Mode</Label>
                                <Tabs value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="CASH">Cash</TabsTrigger>
                                        <TabsTrigger value="UPI">UPI</TabsTrigger>
                                        <TabsTrigger value="CARD">Card</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="CASH" className="space-y-4 mt-4">
                                        <div>
                                            <Label htmlFor="cashTendered">Cash Tendered</Label>
                                            <Input
                                                id="cashTendered"
                                                type="number"
                                                value={cashTendered}
                                                onChange={(e) => setCashTendered(e.target.value)}
                                                placeholder={`₹${selectedSeva.price}`}
                                                className="h-12 text-lg"
                                                autoFocus
                                            />
                                        </div>
                                        {cashTendered && (
                                            <div className="p-4 bg-muted rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">Change to Return:</span>
                                                    <span className="text-2xl font-bold text-green-600">₹{calculateChange()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="UPI" className="space-y-4 mt-4">
                                        <div className="p-6 bg-muted rounded-lg text-center">
                                            <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                                                <span className="text-muted-foreground">QR Code</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Scan to pay ₹{selectedSeva.price}</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="transactionId">Transaction ID (optional)</Label>
                                            <Input
                                                id="transactionId"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder="Enter UPI transaction ID"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="CARD" className="space-y-4 mt-4">
                                        <div className="p-6 bg-muted rounded-lg text-center">
                                            <p className="text-lg font-semibold mb-2">Swipe/Insert Card</p>
                                            <p className="text-sm text-muted-foreground">Amount: ₹{selectedSeva.price}</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="cardTransactionId">Transaction ID</Label>
                                            <Input
                                                id="cardTransactionId"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder="Auto-filled after card payment"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <Button
                                    onClick={handlePaymentSubmit}
                                    disabled={paymentMode === 'CASH' && (!cashTendered || parseFloat(cashTendered) < selectedSeva.price)}
                                    className="w-full h-14 text-lg mt-6"
                                >
                                    <Receipt className="h-5 w-5 mr-2" />
                                    Complete Booking & Print Receipt
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
