import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dummyAssets } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function AssetReports() {
  const { checkModuleAccess } = usePermissions();

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Asset Reports"
        description="Asset registers and compliance reports"
      />
      <Tabs defaultValue="register" className="space-y-4">
        <TabsList>
          <TabsTrigger value="register">Asset Register</TabsTrigger>
          <TabsTrigger value="category">Category-wise</TabsTrigger>
          <TabsTrigger value="location">Location-wise</TabsTrigger>
          <TabsTrigger value="donor">Donor-wise</TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Complete Asset Register</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total Assets: {dummyAssets.length}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Category-wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Category reports</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location-wise Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Location reports</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="donor">
          <Card>
            <CardHeader>
              <CardTitle>Donor-wise Asset Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Donor reports</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
