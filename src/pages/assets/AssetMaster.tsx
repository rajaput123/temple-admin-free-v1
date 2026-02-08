import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Eye, QrCode, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '@/types/assets';
import { dummyAssets, dummyAssetCategories, dummyAssetLocations } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { getSubCategoriesForMajorCategory } from '@/lib/assets/subcategory-field-config';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { getStoredAssets, saveAssets } from '@/lib/assets/asset-store';
import AssetCustodyContent from '@/components/assets/AssetCustodyContent';

export default function AssetMaster() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>(getStoredAssets());
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  // Load assets from localStorage on mount and when page becomes visible
  useEffect(() => {
    const loadAssets = () => {
      const storedAssets = getStoredAssets();
      setAssets(storedAssets);
    };
    
    loadAssets();
    
    // Reload when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAssets();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadAssets);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadAssets);
    };
  }, []);

  // Get categories from localStorage or use defaults
  const [categories] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
    return dummyAssetCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      category: cat.category,
      subCategory: cat.subCategory,
    }));
  });

  // Helper to get major category name from asset
  const getMajorCategoryName = (asset: Asset): string => {
    // Try to find major category from categories list
    const majorCat = categories.find(cat => {
      // Check if asset's subcategory matches any subcategory in this major category
      if (asset.subCategory) {
        const subCats = getSubCategoriesForMajorCategory(cat.name);
        return subCats.includes(asset.subCategory);
      }
      return false;
    });
    return majorCat?.name || asset.category;
  };

  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
      if (conditionFilter !== 'all' && asset.condition !== conditionFilter) return false;
      if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
      if (lifecycleFilter !== 'all' && asset.lifecycleStatus !== lifecycleFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!asset.name.toLowerCase().includes(query) &&
            !asset.assetCode.toLowerCase().includes(query) &&
            !asset.nameEnglish?.toLowerCase().includes(query) &&
            !asset.donorName?.toLowerCase().includes(query) &&
            !asset.currentLocationName.toLowerCase().includes(query) &&
            !asset.currentCustodianName?.toLowerCase().includes(query) &&
            !asset.acquisitionType?.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [assets, categoryFilter, conditionFilter, statusFilter, lifecycleFilter, searchQuery]);



  const assetColumns = [
    {
      key: 'name',
      label: 'Asset Name',
      render: (_: unknown, row: Asset) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.nameEnglish && <div className="text-xs text-muted-foreground">{row.nameEnglish}</div>}
        </div>
      ),
    },
    {
      key: 'majorCategory',
      label: 'Major Category',
      render: (_: unknown, row: Asset) => {
        const majorCategory = getMajorCategoryName(row);
        return (
          <div>
            <Badge variant="outline">{majorCategory}</Badge>
          </div>
        );
      },
    },
    {
      key: 'subCategory',
      label: 'Sub Category',
      render: (_: unknown, row: Asset) => (
        <div className="text-sm">{row.subCategory || '-'}</div>
      ),
    },
    {
      key: 'acquisitionType',
      label: 'Acquisition Type',
      render: (_: unknown, row: Asset) => {
        const type = row.acquisitionType || '-';
        return (
          <div className="text-sm capitalize">
            {typeof type === 'string' ? type.replace('_', ' ') : type}
          </div>
        );
      },
    },
    {
      key: 'acquisitionDate',
      label: 'Acquisition Date',
      render: (_: unknown, row: Asset) => (
        <div className="text-sm">
          {row.acquisitionDate ? new Date(row.acquisitionDate).toLocaleDateString() : '-'}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (_: unknown, row: Asset) => {
        // Priority 1: Get data from customFields (new form data)
        const building = row.customFields?.buildingSection || '';
        const room = row.customFields?.roomAreaName || '';
        
        if (building || room) {
          // New format: Building > Room
          const parts = [building, room].filter(Boolean);
          return <div className="text-sm">{parts.join(' > ') || '-'}</div>;
        }
        
        // Priority 2: Parse currentLocationName for old data format
        // Old format: "Main Temple > Block A > Sanctum Sanctorum"
        // Extract last two parts as Building > Room
        if (row.currentLocationName) {
          const parts = row.currentLocationName.split(' > ').filter(Boolean);
          if (parts.length >= 2) {
            // Take last two parts as Building > Room
            return <div className="text-sm">{parts.slice(-2).join(' > ')}</div>;
          } else if (parts.length === 1) {
            return <div className="text-sm">{parts[0]}</div>;
          }
        }
        
        return <div className="text-sm">-</div>;
      },
    },
    {
      key: 'storageType',
      label: 'Storage Type',
      render: (_: unknown, row: Asset) => {
        // Get data from customFields.storageType (saved from form)
        const storageType = row.customFields?.storageType || '';
        return (
          <div className="text-sm">{storageType || '-'}</div>
        );
      },
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: unknown, row: Asset) => (
        <div className="text-sm">{row.customFields?.department || '-'}</div>
      ),
    },
    {
      key: 'currentCustodianName',
      label: 'Custodian',
      render: (_: unknown, row: Asset) => {
        // Display custodian name (saved from form)
        const custodianName = row.currentCustodianName || '-';
        return <div className="text-sm">{custodianName}</div>;
      },
    },
    {
      key: 'lifecycleStatus',
      label: 'Lifecycle',
      render: (_: unknown, row: Asset) => {
        const getLifecycleColor = (status?: string) => {
          switch (status) {
            case 'active':
              return 'bg-green-500 text-white border-green-600 hover:bg-green-600';
            case 'in_use':
              return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600';
            case 'under_maintenance':
              return 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600';
            case 'disposed':
              return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600';
            case 'condemned':
              return 'bg-red-500 text-white border-red-600 hover:bg-red-600';
            default:
              return 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500';
          }
        };
        return (
          <Badge variant="outline" className={`capitalize ${getLifecycleColor(row.lifecycleStatus)}`}>
            {row.lifecycleStatus?.replace('_', ' ') || 'active'}
        </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Asset) => (
        <Badge 
          variant={row.status === 'active' ? 'default' : 'destructive'}
          className={
            row.status === 'active' 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Master"
        description="Manage asset master records, categories, valuations, and asset details"
        actions={
          checkWriteAccess('asset_master') && (
            <Button onClick={() => navigate('/assets/master/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          )
        }
      />

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="custody">Custody Assignment</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          {/* Filters and Search */}
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search by asset code, name, donor, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="movable">MOVABLE</SelectItem>
                    <SelectItem value="immovable">IMMOVABLE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="condemned">Condemned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
                <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                  <SelectTrigger className="w-40 h-10">
                    <SelectValue placeholder="Lifecycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lifecycle</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                    <SelectItem value="condemned">Condemned</SelectItem>
                  </SelectContent>
                </Select>
            <Button variant="outline" className="rounded-lg" onClick={() => {
              // Export functionality
              console.log('Export assets');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-0">
          <DataTable
            data={filteredAssets}
            columns={assetColumns}
                onRowClick={(row: Asset) => {
                  setViewingAsset(row);
                  setIsSheetOpen(true);
                }}
            actions={(row: Asset) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setViewingAsset(row); }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {checkWriteAccess('asset_master') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/assets/master/${row.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Generate QR code
                    console.log('Generate QR for', row.assetCode);
                  }}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Level 1: Asset Type (MOVABLE/IMMOVABLE) → Level 2: Major Categories → Level 3: Sub Categories
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* MOVABLE Categories */}
                    <div>
                  <h3 className="font-semibold mb-3 text-primary">MOVABLE</h3>
                  <div className="space-y-3 ml-4">
                    {categories
                      .filter(cat => cat.category === 'movable')
                      .map(cat => {
                        const subCategories = getSubCategoriesForMajorCategory(cat.name);
                        return (
                          <div key={cat.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{cat.name}</div>
                              <Badge variant="outline">{cat.category}</Badge>
                            </div>
                            {subCategories.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground mb-1">Sub Categories:</div>
                                <div className="flex flex-wrap gap-1">
                                  {subCategories.map((subCat, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {subCat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                    </div>

                {/* IMMOVABLE Categories */}
                <div>
                  <h3 className="font-semibold mb-3 text-primary">IMMOVABLE</h3>
                  <div className="space-y-3 ml-4">
                    {categories
                      .filter(cat => cat.category === 'immovable')
                      .map(cat => {
                        const subCategories = getSubCategoriesForMajorCategory(cat.name);
                        return (
                          <div key={cat.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{cat.name}</div>
                    <Badge variant="outline">{cat.category}</Badge>
                            </div>
                            {subCategories.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground mb-1">Sub Categories:</div>
                                <div className="flex flex-wrap gap-1">
                                  {subCategories.map((subCat, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {subCat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Asset Locations</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manage hierarchical location structure (Temple → Block → Building → Floor → Room → Locker)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dummyAssetLocations.map(loc => (
                  <div key={loc.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{loc.fullPath}</div>
                    <div className="text-xs text-muted-foreground mt-1">Type: {loc.type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custody" className="space-y-4">
          <AssetCustodyContent />
        </TabsContent>
      </Tabs>

      {/* Asset Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {viewingAsset && (
            <>
              <SheetHeader>
                <SheetTitle>{viewingAsset.name}</SheetTitle>
                {viewingAsset.nameEnglish && (
                  <SheetDescription>{viewingAsset.nameEnglish}</SheetDescription>
                )}
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Asset Code</Label>
                      <p className="font-medium">{viewingAsset.assetCode}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium capitalize">{viewingAsset.category}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Major Category</Label>
                      <p className="font-medium">{getMajorCategoryName(viewingAsset)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Sub Category</Label>
                      <p className="font-medium">{viewingAsset.subCategory || '-'}</p>
                    </div>
                    {viewingAsset.categorySpecificFields?.jewelryType && (
                      <div>
                        <Label className="text-muted-foreground">Type of Jewelry</Label>
                        <p className="font-medium">{viewingAsset.categorySpecificFields.jewelryType}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge 
                        variant={viewingAsset.status === 'active' ? 'default' : 'destructive'}
                        className={
                          viewingAsset.status === 'active' 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }
                      >
                        {viewingAsset.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Lifecycle Status</Label>
                      <Badge 
                        variant="outline"
                        className={
                          viewingAsset.lifecycleStatus === 'active' 
                            ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                            : viewingAsset.lifecycleStatus === 'in_use'
                            ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                            : viewingAsset.lifecycleStatus === 'under_maintenance'
                            ? 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600'
                            : viewingAsset.lifecycleStatus === 'disposed'
                            ? 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600'
                            : viewingAsset.lifecycleStatus === 'condemned'
                            ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                            : 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500'
                        }
                      >
                        {viewingAsset.lifecycleStatus?.replace('_', ' ') || 'active'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Condition</Label>
                      <Badge 
                        variant="outline"
                        className={
                          viewingAsset.condition === 'excellent'
                            ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                            : viewingAsset.condition === 'good'
                            ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                            : viewingAsset.condition === 'fair'
                            ? 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600'
                            : viewingAsset.condition === 'poor'
                            ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
                            : viewingAsset.condition === 'condemned'
                            ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                            : 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500'
                        }
                      >
                        {viewingAsset.condition}
                      </Badge>
                    </div>
                  </div>
                  {viewingAsset.description && (
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{viewingAsset.description}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Acquisition Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acquisition Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Acquisition Type</Label>
                      <p className="font-medium capitalize">
                        {typeof viewingAsset.acquisitionType === 'string' 
                          ? viewingAsset.acquisitionType.replace('_', ' ') 
                          : viewingAsset.acquisitionType || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Acquisition Date</Label>
                      <p className="font-medium">
                        {viewingAsset.acquisitionDate 
                          ? new Date(viewingAsset.acquisitionDate).toLocaleDateString() 
                          : viewingAsset.acquisitionYear || '-'}
                      </p>
                    </div>
                    {viewingAsset.donorName && (
                      <div>
                        <Label className="text-muted-foreground">Donor Name</Label>
                        <p className="font-medium">{viewingAsset.donorName}</p>
                      </div>
                    )}
                    {viewingAsset.donorReceiptNumber && (
                      <div>
                        <Label className="text-muted-foreground">Donor Receipt Number</Label>
                        <p className="font-medium">{viewingAsset.donorReceiptNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location & Storage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location & Storage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Building / Section</Label>
                      <p className="font-medium">
                        {viewingAsset.customFields?.buildingSection || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Room / Area Name</Label>
                      <p className="font-medium">
                        {viewingAsset.customFields?.roomAreaName || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Storage Type</Label>
                      <p className="font-medium">
                        {viewingAsset.customFields?.storageType || '-'}
                      </p>
                    </div>
                    {viewingAsset.customFields?.lockerReference && (
                      <div>
                        <Label className="text-muted-foreground">Locker Reference</Label>
                        <p className="font-medium">{viewingAsset.customFields.lockerReference}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="font-medium">
                        {viewingAsset.currentLocationName || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Custody & Department */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Custody & Department</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Custodian</Label>
                      <p className="font-medium">
                        {viewingAsset.currentCustodianName || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Custodian Type</Label>
                      <p className="font-medium capitalize">
                        {viewingAsset.currentCustodianType || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Department</Label>
                      <p className="font-medium">
                        {viewingAsset.customFields?.department || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Valuation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Valuation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Current Valuation</Label>
                      <p className="font-medium text-lg">
                        ₹{(viewingAsset.currentValuation || 0).toLocaleString()}
                      </p>
                    </div>
                    {viewingAsset.valuationDate && (
                      <div>
                        <Label className="text-muted-foreground">Valuation Date</Label>
                        <p className="font-medium">
                          {new Date(viewingAsset.valuationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Specific Fields */}
                {viewingAsset.categorySpecificFields && Object.keys(viewingAsset.categorySpecificFields).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Category Specific Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(viewingAsset.categorySpecificFields)
                          .filter(([key]) => key !== 'jewelryType') // Already shown above
                          .map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              <p className="font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Additional Information */}
                {(viewingAsset.customFields?.tags || 
                  viewingAsset.customFields?.internalNotes || 
                  viewingAsset.customFields?.remarks) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Information</h3>
                      {viewingAsset.customFields?.tags && (
                        <div>
                          <Label className="text-muted-foreground">Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {viewingAsset.customFields.tags.split(',').map((tag, idx) => (
                              <Badge key={idx} variant="outline">{tag.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewingAsset.customFields?.internalNotes && (
                        <div>
                          <Label className="text-muted-foreground">Internal Notes</Label>
                          <p className="text-sm mt-1">{viewingAsset.customFields.internalNotes}</p>
                        </div>
                      )}
                      {viewingAsset.customFields?.remarks && (
                        <div>
                          <Label className="text-muted-foreground">Remarks</Label>
                          <p className="text-sm mt-1">{viewingAsset.customFields.remarks}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Metadata */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Metadata</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Created At</Label>
                      <p className="font-medium">
                        {viewingAsset.createdAt 
                          ? new Date(viewingAsset.createdAt).toLocaleString() 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Updated At</Label>
                      <p className="font-medium">
                        {viewingAsset.updatedAt 
                          ? new Date(viewingAsset.updatedAt).toLocaleString() 
                          : '-'}
                      </p>
                    </div>
                    {viewingAsset.createdByName && (
                      <div>
                        <Label className="text-muted-foreground">Created By</Label>
                        <p className="font-medium">{viewingAsset.createdByName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {checkWriteAccess('asset_master') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSheetOpen(false);
                        navigate(`/assets/master/${viewingAsset.id}/edit`);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Asset
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Generate QR code
                      console.log('Generate QR for', viewingAsset.assetCode);
                    }}
                    className="flex-1"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
