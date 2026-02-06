import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DevoteeChatPanel } from '@/components/knowledge/DevoteeChatPanel';
import { listDocuments } from '@/lib/knowledge-store';

export default function DevoteeChat() {
  const documents = listDocuments();
  return (
    <MainLayout>
      <PageHeader
        title="Devotee AI Chat"
        description="Ask questions about published temple knowledge"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Chat' },
        ]}
      />
      <div className="p-6">
        <DevoteeChatPanel documents={documents} />
      </div>
    </MainLayout>
  );
}

