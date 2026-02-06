import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    Clock,
    Users,
    Wallet,
    FileText,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Plus,
    MoreVertical,
    Download,
    Eye,
    ChevronRight,
    MessageSquare,
    Play,
    ListTodo,
    PieChart,
    Files,
    TrendingUp
} from 'lucide-react';
import {
    dummyProjects,
    dummyActivities,
    dummyMilestones,
    dummyProjectFinance,
    dummyProjectDocs
} from '@/data/projects-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(dummyProjects.find(p => p.id === id) || dummyProjects[0]);
    const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
    const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    // Filter data for this specific project
    const activities = dummyActivities.filter(a => a.projectId === project.id);
    const milestones = dummyMilestones.filter(m => m.projectId === project.id);
    const finance = dummyProjectFinance.filter(f => f.projectId === project.id);
    const docs = dummyProjectDocs.filter(d => d.projectId === project.id);

    const openActivityDetails = (activity: any) => {
        setSelectedActivity(activity);
        setIsActivityDrawerOpen(true);
    };

    return (
        <MainLayout>
            {/* Context-Switched Header with Breadcrumbs */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="p-4 px-6 flex items-center justify-between max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                <span>Projects</span>
                                <ChevronRight className="h-3 w-3" />
                            </div>
                            <Select value={project.id} onValueChange={(val) => val === 'all' ? navigate('/projects') : navigate(`/projects/${val}`)}>
                                <SelectTrigger className="h-8 w-[220px] bg-gray-50 border-none font-bold text-xs uppercase tracking-wider">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-[10px] font-bold uppercase">All Projects</SelectItem>
                                    {dummyProjects.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {project.status === 'proposed' && (
                            <>
                                <Button variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50 text-[10px] font-black uppercase">Reject Proposal</Button>
                                <Button className="h-8 bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase">Approve & Activate</Button>
                            </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="px-6 pb-4 max-w-[1600px] mx-auto flex items-end justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-gray-900">{project.name}</h1>
                            <Badge className={`uppercase text-[9px] font-black border-none px-2 ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                                project.status === 'delayed' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{project.description}</p>
                    </div>

                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Project Progress</p>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-gray-900">{project.progress}%</span>
                                <Progress value={project.progress} className="h-2 w-24 bg-gray-100" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 max-w-[1600px] mx-auto">
                    <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="bg-transparent border-b-0 h-12 p-0 gap-8">
                            {['summary', 'timeline', 'execution', 'finance', 'documents'].map(tab => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-primary"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="p-6 max-w-[1600px] mx-auto">
                <Tabs defaultValue="summary" className="w-full space-y-6">
                    {/* Note: We use hidden TabsList to allow TabsContent to work across the sticky header */}
                    <TabsList className="hidden"><TabsTrigger value="summary">S</TabsTrigger></TabsList>

                    {/* Summary Tab */}
                    <TabsContent value="summary" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="col-span-2 border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black uppercase tracking-widest text-[10px] text-gray-400">Strategic Vision</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-0">
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                        The {project.name} initiative aims to revitalize the temple's architectural heritage while integrating modern safety standards.
                                        This involves intricate gold gilding, structural reinforcement, and digital monitoring systems.
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Start Date', value: project.startDate, icon: Calendar },
                                            { label: 'End Date', value: project.endDate, icon: Clock },
                                            { label: 'Manager', value: 'Ramesh Kumar', icon: Users },
                                            { label: 'Category', value: project.category, icon: FileText },
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <item.icon className="h-4 w-4 text-primary mb-2" />
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{item.label}</p>
                                                <p className="text-xs font-black text-gray-900 mt-0.5">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black uppercase tracking-widest text-[10px] text-primary">Key Stakeholders</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-0">
                                    {[
                                        { name: 'Admin Dept', role: 'Governance', contact: 'Ramesh K.' },
                                        { name: 'Architecture Firm', role: 'Technical', contact: 'A. Sharma' },
                                        { name: 'Trust Board', role: 'Approval', contact: 'V. Rao' },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-primary/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">{s.name[0]}</div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-900">{s.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{s.role}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="h-3 w-3" /></Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-black uppercase tracking-widest text-[10px] text-gray-400">Milestone Roadmap</CardTitle>
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase">Configure Gantt</Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-4">
                                    {milestones.map((m, i) => (
                                        <div key={m.id} className="flex gap-6 relative">
                                            <div className="flex flex-col items-center shrink-0 w-12">
                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center z-10 ${m.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    m.status === 'delayed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {m.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                </div>
                                                {i < milestones.length - 1 && <div className="w-0.5 h-full bg-gray-100 absolute top-8" />}
                                            </div>
                                            <div className="pb-8 flex-1 border-b last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-black text-gray-900">{m.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.dueDate}</span>
                                                            {m.isCritical && <Badge className="bg-amber-100 text-amber-700 uppercase text-[8px] font-black border-none">Critical Path</Badge>}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase opacity-0 group-hover:opacity-100">Edit</Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Execution Tab */}
                    <TabsContent value="execution" className="space-y-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Project Activities</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ongoing and planned tasks</p>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 h-9" onClick={() => { setSelectedActivity(null); setIsActivityDrawerOpen(true); }}>
                                <Plus className="h-4 w-4 mr-2" /> Add Activity
                            </Button>
                        </div>

                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Activity</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Priority</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Due Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Completion</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {activities.map(activity => (
                                            <tr key={activity.id} className="hover:bg-primary/[0.02] cursor-pointer group" onClick={() => openActivityDetails(activity)}>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{activity.title}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Assigned to: {activity.assignedTo?.join(', ')}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={`text-[9px] font-black uppercase border-none ${activity.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                        activity.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                                                            activity.status === 'blocked' ? 'bg-red-50 text-red-600' :
                                                                'bg-gray-50 text-gray-400'
                                                        }`}>
                                                        {activity.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`text-[9px] font-black uppercase border-none ${activity.priority === 'urgent' ? 'bg-red-500 text-white' :
                                                        activity.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {activity.priority}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-700">{activity.dueDate}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 flex items-center gap-3">
                                                        <Progress value={activity.progress} className="h-1.5 flex-1 bg-gray-100" />
                                                        <span className="text-[10px] font-bold text-gray-900">{activity.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><Eye className="h-4 w-4 text-gray-400" /></Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Finance Tab */}
                    <TabsContent value="finance" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Budget', value: `INR ${(project.budget.planned / 1000).toFixed(0)}K`, type: 'total' },
                                { label: 'Actual Spent', value: `INR ${(project.budget.actual / 1000).toFixed(0)}K`, type: 'spent' },
                                { label: 'Remaining', value: `INR ${((project.budget.planned - project.budget.actual) / 1000).toFixed(0)}K`, type: 'left' },
                                { label: 'Budget Utilized', value: `${((project.budget.actual / project.budget.planned) * 100).toFixed(1)}%`, type: 'percent' },
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-xl font-black text-gray-900">{stat.value}</h3>
                                        <Progress
                                            value={stat.type === 'percent' ? parseFloat(stat.value) : 100}
                                            className={`h-1.5 mt-4 bg-gray-100 ${stat.type === 'left' ? 'bg-green-500' : ''}`}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-widest text-[10px] text-gray-400">Expense Audit</CardTitle>
                                    <CardDescription>Verified financial records for this initiative.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" onClick={() => setIsExpenseDrawerOpen(true)}>
                                    <Plus className="h-3 w-3 mr-2 text-primary" /> Log Expense
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-0 divide-y">
                                    {finance.map(f => (
                                        <div key={f.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${f.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {f.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{f.description}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{f.category} • Recorded by {f.recordedBy}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${f.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {f.type === 'income' ? '+' : '-'} {project.budget.currency} {f.amount.toLocaleString()}
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{f.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Project Repository</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Plans, Contracts, and Reports</p>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 h-9">
                                <Plus className="h-4 w-4 mr-2" /> Upload File
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {docs.map(doc => (
                                <Card key={doc.id} className="group hover:shadow-lg transition-all border-gray-100 overflow-hidden bg-white">
                                    <div className="aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                                        <FileText className="h-10 w-10 text-gray-200 group-hover:scale-110 group-hover:text-primary/20 transition-all" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full"><Eye className="h-4 w-4" /></Button>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full"><Download className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20 bg-primary/5">{doc.category}</Badge>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{doc.size}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-gray-900 truncate">{doc.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Uploaded {doc.uploadedAt}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Execution Detail / Activity Side Drawer */}
            <Sheet open={isActivityDrawerOpen} onOpenChange={setIsActivityDrawerOpen}>
                <SheetContent className="w-[450px] sm:w-[540px]">
                    <SheetHeader className="bg-gray-50 -mx-6 px-8 py-8 border-b">
                        <div className="flex justify-between items-start">
                            <Badge className="bg-primary/10 text-primary uppercase text-[10px] font-black border-none mb-4">Task Detail</Badge>
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase">Copy URL</Button>
                        </div>
                        <SheetTitle className="text-2xl font-black text-gray-900">
                            {selectedActivity ? selectedActivity.title : 'New Project Activity'}
                        </SheetTitle>
                        <SheetDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Execution Context: {project.name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-8 space-y-8">
                        {/* Status & Priority Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Status</Label>
                                <Select defaultValue={selectedActivity?.status || 'pending'}>
                                    <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Priority</Label>
                                <Select defaultValue={selectedActivity?.priority || 'normal'}>
                                    <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Resource Assignment</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedActivity?.assignedTo?.map((id: string) => (
                                    <Badge key={id} className="bg-blue-50 text-blue-700 px-3 py-1 flex items-center gap-2 border-none">
                                        <div className="h-4 w-4 rounded-full bg-blue-600/10 flex items-center justify-center text-[8px] font-black">{id[0]}</div>
                                        <span className="text-[10px] font-bold">{id}</span>
                                    </Badge>
                                ))}
                                <Button variant="outline" size="sm" className="h-7 border-dashed border-gray-300 rounded-full px-4">
                                    <Plus className="h-3 w-3 mr-2" /> Add Resource
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Briefing & Notes</Label>
                            <Textarea
                                placeholder="Details about this activity's requirements..."
                                className="h-40 resize-none bg-gray-50/50 border-gray-200"
                                defaultValue={selectedActivity?.description || ''}
                            />
                        </div>

                        {/* Progress */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold uppercase tracking-tighter text-gray-500">
                                <span>Activity Progress</span>
                                <span className="text-gray-900">{selectedActivity?.progress || 0}%</span>
                            </div>
                            <Progress value={selectedActivity?.progress || 0} className="h-2 bg-gray-100" />
                        </div>
                    </div>

                    <SheetFooter className="absolute bottom-0 left-0 right-0 p-8 border-t bg-gray-50">
                        <div className="flex justify-between w-full">
                            <Button variant="ghost" className="text-red-500 font-bold text-[10px] uppercase">Archive Task</Button>
                            <div className="flex gap-3">
                                <Button variant="outline" className="h-10 px-6 font-bold uppercase text-[10px]" onClick={() => setIsActivityDrawerOpen(false)}>Cancel</Button>
                                <Button className="h-10 px-8 font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20">Save Updates</Button>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Expense Logging Side Drawer */}
            <Sheet open={isExpenseDrawerOpen} onOpenChange={setIsExpenseDrawerOpen}>
                <SheetContent className="w-[450px]">
                    <SheetHeader className="bg-gray-50 -mx-6 px-8 py-8 border-b">
                        <div className="flex justify-between items-start">
                            <Badge className="bg-amber-100 text-amber-700 uppercase text-[10px] font-black border-none mb-4">Financial Record</Badge>
                        </div>
                        <SheetTitle className="text-2xl font-black text-gray-900">Log New Expense</SheetTitle>
                        <SheetDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Initiative: {project.name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Amount ({project.budget.currency})</Label>
                            <Input type="number" placeholder="0.00" className="h-12 text-2xl font-black text-gray-900 border-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Expense Category</Label>
                            <Select defaultValue="Materials">
                                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Materials">Materials & Procurement</SelectItem>
                                    <SelectItem value="Labor">Labor & Service</SelectItem>
                                    <SelectItem value="Admin">Administrative</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Description</Label>
                            <Textarea placeholder="What was this expenditure for?" className="h-24 resize-none" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-tighter text-gray-500">Date of Transaction</Label>
                            <Input type="date" className="h-11" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <SheetFooter className="absolute bottom-0 left-0 right-0 p-8 border-t bg-gray-50">
                        <div className="flex justify-end gap-3 w-full">
                            <Button variant="outline" className="h-11 px-8 font-bold uppercase text-[10px]" onClick={() => setIsExpenseDrawerOpen(false)}>Cancel</Button>
                            <Button className="h-11 px-10 font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20">Submit Entry</Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </MainLayout>
    );
}
