import type { SevaMaster, SevaBooking, TimeSlot, CounterSettlement } from '@/types/seva-booking';

// ═══════════════════════════════════════════════════════════════════════════
// SEVA MASTERS (Service Types)
// ═══════════════════════════════════════════════════════════════════════════

export const dummySevas: SevaMaster[] = [
    {
        id: 'seva-001',
        name: 'Mahamangala Arati',
        nameHindi: 'महामंगल आरती',
        type: 'ARCHANA',
        price: 500,
        duration: 30,
        capacity: 50,
        availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
        availableTimeSlots: [
            { startTime: '06:00', endTime: '06:30' },
            { startTime: '12:00', endTime: '12:30' },
            { startTime: '18:00', endTime: '18:30' },
        ],
        minDevotees: 1,
        maxDevotees: 10,
        requiresGotra: true,
        requiresAdvanceBooking: false,
        advanceBookingDays: 7,
        walkInAllowed: true,
        walkInPercentage: 30,
        isActive: true,
        isPriority: false,
        description: 'Daily Mahamangala Arati with traditional rituals',
        benefits: ['Spiritual blessings', 'Family prosperity', 'Personal well-being'],
        category: 'Daily Sevas',
        iconUrl: '/assets/sevas/arati.png',
    },
    {
        id: 'seva-002',
        name: 'Rudrabhishekam',
        nameHindi: 'रुद्राभिषेकम्',
        type: 'ABHISHEKAM',
        price: 2100,
        duration: 60,
        capacity: 20,
        availableDays: [1, 3, 5], // Mon, Wed, Fri
        availableTimeSlots: [
            { startTime: '07:00', endTime: '08:00' },
            { startTime: '16:00', endTime: '17:00' },
        ],
        minDevotees: 1,
        maxDevotees: 5,
        requiresGotra: true,
        requiresAdvanceBooking: true,
        advanceBookingDays: 15,
        walkInAllowed: false,
        isActive: true,
        isPriority: true,
        description: 'Sacred Rudrabhishekam for Lord Shiva',
        benefits: ['Health and longevity', 'Obstacle removal', 'Spiritual elevation'],
        category: 'Special Pujas',
        iconUrl: '/assets/sevas/abhishekam.png',
    },
    {
        id: 'seva-003',
        name: 'VIP Darshan',
        nameHindi: 'विशेष दर्शन',
        type: 'DARSHAN',
        price: 300,
        duration: 15,
        capacity: 100,
        availableDays: [0, 1, 2, 3, 4, 5, 6],
        availableTimeSlots: [
            { startTime: '05:00', endTime: '05:15' },
            { startTime: '05:15', endTime: '05:30' },
            { startTime: '05:30', endTime: '05:45' },
            { startTime: '08:00', endTime: '08:15' },
            { startTime: '08:15', endTime: '08:30' },
            { startTime: '19:00', endTime: '19:15' },
            { startTime: '19:15', endTime: '19:30' },
        ],
        minDevotees: 1,
        maxDevotees: 20,
        requiresGotra: false,
        requiresAdvanceBooking: false,
        walkInAllowed: true,
        walkInPercentage: 50,
        isActive: true,
        isPriority: false,
        description: 'Special VIP Darshan with priority queue access',
        benefits: ['Skip general queue', 'Closer darshan', 'Peaceful experience'],
        category: 'Darshan',
        iconUrl: '/assets/sevas/darshan.png',
    },
    {
        id: 'seva-004',
        name: 'Sahasranama Archana',
        nameHindi: 'सहस्रनाम अर्चना',
        type: 'ARCHANA',
        price: 1100,
        duration: 45,
        capacity: 30,
        availableDays: [0, 6], // Sunday, Saturday
        availableTimeSlots: [
            { startTime: '09:00', endTime: '09:45' },
            { startTime: '15:00', endTime: '15:45' },
        ],
        minDevotees: 1,
        maxDevotees: 8,
        requiresGotra: true,
        requiresAdvanceBooking: true,
        advanceBookingDays: 10,
        walkInAllowed: true,
        walkInPercentage: 20,
        isActive: true,
        isPriority: false,
        description: 'Recitation of 1000 divine names with offerings',
        benefits: ['Divine grace', 'Mental peace', 'Success in endeavors'],
        category: 'Weekly Sevas',
        iconUrl: '/assets/sevas/archana.png',
    },
    {
        id: 'seva-005',
        name: 'Annadanam',
        nameHindi: 'अन्नदानम्',
        type: 'DONATION',
        price: 5000,
        duration: 120,
        capacity: 10,
        availableDays: [0, 1, 2, 3, 4, 5, 6],
        availableTimeSlots: [
            { startTime: '12:00', endTime: '14:00' },
        ],
        minDevotees: 1,
        maxDevotees: 2,
        requiresGotra: false,
        requiresAdvanceBooking: true,
        advanceBookingDays: 30,
        walkInAllowed: false,
        isActive: true,
        isPriority: true,
        description: 'Food offering service for devotees (feeds 100+ people)',
        benefits: ['Great merit (punya)', 'Ancestor blessings', 'Community service'],
        category: 'Donations',
        iconUrl: '/assets/sevas/annadanam.png',
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// TIME SLOTS (Generated for today and next 7 days)
// ═══════════════════════════════════════════════════════════════════════════

function generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const today = new Date();

    // Generate slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        dummySevas.forEach(seva => {
            // Check if seva is available on this day
            if (!seva.availableDays.includes(dayOfWeek)) return;

            seva.availableTimeSlots.forEach((timeSlot, index) => {
                const bookedCount = dayOffset === 0
                    ? Math.floor(Math.random() * seva.capacity * 0.6) // Today: 0-60% booked
                    : Math.floor(Math.random() * seva.capacity * 0.3); // Future: 0-30% booked

                const walkInReserved = Math.floor(seva.capacity * ((seva.walkInPercentage || 0) / 100));
                const availableCount = seva.capacity - bookedCount;

                let status: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED' = 'AVAILABLE';
                if (bookedCount >= seva.capacity) status = 'FULL';
                else if (availableCount <= seva.capacity * 0.2) status = 'LIMITED';

                slots.push({
                    id: `slot-${seva.id}-${dateStr}-${index}`,
                    sevaId: seva.id,
                    date: dateStr,
                    startTime: timeSlot.startTime,
                    endTime: timeSlot.endTime,
                    capacity: seva.capacity,
                    bookedCount,
                    walkInReserved,
                    availableCount,
                    version: 1,
                    status,
                    isOverrideAllowed: seva.isPriority,
                });
            });
        });
    }

    return slots;
}

export const dummyTimeSlots: TimeSlot[] = generateTimeSlots();

// ═══════════════════════════════════════════════════════════════════════════
// BOOKINGS (Today's bookings for demo)
// ═══════════════════════════════════════════════════════════════════════════

function generateTodayBookings(): SevaBooking[] {
    const bookings: SevaBooking[] = [];
    const today = new Date().toISOString().split('T')[0];
    const todaySlots = dummyTimeSlots.filter(s => s.date === today);

    const devoteeNames = [
        'Ramesh Kumar', 'Priya Sharma', 'Vijay Patel', 'Lakshmi Iyer',
        'Suresh Reddy', 'Kavita Nair', 'Arun Singh', 'Meera Desai',
        'Rajesh Rao', 'Sita Joshi', 'Ganesh Murthy', 'Radha Pillai'
    ];

    const gotras = ['Bharadwaja', 'Kashyapa', 'Atri', 'Vishwamitra', 'Gautama', 'Jamadagni'];
    const phones = ['9876543210', '9876543211', '9876543212', '9876543213', '9876543214'];

    let receiptCounter = 1;

    todaySlots.forEach((slot, index) => {
        if (slot.bookedCount === 0) return;

        const seva = dummySevas.find(s => s.id === slot.sevaId)!;
        const bookingsToGenerate = Math.min(3, slot.bookedCount); // Max 3 bookings per slot for demo

        for (let i = 0; i < bookingsToGenerate; i++) {
            const devoteeIndex = (index + i) % devoteeNames.length;
            const isCompleted = Math.random() > 0.7;
            const isPending = Math.random() > 0.5;

            let status: 'PENDING' | 'COLLECTED' | 'COMPLETED' | 'NO_SHOW' =
                isCompleted ? 'COMPLETED' : (isPending ? 'PENDING' : 'COLLECTED');

            const paymentMode: 'CASH' | 'UPI' | 'CARD' =
                Math.random() > 0.6 ? 'CASH' : (Math.random() > 0.5 ? 'UPI' : 'CARD');

            bookings.push({
                id: `booking-${today}-${String(receiptCounter).padStart(6, '0')}`,
                receiptNumber: `C01-2024-${String(receiptCounter).padStart(6, '0')}`,
                qrCode: `QR-${today}-${receiptCounter}`,
                devotee: {
                    name: devoteeNames[devoteeIndex],
                    phone: phones[devoteeIndex % phones.length],
                    gotra: seva.requiresGotra ? gotras[devoteeIndex % gotras.length] : undefined,
                    numberOfDevotees: Math.floor(Math.random() * 4) + 1,
                    isRegular: Math.random() > 0.7,
                },
                seva: {
                    id: seva.id,
                    name: seva.name,
                    type: seva.type,
                    price: seva.price,
                    duration: seva.duration,
                },
                slot: {
                    id: slot.id,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    capacity: slot.capacity,
                    bookedCount: slot.bookedCount,
                    isPriority: seva.isPriority,
                },
                payment: {
                    amount: seva.price,
                    mode: paymentMode,
                    cashAmount: paymentMode === 'CASH' ? seva.price : undefined,
                    digitalAmount: paymentMode !== 'CASH' ? seva.price : undefined,
                    transactionId: paymentMode !== 'CASH' ? `TXN${Date.now()}${i}` : undefined,
                    status: status === 'PENDING' ? 'PENDING' : 'COLLECTED',
                    collectedAt: status !== 'PENDING' ? new Date() : undefined,
                    collectedBy: status !== 'PENDING' ? 'user-001' : undefined,
                },
                status,
                bookingType: Math.random() > 0.3 ? 'WALK_IN' : 'PRE_BOOKED',
                counter: {
                    id: 'counter-001',
                    name: 'Counter 1',
                },
                createdBy: 'user-001',
                createdAt: new Date(),
                updatedAt: new Date(),
                isLateCollection: false,
                isReprint: false,
                auditLog: [
                    {
                        timestamp: new Date(),
                        action: 'CREATED',
                        userId: 'user-001',
                    },
                ],
            });

            receiptCounter++;
        }
    });

    return bookings;
}

export const dummySevaBookings: SevaBooking[] = generateTodayBookings();

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER SETTLEMENT (Today's summary)
// ═══════════════════════════════════════════════════════════════════════════

function generateTodaySettlement(): CounterSettlement {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = dummySevaBookings;

    const cashBookings = todayBookings.filter(b => b.payment.mode === 'CASH' && b.payment.status === 'COLLECTED');
    const upiBookings = todayBookings.filter(b => b.payment.mode === 'UPI' && b.payment.status === 'COLLECTED');
    const cardBookings = todayBookings.filter(b => b.payment.mode === 'CARD' && b.payment.status === 'COLLECTED');

    const systemCashTotal = cashBookings.reduce((sum, b) => sum + b.payment.amount, 0);
    const upiTotal = upiBookings.reduce((sum, b) => sum + b.payment.amount, 0);
    const cardTotal = cardBookings.reduce((sum, b) => sum + b.payment.amount, 0);
    const totalRevenue = systemCashTotal + upiTotal + cardTotal;

    const noShowCount = todayBookings.filter(b => b.status === 'NO_SHOW').length;

    return {
        id: 'settlement-001',
        counterId: 'counter-001',
        counterName: 'Counter 1',
        date: today,
        shift: 'MORNING',
        openingBalance: 2000,
        closingBalance: systemCashTotal + 2000, // Physical cash = opening + collected
        systemCashTotal,
        variance: 0,
        upiTotal,
        cardTotal,
        digitalTotal: upiTotal + cardTotal,
        totalBookings: todayBookings.length,
        cashBookings: cashBookings.length,
        digitalBookings: upiBookings.length + cardBookings.length,
        totalRevenue,
        targetRevenue: 50000,
        achievementPercentage: (totalRevenue / 50000) * 100,
        noShowCount,
        noShowRevenueLoss: noShowCount * 500, // Average
        status: 'DRAFT',
        submittedBy: 'user-001',
        isLocked: false,
    };
}

export const dummyCounterSettlement: CounterSettlement = generateTodaySettlement();

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getSevaById(id: string): SevaMaster | undefined {
    return dummySevas.find(s => s.id === id);
}

export function getAvailableSlots(sevaId: string, date: string): TimeSlot[] {
    return dummyTimeSlots.filter(s => s.sevaId === sevaId && s.date === date && s.status !== 'FULL');
}

export function getTodayBookings(): SevaBooking[] {
    const today = new Date().toISOString().split('T')[0];
    return dummySevaBookings.filter(b => b.slot.date === today);
}

export function getBookingsByStatus(status: string): SevaBooking[] {
    return dummySevaBookings.filter(b => b.status === status);
}
