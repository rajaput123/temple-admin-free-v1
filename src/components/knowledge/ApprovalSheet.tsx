import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import type { KnowledgeCategory, KnowledgeDocument } from '@/types/knowledge';
import { publishDocument, reviewDocument } from '@/lib/knowledge-store';
import { useState } from 'react';

export function ApprovalSheet({
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
  const [notes, setNotes] = useState('');
  const category = document ? categories.find((c) => c.id === document.categoryId) : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[760px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Review Document</SheetTitle>
          <SheetDescription>{document ? document.title : ''}</SheetDescription>
        </SheetHeader>

        {!document ? null : (
          <div className="mt-6 space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Category</div>
                  <div className="text-foreground font-medium">{category?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-foreground font-medium">{document.status}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Uploaded By</div>
                  <div className="text-foreground font-medium">{document.uploadedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Upload Date</div>
                  <div className="text-foreground font-medium">{document.uploadDate}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm font-semibold text-foreground mb-2">AI Summary Preview</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{document.aiSummary || 'Not ready yet.'}</div>
            </Card>

            <Card className="p-4">
              <div className="text-sm font-semibold text-foreground mb-2">Key Chunks</div>
              <div className="space-y-2">
                {(document.chunks || []).slice(0, 5).map((c) => (
                  <div key={c.id} className="text-sm text-muted-foreground border rounded-md p-2">
                    {c.text}
                  </div>
                ))}
              </div>
            </Card>

            <div className="form-field">
              <div className="text-sm font-semibold text-foreground mb-2">Reviewer Notes</div>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Optional notes…" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={() => {
                  reviewDocument(document.id, 'approved', notes || undefined);
                  onOpenChange(false);
                }}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  reviewDocument(document.id, 'rejected', notes || undefined);
                  onOpenChange(false);
                }}
              >
                Reject
              </Button>
              {document.status === 'approved' ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    publishDocument(document.id);
                    onOpenChange(false);
                  }}
                >
                  Publish
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

