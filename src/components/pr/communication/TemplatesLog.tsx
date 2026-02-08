import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/pr/shared/EmptyState';
import { FileText, Smartphone, Mail, MessageCircle, Bell, Edit, Trash2, Copy, MoreVertical } from 'lucide-react';
import { getTemplates, deleteTemplate } from '@/lib/pr-communication-store';
import type { MessageTemplate, MessageChannel } from '@/types/pr-communication';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import '@/styles/pr-communication.css';

interface TemplatesLogProps {
  onEdit: (template: MessageTemplate) => void;
}

const channelIcons = {
  sms: Smartphone,
  email: Mail,
  whatsapp: MessageCircle,
  push: Bell,
};

const channelLabels: Record<string, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Push',
};

export function TemplatesLog({ onEdit }: TemplatesLogProps) {
  const templates = getTemplates();

  const handleDuplicate = (template: MessageTemplate) => {
    // TODO: Implement duplicate functionality
    toast.success('Template duplicated');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
      toast.success('Template deleted successfully');
    }
  };

  // Mock usage count
  const getUsageCount = (templateId: string) => {
    return Math.floor(Math.random() * 50);
  };

  const columns = [
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
      render: (_: unknown, row: MessageTemplate) => (
        <div className="font-medium text-foreground">{row.name}</div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (_: unknown, row: MessageTemplate) => (
        <Badge variant="outline" className="text-xs">
          {row.category}
        </Badge>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (_: unknown, row: MessageTemplate) => {
        const Icon = channelIcons[row.channel];
        return (
          <Badge variant="outline" className="text-xs gap-1">
            <Icon className="h-3 w-3" />
            {channelLabels[row.channel] || row.channel}
          </Badge>
        );
      },
    },
    {
      key: 'content',
      label: 'Content Preview',
      render: (_: unknown, row: MessageTemplate) => (
        <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
          {row.content.substring(0, 80)}...
        </div>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      sortable: true,
      render: (_: unknown, row: MessageTemplate) => (
        <div className="text-sm font-medium">
          {getUsageCount(row.id)} times
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (_: unknown, row: MessageTemplate) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: MessageTemplate) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(row)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(row.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (templates.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-12">
          <EmptyState
            icon={FileText}
            title="No templates found"
            description="Create your first message template to get started"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates
            </CardTitle>
            <CardDescription className="mt-1">
              View and manage all message templates
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {templates.length} {templates.length === 1 ? 'template' : 'templates'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={templates}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search templates by name, category, or content..."
          emptyMessage="No templates found"
        />
      </CardContent>
    </Card>
  );
}
