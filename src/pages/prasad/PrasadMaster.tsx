import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Eye } from 'lucide-react';
import { PrasadMaster } from '@/types/prasad';
import { PrasadMasterModal } from '@/components/prasad/PrasadMasterModal';
import { dummyPrasadMaster } from '@/data/prasad-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function PrasadMasterPage() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [prasadMaster, setPrasadMaster] = useState<PrasadMaster[]>(dummyPrasadMaster);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrasad, setEditingPrasad] = useState<PrasadMaster | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('prasad_master')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredPrasad = useMemo(() => {
    return prasadMaster.filter(prasad => {
      if (statusFilter !== 'all' && prasad.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!prasad.name.toLowerCase().includes(query) && !prasad.code.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [prasadMaster, statusFilter, searchQuery]);

  const handleSave = (data: Partial<PrasadMaster>) => {
    if (editingPrasad) {
      setPrasadMaster(prasadMaster.map(p => p.id === editingPrasad.id ? { ...p, ...data } : p));
    } else {
      const newPrasad: PrasadMaster = {
        ...data,
        id: `prasad-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        createdByName: 'Current User',
      } as PrasadMaster;
      setPrasadMaster([...prasadMaster, newPrasad]);
    }
    setEditingPrasad(null);
    setModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Prasad Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    {
      key: 'packSizes',
      label: 'Pack Sizes',
      render: (_: unknown, prasad: PrasadMaster) => prasad.packSizes.map(ps => ps.name).join(', '),
    },
    {
      key: 'shelfLife',
      label: 'Shelf Life',
      render: (_: unknown, prasad: PrasadMaster) => `${prasad.shelfLife} days`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, prasad: PrasadMaster) => (
        <Badge variant={prasad.status === 'active' ? 'default' : 'outline'}>
          {prasad.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, prasad: PrasadMaster) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingPrasad(prasad);
            setModalOpen(true);
          }}>
            <Eye className="w-4 h-4" />
          </Button>
          {checkWriteAccess('prasad_master') && (
            <Button variant="ghost" size="sm" onClick={() => {
              setEditingPrasad(prasad);
              setModalOpen(true);
            }}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Prasad Master"
        description="Manage finished prasad types, pack sizes, and pricing rules"
        actions={
          checkWriteAccess('prasad_master') ? (
            <Button onClick={() => {
              setEditingPrasad(null);
              setModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Prasad
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prasad Master</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search prasad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredPrasad}
            columns={columns}
            searchKey="name"
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {modalOpen && (
        <PrasadMasterModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          prasad={editingPrasad}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
