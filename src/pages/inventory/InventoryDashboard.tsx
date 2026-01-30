import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Gift,
    ClipboardCheck,
    ArrowRight,
    Clock,
    MoreVertical
} from 'lucide-react';
import { dummyItems, dummyStockEntries, dummyPurchaseOrders } from '@/data/inventory-data';
import { useNavigate } from 'react-router-dom';

export default function InventoryDashboard() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('this_month');

    // KPIs
    const totalItems = dummyItems.length;
    const lowStockItems = dummyItems.filter(i => i.totalStock < i.reorderPoint).length;
    const outOfStockItems = dummyItems.filter(i => i.totalStock === 0).length;
    const stockValue = dummyItems.reduce((sum, item) => sum + (item.totalStock * (item.supplierPricing?.[0]?.rate || 0)), 0);

    const pendingPOs = dummyPurchaseOrders.filter(po => po.status === 'pending_approval').length;
    const recentMovements = dummyStockEntries.slice(0, 5);

    return (
        <MainLayout>
            <PageHeader
                title="Inventory Dashboard"
                description="Real-time overview of stock levels, movements, and procurement"
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/inventory/reports')}>View Reports</Button>
                        <Button onClick={() => navigate('/inventory/entries')}>New Transaction</Button>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">₹{stockValue.toLocaleString()}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +2.5% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-900">{lowStockItems} Items</div>
                        <p className="text-xs text-orange-600 flex items-center mt-1">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-900">{pendingPOs} Orders</div>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                            Waiting for approval
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Material Donations</CardTitle>
                        <Gift className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">12 Receipts</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Stock Movements</CardTitle>
                        <CardDescription>Latest inventory transactions across all godowns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentMovements.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${entry.type === 'receipt' ? 'bg-green-100 text-green-600' :
                                                entry.type === 'issue' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {entry.type === 'receipt' ? <TrendingUp className="h-4 w-4" /> :
                                                entry.type === 'issue' ? <TrendingDown className="h-4 w-4" /> :
                                                    <Clock className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{entry.items[0]?.itemName}</div>
                                            <div className="text-sm text-muted-foreground">{entry.type.toUpperCase()} • {entry.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{Math.abs(entry.items[0]?.quantity)} {entry.items[0]?.uom}</div>
                                        <div className="text-sm text-muted-foreground">{entry.entryNumber}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/inventory/transactions')}>
                            View All Transactions <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common inventory tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/inventory/entries?type=receipt')}>
                            <TrendingUp className="h-4 w-4 mr-3 text-green-600" />
                            Recieve Stock (GRN)
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/inventory/entries?type=issue')}>
                            <TrendingDown className="h-4 w-4 mr-3 text-orange-600" />
                            Issue to Kitchen/Puja
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/inventory/orders/new')}>
                            <ShoppingCart className="h-4 w-4 mr-3 text-purple-600" />
                            Create Purchase Order
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/inventory/donations/new')}>
                            <Gift className="h-4 w-4 mr-3 text-pink-600" />
                            Record Material Donation
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/inventory/audits/new')}>
                            <ClipboardCheck className="h-4 w-4 mr-3 text-blue-600" />
                            Start Stock Audit
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
