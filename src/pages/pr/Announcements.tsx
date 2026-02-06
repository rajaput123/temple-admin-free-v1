import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, LayoutGrid, LayoutList, Send } from 'lucide-react';
import { dummyAnnouncements } from '@/data/communications-data';
import type { Announcement, CommunicationStatus } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AnnouncementModal } from '@/components/pr/AnnouncementModal';
import { canUserPerformAction, getNextStatus } from '@/lib/communication-approval-workflow';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const statusColors: Record<CommunicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  pending_approval: 'bg-orange-100 text-orange-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function Announcements() {
  const { checkWriteAccess } = usePermissions();
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(dummyAnnouncements);
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const canWrite = checkWriteAccess('communications');

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = (data: Partial<Announcement>) => {
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id ? { ...ann, ...data } as Announcement : ann
      ));
      toast({ title: 'Announcement Updated', description: 'The announcement has been updated successfully.' });
    } else {
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        status: 'draft',
        createdBy: user?.id || 'current-user',
        createdAt: new Date().toISOString(),
        channels: [],
        priority: 'normal',
        audienceType: 'all',
        autoExpire: true,
        version: 1,
        isLocked: false,
        expiryNotified: false,
        ...data,
      } as Announcement;
      setAnnouncements([...announcements, newAnnouncement]);
      toast({ title: 'Announcement Created', description: 'A new announcement has been created.' });
    }
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleDelete = (announcement: Announcement) => {
    if (announcement.status === 'draft') {
      setAnnouncements(announcements.filter(ann => ann.id !== announcement.id));
      toast({ title: 'Announcement Deleted', description: 'The announcement has been deleted.' });
    }
  };

  const handlePublish = (announcement: Announcement) => {
    if (!user) return;
    
    if (canUserPerformAction(user.role, announcement.status, 'publish')) {
      const nextStatus = getNextStatus(announcement.status, 'publish', user.role);
      if (nextStatus) {
        setAnnouncements(announcements.map(ann =>
          ann.id === announcement.id
            ? {
                ...ann,
                status: nextStatus,
                publishedBy: user.id,
                publishedAt: new Date().toISOString(),
                isLocked: true,
              } as Announcement
            : ann
        ));
        toast({ title: 'Announcement Published', description: 'The announcement has been published successfully.' });
      }
    } else {
      toast({
        title: 'Cannot Publish',
        description: 'You do not have permission to publish this announcement or it is not in the correct status.',
        variant: 'destructive',
      });
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesStatus = statusFilter === 'all' || ann.status === statusFilter;
    return matchesStatus;
  });

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 truncate">{row.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <Badge variant={row.priority === 'urgent' ? 'destructive' : 'outline'}>
          {row.priority}
        </Badge>
      ),
    },
    {
      key: 'audienceType',
      label: 'Audience',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <Badge variant="secondary" className="capitalize">
          {row.audienceType || 'All'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <Badge className={statusColors[row.status]}>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'validityStart',
      label: 'Published',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <span className="text-sm text-gray-600">
          {row.validityStart ? new Date(row.validityStart).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'validityEnd',
      label: 'Expires',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <span className="text-sm text-gray-600">
          {row.validityEnd ? new Date(row.validityEnd).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'views',
      label: 'Views',
      render: (value: unknown, row: Announcement) => (
        <span className="text-sm text-gray-600">{row.views || 0}</span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Announcements & Notices"
        description="Manage temple announcements, notices, and public communications"
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center border">
              <Button
                variant={viewMode === 'table' ? 'outline' : 'ghost'}
                size="sm"
                className={`px-2 h-7 ${viewMode === 'table' ? 'shadow-sm bg-white' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'outline' : 'ghost'}
                size="sm"
                className={`px-2 h-7 ${viewMode === 'cards' ? 'shadow-sm bg-white' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            {canWrite && (
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['all', 'draft', 'published', 'expired'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <DataTable
                data={filteredAnnouncements}
                columns={columns}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    {canWrite && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {row.status === 'approved' && user && canUserPerformAction(user.role, row.status, 'publish') && (
                          <Button variant="ghost" size="sm" onClick={() => handlePublish(row)} className="text-green-600">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {row.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="capitalize">{announcement.category}</Badge>
                      <Badge className={statusColors[announcement.status]}>
                        {announcement.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 line-clamp-2 leading-tight">
                      {announcement.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{announcement.views || 0}</span> views
                      </div>
                      <div>
                        Expires: {new Date(announcement.validityEnd).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t flex justify-end gap-2">
                    {canWrite && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>
                          Edit
                        </Button>
                        {announcement.status === 'approved' && user && canUserPerformAction(user.role, announcement.status, 'publish') && (
                          <Button variant="default" size="sm" onClick={() => handlePublish(announcement)} className="bg-green-600 hover:bg-green-700">
                            Publish
                          </Button>
                        )}
                        {announcement.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(announcement)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnnouncementModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        announcement={editingAnnouncement}
        onSave={handleSaveAnnouncement}
      />
    </MainLayout>
  );
}
