import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Tag, Globe, Lock, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { KnowledgeCategory, KnowledgeDocument } from '@/types/knowledge';
import { publishDocument, submitForApproval } from '@/lib/knowledge-store';

function getStatusBadge(status: KnowledgeDocument['status']) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft: { 
      label: 'Draft', 
      className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
      icon: <FileText className="h-3 w-3" />
    },
    uploaded: { 
      label: 'Uploaded', 
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      icon: <FileText className="h-3 w-3" />
    },
    processing: { 
      label: 'Processing', 
      className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
      icon: <Clock className="h-3 w-3" />
    },
    pending_approval: { 
      label: 'Pending Approval', 
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
      icon: <AlertCircle className="h-3 w-3" />
    },
    approved: { 
      label: 'Approved', 
      className: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    published: { 
      label: 'Published', 
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    rejected: { 
      label: 'Rejected', 
      className: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
      icon: <XCircle className="h-3 w-3" />
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function DocumentDetailSheet({
  open,
  onOpenChange,
  document,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
  categories: KnowledgeCategory[];
}) {
  const category = document ? categories.find((c) => c.id === document.categoryId) : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{document?.title || 'Document'}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 mt-2">
            <FileText className="h-4 w-4" />
            {document ? document.fileName : ''}
          </SheetDescription>
        </SheetHeader>

        {!document ? null : (
          <div className="mt-6 space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              {getStatusBadge(document.status)}
            </div>

            {/* Basic Information */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Category
                  </div>
                  <div className="text-foreground font-medium">{category?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    {document.accessType === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    Access Type
                  </div>
                  <Badge variant={document.accessType === 'public' ? 'default' : 'secondary'}>
                    {document.accessType === 'public' ? 'Public' : 'Internal'}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Uploaded By
                  </div>
                  <div className="text-foreground font-medium">{document.uploadedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Upload Date
                  </div>
                  <div className="text-foreground font-medium">{document.uploadDate}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Version</div>
                  <div className="text-foreground font-medium">v{document.version}</div>
                </div>
                {document.approval && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Reviewed By</div>
                    <div className="text-foreground font-medium">{document.approval.reviewerId}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(document.approval.reviewedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{document.description || 'No description provided.'}</div>
            </Card>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* AI Summary */}
            {document.aiSummary && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">AI Summary</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{document.aiSummary}</div>
              </Card>
            )}

            {/* Approval Notes */}
            {document.approval?.notes && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Reviewer Notes</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{document.approval.notes}</div>
              </Card>
            )}

            {/* AI Processing Details */}
            {document.processingLog && document.processingLog.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Processing Log</h3>
                <div className="space-y-2">
                  {document.processingLog.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {log}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Chunks */}
            {document.chunks && document.chunks.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Content Chunks</h3>
                <div className="space-y-3">
                  {document.chunks.slice(0, 10).map((c) => (
                    <div key={c.id} className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/30">
                      {c.text}
                    </div>
                  ))}
                  {document.chunks.length > 10 && (
                    <div className="text-xs text-muted-foreground text-center">
                      Showing 10 of {document.chunks.length} chunks
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {document.status === 'draft' || document.status === 'uploaded' ? (
                <Button onClick={() => {
                  submitForApproval(document.id);
                  setTimeout(() => onOpenChange(false), 500);
                }}>
                  Send to Approval
                </Button>
              ) : null}

              {document.status === 'approved' ? (
                <Button onClick={() => {
                  publishDocument(document.id);
                  setTimeout(() => onOpenChange(false), 500);
                }}>
                  Publish Document
                </Button>
              ) : null}

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

