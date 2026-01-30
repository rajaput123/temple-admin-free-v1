import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Switch } from '@/components/ui/switch';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Home, ArrowUp } from 'lucide-react';
import { ChildTemple, Temple } from '@/types/temple-structure';
import { ChildTempleModal } from '@/components/structure/ChildTempleModal';
import { dummyTemples, dummyChildTemples } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';
import { calculateDistance } from '@/lib/temple-distance';

export default function ChildTemples() {
  const navigate = useNavigate();
  const { checkModuleAccess, user } = usePermissions();
  const [temples, setTemples] = useState<Temple[]>(dummyTemples);
  const [childTemples, setChildTemples] = useState<ChildTemple[]>(dummyChildTemples);
  const [childTempleModalOpen, setChildTempleModalOpen] = useState(false);
  const [editingChildTemple, setEditingChildTemple] = useState<ChildTemple | null>(null);
  
  if (!checkModuleAccess('structure')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }
  
  const primaryTemple = temples.find(t => t.isPrimary) || temples[0];
  
  const childTemplesWithDistance = useMemo(() => {
    if (!primaryTemple?.gpsCoordinates) return childTemples;
    return childTemples.map(ct => {
      const parentTemple = temples.find(t => t.id === ct.parentTempleId);
      if (parentTemple?.gpsCoordinates && primaryTemple.gpsCoordinates) {
        const distance = calculateDistance(
          primaryTemple.gpsCoordinates.latitude,
          primaryTemple.gpsCoordinates.longitude,
          parentTemple.gpsCoordinates.latitude,
          parentTemple.gpsCoordinates.longitude
        );
        return { ...ct, distanceFromMain: distance };
      }
      return ct;
    });
  }, [childTemples, temples, primaryTemple]);

  const getTempleName = (id: string) => temples.find(t => t.id === id)?.name || 'Unknown';

  const handleSaveChildTemple = (data: Partial<ChildTemple>) => {
    if (editingChildTemple) {
      setChildTemples(childTemples.map(t => t.id === editingChildTemple.id ? { ...t, ...data } : t));
    } else {
      setChildTemples([...childTemples, { ...data, id: `child-${Date.now()}`, createdAt: new Date().toISOString() } as ChildTemple]);
    }
    setEditingChildTemple(null);
    setChildTempleModalOpen(false);
  };

  const toggleChildTempleStatus = (id: string) => {
    setChildTemples(childTemples.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t));
  };

  const handlePromoteToMain = (childTemple: ChildTemple) => {
    const newTemple: Temple = {
      id: `temple-${Date.now()}`,
      name: childTemple.name,
      location: '',
      description: childTemple.description,
      status: childTemple.status,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      customFields: childTemple.customFields,
    };
    setTemples([...temples, newTemple]);
    setChildTemples(childTemples.filter(ct => ct.id !== childTemple.id));
  };
  
  const childTempleColumns = [
    { key: 'name', label: 'Child Temple Name', sortable: true },
    { 
      key: 'parentTempleId', 
      label: 'Parent Temple', 
      render: (value: unknown) => getTempleName(value as string) 
    },
    { 
      key: 'distanceFromMain', 
      label: 'Distance from Main', 
      render: (_: unknown, row: ChildTemple & { distanceFromMain?: number }) => 
        row.distanceFromMain ? `${row.distanceFromMain.toFixed(2)} km` : '-'
    },
    { key: 'description', label: 'Description' },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: ChildTemple) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleChildTempleStatus(row.id)}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Child Temples"
        description="Manage child temple information"
        actions={
          <Button onClick={() => { setEditingChildTemple(null); setChildTempleModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Child Temple
          </Button>
        }
      />

      <div className="mt-6">
        <DataTable
          data={childTemplesWithDistance}
          columns={childTempleColumns}
          searchPlaceholder="Search child temples..."
          defaultViewMode="grid"
          imageKey="image"
          onRowClick={(row) => navigate(`/structure/child-temples/${row.id}`)}
          actions={(row) => (
            <>
              <DropdownMenuItem onClick={() => { setEditingChildTemple(row); setChildTempleModalOpen(true); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePromoteToMain(row)}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Promote to Main Temple
              </DropdownMenuItem>
            </>
          )}
        />
      </div>

      <ChildTempleModal
        open={childTempleModalOpen}
        onOpenChange={setChildTempleModalOpen}
        childTemple={editingChildTemple}
        temples={temples}
        onSave={(data) => {
          handleSaveChildTemple(data);
          setTemples(temples); // Update temples if new one was added
        }}
      />
    </MainLayout>
  );
}
