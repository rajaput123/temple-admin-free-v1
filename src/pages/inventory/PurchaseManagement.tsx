import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Edit, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PurchaseOrder, POStatus } from '@/types/inventory';
import { PurchaseOrderModal } from '@/components/inventory/PurchaseOrderModal';
import { dummyPurchaseOrders, dummyPurchaseRequisitions, dummySuppliers, dummyItems } from '@/data/inventory-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

const statusLabels: Record<POStatus, string> = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    partially_received: 'Partially Received',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function PurchaseManagement() {
    const { checkModuleAccess, checkWriteAccess } = usePermissions();
    const { user } = useAuth();
    const [orders, setOrders] = useState<PurchaseOrder[]>(dummyPurchaseOrders);
    const [requisitions] = useState(dummyPurchaseRequisitions);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [supplierFilter, setSupplierFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (statusFilter !== 'all' && order.status !== statusFilter) return false;
            if (supplierFilter !== 'all' && order.supplierId !== supplierFilter) return false;
            if (dateFrom && order.date < dateFrom) return false;
            if (dateTo && order.date > dateTo) return false;
            return true;
        });
    }, [orders, statusFilter, supplierFilter, dateFrom, dateTo]);

    const handleSaveOrder = (data: Partial<PurchaseOrder>) => {
        if (editingOrder) {
            setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...data } : o));
        } else {
            const newOrder: PurchaseOrder = {
                ...data,
                id: `po-${Date.now()}`,
                poNumber: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
                createdBy: user?.id || 'user-1',
                createdByName: user?.name || 'User',
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as PurchaseOrder;
            setOrders([...orders, newOrder]);
        }
        setEditingOrder(null);
        setOrderModalOpen(false);
    };

    const getStatusBadge = (status: POStatus) => {
        const variants: Record<POStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            draft: 'secondary',
            pending_approval: 'outline',
            approved: 'default',
            partially_received: 'outline',
            completed: 'default',
            cancelled: 'destructive',
        };
        return <Badge variant={variants[status]}>{statusLabels[status]}</Badge>;
    };

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval');
    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const orderColumns = [
        { key: 'poNumber', label: 'PO Number', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'supplierName', label: 'Supplier', sortable: true },
        {
            key: 'items',
            label: 'Items',
            render: (_: unknown, row: PurchaseOrder) => (
                <div className="text-sm">{row.items.length} item(s)</div>
            ),
        },
        {
            key: 'totalAmount',
            label: 'Amount',
            render: (value: unknown) => `₹${(value as number).toLocaleString()}`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (_: unknown, row: PurchaseOrder) => getStatusBadge(row.status),
        },
        {
            key: 'approvalWorkflow',
            label: 'Approval',
            render: (_: unknown, row: PurchaseOrder) => {
                if (!row.approvalWorkflow || row.approvalWorkflow.length === 0) return '-';
                const allApproved = row.approvalWorkflow.every(a => a.status === 'approved');
                const anyRejected = row.approvalWorkflow.some(a => a.status === 'rejected');
                if (allApproved) return <CheckCircle className="h-4 w-4 text-green-600" />;
                if (anyRejected) return <XCircle className="h-4 w-4 text-red-600" />;
                return <Clock className="h-4 w-4 text-yellow-600" />;
            },
        },
        {
            key: 'dueDate',
            label: 'Due Date',
            render: (value: unknown) => value ? new Date(value as string).toLocaleDateString() : '-',
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Purchase Management"
                description="Workflow for Purchase Requisitions, Quotations, and Orders"
                actions={
                    checkWriteAccess('purchase_orders') && (
                        <Button onClick={() => { setEditingOrder(null); setOrderModalOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Purchase Order
                        </Button>
                    )
                }
            />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4 border-l-4 border-l-blue-500">
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                    </Card>
                    <Card className="p-4 border-l-4 border-l-yellow-500">
                        <div className="text-sm text-muted-foreground">Pending Approvals</div>
                        <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
                    </Card>
                    <Card className="p-4 border-l-4 border-l-green-500">
                        <div className="text-sm text-muted-foreground">Total Value</div>
                        <div className="text-2xl font-bold text-green-600">₹{totalValue.toLocaleString()}</div>
                    </Card>
                </div>

                <div className="flex gap-4 items-end bg-background p-4 rounded-lg border">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex-1">
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From Date" />
                    </div>
                    <div className="flex-1">
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To Date" />
                    </div>
                </div>

                <DataTable
                    data={filteredOrders}
                    columns={orderColumns}
                    searchable={false}
                    onRowClick={(row) => { setEditingOrder(row); setOrderModalOpen(true); }}
                    actions={(row) => (
                        <>
                            {checkWriteAccess('purchase_orders') && (
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingOrder(row); setOrderModalOpen(true); }}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                <FileText className="h-4 w-4 mr-2" /> View
                            </Button>
                        </>
                    )}
                />
            </div>

            <PurchaseOrderModal
                open={orderModalOpen}
                onOpenChange={setOrderModalOpen}
                order={editingOrder}
                requisitions={requisitions}
                suppliers={dummySuppliers}
                items={dummyItems}
                onSave={handleSaveOrder}
            />
        </MainLayout>
    );
}
