import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Download,
  Eye,
  Edit,
  Trash2,
  Printer
} from 'lucide-react';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { SevaBooking } from '@/types/erp';

// Dummy data
const initialBookings: SevaBooking[] = [
  { id: '1', bookingNumber: 'SV-2024-001', devotee: 'Ravi Shankar', sevaType: 'Abhishekam', date: '2024-01-28', time: '06:00 AM', amount: 500, status: 'confirmed', paymentStatus: 'paid' },
  { id: '2', bookingNumber: 'SV-2024-002', devotee: 'Kamala Devi', sevaType: 'Archana', date: '2024-01-28', time: '08:00 AM', amount: 100, status: 'confirmed', paymentStatus: 'paid' },
  { id: '3', bookingNumber: 'SV-2024-003', devotee: 'Srinivas Rao', sevaType: 'Kalyanam', date: '2024-01-28', time: '10:00 AM', amount: 5000, status: 'pending', paymentStatus: 'pending' },
  { id: '4', bookingNumber: 'SV-2024-004', devotee: 'Padma Lakshmi', sevaType: 'Sahasranamam', date: '2024-01-28', time: '11:00 AM', amount: 250, status: 'confirmed', paymentStatus: 'paid' },
  { id: '5', bookingNumber: 'SV-2024-005', devotee: 'Venkat Reddy', sevaType: 'Abhishekam', date: '2024-01-29', time: '06:00 AM', amount: 500, status: 'confirmed', paymentStatus: 'paid' },
  { id: '6', bookingNumber: 'SV-2024-006', devotee: 'Lakshmi Narayanan', sevaType: 'Annadanam Sponsorship', date: '2024-01-29', time: '12:00 PM', amount: 25000, status: 'completed', paymentStatus: 'paid' },
  { id: '7', bookingNumber: 'SV-2024-007', devotee: 'Ganapathi Iyer', sevaType: 'Archana', date: '2024-01-29', time: '07:00 AM', amount: 100, status: 'cancelled', paymentStatus: 'refunded' },
  { id: '8', bookingNumber: 'SV-2024-008', devotee: 'Meenakshi Sundaram', sevaType: 'Special Pooja', date: '2024-01-30', time: '09:00 AM', amount: 1500, status: 'pending', paymentStatus: 'pending' },
];

const sevaTypes = [
  { value: 'abhishekam', label: 'Abhishekam' },
  { value: 'archana', label: 'Archana' },
  { value: 'kalyanam', label: 'Kalyanam' },
  { value: 'sahasranamam', label: 'Sahasranamam' },
  { value: 'annadanam', label: 'Annadanam Sponsorship' },
  { value: 'special_pooja', label: 'Special Pooja' },
];

export default function SevaBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<SevaBooking | null>(null);
  const [sevaTypeOptions, setSevaTypeOptions] = useState(sevaTypes);

  const [formData, setFormData] = useState({
    devotee: '',
    phone: '',
    sevaType: '',
    date: '',
    time: '',
    amount: '',
  });

  const columns = [
    {
      key: 'bookingNumber',
      label: 'Booking #',
      sortable: true,
      render: (value: unknown) => (
        <span className="font-mono text-sm font-medium text-foreground">{value as string}</span>
      ),
    },
    {
      key: 'devotee',
      label: 'Devotee',
      sortable: true,
    },
    {
      key: 'sevaType',
      label: 'Seva Type',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (value: unknown, row: SevaBooking) => (
        <div>
          <div className="font-medium text-foreground">
            {new Date(value as string).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-xs text-muted-foreground">{row.time}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium text-foreground">
          ₹{(value as number).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as SevaBooking['status'];
        const variants: Record<SevaBooking['status'], 'success' | 'warning' | 'destructive' | 'neutral'> = {
          pending: 'warning',
          confirmed: 'primary' as 'success',
          completed: 'success',
          cancelled: 'destructive',
        };
        return <StatusBadge variant={variants[status]}>{status}</StatusBadge>;
      },
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: unknown) => {
        const status = value as SevaBooking['paymentStatus'];
        const variants: Record<SevaBooking['paymentStatus'], 'success' | 'warning' | 'neutral'> = {
          pending: 'warning',
          paid: 'success',
          refunded: 'neutral',
        };
        return <StatusBadge variant={variants[status]}>{status}</StatusBadge>;
      },
    },
  ];

  const handleAddNew = () => {
    setEditingBooking(null);
    setFormData({ devotee: '', phone: '', sevaType: '', date: '', time: '', amount: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (booking: SevaBooking) => {
    setEditingBooking(booking);
    setFormData({
      devotee: booking.devotee,
      phone: '',
      sevaType: booking.sevaType.toLowerCase().replace(/ /g, '_'),
      date: booking.date,
      time: booking.time,
      amount: String(booking.amount),
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const handleSubmit = () => {
    if (editingBooking) {
      setBookings(bookings.map(b => 
        b.id === editingBooking.id 
          ? { 
              ...b, 
              devotee: formData.devotee,
              sevaType: sevaTypeOptions.find(s => s.value === formData.sevaType)?.label || formData.sevaType,
              date: formData.date,
              time: formData.time,
              amount: Number(formData.amount),
            }
          : b
      ));
    } else {
      const newBooking: SevaBooking = {
        id: String(bookings.length + 1),
        bookingNumber: `SV-2024-${String(bookings.length + 1).padStart(3, '0')}`,
        devotee: formData.devotee,
        sevaType: sevaTypeOptions.find(s => s.value === formData.sevaType)?.label || formData.sevaType,
        date: formData.date,
        time: formData.time,
        amount: Number(formData.amount),
        status: 'pending',
        paymentStatus: 'pending',
      };
      setBookings([...bookings, newBooking]);
    }
    setIsFormOpen(false);
  };

  const handleAddSevaType = (name: string) => {
    const newSeva = { value: name.toLowerCase().replace(/ /g, '_'), label: name };
    setSevaTypeOptions([...sevaTypeOptions, newSeva]);
    return newSeva;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Seva Bookings"
        description="Manage devotee seva bookings and reservations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Seva Counter', href: '/seva' },
          { label: 'Bookings' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'bg-muted text-muted-foreground' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-warning/10 text-warning' },
          { label: "Today's Revenue", value: `₹${bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}`, color: 'bg-success/10 text-success' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold text-foreground mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        searchPlaceholder="Search bookings..."
        onRowClick={(row) => handleEdit(row)}
        actions={(row) => (
          <>
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Booking
            </DropdownMenuItem>
          </>
        )}
      />

      {/* Booking Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBooking ? 'Edit Booking' : 'New Seva Booking'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-field col-span-2">
                <Label htmlFor="devotee" className="form-label">
                  Devotee Name <span className="form-required">*</span>
                </Label>
                <Input
                  id="devotee"
                  value={formData.devotee}
                  onChange={(e) => setFormData({ ...formData, devotee: e.target.value })}
                  placeholder="Enter devotee name"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="phone" className="form-label">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-field">
                <Label className="form-label">
                  Seva Type <span className="form-required">*</span>
                </Label>
                <SearchableSelect
                  options={sevaTypeOptions}
                  value={formData.sevaType}
                  onChange={(value) => setFormData({ ...formData, sevaType: value })}
                  placeholder="Select seva"
                  addNewLabel="+ Add Seva Type"
                  onAddNew={handleAddSevaType}
                />
              </div>

              <div className="form-field">
                <Label htmlFor="date" className="form-label">
                  Date <span className="form-required">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-field">
                <Label htmlFor="time" className="form-label">
                  Time <span className="form-required">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="form-field col-span-2">
                <Label htmlFor="amount" className="form-label">
                  Amount (₹) <span className="form-required">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBooking ? 'Save Changes' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
