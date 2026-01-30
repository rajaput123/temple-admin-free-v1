import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Eye, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Recipe } from '@/types/kitchen';
import { RecipeModal } from '@/components/kitchen/RecipeModal';
import { dummyRecipes } from '@/data/kitchen-data';
import { dummyItems, dummyUOMs } from '@/data/inventory-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Recipes() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [recipes, setRecipes] = useState<Recipe[]>(dummyRecipes);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('recipes')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (statusFilter !== 'all' && recipe.status !== statusFilter) return false;
      if (approvalFilter !== 'all') {
        if (approvalFilter === 'approved' && recipe.status !== 'approved') return false;
        if (approvalFilter === 'pending' && recipe.status !== 'pending_approval') return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!recipe.name.toLowerCase().includes(query) && 
            !recipe.code.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [recipes, statusFilter, approvalFilter, searchQuery]);

  const handleSaveRecipe = (data: Partial<Recipe>) => {
    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...r, ...data } : r));
    } else {
      const newRecipe: Recipe = {
        ...data,
        id: `recipe-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        createdByName: 'Current User',
      } as Recipe;
      setRecipes([...recipes, newRecipe]);
    }
    setEditingRecipe(null);
    setRecipeModalOpen(false);
  };

  const getStatusBadge = (status: Recipe['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="default" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approvedRecipes = recipes.filter(r => r.status === 'approved').length;
  const pendingRecipes = recipes.filter(r => r.status === 'pending_approval').length;
  const totalRecipes = recipes.length;

  const recipeColumns = [
    { key: 'name', label: 'Recipe Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { 
      key: 'currentVersion', 
      label: 'Version', 
      render: (value: string) => <Badge variant="outline">{value}</Badge>
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: Recipe['status']) => getStatusBadge(value)
    },
    {
      key: 'batchSizes',
      label: 'Batch Sizes',
      render: (_: unknown, recipe: Recipe) => {
        const version = recipe.versions.find(v => v.id === recipe.currentVersionId);
        return version?.batchSizes.map(bs => bs.name).join(', ') || '-';
      }
    },
    {
      key: 'cost',
      label: 'Cost/Unit',
      render: (_: unknown, recipe: Recipe) => {
        const costing = recipe.costing?.[0];
        return costing ? `₹${costing.costPerUnit}` : '-';
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, recipe: Recipe) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewingRecipe(recipe);
              setRecipeModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {checkWriteAccess('recipes') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingRecipe(recipe);
                  setRecipeModalOpen(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Create new version
                  setEditingRecipe(recipe);
                  setRecipeModalOpen(true);
                }}
              >
                <History className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Recipes Management"
        description="Manage recipe master data, versions, and approvals"
        actions={
          checkWriteAccess('recipes') ? (
            <Button onClick={() => {
              setEditingRecipe(null);
              setRecipeModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
          ) : null
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecipes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedRecipes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingRecipes}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recipes</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search recipes..."
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Approval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredRecipes}
              columns={recipeColumns}
              searchKey="name"
              defaultPageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      {recipeModalOpen && (
        <RecipeModal
          open={recipeModalOpen}
          onOpenChange={setRecipeModalOpen}
          recipe={editingRecipe || viewingRecipe}
          items={dummyItems}
          uoms={dummyUOMs}
          onSave={handleSaveRecipe}
        />
      )}
    </MainLayout>
  );
}
