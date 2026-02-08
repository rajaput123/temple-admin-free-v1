import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { dummyAssetMovements } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { getStoredAssets, updateAsset } from '@/lib/assets/asset-store';
import { MovementRequestModal } from '@/components/assets/MovementRequestModal';
import { dummyAssetLocations } from '@/data/assets-data';
import type { AssetMovement } from '@/types/assets';

const MOVEMENT_STORAGE_KEY = 'asset_movements';

function getStoredMovements(): AssetMovement[] {
  try {
    const stored = localStorage.getItem(MOVEMENT_STORAGE_KEY);
    if (!stored) return dummyAssetMovements;
    return JSON.parse(stored);
  } catch {
    return dummyAssetMovements;
  }
}

function saveMovements(movements: AssetMovement[]): void {
  try {
    localStorage.setItem(MOVEMENT_STORAGE_KEY, JSON.stringify(movements));
  } catch (error) {
    console.error('Error saving movements:', error);
  }
}

export default function AssetMovement() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [movements, setMovements] = useState<AssetMovement[]>(getStoredMovements());
  const [assets, setAssets] = useState(getStoredAssets());
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<AssetMovement | null>(null);

  // Load assets and movements from localStorage on mount and when page becomes visible
  useEffect(() => {
    const loadData = () => {
      const storedAssets = getStoredAssets();
      const storedMovements = getStoredMovements();
      setAssets(storedAssets);
      setMovements(storedMovements);
    };
    
    loadData();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadData);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const handleSaveMovement = (movementData: Partial<AssetMovement>) => {
    if (editingMovement) {
      const updated = movements.map(m => 
        m.id === editingMovement.id ? { ...m, ...movementData } : m
      );
      setMovements(updated);
      saveMovements(updated);
    } else {
      const newMovement: AssetMovement = {
        ...movementData,
        id: movementData.id || `mov-${Date.now()}`,
        createdAt: movementData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AssetMovement;
      const updated = [...movements, newMovement];
      setMovements(updated);
      saveMovements(updated);
    }
    
    // If movement is completed, update asset locations
    if (movementData.status === 'completed' && movementData.assets) {
      movementData.assets.forEach(assetInfo => {
        const asset = assets.find(a => a.id === assetInfo.assetId);
        if (asset && movementData.destinationLocationId && movementData.destinationLocationName) {
          updateAsset(assetInfo.assetId, {
            currentLocationId: movementData.destinationLocationId,
            currentLocationName: movementData.destinationLocationName,
            // Update customFields for location
            customFields: {
              ...asset.customFields,
              buildingSection: movementData.destinationLocationName.split(' > ')[1] || asset.customFields?.buildingSection || '',
              roomAreaName: movementData.destinationLocationName.split(' > ').slice(-1)[0] || asset.customFields?.roomAreaName || '',
            },
          });
        }
      });
      // Reload assets to reflect changes
      setAssets(getStoredAssets());
    }
    
    setEditingMovement(null);
    setMovementModalOpen(false);
  };

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const columns = [
    { key: 'movementNumber', label: 'Movement #' },
    { key: 'date', label: 'Date' },
    { key: 'sourceLocationName', label: 'From' },
    { key: 'destinationLocationName', label: 'To' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Movement"
        description="Manage asset transfer requests and approval workflows"
        actions={
          checkWriteAccess('asset_movement') && (
            <Button onClick={() => {
              setEditingMovement(null);
              setMovementModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Movement
            </Button>
          )
        }
      />
      <DataTable data={movements} columns={columns} />
      
      {movementModalOpen && (
        <MovementRequestModal
          open={movementModalOpen}
          onOpenChange={setMovementModalOpen}
          movement={editingMovement || undefined}
          assets={assets}
          locations={dummyAssetLocations}
          onSave={handleSaveMovement}
        />
      )}
    </MainLayout>
  );
}
