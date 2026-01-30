import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Warehouse,
    MapPin,
    User,
    Package,
    Thermometer,
    Plus,
    MoreVertical,
    AlertTriangle
} from 'lucide-react';
import { dummyGodowns, dummyItems } from '@/data/inventory-data';
import { Godown } from '@/types/inventory';

export default function Godowns() {
    const [godowns, setGodowns] = useState<Godown[]>(dummyGodowns);
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate utilization for each godown
    const getGodownStats = (godownId: string) => {
        // This is a rough simulation since we don't have item volumes
        // In a real app, this would be calculated based on storage volume occupied
        const itemsInGodown = dummyItems.filter(item =>
            item.stockAllocations.some(alloc => alloc.godownId === godownId && alloc.quantity > 0)
        );
        const totalItems = itemsInGodown.length;
        // Mock utilization between 30% and 90%
        const utilization = Math.floor(Math.random() * (90 - 30 + 1)) + 30;

        return { totalItems, utilization };
    };

    const getGodownTypeLabel = (type: string) => {
        switch (type) {
            case 'main_store': return 'Main Storage';
            case 'kitchen_store': return 'Kitchen Store';
            case 'counter_store': return 'Counter Store';
            default: return 'Store';
        }
    };

    const filteredGodowns = godowns.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MainLayout>
            <PageHeader
                title="Godowns & Stores"
                description="Manage storage locations, capacity, and access controls"
                actions={
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Store
                    </Button>
                }
            />

            <div className="mt-6 mb-6">
                <Input
                    placeholder="Search stores by name or location..."
                    className="max-w-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredGodowns.map(godown => {
                    const stats = getGodownStats(godown.id);
                    const isHighUtil = stats.utilization > 80;

                    return (
                        <Card key={godown.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Warehouse className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{godown.name}</CardTitle>
                                            <CardDescription>{getGodownTypeLabel(godown.type)}</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{godown.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4 flex-shrink-0" />
                                        <span>Manager: {godown.managerName}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            <span>{stats.totalItems} Items stored</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isHighUtil && <AlertTriangle className="h-3 w-3 text-orange-600" />}
                                            <span className={isHighUtil ? "text-orange-600 font-medium" : ""}>
                                                {stats.utilization}% Full
                                            </span>
                                        </div>
                                    </div>

                                    <Progress value={stats.utilization} className={isHighUtil ? "bg-orange-100 [&>div]:bg-orange-600" : ""} />

                                    <div className="pt-2 flex flex-wrap gap-2">
                                        {godown.type === 'kitchen_store' && (
                                            <Badge variant="outline" className="flex gap-1 items-center bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                                                <Thermometer className="h-3 w-3" />
                                                Temp Controlled
                                            </Badge>
                                        )}
                                        <Badge variant={godown.status === 'active' ? 'secondary' : 'destructive'}>
                                            {godown.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </MainLayout>
    );
}
