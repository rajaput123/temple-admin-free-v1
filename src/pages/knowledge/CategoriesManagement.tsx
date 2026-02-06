import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryCard } from '@/components/knowledge/CategoryCard';
import { AddCategoryCard } from '@/components/knowledge/AddCategoryCard';
import { CreateCategoryModal } from '@/components/knowledge/CreateCategoryModal';
import { listCategories, listDocuments, setCategoryStatus } from '@/lib/knowledge-store';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoriesManagement() {
  const navigate = useNavigate();
  const categories = listCategories();
  const documents = listDocuments();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const countsByCategory = useMemo(() => {
    const map = new Map<string, { total: number; published: number; pendingApproval: number }>();
    for (const c of categories) map.set(c.id, { total: 0, published: 0, pendingApproval: 0 });
    for (const d of documents) {
      const cur = map.get(d.categoryId) || { total: 0, published: 0, pendingApproval: 0 };
      cur.total += 1;
      if (d.status === 'published') cur.published += 1;
      if (d.status === 'pending_approval') cur.pendingApproval += 1;
      map.set(d.categoryId, cur);
    }
    return map;
  }, [categories, documents]);

  // Get general category - ensure it always exists
  const generalCategory = categories.find(c => c.id === 'cat-general') || {
    id: 'cat-general',
    name: 'General',
    status: 'active' as const,
    isSystem: true,
  };

  return (
    <MainLayout>
      <PageHeader
        title="Categories"
        description="Manage knowledge categories and document governance"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Categories' },
        ]}
      />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {/* General Category Card */}
          <CategoryCard
            category={generalCategory}
            counts={countsByCategory.get(generalCategory.id) || { total: 0, published: 0, pendingApproval: 0 }}
            onAdd={() => navigate(`/knowledge/upload?categoryId=${encodeURIComponent(generalCategory.id)}`)}
            onViewDocuments={() => navigate(`/knowledge/documents?categoryId=${encodeURIComponent(generalCategory.id)}&status=published`)}
            onToggleStatus={() => setCategoryStatus(generalCategory.id, generalCategory.status === 'disabled' ? 'active' : 'disabled')}
            onEdit={() => navigate(`/knowledge/categories`)}
            onClick={() => navigate(`/knowledge/documents?categoryId=${encodeURIComponent(generalCategory.id)}&status=published`)}
            isGeneral={true}
          />
          
          {/* Add Category Card */}
          <AddCategoryCard onCreate={() => setCreateModalOpen(true)} />
        </div>
      </div>
      <CreateCategoryModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </MainLayout>
  );
}

