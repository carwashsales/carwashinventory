
'use client';

import { InventoryManagement } from '@/components/inventory/inventory-management';
import { AppShell } from '@/components/app-shell';

export default function InventoryPage() {
  return (
    <AppShell>
      <InventoryManagement />
    </AppShell>
  );
}
