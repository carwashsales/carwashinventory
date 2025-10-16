'use client';

import { useContext } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardSummaryProps {
  totalRevenue: number;
  totalCommissions: number;
  totalExpenses: number;
  netProfit: number;
}

export function DashboardSummary({ totalRevenue, totalCommissions, totalExpenses, netProfit }: DashboardSummaryProps) {
  const { t } = useContext(AppContext) as AppContextType;

  const summaryCards = [
    { title: t('total-revenue'), value: totalRevenue.toFixed(2) },
    { title: t('total-commissions'), value: totalCommissions.toFixed(2) },
    { title: t('total-expenses'), value: totalExpenses.toFixed(2) },
    { title: t('net-profit'), value: netProfit.toFixed(2) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map(card => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
