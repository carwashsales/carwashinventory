
'use client';

import { useApp } from '@/hooks/use-app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyReport } from './daily-report';
import { CustomerHistory } from './customer-history';

export function ReportsTab() {
  const { t } = useApp();

  return (
    <Tabs defaultValue="daily-report" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="daily-report">{t('daily-report-tab-title')}</TabsTrigger>
        <TabsTrigger value="customer-history">{t('customer-history-tab-text')}</TabsTrigger>
      </TabsList>
      <TabsContent value="daily-report" className="pt-6">
        <DailyReport />
      </TabsContent>
      <TabsContent value="customer-history" className="pt-6">
        <CustomerHistory />
      </TabsContent>
    </Tabs>
  );
}
