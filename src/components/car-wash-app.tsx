
'use client';

import { useApp } from '@/hooks/use-app';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewServiceForm } from '@/components/new-service-form';
import { ReportsTab } from '@/components/reports-tab';
import { ManageServices } from './manage-services';

export function CarWashApp() {
  const { t } = useApp();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Tabs defaultValue="new-service" className="container mx-auto py-6">
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
      </main>
    </div>
  );
}
