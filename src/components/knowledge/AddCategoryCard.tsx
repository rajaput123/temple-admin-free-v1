import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function AddCategoryCard({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-all cursor-pointer group bg-muted/30 hover:bg-muted/50">
      <div className="flex flex-col items-center justify-center min-h-[180px] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Create Specific Category</h3>
          <p className="text-sm text-muted-foreground">
            Add a new category to organize your knowledge documents
          </p>
        </div>
        <Button onClick={onCreate} className="mt-2" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Specific Category
        </Button>
      </div>
    </Card>
  );
}
