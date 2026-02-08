import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Save, Download, HelpCircle, Landmark, Wallet, CheckSquare, Package, UtensilsCrossed, Users } from 'lucide-react';
import { getBranchAccessRules } from '@/lib/branch-store';
import type { BranchAccessRule } from '@/types/branch';
import { toast } from 'sonner';

const moduleIcons: Record<string, React.ReactNode> = {
  assets: <Landmark className="h-4 w-4" />,
  donations: <Wallet className="h-4 w-4" />,
  tasks: <CheckSquare className="h-4 w-4" />,
  events: <Eye className="h-4 w-4" />,
  finance: <Wallet className="h-4 w-4" />,
  inventory: <Package className="h-4 w-4" />,
  kitchen: <UtensilsCrossed className="h-4 w-4" />,
  hr: <Users className="h-4 w-4" />,
};

const moduleCategories: Record<string, string> = {
  assets: 'Operations',
  donations: 'Finance',
  tasks: 'Operations',
  events: 'Operations',
  finance: 'Finance',
  inventory: 'Operations',
  kitchen: 'Operations',
  hr: 'Administration',
};

export default function BranchAccess() {
  const [rules, setRules] = useState(getBranchAccessRules());

  const handleToggle = (moduleName: string, field: keyof BranchAccessRule, value: boolean) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.moduleName === moduleName
          ? { ...rule, [field]: value }
          : rule
      )
    );
  };

  const handleSave = () => {
    toast.success('Access rules updated successfully');
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'own_only': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'region': return 'bg-green-100 text-green-800 border-green-200';
      case 'all_branches': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'own_only': return 'Own Branch Only';
      case 'region': return 'Region';
      case 'all_branches': return 'All Branches';
      default: return scope;
    }
  };

  const groupedRules = rules.reduce((acc, rule) => {
    const category = moduleCategories[rule.moduleName] || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, BranchAccessRule[]>);

  const columns = [
    {
      key: 'moduleName',
      label: 'Module',
      render: (_: unknown, row: BranchAccessRule) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {moduleIcons[row.moduleName] || <Eye className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium text-sm">{row.moduleName.toUpperCase()}</div>
            <div className="text-xs text-muted-foreground">
              {moduleCategories[row.moduleName] || 'Other'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'branchScope',
      label: 'Branch Scope',
      render: (_: unknown, row: BranchAccessRule) => (
        <Badge className={`${getScopeColor(row.branchScope)} text-xs`} variant="outline">
          {getScopeLabel(row.branchScope)}
        </Badge>
      ),
    },
    {
      key: 'regionRollup',
      label: 'Region Roll-up',
      render: (_: unknown, row: BranchAccessRule) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.regionRollupEnabled}
            onCheckedChange={(checked) =>
              handleToggle(row.moduleName, 'regionRollupEnabled', checked)
            }
          />
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Allow regional heads to view aggregated data from all branches in their region</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'parentVisibility',
      label: 'Parent Visibility',
      render: (_: unknown, row: BranchAccessRule) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.parentVisibilityEnabled}
            onCheckedChange={(checked) =>
              handleToggle(row.moduleName, 'parentVisibilityEnabled', checked)
            }
          />
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Allow parent branches to view child branch data</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'crossBranch',
      label: 'Cross-Branch Comparison',
      render: (_: unknown, row: BranchAccessRule) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.crossBranchComparisonEnabled}
            onCheckedChange={(checked) =>
              handleToggle(row.moduleName, 'crossBranchComparisonEnabled', checked)
            }
          />
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Enable comparison reports across multiple branches</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <MainLayout>
        <PageHeader
          title="Access & Data Control"
          description="Configure data segregation rules and access control policies"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'Branch Management', href: '/branch' },
            { label: 'Access & Data Control', href: '/branch/access' },
          ]}
        />

        <div className="space-y-4">
          <Tabs defaultValue="rules" className="space-y-4">
            <TabsList>
              <TabsTrigger value="rules">Access Rules</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <Card className="rounded-xl border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Module-Level Access Control</CardTitle>
                      <CardDescription>
                        Configure data segregation rules for each module
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Rules
                      </Button>
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    data={rules}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search modules..."
                    emptyMessage="No access rules found"
                  />
                </CardContent>
              </Card>

              {/* Grouped View (Alternative) */}
              <div className="space-y-4">
                {Object.entries(groupedRules).map(([category, categoryRules]) => (
                  <Card key={category} className="rounded-xl border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryRules.map(rule => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                {moduleIcons[rule.moduleName] || <Eye className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{rule.moduleName.toUpperCase()}</div>
                                <Badge className={`${getScopeColor(rule.branchScope)} text-xs mt-1`} variant="outline">
                                  {getScopeLabel(rule.branchScope)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`${rule.moduleName}-rollup`} className="text-xs">
                                  Region Roll-up
                                </Label>
                                <Switch
                                  id={`${rule.moduleName}-rollup`}
                                  checked={rule.regionRollupEnabled}
                                  onCheckedChange={(checked) =>
                                    handleToggle(rule.moduleName, 'regionRollupEnabled', checked)
                                  }
                                />
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Allow regional heads to view aggregated data from all branches in their region</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`${rule.moduleName}-parent`} className="text-xs">
                                  Parent Visibility
                                </Label>
                                <Switch
                                  id={`${rule.moduleName}-parent`}
                                  checked={rule.parentVisibilityEnabled}
                                  onCheckedChange={(checked) =>
                                    handleToggle(rule.moduleName, 'parentVisibilityEnabled', checked)
                                  }
                                />
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Allow parent branches to view child branch data</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`${rule.moduleName}-comparison`} className="text-xs">
                                  Cross-Branch
                                </Label>
                                <Switch
                                  id={`${rule.moduleName}-comparison`}
                                  checked={rule.crossBranchComparisonEnabled}
                                  onCheckedChange={(checked) =>
                                    handleToggle(rule.moduleName, 'crossBranchComparisonEnabled', checked)
                                  }
                                />
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Enable comparison reports across multiple branches</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card className="rounded-xl border shadow-sm">
                <CardHeader>
                  <CardTitle>Access Audit Log</CardTitle>
                  <CardDescription>
                    Track data access across branches (Last 30 days)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-12 text-center text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No audit logs available</p>
                    <p className="text-sm mt-1">Audit logs will appear here when data access is tracked</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </TooltipProvider>
  );
}
