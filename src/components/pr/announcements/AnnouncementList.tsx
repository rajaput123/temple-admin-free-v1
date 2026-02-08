import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Archive, Trash2, MoreVertical } from 'lucide-react';
import { StatusBadge } from '@/components/pr/shared/StatusBadge';
import type { Announcement } from '@/types/pr-communication';

interface AnnouncementListProps {
  announcements: Announcement[];
  onView: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode?: 'table' | 'grid';
}

export function AnnouncementList({
  announcements,
  onView,
  onEdit,
  onArchive,
  onDelete,
  viewMode = 'table',
}: AnnouncementListProps) {
  const columns = [
    {
      key: 'checkbox',
      label: '',
      render: (_: unknown, row: Announcement) => (
        <Checkbox className="cursor-pointer" />
      ),
    },
    {
      key: 'title',
      label: 'TITLE',
      sortable: true,
      render: (_: unknown, row: Announcement) => (
        <div className="min-w-[250px]">
          <div className="font-medium text-foreground">{row.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.category} • {new Date(row.createdAt).toLocaleDateString('en-GB')}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'CATEGORY',
      sortable: true,
      render: (_: unknown, row: Announcement) => (
        <Badge variant="outline" className="text-xs capitalize">
          {row.category}
        </Badge>
      ),
    },
    {
      key: 'audience',
      label: 'AUDIENCE',
      render: (_: unknown, row: Announcement) => (
        <span className="text-sm text-foreground">
          {row.audience.type === 'all' ? 'All Devotees' : row.audience.type}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      render: (_: unknown, row: Announcement) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'publishDate',
      label: 'PUBLISH DATE',
      sortable: true,
      render: (_: unknown, row: Announcement) => (
        <div className="text-sm text-foreground">
          {row.publishDate ? new Date(row.publishDate).toLocaleDateString('en-GB') : '—'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: unknown, row: Announcement) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            {(row.status === 'draft' || row.status === 'scheduled') && (
              <DropdownMenuItem onClick={() => onEdit(row)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {row.status === 'published' && (
              <DropdownMenuItem onClick={() => onArchive(row.id)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(row.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      data={announcements}
      columns={columns}
      searchable={false}
      selectable={true}
      viewToggle={false}
      defaultViewMode={viewMode}
      onRowClick={onView}
      emptyMessage="No announcements found"
    />
  );
}
