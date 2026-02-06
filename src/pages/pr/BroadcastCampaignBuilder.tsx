import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';

const defaultTemplates = ['Darshan Confirmation', 'Event Invitation', 'Crisis Alert', 'Donation Receipt'];
const defaultAudiences = ['all', 'donors', 'volunteers', 'sevakartas', 'members'];
import {
    Send,
    ArrowLeft,
    Mail,
    MessageSquare,
    Phone,
    Users,
    Target,
    Zap,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export default function BroadcastCampaignBuilder() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [channel, setChannel] = useState<'sms' | 'email' | 'whatsapp'>('sms');
    const [isLoading, setIsLoading] = useState(false);
    const [templates, setTemplates] = useState<string[]>(defaultTemplates);
    const [audiences, setAudiences] = useState<string[]>(defaultAudiences);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    const [formData, setFormData] = useState({
        campaignName: '',
        templateId: '',
        message: '',
        audience: 'all',
        scheduledFor: '',
    });

    const handleAddTemplate = async (data: Record<string, any>): Promise<string> => {
        const newTemplate = data.name?.trim();
        if (!newTemplate || templates.includes(newTemplate)) {
            throw new Error('Template already exists or invalid');
        }
        setTemplates([...templates, newTemplate]);
        return newTemplate;
    };

    const handleAddAudience = async (data: Record<string, any>): Promise<string> => {
        const newAudience = data.name?.toLowerCase().trim();
        if (!newAudience || audiences.includes(newAudience)) {
            throw new Error('Audience already exists or invalid');
        }
        setAudiences([...audiences, newAudience]);
        return newAudience;
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: 'Campaign Dispatched', description: 'Your message is being queued for delivery.' });
            navigate('/pr/broadcast');
        }, 1500);
    };

    return (
        <MainLayout>
            <PageHeader
                title="Create Broadcast Campaign"
                description="Launch a new multi-channel message to your temple community"
                actions={
                    <Button variant="outline" onClick={() => navigate('/pr/broadcast')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
                    </Button>
                }
            />

            <div className="max-w-5xl mx-auto pb-32 px-4">
                <form onSubmit={handleSend} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-primary/10">
                            <CardHeader className="bg-gray-50/50 border-b">
                                <CardTitle className="text-lg">Step 1: Choose Channel</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs value={channel} onValueChange={(v) => setChannel(v as any)} className="w-full">
                                    <TabsList className="grid grid-cols-3 w-full h-20 bg-gray-100 p-1">
                                        <TabsTrigger value="sms" className="flex flex-col gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">SMS</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="whatsapp" className="flex flex-col gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Phone className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="email" className="flex flex-col gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="bg-gray-50/50 border-b">
                                <CardTitle className="text-lg">Step 2: Compose Message</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campaign Reference Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Festival Reminder - March"
                                        value={formData.campaignName}
                                        onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="template">Start from Template</Label>
                                    <DropdownWithAdd
                                        value={formData.templateId}
                                        options={templates}
                                        onValueChange={(v) => setFormData({ ...formData, templateId: v })}
                                        addButtonLabel="Create New Template"
                                        quickAddConfig={{
                                            title: 'Create New Template',
                                            fields: [
                                                { name: 'name', label: 'Template Name', type: 'text', required: true, placeholder: 'e.g., Festival Reminder' },
                                                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                            ],
                                            onSave: handleAddTemplate,
                                        }}
                                        placeholder="Select a pre-approved template..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message Content *</Label>
                                    <Textarea
                                        id="message"
                                        rows={6}
                                        placeholder="Type your message content..."
                                        className="font-medium resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                                        <span>Use {'{name}, {date}, {event}'} for personalization</span>
                                        <span className={formData.message.length > 160 ? 'text-red-500' : ''}>
                                            {formData.message.length} Characters
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Audience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="audience">Target Segment</Label>
                                    <DropdownWithAdd
                                        value={formData.audience}
                                        options={audiences}
                                        onValueChange={(v) => setFormData({ ...formData, audience: v })}
                                        addButtonLabel="Add New Audience"
                                        quickAddConfig={{
                                            title: 'Add New Audience Segment',
                                            fields: [
                                                { name: 'name', label: 'Audience Name', type: 'text', required: true, placeholder: 'e.g., Regular Devotees' },
                                                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                            ],
                                            onSave: handleAddAudience,
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schedule">Schedule Sending</Label>
                                    <Input
                                        id="schedule"
                                        type="datetime-local"
                                        value={formData.scheduledFor}
                                        onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium italic">Leave empty to send immediately.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">
                                    Custom Fields
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <CustomFields
                                    initialCustomFields={customFields}
                                    onCustomFieldsChange={setCustomFields}
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Dispatch Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Recipients:</span>
                                    <span className="font-bold text-gray-900">1,200</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Channel:</span>
                                    <Badge variant="outline" className="h-4 text-[9px] uppercase font-bold bg-white">{channel}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs border-t pt-2 border-primary/10">
                                    <span className="text-gray-900 font-bold uppercase tracking-tighter">Est. Credit Cost:</span>
                                    <span className="text-lg font-black text-primary">
                                        {channel === 'sms' ? '$18.40' : '$0.00'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                            <div className="text-xs text-blue-800 leading-relaxed">
                                <span className="font-bold block mb-1">Provider: Twilio / SendGrid</span>
                                Your message will be sent through the connected temple gateway. Please ensure sufficient balance before dispatch.
                            </div>
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t flex justify-between items-center gap-4 z-50">
                        <div className="flex items-center gap-2 px-4">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-bold text-gray-600">Gateways Online</span>
                        </div>
                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/pr/broadcast')}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 min-w-[180px] font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" /> Start Campaign
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
