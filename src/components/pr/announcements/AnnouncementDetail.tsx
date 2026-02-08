import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit, Calendar, Users, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/pr/shared/StatusBadge';
import type { Announcement } from '@/types/pr-communication';

interface AnnouncementDetailProps {
  announcement: Announcement;
  onEdit: () => void;
}

export function AnnouncementDetail({ announcement, onEdit }: AnnouncementDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{announcement.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={announcement.status} />
            <Badge variant="outline">{announcement.category}</Badge>
            <Badge variant="outline">{announcement.priority}</Badge>
          </div>
        </div>
        {(announcement.status === 'draft' || announcement.status === 'scheduled') && (
          <Button onClick={onEdit} className="bg-amber-500 hover:bg-amber-600">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Card className="pr-card">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </h3>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.description }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <Label className="text-xs text-gray-500 mb-1">Audience</Label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {announcement.audience.type === 'all' ? 'All Devotees' : announcement.audience.type}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500 mb-1">Publish Date</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {announcement.publishDate 
                    ? new Date(announcement.publishDate).toLocaleDateString()
                    : 'Not scheduled'}
                </span>
              </div>
            </div>

            {announcement.expiryDate && (
              <div>
                <Label className="text-xs text-gray-500 mb-1">Expiry Date</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {new Date(announcement.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500 mb-1">Created</Label>
              <span className="text-sm font-medium">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {announcement.attachments.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Attachments</h3>
              <div className="space-y-2">
                {announcement.attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 p-2 rounded border">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{att.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
