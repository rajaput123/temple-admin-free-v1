import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { dummyCommunicationMetrics, dummyCommunicationAuditLogs } from '@/data/communications-data';
import type { CommunicationAuditLog } from '@/types/communications';

export default function Reports() {
  const [metrics] = useState(dummyCommunicationMetrics);
  const [auditLogs] = useState<CommunicationAuditLog[]>(dummyCommunicationAuditLogs);

  const auditColumns = [
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: unknown, row: CommunicationAuditLog) => (
        <Badge variant="outline" className="capitalize">
          {row.action.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'communicationType',
      label: 'Communication Type',
      sortable: true,
      render: (value: unknown, row: CommunicationAuditLog) => (
        <Badge variant="outline" className="capitalize">
          {row.communicationType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'communicationId',
      label: 'Communication ID',
      render: (value: unknown, row: CommunicationAuditLog) => (
        <div className="font-mono text-sm">{row.communicationId}</div>
      ),
    },
    {
      key: 'performedBy',
      label: 'Performed By',
      sortable: true,
      render: (value: unknown, row: CommunicationAuditLog) => (
        <div className="font-medium">{row.performedBy}</div>
      ),
    },
    {
      key: 'performedAt',
      label: 'Timestamp',
      sortable: true,
      render: (value: unknown, row: CommunicationAuditLog) => (
        <div className="text-sm">
          {new Date(row.performedAt).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (value: unknown, row: CommunicationAuditLog) => (
        <div className="text-sm text-gray-600 max-w-md truncate">
          {row.details || '-'}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Communication Reports & Audit"
        description="View communication metrics, delivery statistics, and audit trails"
      />

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics & Analytics
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Total Messages</div>
                <div className="text-2xl font-bold mt-1">{metrics.totalMessages}</div>
                <div className="text-xs text-gray-500 mt-1">Period: {metrics.period}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600">Delivery Success Rate</div>
                <div className="text-2xl font-bold mt-1 text-green-600">
                  {metrics.deliverySuccessRate}%
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Avg Response Time</div>
                <div className="text-2xl font-bold mt-1">{metrics.averageResponseTime} min</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="text-sm text-gray-600">Crisis Alerts</div>
                <div className="text-2xl font-bold mt-1 text-red-600">
                  {metrics.crisisAlertsCount}
                </div>
              </div>
            </div>

            {/* Channel-wise Metrics */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-4">Channel-wise Performance</h3>
              <div className="space-y-3">
                {metrics.byChannel.map((channel, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {channel.channel.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-600">{channel.count} messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${channel.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {channel.successRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-4">Status Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                {metrics.byStatus.map((status, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 capitalize">
                      {status.status.replace('_', ' ')}
                    </div>
                    <div className="text-xl font-bold mt-1">{status.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unauthorized Attempts */}
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-600">Security Alerts</h3>
              </div>
              <div className="text-sm text-gray-700">
                <strong>{metrics.unauthorizedAttemptsCount}</strong> unauthorized communication attempts detected and blocked.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-4">Communication Audit Trail</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete log of all communication-related actions for compliance and audit purposes.
              </p>
              <DataTable data={auditLogs} columns={auditColumns} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
