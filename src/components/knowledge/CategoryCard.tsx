import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye, Edit2, Power } from 'lucide-react';
import type { KnowledgeCategory } from '@/types/knowledge';

export function CategoryCard({
  category,
  counts,
  onAdd,
  onViewDocuments,
  onToggleStatus,
  onEdit,
  onClick,
  isGeneral = false,
}: {
  category: KnowledgeCategory;
  counts: { total: number; published: number; pendingApproval: number };
  onAdd: () => void;
  onViewDocuments: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onClick?: () => void;
  isGeneral?: boolean;
}) {
  return (
    <Card 
      className={`p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 ${
        isGeneral 
          ? 'border-l-primary bg-gradient-to-br from-primary/5 to-background hover:from-primary/10' 
          : 'border-l-accent hover:border-l-accent/80'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isGeneral ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
          }`}>
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground truncate">{category.name}</h3>
              {category.status === 'disabled' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Disabled</span>
              )}
              {isGeneral && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">General</span>
              )}
            </div>
            {isGeneral && (
              <p className="text-xs text-muted-foreground mt-1">All general queries and common information</p>
            )}
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }} 
          disabled={category.status === 'disabled'}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{counts.total}</div>
          <div className="text-xs text-muted-foreground mt-1">Total</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.published}</div>
          <div className="text-xs text-muted-foreground mt-1">Published</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pendingApproval}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending</div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" onClick={onViewDocuments} className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        {!isGeneral && (
          <>
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={category.isSystem}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleStatus} disabled={category.isSystem}>
              <Power className="h-4 w-4 mr-1" />
              {category.status === 'disabled' ? 'Enable' : 'Disable'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

