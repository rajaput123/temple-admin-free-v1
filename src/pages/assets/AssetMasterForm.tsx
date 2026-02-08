import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { AssetMasterInlineForm } from '@/components/assets/AssetMasterInlineForm';
import { dummyAssets, dummyAssetLocations, dummyAssetCategories } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import type { Asset, AssetCategory } from '@/types/assets';
import { getStoredAssets, saveAssets } from '@/lib/assets/asset-store';

export default function AssetMasterForm() {
  const { checkModuleAccess } = usePermissions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'new';
  
  const asset = isEdit ? getStoredAssets().find(a => a.id === id) || null : null;
  
  // Initialize with default categories immediately to prevent blank page
  const defaultCategories = dummyAssetCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    category: cat.category,
    subCategory: cat.subCategory,
  }));
  
  const [categories, setCategories] = useState<Array<{ id: string; name: string; category: AssetCategory; subCategory?: string }>>(defaultCategories);

  useEffect(() => {
      try {
        // Load categories from localStorage
        const savedCategories = localStorage.getItem('asset_categories');
        if (savedCategories) {
          try {
            const parsed = JSON.parse(savedCategories);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
            } else {
              // If parsed data is invalid, use default categories
              const defaultCategories = dummyAssetCategories.map(cat => ({
                id: cat.id,
                name: cat.name,
                category: cat.category,
                subCategory: cat.subCategory,
              }));
              setCategories(defaultCategories);
            }
          } catch (e) {
            console.error('Error parsing saved categories:', e);
            // If parsing fails, use default categories
            const defaultCategories = dummyAssetCategories.map(cat => ({
              id: cat.id,
              name: cat.name,
              category: cat.category,
              subCategory: cat.subCategory,
            }));
            setCategories(defaultCategories);
          }
        } else {
          // If no saved categories, use default categories
          const defaultCategories = dummyAssetCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            category: cat.category,
            subCategory: cat.subCategory,
          }));
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Error in useEffect:', error);
        // Fallback to default categories on any error
        const defaultCategories = dummyAssetCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          category: cat.category,
          subCategory: cat.subCategory,
        }));
        setCategories(defaultCategories);
      }
  }, []);

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const handleSaveAsset = (data: Partial<Asset>) => {
    // Load existing assets
    const existingAssets = getStoredAssets();
    
    if (isEdit && asset) {
      // Update existing asset - preserve customFields
      const updatedAssets = existingAssets.map(a => {
        if (a.id === asset.id) {
          return {
            ...a,
            ...data,
            // Ensure customFields is properly merged
            customFields: {
              ...(a.customFields || {}),
              ...(data.customFields || {}),
            },
          } as Asset;
        }
        return a;
      });
      saveAssets(updatedAssets);
    } else {
      // Create new asset - ensure customFields is included
      const newAsset: Asset = {
        ...data,
        id: data.id || `ast-${Date.now()}`,
        assetCode: data.assetCode || `AST-${String(Date.now()).slice(-6)}`,
        status: data.status || 'active',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure customFields is preserved
        customFields: data.customFields || {},
      } as Asset;
      
      const updatedAssets = [...existingAssets, newAsset];
      saveAssets(updatedAssets);
    }
    
    navigate('/assets/master');
  };

  const handleCancel = () => {
    navigate('/assets/master');
  };

  const handleCategoryAdd = (category: { id: string; name: string; category: AssetCategory; subCategory?: string }) => {
    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    // Save to localStorage
    localStorage.setItem('asset_categories', JSON.stringify(updatedCategories));
  };

  return (
      <MainLayout>
        <PageHeader
          title={isEdit ? 'Edit Asset' : 'Add Asset'}
          description={isEdit ? 'Update asset information' : 'Create a new asset record'}
        />
        <AssetMasterInlineForm
          asset={asset}
          locations={dummyAssetLocations}
          categories={categories}
          onSave={handleSaveAsset}
          onCancel={handleCancel}
          onCategoryAdd={handleCategoryAdd}
        />
      </MainLayout>
    );
}
