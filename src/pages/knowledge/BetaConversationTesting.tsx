import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { BetaChatPanel } from '@/components/knowledge/BetaChatPanel';
import { listCategories, listDocuments } from '@/lib/knowledge-store';

export default function BetaConversationTesting() {
  // Use same categories from Categories Management (only active categories)
  const allCategories = listCategories();
  const categories = allCategories.filter(c => c.status === 'active');
  const documents = listDocuments();

  return (
    <MainLayout>
      <PageHeader
        title="Beta Conversation Testing"
        description="Test knowledge responses before publishing to devotees"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Beta Testing' },
        ]}
      />
      <div className="p-6 h-full">
        <BetaChatPanel categories={categories} documents={documents} />
      </div>
    </MainLayout>
  );
}

