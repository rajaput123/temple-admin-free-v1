import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Network, GitBranch, ChevronRight, ChevronDown, Search, Building2, MapPin, Users, List } from 'lucide-react';
import { getBranches, getRegions } from '@/lib/branch-store';
import type { Branch, Region } from '@/types/branch';

export default function BranchHierarchy() {
  const branches = getBranches();
  const regions = getRegions();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  // Build hierarchy tree
  const hierarchyTree = useMemo(() => {
    const tree: Record<string, Branch[]> = {};
    branches.forEach(branch => {
      const parentId = branch.parentBranchId || 'root';
      if (!tree[parentId]) {
        tree[parentId] = [];
      }
      tree[parentId].push(branch);
    });
    return tree;
  }, [branches]);

  const rootBranches = useMemo(() => {
    return branches.filter(b => b.hierarchyLevel === 1);
  }, [branches]);

  // Filter branches based on search query
  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    const query = searchQuery.toLowerCase();
    return branches.filter(b =>
      b.branchName.toLowerCase().includes(query) ||
      b.branchCode.toLowerCase().includes(query) ||
      b.city?.toLowerCase().includes(query) ||
      b.state?.toLowerCase().includes(query)
    );
  }, [branches, searchQuery]);

  // Get branches to display based on search and view mode
  const displayBranches = useMemo(() => {
    if (!searchQuery) {
      return rootBranches;
    }
    
    if (viewMode === 'list') {
      return filteredBranches;
    }

    // Tree mode with search: find matching branches and their parents/children
    const matchingIds = new Set(filteredBranches.map(b => b.id));
    const relevantIds = new Set<string>();
    
    // Add matching branches
    filteredBranches.forEach(b => relevantIds.add(b.id));
    
    // Add all parents of matching branches
    filteredBranches.forEach(branch => {
      let current = branch;
      while (current.parentBranchId) {
        relevantIds.add(current.parentBranchId);
        current = branches.find(b => b.id === current.parentBranchId)!;
        if (!current) break;
      }
    });
    
    // Add all children of matching branches
    const addChildren = (branchId: string) => {
      const children = hierarchyTree[branchId] || [];
      children.forEach(child => {
        relevantIds.add(child.id);
        addChildren(child.id);
      });
    };
    filteredBranches.forEach(b => addChildren(b.id));
    
    // Auto-expand parents of matching branches
    filteredBranches.forEach(branch => {
      let current = branch;
      while (current.parentBranchId) {
        setExpandedNodes(prev => new Set([...prev, current.parentBranchId!]));
        current = branches.find(b => b.id === current.parentBranchId)!;
        if (!current) break;
      }
    });
    
    // Return root branches that are relevant or have relevant descendants
    return rootBranches.filter(root => {
      const isRelevant = (branchId: string): boolean => {
        if (relevantIds.has(branchId)) return true;
        const children = hierarchyTree[branchId] || [];
        return children.some(child => isRelevant(child.id));
      };
      return isRelevant(root.id);
    });
  }, [searchQuery, rootBranches, filteredBranches, viewMode, branches, hierarchyTree]);

  // Auto-expand when search is active
  useEffect(() => {
    if (searchQuery && viewMode === 'tree') {
      filteredBranches.forEach(branch => {
        let current = branch;
        while (current.parentBranchId) {
          setExpandedNodes(prev => new Set([...prev, current.parentBranchId!]));
          current = branches.find(b => b.id === current.parentBranchId)!;
          if (!current) break;
        }
      });
    }
  }, [searchQuery, viewMode, filteredBranches, branches]);

  const toggleNode = (branchId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(branches.map(b => b.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getBranchTypeIcon = (type: Branch['branchType']) => {
    switch (type) {
      case 'head_office': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'regional_office': return <MapPin className="h-4 w-4 text-orange-600" />;
      case 'temple': return <GitBranch className="h-4 w-4 text-green-600" />;
      case 'subsidiary_temple': return <GitBranch className="h-4 w-4 text-purple-600" />;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'border-l-4 border-l-blue-500 bg-blue-50/50';
      case 2: return 'border-l-4 border-l-orange-500 bg-orange-50/50';
      case 3: return 'border-l-4 border-l-green-500 bg-green-50/50';
      case 4: return 'border-l-4 border-l-purple-500 bg-purple-50/50';
      default: return 'border-l-4 border-l-gray-500 bg-gray-50/50';
    }
  };

  const isBranchMatching = (branch: Branch) => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      branch.branchName.toLowerCase().includes(query) ||
      branch.branchCode.toLowerCase().includes(query) ||
      branch.city?.toLowerCase().includes(query) ||
      branch.state?.toLowerCase().includes(query)
    );
  };

  const renderBranchNode = (branch: Branch, level: number = 0, isLast: boolean = false) => {
    const children = hierarchyTree[branch.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(branch.id);
    const isMatching = isBranchMatching(branch);
    const indent = level * 32;

    return (
      <div key={branch.id} className="relative">
        {/* Visual Connectors */}
        {level > 0 && (
          <>
            {/* Horizontal line from parent */}
            <div
              className="absolute top-6 border-t border-border/40"
              style={{
                left: `${indent - 16}px`,
                width: '16px',
              }}
            />
            {/* Vertical line connecting siblings */}
            {!isLast && (
              <div
                className="absolute border-l border-border/40"
                style={{
                  left: `${indent - 16}px`,
                  top: '24px',
                  height: 'calc(100% - 24px)',
                }}
              />
            )}
          </>
        )}

        <div className="space-y-1">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${getLevelColor(branch.hierarchyLevel)} ${isMatching ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
            style={{ marginLeft: `${indent}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(branch.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6 shrink-0" />
            )}
            <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center flex-shrink-0">
              {getBranchTypeIcon(branch.branchType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm truncate">{branch.branchName}</div>
                <Badge variant="outline" className="text-xs">
                  {branch.branchCode}
                </Badge>
                {isMatching && (
                  <Badge variant="default" className="text-xs bg-primary">
                    Match
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {branch.city}, {branch.state}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs">
                L{branch.hierarchyLevel}
              </Badge>
              {branch.regionId && (
                <Badge variant="outline" className="text-xs">
                  {regions.find(r => r.id === branch.regionId)?.regionName || branch.regionId}
                </Badge>
              )}
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="relative" style={{ marginLeft: `${indent + 8}px` }}>
              {/* Vertical connector line for children */}
              <div
                className="absolute left-0 top-0 w-px border-l border-border/40"
                style={{ height: '100%' }}
              />
              {children.map((child, index) => 
                renderBranchNode(child, level + 1, index === children.length - 1)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredRegions = useMemo(() => {
    if (!searchQuery) return regions;
    const query = searchQuery.toLowerCase();
    return regions.filter(r =>
      r.regionName.toLowerCase().includes(query) ||
      r.regionCode.toLowerCase().includes(query)
    );
  }, [regions, searchQuery]);

  return (
    <MainLayout>
      <PageHeader
        title="Hierarchy & Regions"
        description="Manage organizational hierarchy and regional grouping"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Branch Management', href: '/branch' },
          { label: 'Hierarchy & Regions', href: '/branch/hierarchy' },
        ]}
      />

      <div className="space-y-4">
        <Tabs defaultValue="hierarchy" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hierarchy" className="gap-2">
              <Network className="h-4 w-4" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="regions" className="gap-2">
              <MapPin className="h-4 w-4" />
              Regions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="space-y-4">
            <Card className="rounded-xl border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Branch Hierarchy</CardTitle>
                    <CardDescription>
                      Visual representation of branch organizational structure
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search branches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[250px]"
                      />
                    </div>
                    {searchQuery && (
                      <div className="flex items-center gap-1 border rounded-md">
                        <Button
                          variant={viewMode === 'tree' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('tree')}
                          className="h-8"
                        >
                          <Network className="h-3 w-3 mr-1" />
                          Tree
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="h-8"
                        >
                          <List className="h-3 w-3 mr-1" />
                          List
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={expandAll}>
                      Expand All
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>
                      Collapse All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 min-h-[400px]">
                  {viewMode === 'list' && searchQuery ? (
                    // List view for search results
                    filteredBranches.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No branches found</p>
                        <p className="text-sm mt-1">Try adjusting your search query</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredBranches.map(branch => (
                          <div
                            key={branch.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${getLevelColor(branch.hierarchyLevel)} ring-2 ring-primary/50 bg-primary/5`}
                          >
                            <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center flex-shrink-0">
                              {getBranchTypeIcon(branch.branchType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm truncate">{branch.branchName}</div>
                                <Badge variant="outline" className="text-xs">
                                  {branch.branchCode}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {branch.city}, {branch.state}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                L{branch.hierarchyLevel}
                              </Badge>
                              {branch.regionId && (
                                <Badge variant="outline" className="text-xs">
                                  {regions.find(r => r.id === branch.regionId)?.regionName || branch.regionId}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    // Tree view
                    displayBranches.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <Network className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No branches found</p>
                        <p className="text-sm mt-1">
                          {searchQuery ? 'Try adjusting your search query' : 'No branches available'}
                        </p>
                      </div>
                    ) : (
                      displayBranches.map((branch, index) => 
                        renderBranchNode(branch, 0, index === displayBranches.length - 1)
                      )
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card className="rounded-xl border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Regions</CardTitle>
                    <CardDescription>
                      Manage regional grouping and assignments
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Region
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRegions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No regions found</p>
                      <p className="text-sm mt-1">
                        {searchQuery ? 'Try adjusting your search query' : 'No regions available'}
                      </p>
                    </div>
                  ) : (
                    filteredRegions.map(region => {
                      const regionBranches = branches.filter(b => b.regionId === region.id);
                      const activeBranches = regionBranches.filter(b => b.status === 'active').length;
                      
                      return (
                        <Card key={region.id} className="rounded-lg border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-semibold">{region.regionName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {region.regionCode} • {region.regionType}
                                    </div>
                                  </div>
                                </div>
                                {region.coverageArea && region.coverageArea.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-muted-foreground mb-1">Coverage Area:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {region.coverageArea.map((area, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {area}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Total Branches</div>
                                    <div className="text-lg font-bold">{regionBranches.length}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Active</div>
                                    <div className="text-lg font-bold text-green-600">{activeBranches}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
