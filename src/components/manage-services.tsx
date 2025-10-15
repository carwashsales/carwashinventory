
'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import type { ServiceConfig, ServicePrice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const carSizes = ['small', 'medium', 'big', 'long-gmc', 'microbus', 'long-coaster'];

const ServiceTypeForm = ({ config, onFinished }: { config: ServiceConfig | null; onFinished: () => void }) => {
    const { t, addServiceConfig, updateServiceConfig } = useApp();
    const [formData, setFormData] = useState<Omit<ServiceConfig, 'id' | 'userId'>>(() => {
      if (config) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, userId, ...rest } = config;
        return rest;
      }
      return {
        name: '',
        nameAr: '',
        nameEn: '',
        needsSize: false,
        hasCoupon: false,
        prices: { default: { price: 0, commission: 0 } },
      };
    });
    
    const isNew = !config;

    const handlePriceChange = (key: string, field: keyof ServicePrice, value: string) => {
      const numericValue = parseFloat(value) || 0;
      setFormData(prev => {
        const newPrices = { ...prev.prices };
        if (!newPrices[key]) {
          newPrices[key] = { price: 0, commission: 0 };
        }
        newPrices[key] = { ...newPrices[key], [field]: numericValue };
        return { ...prev, prices: newPrices };
      });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isNew) {
        await addServiceConfig(formData);
      } else if (config) {
        await updateServiceConfig({ ...formData, id: config.id, userId: config.userId });
      }
      onFinished();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
        <div className="space-y-2">
          <Label htmlFor="service-name">{t('service-name-label')}</Label>
          <Input id="service-name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value.toLowerCase().replace(/\s+/g, '-')}))} placeholder={t('service-name-placeholder')} required disabled={!isNew} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-name-arabic">{t('service-name-arabic-label')}</Label>
              <Input id="service-name-arabic" value={formData.nameAr} onChange={e => setFormData(p => ({...p, nameAr: e.target.value}))} placeholder={t('service-name-arabic-placeholder')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-name-english">{t('service-name-english-label')}</Label>
              <Input id="service-name-english" value={formData.nameEn} onChange={e => setFormData(p => ({...p, nameEn: e.target.value}))} placeholder={t('service-name-english-placeholder')} required />
            </div>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox id="needs-size" checked={formData.needsSize} onCheckedChange={checked => setFormData(p => ({ ...p, needsSize: !!checked }))} />
            <Label htmlFor="needs-size" className="cursor-pointer">{t('requires-car-size-label')}</Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox id="has-coupon" checked={formData.hasCoupon} onCheckedChange={checked => setFormData(p => ({ ...p, hasCoupon: !!checked }))} />
            <Label htmlFor="has-coupon" className="cursor-pointer">{t('has-coupon-label')}</Label>
          </div>
        </div>

        {!formData.needsSize ? (
          <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
            <div>
              <Label>{t('default-price-label')}</Label>
              <Input type="number" value={formData.prices?.default?.price || ''} onChange={e => handlePriceChange('default', 'price', e.target.value)} />
            </div>
            <div>
              <Label>{t('default-commission-label')}</Label>
              <Input type="number" value={formData.prices?.default?.commission || ''} onChange={e => handlePriceChange('default', 'commission', e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">{t('prices-for-sizes-label')}</h4>
            {carSizes.map(size => (
              <div key={size} className="grid grid-cols-1 gap-y-2">
                 <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <Label>{t('price-for-size-label').replace('{size}', t(`${size}-car`))}</Label>
                      <Input type="number" value={formData.prices?.[size]?.price || ''} onChange={e => handlePriceChange(size, 'price', e.target.value)} />
                    </div>
                    <div>
                      <Label>{t('commission-for-size-label').replace('{size}', t(`${size}-car`))}</Label>
                      <Input type="number" value={formData.prices?.[size]?.commission || ''} onChange={e => handlePriceChange(size, 'commission', e.target.value)} />
                    </div>
                 </div>
                {formData.hasCoupon && (
                   <div className="col-span-2">
                    <Label>{t('coupon-commission-label')} ({t(`${size}-car`)})</Label>
                    <Input type="number" value={formData.prices?.[size]?.couponCommission || ''} onChange={e => handlePriceChange(size, 'couponCommission', e.target.value)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">{t('clear-btn')}</Button>
          </DialogClose>
          <Button type="submit">{t('save-changes-btn')}</Button>
        </DialogFooter>
      </form>
    );
  };

export function ManageServices() {
  const { t, serviceConfigs, removeServiceConfig, language } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ServiceConfig | null>(null);

  const openDialog = (config: ServiceConfig | null = null) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };
  
  const getServiceDisplayName = (config: ServiceConfig) => {
    if (language === 'ar') {
      return config.nameAr || config.name;
    }
    return config.nameEn || config.name;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">{t('service-types-page-title')}</CardTitle>
              <CardDescription>{t('service-types-page-description')}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog(null)}>
                  <PlusCircle />
                  {t('add-new-service-type-btn')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingConfig ? t('edit-service-type-title') : t('add-service-type-title')}</DialogTitle>
                </DialogHeader>
                <ServiceTypeForm config={editingConfig} onFinished={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('service-type-label')}</TableHead>
                <TableHead>{t('requires-car-size-label')}</TableHead>
                <TableHead>{t('has-coupon-label')}</TableHead>
                <TableHead className="text-right">{t('actions-label')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceConfigs.map(config => (
                <TableRow key={config.id}>
                  <TableCell>{getServiceDisplayName(config)}</TableCell>
                  <TableCell>{config.needsSize ? t('yes-text') : t('no-text')}</TableCell>
                  <TableCell>{config.hasCoupon ? t('yes-text') : t('no-text')}</TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('delete-service-type-title')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('delete-service-type-description')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel-btn')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeServiceConfig(config.id)}>
                            {t('delete-btn')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
