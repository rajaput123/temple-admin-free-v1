import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    Download,
    Calendar,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Mock Data
const stockValueData = [
    { name: 'Raw Materials', value: 45000 },
    { name: 'Pooja Items', value: 25000 },
    { name: 'Perishables', value: 8000 },
    { name: 'Packaging', value: 12000 },
];

const movementData = [
    { name: 'Jan 22', receipts: 4000, issues: 2400 },
    { name: 'Jan 23', receipts: 3000, issues: 1398 },
    { name: 'Jan 24', receipts: 2000, issues: 9800 },
    { name: 'Jan 25', receipts: 2780, issues: 3908 },
    { name: 'Jan 26', receipts: 1890, issues: 4800 },
    { name: 'Jan 27', receipts: 2390, issues: 3800 },
    { name: 'Jan 28', receipts: 3490, issues: 4300 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function InventoryReports() {
    const [reportType, setReportType] = useState('stock');

    return (
        <MainLayout>
            <PageHeader
                title="Inventory Reports"
                description="Comprehensive analysis of stock, movements, and procurement"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Last 30 Days
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                }
            />

            <Tabs defaultValue="stock" className="space-y-4 mt-6">
                <TabsList>
                    <TabsTrigger value="stock">Stock Analysis</TabsTrigger>
                    <TabsTrigger value="movements">Movements</TabsTrigger>
                    <TabsTrigger value="procurement">Procurement</TabsTrigger>
                </TabsList>

                <TabsContent value="stock" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Stock Value Distribution</CardTitle>
                                <CardDescription>Value by category</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stockValueData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8" name="Stock Value (₹)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Category Breakdown</CardTitle>
                                <CardDescription>% of total inventory</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stockValueData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {stockValueData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="movements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Receipts vs Issues</CardTitle>
                            <CardDescription>Daily transaction volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={movementData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="receipts" fill="#4ade80" name="Stock Receipts" />
                                        <Bar dataKey="issues" fill="#f87171" name="Stock Issues" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </MainLayout>
    );
}
