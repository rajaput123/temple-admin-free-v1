import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getBranches, getRegions } from '@/lib/branch-store';
import { GitBranch, Building2, MapPin, TrendingUp, Plus, Download, FileText, AlertCircle, Clock } from 'lucide-react';

export default function BranchOverview() {
  const navigate = useNavigate();
  const branches = getBranches();
  const regions = getRegions();

  const stats = useMemo(() => {
    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.status === 'active').length;
    const headOffices = branches.filter(b => b.branchType === 'head_office').length;
    const regionalOffices = branches.filter(b => b.branchType === 'regional_office').length;
    const temples = branches.filter(b => b.branchType === 'temple').length;
    const subsidiaryTemples = branches.filter(b => b.branchType === 'subsidiary_temple').length;
    const underSetup = branches.filter(b => b.status === 'under_setup').length;
    const inactive = branches.filter(b => b.status === 'inactive').length;
    
    // Group by region
    const branchesByRegion: Record<string, number> = {};
    branches.forEach(b => {
      if (b.regionId) {
        branchesByRegion[b.regionId] = (branchesByRegion[b.regionId] || 0) + 1;
      }
    });

    return {
      totalBranches,
      activeBranches,
      headOffices,
      regionalOffices,
      temples,
      subsidiaryTemples,
      underSetup,
      inactive,
      branchesByRegion,
    };
  }, [branches]);

  const recentBranches = useMemo(() => {
    return branches
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [branches]);

  const branchesNeedingAttention = useMemo(() => {
    return branches.filter(b => 
      b.status === 'under_setup' || 
      b.status === 'inactive' ||
      b.status === 'suspended'
    ).slice(0, 5);
  }, [branches]);

  return (
    <MainLayout>
      <PageHeader
        title="Branch Overview"
        description="Dashboard providing branch-level metrics, status, and quick insights"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Branch Management', href: '/branch' },
          { label: 'Overview', href: '/branch/overview' },
        ]}
      />

      <div className="space-y-6">
        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/branch/directory')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Branches</p>
                  <p className="text-3xl font-bold">{stats.totalBranches}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.activeBranches} active
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/branch/directory?status=active')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Active Branches</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeBranches}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.activeBranches / stats.totalBranches) * 100)}% of total
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/branch/directory?type=temple')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Temples</p>
                  <p className="text-3xl font-bold">{stats.temples}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.subsidiaryTemples} subsidiary
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/branch/hierarchy')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Regions</p>
                  <p className="text-3xl font-bold">{regions.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.regionalOffices} regional offices
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branches Needing Attention */}
          <Card className="rounded-xl border shadow-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Branches Needing Attention
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/branch/directory')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branchesNeedingAttention.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="font-medium">All branches are active</p>
                    <p className="text-sm">No branches require attention at this time</p>
                  </div>
                ) : (
                  branchesNeedingAttention.map(branch => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/branch/directory?branch=${branch.id}`)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{branch.branchName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {branch.branchCode} • {branch.city}, {branch.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={branch.status === 'under_setup' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {branch.status.replace('_', ' ')}
                        </Badge>
                        {branch.status === 'under_setup' && (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => navigate('/branch/directory')}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Create New Branch
              </Button>
              <Button
                onClick={() => navigate('/branch/directory')}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <FileText className="h-4 w-4" />
                View All Branches
              </Button>
              <Button
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Export Directory
              </Button>
              <Button
                onClick={() => navigate('/branch/hierarchy')}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <GitBranch className="h-4 w-4" />
                View Hierarchy
              </Button>
              <Button
                onClick={() => navigate('/branch/users')}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <MapPin className="h-4 w-4" />
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Distribution & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branch Type Distribution */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Branch Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">Head Offices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(stats.headOffices / stats.totalBranches) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{stats.headOffices}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium">Regional Offices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(stats.regionalOffices / stats.totalBranches) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{stats.regionalOffices}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Temples</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(stats.temples / stats.totalBranches) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{stats.temples}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-sm font-medium">Subsidiary Temples</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${(stats.subsidiaryTemples / stats.totalBranches) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{stats.subsidiaryTemples}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branches by Region */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Branches by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regions.map(region => {
                  const count = stats.branchesByRegion[region.id] || 0;
                  const percentage = stats.totalBranches > 0 ? (count / stats.totalBranches) * 100 : 0;
                  return (
                    <div key={region.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{region.regionName}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recently Created Branches</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/branch/directory')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBranches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No branches found</p>
              ) : (
                recentBranches.map(branch => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/branch/directory?branch=${branch.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{branch.branchName}</div>
                        <div className="text-xs text-muted-foreground">
                          {branch.branchCode} • {branch.city}, {branch.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                        {branch.status}
                      </Badge>
                      {branch.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(branch.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
