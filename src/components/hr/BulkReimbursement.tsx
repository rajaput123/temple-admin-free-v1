import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckSquare, Square, DollarSign } from 'lucide-react';
import { Expense } from '@/types/hr';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BulkReimbursementProps {
  expenses: Expense[];
  onProcessPayment: (expenseIds: string[], paymentMethod: string, batchId: string) => void;
}

export function BulkReimbursement({ expenses, onProcessPayment }: BulkReimbursementProps) {
  const { toast } = useToast();
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [batchId, setBatchId] = useState<string>(`BATCH-${Date.now()}`);

  const approvedExpenses = useMemo(() => {
    return expenses.filter(e => e.status === 'approved');
  }, [expenses]);

  const selectedExpensesData = useMemo(() => {
    return approvedExpenses.filter(e => selectedExpenses.has(e.id));
  }, [approvedExpenses, selectedExpenses]);

  const totalAmount = useMemo(() => {
    return selectedExpensesData.reduce((sum, e) => sum + e.amount, 0);
  }, [selectedExpensesData]);

  const toggleSelection = (expenseId: string) => {
    const newSelection = new Set(selectedExpenses);
    if (newSelection.has(expenseId)) {
      newSelection.delete(expenseId);
    } else {
      newSelection.add(expenseId);
    }
    setSelectedExpenses(newSelection);
  };

  const toggleAll = () => {
    if (selectedExpenses.size === approvedExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(approvedExpenses.map(e => e.id)));
    }
  };

  const handleProcess = () => {
    if (selectedExpenses.size === 0) {
      toast({
        title: 'No Expenses Selected',
        description: 'Please select at least one expense for reimbursement',
        variant: 'destructive',
      });
      return;
    }

    onProcessPayment(Array.from(selectedExpenses), paymentMethod, batchId);
    toast({
      title: 'Payment Processing Initiated',
      description: `${selectedExpenses.size} expense(s) are being processed for reimbursement`,
    });
    setSelectedExpenses(new Set());
  };

  const columns = [
    {
      key: 'select',
      label: '',
      width: '50px',
      render: (_: unknown, row: Expense) => (
        <Checkbox
          checked={selectedExpenses.has(row.id)}
          onCheckedChange={() => toggleSelection(row.id)}
        />
      ),
    },
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'expenseType',
      label: 'Category',
      render: (value: unknown) => {
        const category = value as string;
        return <span className="capitalize">{category.replace('_', ' ')}</span>;
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: unknown) => `₹${value}`,
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: unknown) => format(new Date(value as string), 'MMM d, yyyy'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <StatusBadge variant={value === 'approved' ? 'success' : 'neutral'}>
          {value as string}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Bulk Reimbursement Processing</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Process multiple approved expenses for reimbursement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
          >
            {selectedExpenses.size === approvedExpenses.length ? (
              <CheckSquare className="h-4 w-4 mr-2" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            {selectedExpenses.size === approvedExpenses.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {selectedExpenses.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch ID</Label>
                <Input
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Batch ID"
                />
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Selected Expenses: {selectedExpenses.size}
                </span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-foreground">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={handleProcess} className="w-full" size="lg">
              Process Payment
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approved Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={approvedExpenses}
            columns={columns}
            searchable={false}
            viewToggle={false}
            selectable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
