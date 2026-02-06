import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
    MessageSquare,
    Mail,
    Phone,
    Plus,
    BarChart3,
    Settings,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    LayoutList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Broadcast {
    id: string;
    type: 'sms' | 'email' | 'whatsapp';
    template: string;
    recipientCount: number;
    status: 'sent' | 'scheduled' | 'failed' | 'processing';
    sentAt: string;
    cost?: number;
    delivered?: number;
}

const dummyBroadcasts: Broadcast[] = [
    { id: '1', type: 'sms', template: 'Darshan Booking Confirm', recipientCount: 120, status: 'sent', sentAt: '2026-02-05T09:00:00Z', cost: 14.50, delivered: 118 },
    { id: '2', type: 'whatsapp', template: 'Event Invite', recipientCount: 450, status: 'sent', sentAt: '2026-02-04T10:00:00Z', cost: 0, delivered: 442 },
    { id: '3', type: 'email', template: 'Weekly Newsletter', recipientCount: 2500, status: 'scheduled', sentAt: '2026-02-07T09:00:00Z', cost: 0 },
    { id: '4', type: 'sms', template: 'Temple Restoration Announcement', recipientCount: 800, status: 'failed', sentAt: '2026-02-01T14:30:00Z', cost: 0 },
];

export default function BroadcastCenter() {
    const navigate = useNavigate();
    const [broadcasts] = useState<Broadcast[]>(dummyBroadcasts);

    const columns = [
        {
            key: 'type',
            label: 'Channel',
            render: (value: unknown, row: Broadcast) => (
                <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                    {row.type === 'sms' && <MessageSquare className="h-3 w-3 text-blue-500" />}
                    {row.type === 'whatsapp' && <Phone className="h-3 w-3 text-green-500" />}
                    {row.type === 'email' && <Mail className="h-3 w-3 text-orange-500" />}
                    {row.type}
                </div>
            ),
        },
        {
            key: 'template',
            label: 'Campaign / Content',
            render: (val: any, row: Broadcast) => (
                <div>
                    <div className="font-bold text-gray-900">{row.template}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 tracking-tighter">ID: {row.id}</div>
                </div>
            )
        },
        {
            key: 'recipientCount',
            label: 'Scope',
            render: (val: any, row: Broadcast) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-700">{row.recipientCount} Recipients</span>
                    {row.delivered && <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{row.delivered} Delivered</span>}
                </div>
            )
        },
        {
            key: 'sentAt',
            label: 'Time Dispatch',
            render: (val: any, row: Broadcast) => (
                <div className="text-xs font-medium text-gray-500">
                    {new Date(row.sentAt).toLocaleDateString()} at {new Date(row.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Execution',
            render: (value: unknown, row: Broadcast) => (
                <Badge className={`uppercase text-[9px] font-bold border-none ${row.status === 'sent' ? 'bg-green-100 text-green-700' :
                        row.status === 'failed' ? 'bg-red-100 text-red-700' :
                            row.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </Badge>
            ),
        },
    ];

    return (
        <MainLayout>
            <PageHeader
                title="Broadcast Center"
                description="Monitor and dispatch multi-channel communications to the temple community"
                actions={
                    <Button onClick={() => navigate('/pr/broadcast/new')} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" /> New Broadcast Campaign
                    </Button>
                }
            />

            <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Row */}
                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+12%</div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">12,450</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Reach</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-gray-300" />
                        </div>
                        <div className="text-2xl font-black text-gray-900">4,820</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">SMS Credits</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="text-2xl font-black text-gray-900">Active</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp Biz</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-orange-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">98.2%</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Delivery</div>
                    </CardContent>
                </Card>

                {/* Main Content Area: History */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <LayoutList className="h-4 w-4 text-primary" />
                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Broadcast History</h3>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider">View Full Logs</Button>
                        </div>
                        <DataTable data={broadcasts} columns={columns} />
                    </div>
                </div>

                {/* Sidebar: System Info */}
                <div className="space-y-6">
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Gateway Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {[
                                { name: 'Twilio SMS', status: 'online', meta: 'North Region' },
                                { name: 'AWS SES', status: 'online', meta: 'Email Service' },
                                { name: 'Meta Business', status: 'maintenance', meta: 'WhatsApp Api' },
                            ].map(gw => (
                                <div key={gw.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50">
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">{gw.name}</div>
                                        <div className="text-[9px] text-gray-400 uppercase font-medium">{gw.meta}</div>
                                    </div>
                                    <Badge variant="outline" className={`h-4 text-[9px] border-none uppercase font-bold ${gw.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {gw.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/30 border-amber-100 border shadow-none">
                        <CardContent className="p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                            <div className="text-[11px] text-amber-800 leading-tight font-medium">
                                <span className="font-bold block mb-1">Low Balance Alert</span>
                                SMS credits are below 5,000 threshold. Some large campaigns might fail.
                                <Button variant="link" className="h-auto p-0 text-[11px] font-bold text-amber-700 underline mt-1">Recharge Now</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
