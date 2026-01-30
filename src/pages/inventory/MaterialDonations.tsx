import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import {
    Gift,
    Plus,
    FileText,
    Search,
    CheckCircle,
    XCircle,
    Download
} from 'lucide-react';
import { dummyItems } from '@/data/inventory-data';

// Mock Donation Data
const dummyDonations = [
    {
        id: 'don-1',
        receiptNo: 'DR-2024-001',
        date: '2024-01-28',
        donorName: 'Ramesh Gupta',
        donorPhone: '+91 98765 43210',
        items: [
            { itemId: 'item-1', itemName: 'Basmati Rice', quantity: 50, uom: 'kg', value: 4250 }
        ],
        totalValue: 4250,
        status: 'completed',
        taxCertificateIssued: true
    },
    {
        id: 'don-2',
        receiptNo: 'DR-2024-002',
        date: '2024-01-29',
        donorName: 'Sita Devi',
        donorPhone: '+91 98765 43211',
        items: [
            { itemId: 'item-2', itemName: 'Pure Ghee', quantity: 10, uom: 'ltr', value: 6500 },
            { itemId: 'item-4', itemName: 'Coconuts', quantity: 100, uom: 'nos', value: 2500 }
        ],
        totalValue: 9000,
        status: 'pending_verification',
        taxCertificateIssued: false
    },
];

export default function MaterialDonations() {
    const [donations] = useState(dummyDonations);
    const [searchQuery, setSearchQuery] = useState('');

    const columns = [
        { key: 'receiptNo', label: 'Receipt #', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'donorName', label: 'Donor Name', sortable: true },
        {
            key: 'items',
            label: 'Items Donated',
            render: (_: unknown, row: any) => (
                <div className="space-y-1">
                    {row.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm">
                            {item.itemName} - {item.quantity} {item.uom}
                        </div>
                    ))}
                </div>
            )
        },
        {
            key: 'totalValue',
            label: 'Est. Value',
            render: (val: number) => <span className="font-semibold">₹{val.toLocaleString()}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (status: string) => (
                <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                    {status === 'completed' ? 'Verified & Stocked' : 'Pending Check'}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: unknown, row: any) => (
                <div className="flex items-center gap-2">
                    {row.taxCertificateIssued ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Download className="h-3 w-3 mr-1" /> 80G Cert
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={row.status !== 'completed'}>
                            Generate Cert
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Material Donations"
                description="Track in-kind donations, generate 80G certificates"
                actions={
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Donation Receipt
                    </Button>
                }
            />

            <div className="grid gap-4 md:grid-cols-3 mt-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations (Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹13,250</div>
                        <p className="text-xs text-muted-foreground mt-1">Estimated value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">80G Issued</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">1</div>
                        <p className="text-xs text-muted-foreground mt-1">Tax certificates generated</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">1</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires quality check</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search donor or receipt..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Download Report
                        </Button>
                    </div>
                </div>

                <DataTable
                    data={donations}
                    columns={columns}
                />
            </div>
        </MainLayout>
    );
}
