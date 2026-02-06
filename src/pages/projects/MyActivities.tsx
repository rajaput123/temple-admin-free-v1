import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    MoreVertical,
    Eye,
    ListTodo,
    LayoutGrid as KanbanIcon,
    Filter,
    ArrowRight,
    Users
} from 'lucide-react';
import { dummyActivities, dummyProjects } from '@/data/projects-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function MyActivities() {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Filter tasks assigned to "EMP001" (the assumed current user)
    const myTasks = dummyActivities.filter(a => a.assignedTo?.includes('EMP001'));

    const openTaskDetails = (task: any) => {
        setSelectedTask(task);
        setIsDrawerOpen(true);
    };

    const getProjectName = (id: string) => dummyProjects.find(p => p.id === id)?.name || 'Unknown Project';

    return (
        <MainLayout>
            <PageHeader
                title="My Project Activities"
                description="Consolidated task management across all temple initiatives"
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 text-[10px] font-black uppercase px-4"
                                onClick={() => setViewMode('list')}
                            >
                                <ListTodo className="h-3 w-3 mr-2" /> List
                            </Button>
                            <Button
                                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 text-[10px] font-black uppercase px-4"
                                onClick={() => setViewMode('kanban')}
                            >
                                <KanbanIcon className="h-3 w-3 mr-2" /> Board
                            </Button>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 h-9 font-bold text-xs">
                            Update Velocity
                        </Button>
                    </div>
                }
            />

            <div className="p-6">
                {viewMode === 'list' ? (
                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Task & Project</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Workflow State</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Priority</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Projected Completion</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Progress</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {myTasks.map(task => (
                                        <tr key={task.id} className="hover:bg-primary/[0.02] cursor-pointer group" onClick={() => openTaskDetails(task)}>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{task.title}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project:</span>
                                                    <span className="text-[10px] font-black text-gray-700 uppercase">{getProjectName(task.projectId)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase border-none px-2 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                            task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {task.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${task.priority === 'urgent' ? 'bg-red-500' :
                                                            task.priority === 'high' ? 'bg-amber-500' : 'bg-gray-300'
                                                        }`} />
                                                    <span className="text-[10px] font-bold uppercase text-gray-600">{task.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                                                    <Clock className="h-3 w-3 text-gray-300" />
                                                    {task.dueDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${task.progress}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-900">{task.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {['pending', 'in_progress', 'blocked', 'completed'].map(status => (
                            <div key={status} className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${status === 'completed' ? 'bg-green-500' :
                                                status === 'in_progress' ? 'bg-blue-500' :
                                                    status === 'blocked' ? 'bg-red-500' : 'bg-gray-300'
                                            }`} />
                                        {status.replace('_', ' ')}
                                        <span className="bg-gray-100 text-gray-500 px-1.5 rounded text-[8px]">{myTasks.filter(t => t.status === status).length}</span>
                                    </h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3 w-3 text-gray-300" /></Button>
                                </div>
                                <div className="space-y-4">
                                    {myTasks.filter(t => t.status === status).map(task => (
                                        <Card key={task.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openTaskDetails(task)}>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-tighter text-gray-400 border-gray-100">
                                                        {getProjectName(task.projectId)}
                                                    </Badge>
                                                    <Badge className={`text-[8px] font-black uppercase border-none px-1.5 ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                            task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex -space-x-2">
                                                        <div className="h-5 w-5 rounded-full bg-primary/10 border-2 border-white text-[8px] font-black flex items-center justify-center text-primary">RK</div>
                                                    </div>
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                                        Due: {task.dueDate.split(',')[0]}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <div className="h-20 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                        Drop to update
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Task Detail Side Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="w-[450px] sm:w-[540px]">
                    <SheetHeader className="bg-gray-50 -mx-6 px-8 py-8 border-b">
                        <Badge className="bg-primary text-white uppercase text-[10px] font-black border-none w-fit mb-4">Task Detail</Badge>
                        <SheetTitle className="text-2xl font-black text-gray-900 leading-tight">
                            {selectedTask?.title}
                        </SheetTitle>
                        <SheetDescription className="text-xs font-bold uppercase tracking-widest text-primary mt-2">
                            Project: {selectedTask && getProjectName(selectedTask.projectId)}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Set Status</Label>
                                <Select defaultValue={selectedTask?.status}>
                                    <SelectTrigger className="h-11 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending" className="text-xs font-bold uppercase">Pending</SelectItem>
                                        <SelectItem value="in_progress" className="text-xs font-bold uppercase">In Progress</SelectItem>
                                        <SelectItem value="blocked" className="text-xs font-bold uppercase text-red-600">Blocked</SelectItem>
                                        <SelectItem value="completed" className="text-xs font-bold uppercase text-green-600">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Priority level</Label>
                                <Select defaultValue={selectedTask?.priority}>
                                    <SelectTrigger className="h-11 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Project Progress Contribution</Label>
                            <Input type="number" defaultValue={selectedTask?.progress} className="h-11 font-black text-lg" />
                            <Progress value={selectedTask?.progress} className="h-1.5 bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Briefing / Work Log</Label>
                            <Textarea
                                placeholder="Log your progress or notes here..."
                                className="min-h-[150px] resize-none bg-gray-50 border-gray-100 text-sm leading-relaxed"
                                defaultValue={selectedTask?.description}
                            />
                        </div>
                    </div>

                    <SheetFooter className="absolute bottom-0 left-0 right-0 p-8 border-t bg-gray-50 flex justify-between items-center">
                        <Button variant="ghost" className="text-red-500 font-black uppercase text-[10px] tracking-widest">Request Support</Button>
                        <div className="flex gap-4">
                            <Button variant="outline" className="h-11 px-8 font-bold uppercase text-[10px]" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
                            <Button className="h-11 px-10 font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20">Record Progress</Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </MainLayout>
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
