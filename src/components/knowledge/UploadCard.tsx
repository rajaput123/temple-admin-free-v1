import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UploadCard() {
  const navigate = useNavigate();

  return (
    <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-primary/5 to-background hover:from-primary/10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">Upload Document</h3>
          <p className="text-sm text-muted-foreground">
            Upload a new document to the knowledge base for AI processing and approval
          </p>
        </div>
        <Button onClick={() => navigate('/knowledge/upload')} size="lg" className="flex-shrink-0">
          <FileText className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
    </Card>
  );
}
