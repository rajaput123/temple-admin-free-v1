import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Plus,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FolderSearch,
    ChevronDown,
    LayoutGrid,
    Target,
    ArrowRight,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dummyProjects } from '@/data/projects-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProjectsOverview() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const filteredProjects = dummyProjects.filter(p => filter === 'all' || p.status === filter);

    const stats = [
        { label: 'Active Initiatives', value: dummyProjects.filter(p => p.status === 'active').length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Delayed / At Risk', value: dummyProjects.filter(p => p.status === 'delayed').length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Proposed', value: dummyProjects.filter(p => p.status === 'proposed').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Budget Utilized', value: '42.5%', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Projects & Initiatives"
                description="Monitor the strategic growth and infrastructure development of the temple"
                actions={
                    <div className="flex items-center gap-3">
                        <Select value="all">
                            <SelectTrigger className="w-[200px] h-9 bg-white border-primary/20 font-bold text-xs uppercase tracking-wider">
                                <LayoutGrid className="mr-2 h-4 w-4 text-primary" />
                                <SelectValue placeholder="Context: All Projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {dummyProjects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => navigate('/projects/new')} className="bg-primary hover:bg-primary/90 h-9">
                            <Plus className="h-4 w-4 mr-2" /> Create Project
                        </Button>
                    </div>
                }
            />

            <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
                {/* Strategic Awareness Layer: KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters & Tabs */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex gap-4">
                        {['all', 'active', 'delayed', 'proposed'].map(s => (
                            <Button
                                key={s}
                                variant="ghost"
                                size="sm"
                                className={`text-xs font-bold uppercase tracking-tighter h-8 px-4 rounded-full transition-all ${filter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                onClick={() => setFilter(s)}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest border-gray-200" onClick={() => navigate('/projects/registry')}>
                        <FolderSearch className="h-3 w-3 mr-2" /> Project Registry
                    </Button>
                </div>

                {/* Monitoring Layer: Project Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map(project => (
                        <Card
                            key={project.id}
                            className="group cursor-pointer hover:shadow-xl transition-all border-gray-100 overflow-hidden bg-white"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <CardHeader className="p-6 pb-2">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className={`uppercase text-[9px] font-black border-none px-2 ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                                            project.status === 'delayed' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {project.status}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Users className="h-4 w-4" />
                                        <span className="text-[10px] font-bold">8 Staff</span>
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="text-sm line-clamp-2 mt-2 leading-relaxed min-h-[40px]">
                                    {project.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <span>Completion Progress</span>
                                        <span className="text-gray-900">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2 bg-gray-100" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Budget Burn</p>
                                        <p className="text-sm font-black text-gray-900">
                                            {project.budget.currency} {(project.budget.actual / 1000).toFixed(0)}K / {(project.budget.planned / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Next Milestone</p>
                                        <p className="text-sm font-black text-gray-900 truncate">Procurement</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Last modified {new Date(project.lastUpdated).toLocaleDateString()}</span>
                                <Button variant="ghost" size="sm" className="text-primary font-black uppercase text-[10px] tracking-widest gap-2 p-0 h-auto hover:bg-transparent">
                                    Enter Hub <ArrowRight className="h-3 w-3" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Empty Stat / Add New */}
                    <Card
                        className="border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/40 transition-all group flex flex-col items-center justify-center p-12 cursor-pointer"
                        onClick={() => navigate('/projects/new')}
                    >
                        <div className="h-16 w-16 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900">Create New Initiative</h4>
                        <p className="text-sm text-gray-400 text-center mt-2 font-medium">Define goals, timeline, and budget for your next temple project.</p>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
