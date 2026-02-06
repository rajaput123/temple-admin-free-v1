import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Save,
    Calendar,
    Wallet,
    Users,
    Info,
    Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const STEPS = [
    { id: 1, name: 'Basic Info', icon: Info },
    { id: 2, name: 'Timeline', icon: Calendar },
    { id: 3, name: 'Budget & Assignment', icon: Wallet },
    { id: 4, name: 'Review', icon: CheckCircle2 },
];

export default function ProjectEditor() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'infrastructure',
        startDate: '',
        endDate: '',
        plannedBudget: '',
        currency: 'INR',
        managerId: '',
        status: 'proposed'
    });

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (status: 'proposed' | 'active') => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: 'Project Registered',
                description: `Initiative "${formData.name}" has been saved as ${status.toUpperCase()}.`
            });
            navigate('/projects');
        }, 1500);
    };

    return (
        <MainLayout>
            <PageHeader
                title="Register New Initiative"
                description="Follow the guided wizard to define a new temple project"
                actions={
                    <Button variant="outline" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Discard
                    </Button>
                }
            />

            <div className="max-w-4xl mx-auto pb-32 px-4">
                {/* Stepper Progress */}
                <div className="flex justify-between items-center mb-12 relative px-8">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                    {STEPS.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.id === currentStep ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' :
                                step.id < currentStep ? 'bg-green-500 border-green-500 text-white' :
                                    'bg-white border-gray-200 text-gray-400'
                                }`}>
                                {step.id < currentStep ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase mt-2 tracking-widest ${step.id === currentStep ? 'text-primary' : 'text-gray-400'
                                }`}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b p-8">
                                <CardTitle className="text-xl font-black text-gray-900">Step 1: Core Information</CardTitle>
                                <CardDescription>Define the project name, category, and vision.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Project Name *</Label>
                                    <Input
                                        placeholder="e.g., South Gate Restoration"
                                        className="h-12 text-lg font-bold"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Initiative Category</Label>
                                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                                <SelectItem value="outreach">Social Outreach</SelectItem>
                                                <SelectItem value="ritual">Ritual Enhancement</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Lead Project Manager</Label>
                                        <Select value={formData.managerId} onValueChange={v => setFormData({ ...formData, managerId: v })}>
                                            <SelectTrigger className="h-11"><SelectValue placeholder="Select staff..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EMP001">Ramesh Kumar (Admin)</SelectItem>
                                                <SelectItem value="EMP005">Suresh Singh (Ops)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Mission / Vision Statement</Label>
                                    <Textarea
                                        placeholder="Describe the long-term impact of this project..."
                                        className="h-32 resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Timeline */}
                    {currentStep === 2 && (
                        <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b p-8">
                                <CardTitle className="text-xl font-black text-gray-900">Step 2: Scheduling & Timeline</CardTitle>
                                <CardDescription>Set the execution window for this initiative.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-2">
                                            <Rocket className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Target Commencement</Label>
                                            <Input
                                                type="date"
                                                className="h-11"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Estimated start of activities</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center mb-2">
                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Projected Handover</Label>
                                            <Input
                                                type="date"
                                                className="h-11"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Target completion date</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
                                    <Info className="h-6 w-6 text-amber-500 shrink-0" />
                                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                        <span className="font-bold block mb-1 uppercase tracking-widest text-[10px]">Strategic Note:</span>
                                        Timelines are used for the Gantt view and budget forecasting. Ensure dates align with major temple festivals to avoid logistical overlapping.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Budget & Assignment */}
                    {currentStep === 3 && (
                        <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b p-8">
                                <CardTitle className="text-xl font-black text-gray-900">Step 3: Financial Governance</CardTitle>
                                <CardDescription>Allocate resources and define the monetary scope.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-4 gap-6 items-end">
                                    <div className="col-span-3 space-y-2">
                                        <Label className="text-sm font-bold">Planned Expenditure Limit</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="h-12 text-2xl font-black text-primary"
                                            value={formData.plannedBudget}
                                            onChange={e => setFormData({ ...formData, plannedBudget: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Currency</Label>
                                        <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
                                            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-bold">Strategic Personnel Assignment</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Project Auditor', 'Logistics Lead', 'Finance Liaison'].map(role => (
                                            <div key={role} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-700">{role}</span>
                                                </div>
                                                <Button variant="outline" size="sm" className="h-7 text-[9px] uppercase font-black">Assign</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                                <CardHeader className="bg-primary/5 border-b p-8">
                                    <CardTitle className="text-xl font-black text-primary">Step 4: Review & Finalize</CardTitle>
                                    <CardDescription>Confirm all strategic details before submitting.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Summary</div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-gray-900">{formData.name || 'Untitled Project'}</h4>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase text-gray-500 bg-gray-50">{formData.category}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                                "{formData.description || 'No vision statement provided.'}"
                                            </p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex gap-8">
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Timeframe</div>
                                                    <div className="text-sm font-black text-gray-900">
                                                        {formData.startDate || 'TBD'} — {formData.endDate || 'TBD'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Budget</div>
                                                    <div className="text-sm font-black text-primary text-lg">
                                                        {formData.currency} {formData.plannedBudget || '0.00'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assignment</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">RM</div>
                                                    <span className="text-sm font-bold text-gray-700">Ramesh Kumar (Project Lead)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                                <Rocket className="h-6 w-6 text-blue-500 shrink-0" />
                                <div className="text-xs text-blue-900 leading-relaxed">
                                    <span className="font-black block mb-1 uppercase tracking-widest text-[10px]">Readiness Check:</span>
                                    By activating this project, all assigned staff will receive notifications and the initiative will appear in the temple's public portfolio.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Wizard Navigation Actions */}
                <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-white border-t flex justify-between items-center gap-4 z-50">
                    <Button
                        variant="ghost"
                        className="font-bold text-gray-600"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div className="flex gap-4">
                        {currentStep < 4 ? (
                            <Button className="bg-primary hover:bg-primary/90 h-11 px-8 font-black" onClick={handleNext}>
                                Continue <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 font-bold border-gray-300"
                                    onClick={() => handleSubmit('proposed')}
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" /> Save Draft Proposal
                                </Button>
                                <Button
                                    className="bg-primary hover:bg-primary/90 h-11 px-10 font-bold shadow-lg shadow-primary/20"
                                    onClick={() => handleSubmit('active')}
                                    disabled={isLoading}
                                >
                                    <Rocket className="h-4 w-4 mr-2" /> {isLoading ? 'Activating...' : 'Activate Initiative'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
