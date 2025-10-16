'use client';

import { useMemo, useContext } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AppContext, AppContextType } from '@/contexts/app-context';
import type { Service, Expense } from '@/types';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';

interface RevenueChartProps {
  services: Service[];
  expenses: Expense[];
}

export function RevenueChart({ services, expenses }: RevenueChartProps) {
  const { t } = useContext(AppContext) as AppContextType;

  const data = useMemo(() => {
    if (services.length === 0 && expenses.length === 0) return [];

    const allDates = [
      ...services.map(s => startOfDay(new Date(s.timestamp))),
      ...expenses.map(e => startOfDay(new Date(e.date)))
    ];
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const interval = eachDayOfInterval({ start: minDate, end: maxDate });

    return interval.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dailyRevenue = services
        .filter(s => format(new Date(s.timestamp), 'yyyy-MM-dd') === dayStr)
        .reduce((acc, s) => acc + s.price, 0);
      const dailyExpenses = expenses
        .filter(e => format(new Date(e.date), 'yyyy-MM-dd') === dayStr)
        .reduce((acc, e) => acc + e.amount, 0);

      return {
        date: format(day, 'MMM d'),
        [t('revenue')]: dailyRevenue,
        [t('expenses')]: dailyExpenses,
      };
    });
  }, [services, expenses, t]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        <Tooltip />
        <Legend />
        <Bar dataKey={t('revenue')} fill="#3498db" radius={[4, 4, 0, 0]} />
        <Bar dataKey={t('expenses')} fill="#e74c3c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
