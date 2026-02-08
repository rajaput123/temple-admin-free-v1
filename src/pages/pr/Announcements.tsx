import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Sparkles, Search, List, LayoutGrid, Filter, X } from 'lucide-react';
import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
} from '@/lib/pr-communication-store';
import type { Announcement, AnnouncementStatus, AnnouncementCategory, AnnouncementPriority } from '@/types/pr-communication';
import { toast } from 'sonner';
import { AnnouncementForm } from '@/components/pr/announcements/AnnouncementForm';
import { AnnouncementList } from '@/components/pr/announcements/AnnouncementList';
import { AnnouncementDetail } from '@/components/pr/announcements/AnnouncementDetail';
import { EmptyState } from '@/components/pr/shared/EmptyState';
import { ConfirmationModal } from '@/components/pr/shared/ConfirmationModal';
import '@/styles/pr-communication.css';

export default function Announcements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AnnouncementCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [announcementToArchive, setAnnouncementToArchive] = useState<string | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[Announcements] Component mounted');
    return () => {
      console.log('[Announcements] Component unmounted');
    };
  }, []);

  // Safe data fetching with error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('[Announcements] Loading data...');
        
        const data = getAnnouncements();
        if (Array.isArray(data)) {
          setAnnouncements(data);
          console.log('[Announcements] Data loaded successfully:', data.length);
        } else {
          console.warn('[Announcements] Invalid data structure, using empty array');
          setAnnouncements([]);
        }
        setComponentError(null);
      } catch (error) {
        console.error('[Announcements] Error loading data:', error);
        setComponentError(error instanceof Error ? error.message : 'Failed to load announcements');
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[Announcements] Global error caught:', e.error);
      setComponentError(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[Announcements] Unhandled promise rejection:', e.reason);
      setComponentError(e.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejection);
    
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejection);
    };
  }, []);


  // Quick templates
  const quickTemplates = [
    {
      id: 'festival',
      name: 'Festival Announcement',
      defaults: {
        category: 'festival' as AnnouncementCategory,
        priority: 'high' as AnnouncementPriority,
        audienceType: 'all' as const,
      },
    },
    {
      id: 'emergency',
      name: 'Emergency Notice',
      defaults: {
        category: 'emergency' as AnnouncementCategory,
        priority: 'urgent' as AnnouncementPriority,
        audienceType: 'all' as const,
        emergencyPublish: true,
      },
    },
    {
      id: 'donation',
      name: 'Donation Campaign',
      defaults: {
        category: 'general' as AnnouncementCategory,
        priority: 'normal' as AnnouncementPriority,
        audienceType: 'donors' as const,
      },
    },
    {
      id: 'general',
      name: 'General Notice',
      defaults: {
        category: 'general' as AnnouncementCategory,
        priority: 'normal' as AnnouncementPriority,
        audienceType: 'all' as const,
      },
    },
  ];

  const filteredAnnouncements = useMemo(() => {
    try {
      if (!Array.isArray(announcements)) {
        return [];
      }
      return announcements.filter(announcement => {
        if (!announcement) return false;
        const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
        const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
        const matchesSearch = !searchQuery || announcement.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
      });
    } catch (error) {
      console.error('[Announcements] Error filtering announcements:', error);
      return [];
    }
  }, [announcements, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  const handleCreate = (templateId?: string) => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
    // TODO: Apply template defaults if templateId is provided
  };

  const handleEdit = (announcement: Announcement) => {
    if (announcement.status !== 'draft' && announcement.status !== 'scheduled') {
      toast.error('Only draft or scheduled announcements can be edited');
      return;
    }
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleView = (announcement: Announcement) => {
    setViewingAnnouncement(announcement);
    setIsDetailOpen(true);
  };

  const handleSave = (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAnnouncement) {
      const updated = updateAnnouncement(editingAnnouncement.id, data);
      if (updated) {
        setAnnouncements(getAnnouncements());
        toast.success('Announcement updated successfully');
        setIsFormOpen(false);
        setEditingAnnouncement(null);
      }
    } else {
      const newAnnouncement = createAnnouncement(data);
      setAnnouncements(getAnnouncements());
      toast.success('Announcement created successfully');
      setIsFormOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (announcementToDelete) {
      deleteAnnouncement(announcementToDelete);
      setAnnouncements(getAnnouncements());
      toast.success('Announcement deleted successfully');
      setAnnouncementToDelete(null);
    }
  };

  const handleArchive = (id: string) => {
    setAnnouncementToArchive(id);
    setArchiveConfirmOpen(true);
  };

  const confirmArchive = () => {
    if (announcementToArchive) {
      updateAnnouncement(announcementToArchive, { status: 'archived' });
      setAnnouncements(getAnnouncements());
      toast.success('Announcement archived');
      setAnnouncementToArchive(null);
    }
  };

  // Error display
  if (componentError) {
    return (
      <MainLayout>
        <PageHeader
          title="Announcements"
          description="Manage public announcements and notices"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Announcements', href: '/pr/announcements' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Announcements</h3>
            <p className="text-sm text-gray-600 mb-4">{componentError}</p>
            <Button onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Announcements"
        description="Manage public announcements and notices"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Announcements', href: '/pr/announcements' },
        ]}
      />

      <div className="space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Filters and Search */}
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Status Filter Dropdown */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AnnouncementStatus | 'all')}>
              <SelectTrigger className="w-[140px] h-9">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {(['all', 'draft', 'scheduled', 'published', 'archived'] as const).map(s => (
                  <SelectItem key={s} value={s}>
                    {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter Dropdown */}
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AnnouncementCategory | 'all')}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {(['all', 'festival', 'general', 'emergency', 'policy'] as const).map(c => (
                  <SelectItem key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter Dropdown */}
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as AnnouncementPriority | 'all')}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {(['all', 'low', 'normal', 'high', 'urgent'] as const).map(p => (
                  <SelectItem key={p} value={p}>
                    {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search announcements by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Active Filters Badge */}
            {(statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 h-7 px-2.5">
                  <span className="text-xs">
                    {[
                      statusFilter !== 'all' && statusFilter,
                      categoryFilter !== 'all' && categoryFilter,
                      priorityFilter !== 'all' && priorityFilter,
                    ].filter(Boolean).length} active
                  </span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                    setSearchQuery('');
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 bg-background hover:bg-muted">
                  <Sparkles className="h-4 w-4" />
                  Quick Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {quickTemplates.map(template => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleCreate(template.id)}
                  >
                    {template.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="gap-2 h-9 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleCreate()}>
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>

        {/* Data Table */}
        {filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No announcements found"
            description={searchQuery ? "Try adjusting your search or filters" : "Get started by creating your first announcement"}
            actionLabel={!searchQuery ? "Create Announcement" : undefined}
            onAction={!searchQuery ? handleCreate : undefined}
          />
        ) : (
          <Card className="border rounded-lg">
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 px-3 rounded-r-none"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 px-3 rounded-l-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <AnnouncementList
                announcements={filteredAnnouncements}
                onView={handleView}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                viewMode={viewMode}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingAnnouncement(null);
        }
      }}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </SheetTitle>
            <SheetDescription>
              {editingAnnouncement ? 'Update announcement details' : 'Create a new announcement'}
            </SheetDescription>
          </SheetHeader>
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Detail View Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Announcement Details</SheetTitle>
            <SheetDescription>View announcement information</SheetDescription>
          </SheetHeader>
          {viewingAnnouncement && (
            <AnnouncementDetail
              announcement={viewingAnnouncement}
              onEdit={() => {
                setIsDetailOpen(false);
                handleEdit(viewingAnnouncement);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Announcement?"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        onConfirm={confirmArchive}
        title="Archive Announcement?"
        description="This announcement will be archived and hidden from public view. You can restore it later if needed."
        confirmText="Archive"
        variant="default"
      />
    </MainLayout>
  );
}
