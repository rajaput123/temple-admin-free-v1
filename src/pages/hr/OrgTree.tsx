import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrgTreeNode } from '@/components/hr/OrgTreeNode';
import { orgTree } from '@/data/hr-dummy-data';

export default function OrgTree() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <PageHeader
        title="Organization Tree"
        description="Visual hierarchy of temple organization structure"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'People / HR', href: '/hr' },
          { label: 'Organization', href: '/hr/organization' },
          { label: 'Org Tree' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/hr/organization')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organization
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">100%</span>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 ml-2">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Click nodes to expand/collapse</span>
        </div>
      </div>

      {/* Org Tree */}
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-6 min-w-max">
          <OrgTreeNode node={orgTree} />
        </div>
      </ScrollArea>
    </MainLayout>
  );
}
