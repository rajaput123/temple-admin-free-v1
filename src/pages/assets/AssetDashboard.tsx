import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getStoredAssets } from '@/lib/assets/asset-store';
import { usePermissions } from '@/hooks/usePermissions';
import { Landmark, Package, Building2, DollarSign, TrendingUp } from 'lucide-react';
import type { Asset } from '@/types/assets';

export default function AssetDashboard() {
  const { checkModuleAccess } = usePermissions();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>(getStoredAssets());

  // Load assets from localStorage on mount and when page becomes visible
  useEffect(() => {
    const loadAssets = () => {
      const storedAssets = getStoredAssets();
      setAssets(storedAssets);
    };
    
    loadAssets();
    
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

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAssets = assets.length;
    const sacredCount = assets.filter(a => a.sensitivity === 'sacred').length;
    const movableCount = assets.filter(a => a.category === 'movable').length;
    const immovableCount = assets.filter(a => a.category === 'immovable').length;
    const totalValuation = assets.reduce((sum, a) => sum + a.currentValuation, 0);
    const activeCount = assets.filter(a => a.status === 'active').length;
    const inactiveCount = assets.filter(a => a.status === 'inactive').length;
    const underMaintenanceCount = assets.filter(a => a.lifecycleStatus === 'under_maintenance').length;
    
    return {
      totalAssets,
      sacredCount,
      movableCount,
      immovableCount,
      totalValuation,
      activeCount,
      inactiveCount,
      underMaintenanceCount,
    };
  }, [assets]);

  const handleCardClick = (filterType: string, value?: string) => {
    if (filterType === 'movable') {
      navigate('/assets/master?category=movable');
    } else if (filterType === 'immovable') {
      navigate('/assets/master?category=immovable');
    } else {
      navigate('/assets/master');
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Asset Management Dashboard"
        description="Overview of all assets, categories, and key metrics"
      />

      <div className="space-y-6">
        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20"
            onClick={() => navigate('/assets/master')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Assets</p>
                  <p className="text-3xl font-bold">{stats.totalAssets}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20"
            onClick={() => navigate('/assets/master')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Sacred Assets</p>
                  <p className="text-3xl font-bold">{stats.sacredCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Landmark className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20"
            onClick={() => handleCardClick('movable')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Movable Assets</p>
                  <p className="text-3xl font-bold">{stats.movableCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20"
            onClick={() => handleCardClick('immovable')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Immovable Assets</p>
                  <p className="text-3xl font-bold">{stats.immovableCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Valuation</p>
                  <p className="text-2xl font-bold">₹{(stats.totalValuation / 100000).toFixed(1)}L</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Active Assets</p>
                  <p className="text-2xl font-bold">{stats.activeCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Inactive Assets</p>
                  <p className="text-2xl font-bold">{stats.inactiveCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Under Maintenance</p>
                  <p className="text-2xl font-bold">{stats.underMaintenanceCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20" onClick={() => navigate('/assets/master/new')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-base">Add New Asset</p>
                  <p className="text-sm text-muted-foreground mt-1">Register a new asset</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20" onClick={() => navigate('/assets/master')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-base">View All Assets</p>
                  <p className="text-sm text-muted-foreground mt-1">Browse asset register</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20" onClick={() => navigate('/assets/reports')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-base">View Reports</p>
                  <p className="text-sm text-muted-foreground mt-1">Asset analytics & reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
