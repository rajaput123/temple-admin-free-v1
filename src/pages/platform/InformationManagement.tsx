import { useState, useMemo } from 'react';
import { PlatformLayout } from '@/components/platform/PlatformLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Eye, Download } from 'lucide-react';
import { mockCrowdsourcedInfo, CrowdsourcedInfo, InfoStatus } from '@/data/crowdsourced-info';
import { InformationValidation } from '@/components/platform/InformationValidation';
import { AddTempleInfo } from '@/components/platform/AddTempleInfo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function InformationManagement() {
  const [infoList, setInfoList] = useState<CrowdsourcedInfo[]>(mockCrowdsourcedInfo);
  const [selectedInfo, setSelectedInfo] = useState<CrowdsourcedInfo | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('validation-queue');

  const pendingInfo = useMemo(() => 
    infoList.filter(info => info.status === 'pending' || info.status === 'needs_review'),
    [infoList]
  );

  const approvedInfo = useMemo(() => 
    infoList.filter(info => info.status === 'approved'),
    [infoList]
  );

  const rejectedInfo = useMemo(() => 
    infoList.filter(info => info.status === 'rejected'),
    [infoList]
  );

  const handleApprove = (id: string, notes?: string) => {
    setInfoList(prev =>
      prev.map(info =>
        info.id === id
          ? {
              ...info,
              status: 'approved' as InfoStatus,
              validatedAt: new Date().toISOString(),
              validatedBy: 'admin-1',
              validationNotes: notes,
            }
          : info
      )
    );
    setIsValidationModalOpen(false);
  };

  const handleReject = (id: string, reason: string) => {
    setInfoList(prev =>
      prev.map(info =>
        info.id === id
          ? {
              ...info,
              status: 'rejected' as InfoStatus,
              validatedAt: new Date().toISOString(),
              validatedBy: 'admin-1',
              rejectionReason: reason,
            }
          : info
      )
    );
    setIsValidationModalOpen(false);
  };

  const handleEdit = (id: string) => {
    const info = infoList.find(i => i.id === id);
    if (info) {
      setSelectedInfo(info);
      setIsValidationModalOpen(true);
    }
  };

  const handleRequestMore = (id: string, message: string) => {
    setInfoList(prev =>
      prev.map(info =>
        info.id === id
          ? {
              ...info,
              status: 'needs_review' as InfoStatus,
              validationNotes: `Requested: ${message}`,
            }
          : info
      )
    );
    setIsValidationModalOpen(false);
  };

  const handleAddInfo = (data: Record<string, unknown>) => {
    const newInfo: CrowdsourcedInfo = {
      id: `info-${Date.now()}`,
      templeName: data.templeName as string || 'Unknown',
      location: `${data.city}, ${data.state}`,
      infoType: 'temple_details',
      data,
      source: 'admin',
      status: 'approved',
      submittedAt: new Date().toISOString(),
      validatedAt: new Date().toISOString(),
      validatedBy: 'admin-1',
      validationNotes: 'Added directly by admin - verified',
    };
    setInfoList(prev => [...prev, newInfo]);
    setIsAddModalOpen(false);
  };

  const columns = [
    {
      key: 'templeName',
      label: 'Temple Name',
      render: (value: unknown, row: CrowdsourcedInfo) => (
        <div>
          <div className="font-medium">{row.templeName}</div>
          <div className="text-xs text-muted-foreground">{row.location}</div>
        </div>
      ),
    },
    {
      key: 'infoType',
      label: 'Type',
      render: (value: unknown) => (
        <span className="capitalize">{(value as string).replace('_', ' ')}</span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (value: unknown) => {
        const colors: Record<string, string> = {
          devotee: 'bg-blue-100 text-blue-800',
          admin: 'bg-green-100 text-green-800',
          public: 'bg-gray-100 text-gray-800',
        };
        return (
          <Badge className={colors[value as string] || 'bg-gray-100 text-gray-800'}>
            {value as string}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as InfoStatus;
        const variants: Record<InfoStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          pending: 'secondary',
          approved: 'default',
          rejected: 'destructive',
          needs_review: 'outline',
        };
        return (
          <Badge variant={variants[status]}>
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Information Management</h1>
            <p className="text-muted-foreground mt-2">
              Validate crowdsourced temple information from devotees and public
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Information
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="validation-queue">
              Validation Queue ({pendingInfo.length})
            </TabsTrigger>
            <TabsTrigger value="validated">
              Validated ({approvedInfo.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedInfo.length})
            </TabsTrigger>
            <TabsTrigger value="database">
              Temple Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validation-queue" className="space-y-4">
            <DataTable
              data={pendingInfo}
              columns={columns}
              searchPlaceholder="Search pending information..."
              actions={(row) => (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedInfo(row);
                      setIsValidationModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </>
              )}
            />
          </TabsContent>

          <TabsContent value="validated" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <DataTable
              data={approvedInfo}
              columns={columns}
              searchPlaceholder="Search validated information..."
            />
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <DataTable
              data={rejectedInfo}
              columns={columns}
              searchPlaceholder="Search rejected information..."
            />
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Master database of all validated temple information
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  Import
                </Button>
              </div>
            </div>
            <DataTable
              data={approvedInfo}
              columns={columns}
              searchPlaceholder="Search temple database..."
            />
          </TabsContent>
        </Tabs>
      </div>

      {selectedInfo && (
        <Dialog open={isValidationModalOpen} onOpenChange={setIsValidationModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Information</DialogTitle>
            </DialogHeader>
            <InformationValidation
              info={selectedInfo}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
              onRequestMore={handleRequestMore}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Temple Information</DialogTitle>
          </DialogHeader>
          <AddTempleInfo
            onSave={handleAddInfo}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PlatformLayout>
  );
}
