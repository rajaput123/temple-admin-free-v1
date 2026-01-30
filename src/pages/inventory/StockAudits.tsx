import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    ClipboardCheck,
    Plus,
    AlertTriangle,
    RotateCw,
    TrendingDown,
    TrendingUp,
    FileCheck
} from 'lucide-react';
import { dummyPhysicalAudits } from '@/data/inventory-data';

export default function StockAudits() {
    const [audits] = useState(dummyPhysicalAudits);

    const columns = [
        { key: 'auditNumber', label: 'Audit #', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'godownName', label: 'Godown', sortable: true },
        {
            key: 'totalVariance',
            label: 'Variance',
            render: (val: number) => (
                <div className={`font-semibold ${val === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {val > 0 ? '+' : ''}{val} items
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (status: string) => (
                <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                    {status.replace('_', ' ').toUpperCase()}
                </Badge>
            )
        },
        {
            key: 'conductedByName',
            label: 'Auditor'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: () => (
                <Button variant="ghost" size="sm">View Details</Button>
            )
        }
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Stock Audits"
                description="Physical stock verification and discrepancy management"
                actions={
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Audit
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Audit</p>
                                <h3 className="text-2xl font-bold mt-2">Jan 31, 2024</h3>
                                <p className="text-sm text-muted-foreground mt-1">Main Store</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Variance Detected</p>
                                <h3 className="text-2xl font-bold mt-2 text-red-600">-7 Items</h3>
                                <p className="text-sm text-red-600 mt-1">Requires adjustment</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Audit Compliance</p>
                                <h3 className="text-2xl font-bold mt-2 text-green-600">98.5%</h3>
                                <p className="text-sm text-muted-foreground mt-1">Stock accuracy</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <ClipboardCheck className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Audit History</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable data={audits} columns={columns} />
                </CardContent>
            </Card>
        </MainLayout>
    );
}
