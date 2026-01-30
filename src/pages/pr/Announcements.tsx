import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { dummyAnnouncements } from '@/data/communications-data';
import type { Announcement, CommunicationStatus } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';
import { AnnouncementModal } from '@/components/pr/AnnouncementModal';

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
  const [announcements, setAnnouncements] = useState<Announcement[]>(dummyAnnouncements);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const canWrite = checkWriteAccess('communications');

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleSave = (data: Partial<Announcement>) => {
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? { ...a, ...data } as Announcement : a));
    } else {
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        title: data.title || '',
        content: data.content || '',
        category: data.category || 'general',
        channels: data.channels || [],
        validityStart: data.validityStart || new Date().toISOString(),
        validityEnd: data.validityEnd || new Date().toISOString(),
        status: 'draft',
        priority: data.priority || 'normal',
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        version: 1,
        isLocked: false,
        autoExpire: data.autoExpire || false,
        expiryNotified: false,
        ...data,
      };
      setAnnouncements([...announcements, newAnnouncement]);
    }
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ann.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      key: 'channels',
      label: 'Channels',
      render: (value: unknown, row: Announcement) => (
        <div className="flex flex-wrap gap-1">
          {row.channels.slice(0, 3).map((ch: string) => (
            <Badge key={ch} variant="outline" className="text-xs">
              {ch.replace('_', ' ')}
            </Badge>
          ))}
          {row.channels.length > 3 && (
            <Badge variant="outline" className="text-xs">+{row.channels.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'validityStart',
      label: 'Validity',
      sortable: true,
      render: (value: unknown, row: Announcement) => {
        const start = new Date(row.validityStart);
        const end = new Date(row.validityEnd);
        return (
          <div className="text-sm">
            <div>{start.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">to {end.toLocaleDateString()}</div>
          </div>
        );
      },
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
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: unknown, row: Announcement) => (
        <Badge variant={row.priority === 'urgent' ? 'destructive' : 'outline'}>
          {row.priority}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Announcements & Notices"
        description="Manage temple announcements, notices, and public communications"
        actions={
          canWrite ? (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CommunicationStatus | 'all')}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold mt-1">{announcements.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {announcements.filter(a => a.status === 'published').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {announcements.filter(a => a.status === 'pending_review' || a.status === 'pending_approval').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Expired</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {announcements.filter(a => a.status === 'expired').length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable 
          data={filteredAnnouncements} 
          columns={columns}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              {canWrite && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {row.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        />
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        announcement={editingAnnouncement}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
