import { PlatformLayout } from '@/components/platform/PlatformLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp } from 'lucide-react';

export default function Subscriptions() {
  const subscriptions = [
    {
      id: 'sub-1',
      application: 'Sri Sharadamba Temple',
      tier: 'premium',
      amount: 9999,
      status: 'active',
      nextBilling: '2024-02-15',
    },
    {
      id: 'sub-2',
      application: 'Kashi Vishwanath Temple',
      tier: 'basic',
      amount: 4999,
      status: 'active',
      nextBilling: '2024-02-20',
    },
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform subscriptions and billing
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,49,980</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">Premium & Enterprise</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                12%
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{sub.application}</CardTitle>
                    <CardDescription>Subscription ID: {sub.id}</CardDescription>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">{sub.tier}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">₹{sub.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="default">{sub.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing</p>
                    <p className="text-sm font-medium">{new Date(sub.nextBilling).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">Upgrade</Button>
                  <Button variant="outline" size="sm">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PlatformLayout>
  );
}
