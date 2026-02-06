import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Bell,
    Smartphone,
    Link as LinkIcon,
    Send,
    MoreVertical,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CustomFields, type CustomField } from '@/components/pr/CustomFields';
import { DropdownWithAdd } from '@/components/pr/DropdownWithAdd';

const defaultSegments = ['All App Users', 'Donors', 'Volunteers', 'Members', 'Staff'];
const defaultDeepLinks = ['/events/mahashivaratri-2026', '/donations/history', '/bookings', '/sevas'];
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PushNotification {
    id: string;
    title: string;
    message: string;
    segment: string;
    deepLink?: string;
    status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
    sentAt?: string;
    scheduledAt?: string;
    metrics: {
        delivered: number;
        failed: number;
        ctr: number;
    };
}

const dummyNotifications: PushNotification[] = [
    {
        id: '1',
        title: 'Darshan Timing Change',
        message: 'Temple darshan timings have changed for today due to cleaning.',
        segment: 'All App Users',
        status: 'sent',
        sentAt: '2026-02-05T08:00:00Z',
        metrics: { delivered: 1540, failed: 12, ctr: 4.5 },
    },
    {
        id: '2',
        title: 'Donation Receipt',
        message: 'Your donation receipt for #8821 is ready to view.',
        segment: 'Donors',
        deepLink: '/donations/history',
        status: 'scheduled',
        scheduledAt: '2026-02-06T10:00:00Z',
        metrics: { delivered: 0, failed: 0, ctr: 0 },
    },
    {
        id: '3',
        title: 'Morning Prayer Alert',
        message: 'Join us for the special 5 AM Suprabhatam seva tomorrow.',
        segment: 'All App Users',
        status: 'cancelled',
        sentAt: '2026-02-04T05:00:00Z',
        metrics: { delivered: 0, failed: 0, ctr: 0 },
    }
];

export default function Notifications() {
    const [notifications, setNotifications] = useState<PushNotification[]>(dummyNotifications);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { toast } = useToast();

    // Form State
    const [segments, setSegments] = useState<string[]>(defaultSegments);
    const [deepLinks, setDeepLinks] = useState<string[]>(defaultDeepLinks);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        segment: 'All App Users',
        deepLink: '',
    });

    const handleAddSegment = async (data: Record<string, any>): Promise<string> => {
        const newSegment = data.name?.trim();
        if (!newSegment || segments.includes(newSegment)) {
            throw new Error('Segment already exists or invalid');
        }
        setSegments([...segments, newSegment]);
        return newSegment;
    };

    const handleAddDeepLink = async (data: Record<string, any>): Promise<string> => {
        const newDeepLink = data.name?.trim();
        if (!newDeepLink || deepLinks.includes(newDeepLink)) {
            throw new Error('Deep link already exists or invalid');
        }
        setDeepLinks([...deepLinks, newDeepLink]);
        return newDeepLink;
    };

    const handleSend = () => {
        const newNotif: PushNotification = {
            id: Date.now().toString(),
            ...formData,
            status: 'sent',
            sentAt: new Date().toISOString(),
            metrics: { delivered: 1, failed: 0, ctr: 0 },
        };
        setNotifications([newNotif, ...notifications]);
        setIsDrawerOpen(false);
        toast({ title: 'Notification Sent', description: 'Push notification broadcasted successfully.' });
        setFormData({ title: '', message: '', segment: 'All App Users', deepLink: '' });
    };

    const updateStatus = (id: string, status: PushNotification['status']) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, status } : n));
        toast({ title: `Notification ${status}` });
    };

    const columns = [
        {
            key: 'title',
            label: 'Notification Alert',
            render: (value: unknown, row: PushNotification) => (
                <div className="max-w-md py-1">
                    <div className="font-bold text-gray-900 line-clamp-1">{row.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{row.message}</div>
                    {row.deepLink && (
                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                            <LinkIcon className="h-2.5 w-2.5" /> Destination: {row.deepLink}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'segment',
            label: 'Target Audience',
            render: (value: unknown, row: PushNotification) => (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px] uppercase">
                    {row.segment}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Delivery Status',
            render: (value: unknown, row: PushNotification) => (
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Badge className={`uppercase text-[9px] font-black border-none px-2 ${row.status === 'sent' ? 'bg-green-100 text-green-700' :
                            row.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                row.status === 'cancelled' ? 'bg-gray-100 text-gray-400' :
                                    'bg-yellow-100 text-yellow-700'
                        }`}>
                        {row.status}
                    </Badge>

                    {row.status === 'scheduled' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(row.id, 'cancelled')}
                        >
                            <XCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
        {
            key: 'metrics',
            label: 'Engagement',
            render: (value: unknown, row: PushNotification) => (
                row.status === 'sent' ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                <CheckCircle2 className="h-2.5 w-2.5" /> {row.metrics.delivered}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                                <XCircle className="h-2.5 w-2.5" /> {row.metrics.failed}
                            </div>
                        </div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">CTR: {row.metrics.ctr}%</div>
                    </div>
                ) : row.status === 'scheduled' ? (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                        <Clock className="h-3.5 w-3.5" /> Scheduled
                    </div>
                ) : '-'
            ),
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Push Notifications"
                description="Instant mobile alerts and engagement for temple app users"
                actions={
                    <Button onClick={() => setIsDrawerOpen(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" /> Create Alert
                    </Button>
                }
            />

            <div className="p-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <DataTable
                        data={notifications}
                        columns={columns}
                        onRowClick={(row) => {
                            // Optionally open detail view
                        }}
                    />
                </div>
            </div>

            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader className="pb-6 border-b">
                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" /> New Push Notification
                        </SheetTitle>
                        <SheetDescription>
                            Compose and broadcast an immediate or scheduled alert to mobile users.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 py-8">
                        <div className="space-y-2">
                            <Label className="font-bold">Notification Title *</Label>
                            <Input
                                placeholder="Alert Headline"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Message Content *</Label>
                            <Textarea
                                placeholder="Keep it concise for lock screens..."
                                className="min-h-[100px] resize-none"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            />
                            <div className="text-[10px] text-gray-400 font-medium text-right uppercase">
                                Recommended: Under 120 chars
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Target Audience Segment</Label>
                            <DropdownWithAdd
                                value={formData.segment}
                                options={segments}
                                onValueChange={val => setFormData({ ...formData, segment: val })}
                                addButtonLabel="Add New Segment"
                                quickAddConfig={{
                                    title: 'Add New Segment',
                                    fields: [
                                        { name: 'name', label: 'Segment Name', type: 'text', required: true, placeholder: 'e.g., Regular Devotees' },
                                        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                    ],
                                    onSave: handleAddSegment,
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Deep Link (Mobile Route)</Label>
                            <DropdownWithAdd
                                value={formData.deepLink}
                                options={deepLinks}
                                onValueChange={val => setFormData({ ...formData, deepLink: val })}
                                addButtonLabel="Add New Route"
                                quickAddConfig={{
                                    title: 'Add New Deep Link Route',
                                    fields: [
                                        { name: 'name', label: 'Route Path', type: 'text', required: true, placeholder: 'e.g., /events/new-event' },
                                        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
                                    ],
                                    onSave: handleAddDeepLink,
                                }}
                                placeholder="Select or add deep link route"
                            />
                            <p className="text-[10px] text-gray-400 font-medium leading-tight">
                                Users will be taken to this specific screen inside the app when they tap the notification.
                            </p>
                        </div>

                        <div className="pt-4 border-t">
                            <CustomFields
                                initialCustomFields={customFields}
                                onCustomFieldsChange={setCustomFields}
                            />
                        </div>
                    </div>

                    <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Native App Push</span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleSend}
                                className="bg-primary hover:bg-primary/90 font-bold px-6"
                            >
                                <Send className="h-4 w-4 mr-2" /> Dispatch Alert
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </MainLayout>
    );
}
