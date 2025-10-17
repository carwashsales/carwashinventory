'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/hooks/use-app';
import type { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Download, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { ManageServices } from '@/components/manage-services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Dashboard() {
  const { t, language, services, loadServicesForDate, serviceConfigs, allServices, loadAllServices } = useApp();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [yesterdayServices, setYesterdayServices] = useState<Service[]>([]);

  useEffect(() => {
    if (allServices.length === 0) {
      loadAllServices();
    }
  },[allServices, loadAllServices]);

  const handleDateSelect = useCallback((selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      loadServicesForDate(selectedDate);
      const yesterday = subDays(selectedDate, 1);
      const yesterdayData = allServices.filter(s => s.timestamp.startsWith(yesterday.toISOString().split('T')[0]));
      setYesterdayServices(yesterdayData);
    }
  }, [loadServicesForDate, allServices]);

  useEffect(() => {
    if (date) {
      loadServicesForDate(date);
      const yesterday = subDays(date, 1);
      const yesterdayData = allServices.filter(s => s.timestamp.startsWith(yesterday.toISOString().split('T')[0]));
      setYesterdayServices(yesterdayData);
    }
  }, [date, loadServicesForDate, allServices]);

  const reportData = useMemo(() => {
    let totalSales = 0;
    let totalCommissions = 0;
    const staffCommissions: { [key: string]: { name: string; amount: number } } = {};

    services.forEach(service => {
      totalSales += service.price;
      totalCommissions += service.commission;
      const staffName = language === 'ar' ? service.staffName : service.staffNameEn;
      if (staffCommissions[staffName]) {
        staffCommissions[staffName].amount += service.commission;
      } else {
        staffCommissions[staffName] = { name: staffName, amount: service.commission };
      }
    });

    return { totalSales, totalCommissions, staffCommissions };
  }, [services, language]);

  const yesterdayTotalSales = useMemo(() => {
    return yesterdayServices.reduce((acc, service) => acc + service.price, 0);
  }, [yesterdayServices]);

  const salesDifference = useMemo(() => {
    if (yesterdayTotalSales === 0) {
      return reportData.totalSales > 0 ? 100 : 0;
    }
    return ((reportData.totalSales - yesterdayTotalSales) / yesterdayTotalSales) * 100;
  }, [reportData.totalSales, yesterdayTotalSales]);

  const paymentBreakdown = useMemo(() => {
    const cash = services.filter(s => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.price, 0);
    const machine = services.filter(s => s.paymentMethod === 'machine').reduce((acc, s) => acc + s.price, 0);
    const coupons = services.filter(s => s.hasCoupon).length;
    const notPaid = services.filter(s => !s.isPaid).reduce((acc, s) => acc + s.price, 0);
    return { cash, machine, coupons, notPaid };
  }, [services]);

  const getServiceTypeName = (s: Service) => {
    const config = serviceConfigs.find(c => c.name === s.serviceType);
    const baseName = language === 'ar' ? config?.nameAr : config?.nameEn;
    const name = baseName || s.serviceType;
    return s.waxAddOn ? `${name} + ${t('wax-add-on')}` : name;
  };

  const getCarSizeName = (carSizeId: string | null) => {
    if (!carSizeId) return '-';
    const key = `${carSizeId}-car` as keyof typeof import('@/lib/translations').translations.en;
    return t(key) || carSizeId;
  };
  
  const getPaymentMethodName = (s: Service) => {
    if (!s.isPaid) return t('payment-status-not-paid');
    if (s.hasCoupon) return t('coupon-label');
    if (!s.paymentMethod) return '-';
    const key = `payment-method-${s.paymentMethod}` as keyof typeof import('@/lib/translations').translations.en;
    return t(key) || s.paymentMethod;
  }

  const exportToCsv = () => {
    const headers = [
      t('table-header-time'), t('table-header-service'), t('table-header-size'),
      t('table-header-contact'), t('table-header-staff'), t('table-header-price'), 
      t('table-header-commission'), t('table-header-payment-method')
    ].join(',');

    const rows = services.map(s => [
      format(new Date(s.timestamp), 'p', { locale: language === 'ar' ? arSA : undefined }),
      getServiceTypeName(s),
      getCarSizeName(s.carSize),
      s.customerContact || '',
      language === 'ar' ? s.staffName : s.staffNameEn,
      s.price,
      s.commission,
      getPaymentMethodName(s)
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `report-${format(date!, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="space-y-2">
                <Label>{t('report-date-label')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: language === 'ar' ? arSA : undefined }) : <span>{t('report-date-label')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            <Button onClick={exportToCsv} disabled={services.length === 0}>
              <Download className="h-4 w-4" />
              <span>{t('export-csv-text')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('todays-sales-label')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalSales.toFixed(2)} {t('sar')}</div>
            <p className="text-xs text-muted-foreground">
              {salesDifference.toFixed(1)}% {t('from-yesterday-label')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('washes-completed-label')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="px-0">{t('more-details-label')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('payment-details-label')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <p>{t('payment-method-cash')}: {paymentBreakdown.cash.toFixed(2)} {t('sar')}</p>
                    <p>{t('payment-method-machine')}: {paymentBreakdown.machine.toFixed(2)} {t('sar')}</p>
                    <p>{t('coupon-label')}: {paymentBreakdown.coupons}</p>
                    <p>{t('payment-status-not-paid')}: {paymentBreakdown.notPaid.toFixed(2)} {t('sar')}</p>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('total-commissions-label')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{reportData.totalCommissions} {t('sar')}</p>
            <div className="text-sm space-y-1">
              {Object.values(reportData.staffCommissions).map(staff => (
                <p key={staff.name}>{staff.name}: {staff.amount} {t('sar')}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('services-list-label')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table-header-time')}</TableHead>
                <TableHead>{t('table-header-service')}</TableHead>
                <TableHead>{t('table-header-size')}</TableHead>
                <TableHead>{t('table-header-contact')}</TableHead>
                <TableHead>{t('table-header-staff')}</TableHead>
                <TableHead>{t('table-header-payment-method')}</TableHead>
                <TableHead className="text-right">{t('table-header-price')}</TableHead>
                <TableHead className="text-right">{t('table-header-commission')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? (
                services.map((s: Service) => (
                  <TableRow key={s.id}>
                    <TableCell>{format(new Date(s.timestamp), 'p', { locale: language === 'ar' ? arSA : undefined })}</TableCell>
                    <TableCell>{getServiceTypeName(s)}</TableCell>
                    <TableCell>{getCarSizeName(s.carSize)}</TableCell>
                    <TableCell>{s.customerContact || '-'}</TableCell>
                    <TableCell>{language === 'ar' ? s.staffName : s.staffNameEn}</TableCell>
                    <TableCell>{getPaymentMethodName(s)}</TableCell>
                    <TableCell className="text-right">{s.price}</TableCell>
                    <TableCell className="text-right">{s.commission}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">{t('no-records-text')}</TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="font-bold">{t('table-footer-totals')}</TableCell>
                <TableCell className="text-right font-bold">{reportData.totalSales} {t('sar')}</TableCell>
                <TableCell className="text-right font-bold">{reportData.totalCommissions} {t('sar')}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <div className="col-span-4">
        <ManageServices />
      </div>
    </div>
  );
}
