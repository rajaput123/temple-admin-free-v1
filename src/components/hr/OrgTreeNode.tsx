import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { OrgNode } from '@/types/hr';

interface OrgTreeNodeProps {
  node: OrgNode;
  level?: number;
  isLast?: boolean;
}

export function OrgTreeNode({ node, level = 0, isLast = false }: OrgTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      {/* Connection Lines */}
      {level > 0 && (
        <>
          {/* Horizontal line */}
          <div
            className="absolute top-6 border-t border-border"
            style={{
              left: `-24px`,
              width: '24px',
            }}
          />
          {/* Vertical line from parent */}
          {!isLast && (
            <div
              className="absolute border-l border-border"
              style={{
                left: '-24px',
                top: '24px',
                height: 'calc(100% - 24px)',
              }}
            />
          )}
        </>
      )}

      {/* Node Content */}
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-card",
          "hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer",
          hasChildren && "pr-2"
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
            {node.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{node.name}</p>
          <p className="text-xs text-muted-foreground truncate">{node.designation}</p>
          <p className="text-[10px] text-muted-foreground/70">{node.department}</p>
        </div>

        {hasChildren && (
          <button
            className="p-1 rounded hover:bg-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative ml-12 mt-2 space-y-2">
          {/* Vertical connecting line */}
          <div
            className="absolute border-l border-border"
            style={{
              left: '-24px',
              top: 0,
              height: 'calc(100% - 24px)',
            }}
          />
          
          {node.children!.map((child, index) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isLast={index === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
