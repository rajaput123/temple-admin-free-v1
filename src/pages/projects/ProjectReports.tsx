import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Download,
    Filter,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    BarChart3,
    FileText,
    Target,
    Activity
} from 'lucide-react';
import { dummyProjects } from '@/data/projects-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ProjectReports() {
    const totalBudget = dummyProjects.reduce((acc, p) => acc + p.budget.planned, 0);
    const totalActual = dummyProjects.reduce((acc, p) => acc + p.budget.actual, 0);
    const avgProgress = (dummyProjects.reduce((acc, p) => acc + p.progress, 0) / dummyProjects.length).toFixed(1);

    const metrics = [
        {
            label: 'Total Portfolio Budget',
            value: `₹${(totalBudget / 1000000).toFixed(2)}M`,
            trend: '+12%',
            up: true,
            icon: Target,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            label: 'Actual Burn Rate',
            value: `₹${(totalActual / 1000000).toFixed(2)}M`,
            trend: '-5%',
            up: false,
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            label: 'Avg Completion %',
            value: `${avgProgress}%`,
            trend: '+8%',
            up: true,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: 'Cost Efficiency',
            value: '94.2%',
            trend: '+1.2%',
            up: true,
            icon: PieChartIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Strategic Initiatives Report"
                description="Consolidated performance analytics for temple development"
                actions={
                    <div className="flex items-center gap-3">
                        <Select defaultValue="fy2025">
                            <SelectTrigger className="h-9 w-[180px] text-xs font-bold uppercase tracking-widest border-gray-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fy2025">Fiscal Year 2025</SelectItem>
                                <SelectItem value="fy2024">Fiscal Year 2024</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9 text-xs font-bold uppercase tracking-widest">
                            <Download className="h-4 w-4 mr-2" /> Export PDF
                        </Button>
                    </div>
                }
            />

            <div className="p-6 space-y-8 max-w-[1600px] mx-auto pb-20">
                {/* Executive Summary Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`h-10 w-10 rounded-2xl ${m.bg} flex items-center justify-center`}>
                                        <m.icon className={`h-5 w-5 ${m.color}`} />
                                    </div>
                                    <Badge variant="outline" className={`text-[9px] font-black uppercase border-none ${m.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {m.up ? <ArrowUpRight className="h-2 w-2 mr-1" /> : <ArrowDownRight className="h-2 w-2 mr-1" />}
                                        {m.trend}
                                    </Badge>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                                <h3 className="text-2xl font-black text-gray-900">{m.value}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Visual Analytics Layer (Mock) */}
                    <Card className="lg:col-span-2 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Budget vs Actual by Initiative Category</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px] flex items-end gap-12 px-12 pt-0">
                            {[
                                { name: 'Infrastructure', planned: 85, actual: 72 },
                                { name: 'Outreach', planned: 45, actual: 48 },
                                { name: 'Ritual', planned: 30, actual: 15 },
                                { name: 'Admin', planned: 20, actual: 18 },
                            ].map(cat => (
                                <div key={cat.name} className="flex-1 space-y-4">
                                    <div className="flex gap-2 items-end h-[250px]">
                                        <div
                                            className="w-full bg-gray-100 rounded-t-lg transition-all hover:bg-gray-200"
                                            style={{ height: `${cat.planned}%` }}
                                        />
                                        <div
                                            className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 shadow-lg shadow-primary/10"
                                            style={{ height: `${cat.actual}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-center text-gray-400">{cat.name}</p>
                                </div>
                            ))}
                        </CardContent>
                        <div className="p-6 border-t flex justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-gray-100" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Planned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-primary" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Actual Spend</span>
                            </div>
                        </div>
                    </Card>

                    {/* Status Distribution */}
                    <Card className="border-none shadow-sm flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Project Intensity Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center space-y-6">
                            {[
                                { label: 'High Priority / Critical', val: 3, color: 'bg-red-500' },
                                { label: 'Active Execution', val: 12, color: 'bg-blue-500' },
                                { label: 'On Schedule', val: 18, color: 'bg-green-500' },
                                { label: 'Resource Blocked', val: 2, color: 'bg-amber-500' },
                            ].map(item => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="text-gray-900">{item.val} Projects</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${(item.val / 35) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Performance Table */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <div className="flex justify-between items-end">
                            <div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Portfolio Variance Tracker</CardTitle>
                                <CardDescription className="text-xs font-medium">Detailed financial and operational deviation analysis.</CardDescription>
                            </div>
                            <Button variant="ghost" className="h-8 text-[10px] font-black uppercase">View Full Audit Log</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Project Initiative</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Budget Utilization</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Variance</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Progression</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">ROI Estimate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dummyProjects.map(p => {
                                    const percent = (p.budget.actual / p.budget.planned) * 100;
                                    const variance = p.budget.planned - p.budget.actual;
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900">{p.name}</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{p.category}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900">₹{(p.budget.actual / 1000).toFixed(0)}k</div>
                                                <div className="text-[10px] font-bold text-gray-400">{(percent).toFixed(1)}% of planned</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm font-black ${variance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {variance < 0 ? '-' : '+'}₹{Math.abs(variance / 1000).toFixed(0)}k
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Budget {variance < 0 ? 'Exceeded' : 'Remaining'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Progress value={p.progress} className="h-1.5 w-20 bg-gray-100" />
                                                    <span className="text-[10px] font-black text-gray-900">{p.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors uppercase text-[9px] font-black">High Impact</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
