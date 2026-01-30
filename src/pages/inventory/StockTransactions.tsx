import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, FileText, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { StockEntry, StockEntryType } from '@/types/inventory';
import { StockEntryModal } from '@/components/inventory/StockEntryModal';
import { dummyStockEntries, dummyItems, dummyGodowns } from '@/data/inventory-data';
import { departments } from '@/data/hr-dummy-data';
import { dummyCounters, dummySacreds } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

const entryTypeLabels: Record<StockEntryType, string> = {
    receipt: 'Receipt',
    issue: 'Issue',
    transfer: 'Transfer',
    adjustment: 'Adjustment',
    return: 'Return',
    free_issue: 'Free Issue',
};

export default function StockTransactions() {
    const { checkModuleAccess, checkWriteAccess } = usePermissions();
    const { user } = useAuth();
    const [entries, setEntries] = useState<StockEntry[]>(dummyStockEntries);
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
            if (dateFrom && entry.date < dateFrom) return false;
            if (dateTo && entry.date > dateTo) return false;
            return true;
        });
    }, [entries, typeFilter, dateFrom, dateTo]);

    const handleSaveEntry = (data: Partial<StockEntry>) => {
        if (editingEntry) {
            setEntries(entries.map(e => e.id === editingEntry.id ? { ...e, ...data } : e));
        } else {
            const newEntry: StockEntry = {
                ...data,
                id: `entry-${Date.now()}`,
                entryNumber: `SE-${new Date().getFullYear()}-${String(entries.length + 1).padStart(3, '0')}`,
                createdBy: user?.id || 'user-1',
                createdByName: user?.name || 'User',
                status: 'completed',
                createdAt: new Date().toISOString(),
            } as StockEntry;
            setEntries([...entries, newEntry]);
        }
        setEditingEntry(null);
        setEntryModalOpen(false);
    };

    const getItemName = (itemId: string) => dummyItems.find(i => i.id === itemId)?.name || 'Unknown';

    const entryColumns = [
        { key: 'entryNumber', label: 'Transaction ID', sortable: true },
        {
            key: 'type',
            label: 'Type',
            render: (value: unknown) => {
                const type = value as StockEntryType;
                let icon = null;
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

                if (type === 'receipt') { variant = 'default'; icon = <ArrowDownLeft className="h-3 w-3 mr-1" />; }
                else if (type === 'issue') { variant = 'secondary'; icon = <ArrowUpRight className="h-3 w-3 mr-1" />; }
                else if (type === 'transfer') { variant = 'outline'; icon = <RefreshCw className="h-3 w-3 mr-1" />; }

                return (
                    <Badge variant={variant} className="flex w-fit items-center">
                        {icon} {entryTypeLabels[type]}
                    </Badge>
                );
            },
        },
        { key: 'date', label: 'Date', sortable: true },
        {
            key: 'items',
            label: 'Items',
            render: (_: unknown, row: StockEntry) => (
                <div className="space-y-1">
                    {row.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-sm">
                            {getItemName(item.itemId)}: {item.quantity} {item.uom}
                        </div>
                    ))}
                    {row.items.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{row.items.length - 2} more</div>
                    )}
                </div>
            ),
        },
        {
            key: 'sourceGodownName',
            label: 'Source',
            render: (_: unknown, row: StockEntry) => row.sourceGodownName || '-',
        },
        {
            key: 'destinationGodownName',
            label: 'Destination',
            render: (_: unknown, row: StockEntry) => {
                if (row.destinationGodownName) return row.destinationGodownName;
                if (row.destination) {
                    if (row.destination === 'kitchen') {
                        const kitchenDept = departments.find(d => d.name === 'Kitchen');
                        return kitchenDept?.name || 'Kitchen';
                    }
                    if (row.destination === 'counter') {
                        return row.destinationDetails || 'Counter';
                    }
                    return row.destinationDetails || row.destination;
                }
                return '-';
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (_: unknown, row: StockEntry) => (
                <Badge variant={row.status === 'completed' ? 'default' : row.status === 'draft' ? 'secondary' : 'destructive'}>
                    {row.status}
                </Badge>
            ),
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Stock Transactions"
                description="Record movements, issues, receipts and transfers"
                actions={
                    checkWriteAccess('stock_entries') && (
                        <Button onClick={() => { setEditingEntry(null); setEntryModalOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Transaction
                        </Button>
                    )
                }
            />

            <div className="space-y-4">
                <div className="flex gap-4 items-end bg-background p-4 rounded-lg border">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.entries(entryTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex-1">
                        <Input
                            type="date"
                            placeholder="From Date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            type="date"
                            placeholder="To Date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    data={filteredEntries}
                    columns={entryColumns}
                    searchable={false}
                    onRowClick={(row) => { setEditingEntry(row); setEntryModalOpen(true); }}
                    actions={(row) => (
                        <>
                            <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View
                            </Button>
                        </>
                    )}
                />
            </div>

            <StockEntryModal
                open={entryModalOpen}
                onOpenChange={setEntryModalOpen}
                entry={editingEntry}
                items={dummyItems}
                godowns={dummyGodowns}
                departments={departments}
                counters={dummyCounters}
                sacreds={dummySacreds}
                onSave={handleSaveEntry}
            />
        </MainLayout>
    );
}
