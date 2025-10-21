'use client';

import { InventoryManagement } from '@/components/inventory/inventory-management';
import { ExpenseManagement } from '@/components/expenses/expense-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from '@/hooks/use-app';


export default function InventoryAndExpensesPage() {
  const { t } = useApp();

  return (
    <main className="container mx-auto p-4">
       <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">{t('inventory-title')}</TabsTrigger>
          <TabsTrigger value="expenses">{t('expenses-title')}</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseManagement />
        </TabsContent>
      </Tabs>
    </main>
  );
}
