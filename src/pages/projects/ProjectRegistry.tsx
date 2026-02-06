import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    ChevronRight,
    ArrowLeft,
    Download,
    Filter,
    Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dummyProjects } from '@/data/projects-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, ProjectStatus } from '@/types/projects';
import { useToast } from '@/components/ui/use-toast';

export default function ProjectRegistry() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>(dummyProjects);

    const handleStatusChange = (id: string, newStatus: ProjectStatus) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        toast({ title: 'Status Updated', description: `Project status changed to ${newStatus.toUpperCase()}` });
    };

    const columns = [
        {
            key: 'name',
            label: 'Project Name & Manager',
            sortable: true,
            render: (value: unknown, row: Project) => (
                <div className="py-1">
                    <div className="font-bold text-gray-900 line-clamp-1">{row.name}</div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Mgr ID: {row.managerId}</div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (value: string) => (
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-500 border-gray-100 bg-gray-50/50">
                    {value}
                </Badge>
            )
        },
        {
            key: 'status',
            label: 'Lifecycle Status',
            render: (value: ProjectStatus, row: Project) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select value={row.status} onValueChange={(val) => handleStatusChange(row.id, val as ProjectStatus)}>
                        <SelectTrigger className={`h-8 w-[140px] text-[10px] font-black uppercase border-none ring-0 ${row.status === 'active' ? 'bg-green-100 text-green-700' :
                                row.status === 'delayed' ? 'bg-red-100 text-red-700' :
                                    row.status === 'proposed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-500'
                            }`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="proposed" className="text-[10px] uppercase font-bold">Proposed</SelectItem>
                            <SelectItem value="active" className="text-[10px] uppercase font-bold">Active</SelectItem>
                            <SelectItem value="on_hold" className="text-[10px] uppercase font-bold">On Hold</SelectItem>
                            <SelectItem value="delayed" className="text-[10px] uppercase font-bold">Delayed</SelectItem>
                            <SelectItem value="completed" className="text-[10px] uppercase font-bold">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )
        },
        {
            key: 'progress',
            label: 'Progress',
            sortable: true,
            render: (value: number) => (
                <div className="w-24">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-primary">{value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
                    </div>
                </div>
            )
        },
        {
            key: 'budget',
            label: 'Financial Health',
            render: (value: any, row: Project) => {
                const percent = (row.budget.actual / row.budget.planned) * 100;
                return (
                    <div className="text-[10px] font-bold">
                        <div className="text-gray-900">{row.budget.currency} {(row.budget.actual / 1000).toFixed(1)}k Utilized</div>
                        <div className={`mt-0.5 ${percent > 90 ? 'text-red-500' : 'text-gray-400'}`}>
                            {percent.toFixed(1)}% of {row.budget.planned / 1000}k
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'dates',
            label: 'Timeline',
            render: (value: any, row: Project) => (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    {new Date(row.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' })} -
                    {new Date(row.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </div>
            )
        }
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Project Registry"
                description="Government level control and administration of all temple initiatives"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-9 font-bold text-xs" onClick={() => navigate('/projects')}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                        </Button>
                        <Button onClick={() => navigate('/projects/new')} className="bg-primary hover:bg-primary/90 h-9">
                            <Plus className="h-4 w-4 mr-2" /> Register New Project
                        </Button>
                    </div>
                }
            />

            <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Select defaultValue="all">
                                <SelectTrigger className="h-8 w-[150px] text-xs font-bold border-gray-200">
                                    <Filter className="h-3 w-3 mr-2" />
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                    <SelectItem value="outreach">Social Outreach</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest">
                            <Download className="h-3 w-3 mr-2" /> Export Inventory
                        </Button>
                    </div>

                    <DataTable
                        data={projects}
                        columns={columns}
                        onRowClick={(row) => navigate(`/projects/${row.id}`)}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
