
'use client';

import { useApp } from '@/hooks/use-app';
import { AppShell } from '@/components/app-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewServiceForm } from '@/components/new-service-form';
import { ReportsTab } from '@/components/reports-tab';
import { ManageServices } from './manage-services';

export function CarWashApp() {
  const { t } = useApp();

  return (
    <AppShell>
        <Tabs defaultValue="new-service" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-service">{t('new-service-tab-text')}</TabsTrigger>
            <TabsTrigger value="reports">{t('reports-tab-text')}</TabsTrigger>
            <TabsTrigger value="manage-services">{t('manage-services-tab-text')}</TabsTrigger>
          </TabsList>
          <TabsContent value="new-service">
            <NewServiceForm />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
           <TabsContent value="manage-services">
            <ManageServices />
          </TabsContent>
        </Tabs>
    </AppShell>
  );
}
