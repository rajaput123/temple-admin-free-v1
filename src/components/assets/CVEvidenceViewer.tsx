import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CVEvidence } from '@/types/assets';

interface CVEvidenceViewerProps {
  evidence: CVEvidence[];
  assetId?: string;
}

export function CVEvidenceViewer({ evidence, assetId }: CVEvidenceViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const filteredEvidence = assetId
    ? evidence.filter(e => e.assetId === assetId)
    : evidence;

  if (filteredEvidence.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No CV evidence available
      </div>
    );
  }

  const current = filteredEvidence[currentIndex];

  const getAlertBadge = (level?: string) => {
    switch (level) {
      case 'INFO':
        return <Badge variant="default">INFO</Badge>;
      case 'WARNING':
        return <Badge variant="default">WARNING</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive">CRITICAL</Badge>;
      default:
        return null;
    }
  };

  const getResultBadge = (result?: string) => {
    switch (result) {
      case 'match':
        return <Badge variant="default">Match</Badge>;
      case 'partial_match':
        return <Badge variant="default">Partial Match</Badge>;
      case 'mismatch':
        return <Badge variant="destructive">Mismatch</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{current.assetName}</div>
          <div className="text-sm text-muted-foreground">{current.assetCode}</div>
        </div>
        <div className="flex items-center gap-2">
          {getResultBadge(current.comparisonResult)}
          {getAlertBadge(current.alertLevel)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reference Image</Label>
              {current.referenceImage ? (
                <img
                  src={current.referenceImage}
                  alt="Reference"
                  className="w-full h-64 object-cover rounded border"
                />
              ) : (
                <div className="w-full h-64 border rounded flex items-center justify-center text-muted-foreground">
                  No reference image
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Image</Label>
              {current.currentImage ? (
                <img
                  src={current.currentImage}
                  alt="Current"
                  className="w-full h-64 object-cover rounded border"
                />
              ) : (
                <div className="w-full h-64 border rounded flex items-center justify-center text-muted-foreground">
                  No current image
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {current.similarityScore !== undefined && (
        <div className="p-4 border rounded">
          <div className="text-sm">
            <span className="font-medium">Similarity Score: </span>
            <span>{current.similarityScore}%</span>
          </div>
        </div>
      )}

      {filteredEvidence.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {filteredEvidence.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(Math.min(filteredEvidence.length - 1, currentIndex + 1))}
            disabled={currentIndex === filteredEvidence.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
