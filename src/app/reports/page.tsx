'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ReportsPage() {
  const { t } = useApp();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

  const handleGenerateReport = () => {
    // TODO: Implement report generation based on dateRange
    console.log('Generating report for:', dateRange);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('reports-title')}</h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <DateRangePicker onUpdate={(range) => setDateRange(range.range)} />
          <Button onClick={handleGenerateReport} disabled={!dateRange}>
            {t('generate-report-btn')}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">{t('available-reports-title')}</h2>
        <ul className="list-disc list-inside">
          <li>{t('commission-report-link')}</li>
          <li>{t('services-report-link')}</li>
          <li>{t('expenses-report-link')}</li>
        </ul>
      </div>
    </div>
  );
}
