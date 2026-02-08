import { useMemo, useState } from 'react';
import { getDeliveryReports, getMessages, updateDeliveryReport } from '@/lib/pr-communication-store';
import type { DeliveryReport } from '@/types/pr-communication';
import { toast } from 'sonner';
import { DeliveryReportsLog } from '@/components/pr/communication/DeliveryReportsLog';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/pr-communication.css';

export default function DeliveryReports() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track delivery status, open rates, and engagement metrics for all messages
          </p>
        </div>
      </div>

      {/* Delivery Reports Table with Filters */}
      <DeliveryReportsLog />
    </div>
  );
}
