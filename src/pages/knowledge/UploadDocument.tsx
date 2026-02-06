import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createDocument, listCategories, submitForApproval } from '@/lib/knowledge-store';

export default function UploadDocument() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categories = listCategories();

  const preselectedCategoryId = params.get('categoryId') || '';

  const [form, setForm] = useState({
    categoryId: preselectedCategoryId,
    fileName: '',
    title: '',
    description: '',
    tagsRaw: '',
    accessType: 'internal' as 'internal' | 'public',
  });

  const categoryOptions = useMemo(() => categories.filter(c => c.status !== 'disabled'), [categories]);

  const tags = useMemo(
    () =>
      form.tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [form.tagsRaw],
  );

  return (
    <MainLayout>
      <PageHeader
        title="Upload Document"
        description="Upload a knowledge document for AI processing and approval"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Upload' },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="form-field">
              <Label className="form-label">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => setForm((p) => ({ ...p, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-field">
              <Label className="form-label">Upload File (mock)</Label>
              <Input
                value={form.fileName}
                onChange={(e) => setForm((p) => ({ ...p, fileName: e.target.value }))}
                placeholder="e.g., policies_2026.pdf"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported: PDF, DOC/DOCX, XLS/XLSX, PPT, images, text (mock upload)
              </p>
            </div>

            <div className="form-field">
              <Label className="form-label">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>

            <div className="form-field">
              <Label className="form-label">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description"
                rows={4}
              />
            </div>

            <div className="form-field">
              <Label className="form-label">Tags</Label>
              <Input
                value={form.tagsRaw}
                onChange={(e) => setForm((p) => ({ ...p, tagsRaw: e.target.value }))}
                placeholder="comma separated (e.g., governance, policy)"
              />
            </div>

            <div className="form-field">
              <Label className="form-label">Access Type</Label>
              <Select
                value={form.accessType}
                onValueChange={(value) => setForm((p) => ({ ...p, accessType: value as any }))}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  createDocument({
                    fileName: form.fileName || 'Untitled',
                    categoryId: form.categoryId || categories[0]?.id || 'cat-books-1',
                    title: form.title || 'Untitled Document',
                    description: form.description || '',
                    tags,
                    accessType: form.accessType,
                  });
                  navigate('/knowledge/documents');
                }}
              >
                Save as Draft
              </Button>

              <Button
                onClick={() => {
                  const doc = createDocument({
                    fileName: form.fileName || 'Untitled',
                    categoryId: form.categoryId || categories[0]?.id || 'cat-books-1',
                    title: form.title || 'Untitled Document',
                    description: form.description || '',
                    tags,
                    accessType: form.accessType,
                  });
                  submitForApproval(doc.id);
                  navigate('/knowledge/documents');
                }}
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

