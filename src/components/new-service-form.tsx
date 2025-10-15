'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_TYPES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import type { Service } from '@/types';

type PaymentType = 'coupon' | 'cash' | 'machine' | 'not-paid';

export function NewServiceForm() {
  const { 
    t, 
    language, 
    staff, 
    addService, 
    user
  } = useApp();
  const { toast } = useToast();
  
  const [serviceType, setServiceType] = useState('');
  const [carSize, setCarSize] = useState('');
  const [staffId, setStaffId] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [commission, setCommission] = useState<number | string>('');
  const [customerContact, setCustomerContact] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType | undefined>(undefined);
  const [waxAddOn, setWaxAddOn] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

   const WAX_PRICE = 5;
  const WAX_COMMISSION = 2;

  const serviceConfig = serviceType ? SERVICE_TYPES[serviceType] : null;
  const noStaff = staff.length === 0;

   const showWaxOption = serviceType === 'full-wash' || serviceType === 'outside-only';
  const resetForm = useCallback(() => {
    setServiceType('');
    setCarSize('');
    setStaffId('');
    setPrice('');
    setCommission('');
    setCustomerContact('');
    setPaymentType(undefined);
    setWaxAddOn(false);
    setErrors({});
  }, []);

  useEffect(() => {
    if (!serviceConfig) {
      setPrice('');
      setCommission('');
      setCarSize('');
      setPaymentType(undefined);
      setWaxAddOn(false);
      return;
    }

    if (!serviceConfig.needsSize) {
      setCarSize('');
    }

   if (!serviceConfig.hasCoupon && paymentType === 'coupon') {
        setPaymentType(undefined);
       }
    
    if (!showWaxOption) {
      setWaxAddOn(false);
    }

    const priceKey = serviceConfig.needsSize ? carSize : 'default';
    if (!priceKey) {
      setPrice('');
      setCommission('');
      return;
    }

    const priceObj = serviceConfig.prices[priceKey];
    if (priceObj) {
      let currentPrice = 0;
      let currentCommission = 0;

      if (paymentType === 'coupon' && serviceConfig.hasCoupon && priceObj.couponCommission !== undefined) {
        currentPrice = 0;
        currentCommission = priceObj.couponCommission;
      } else {
       currentPrice = priceObj.price;
        currentCommission = priceObj.commission;
      }

      if (waxAddOn && showWaxOption) {
        currentPrice += WAX_PRICE;
        currentCommission += WAX_COMMISSION;
      }
      
      setPrice(currentPrice);
      setCommission(currentCommission);
    } else {
      setPrice('');
      setCommission('');
    }
   }, [serviceType, carSize, paymentType, serviceConfig, waxAddOn, showWaxOption]);

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!serviceType) newErrors.serviceType = true;
    if (serviceConfig?.needsSize && !carSize) newErrors.carSize = true;
    if (!staffId) newErrors.staffId = true;
    if (!paymentType) newErrors.paymentType = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handlePaymentTypeChange = (method: PaymentType) => {
    setPaymentType(prev => prev === method ? undefined : method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (noStaff) return;
    
    if (!validateForm() || !user) {
       toast({
        title: t('fix-errors-title'),
        description: t('fix-errors-description'),
        variant: 'destructive',
      });
      return;
    }

    const selectedStaff = staff.find(s => s.id === staffId);
    if (!selectedStaff) return;
     
    const isPaid = paymentType !== 'not-paid';
    
    const servicePayload: Omit<Service, 'id' | 'timestamp'> = {
      userId: user.uid,
      serviceType,
      carSize: carSize || null,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffNameEn: selectedStaff.nameEn,
      price: isPaid ? Number(price) : 0,
      commission: Number(commission),
      hasCoupon: paymentType === 'coupon',
      paymentMethod: paymentType !== 'coupon' && isPaid ? paymentType as 'cash' | 'machine' : undefined,
      waxAddOn,
      isPaid,
    };

    if (customerContact) {
      servicePayload.customerContact = customerContact;
    }
    
    addService(servicePayload);

    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('new-service-title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">

        {noStaff && (
          <Alert variant="destructive">
             <Settings className="h-4 w-4" />
            <AlertDescription>
              {t('no-staff-alert')}
            </AlertDescription>
          </Alert>
        )}

        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="service-type">{t('service-type-label')}</Label>
              <Select 
                value={serviceType} 
                onValueChange={(value) => {
                  setServiceType(value);
                  setErrors(prev => ({...prev, serviceType: false}));
                }}
                disabled = {noStaff}
              >
                <SelectTrigger id="service-type" data-invalid={errors.serviceType}>
                  <SelectValue placeholder={t('select-service-type')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SERVICE_TYPES).map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(key as keyof typeof import('@/lib/translations').translations.en)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="car-size">{t('car-size-label')}</Label>
              <Select 
                value={carSize} 
                onValueChange={(value) => {
                  setCarSize(value);
                  setErrors(prev => ({...prev, carSize: false}));
                }}
                disabled={ noStaff ||  !serviceConfig?.needsSize}
              >
                <SelectTrigger id="car-size" data-invalid={errors.carSize}>
                  <SelectValue placeholder={t('select-car-size')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('small-car')}</SelectItem>
                  <SelectItem value="medium">{t('medium-car')}</SelectItem>
                  <SelectItem value="big">{t('big-car')}</SelectItem>
                  <SelectItem value="long-gmc">{t('long-gmc')}</SelectItem>
                  <SelectItem value="microbus">{t('microbus')}</SelectItem>
                  <SelectItem value="long-coaster">{t('long-coaster')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="staff-member">{t('staff-member-label')}</Label>
              <Select 
                value={staffId} 
                onValueChange={(value) => {
                  setStaffId(value);
                  setErrors(prev => ({...prev, staffId: false}));
                }}
                disabled={noStaff}
              >
                <SelectTrigger id="staff-member" data-invalid={errors.staffId}>
                  <SelectValue placeholder={t('select-staff-member')} />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {language === 'ar' ? s.name : s.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-contact">{t('customer-contact-label')}</Label>
              <Input 
                id="customer-contact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder={t('customer-contact-placeholder')}
                disabled={noStaff}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">{t('price-label')}</Label>
               <Input id="price" value={paymentType === 'not-paid' ? 0 : price} readOnly disabled={noStaff} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">{t('commission-label')}</Label>
              <Input id="commission" value={commission} readOnly disabled={noStaff} />
            </div>
            
        
             {showWaxOption && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse pt-8">
                  <Checkbox 
                    id="wax-add-on" 
                    checked={waxAddOn} 
                    onCheckedChange={(checked) => setWaxAddOn(Boolean(checked))} 
                    disabled={noStaff} 
                  />
                  <Label htmlFor="wax-add-on" className="cursor-pointer">{t('wax-add-on')} (+{WAX_PRICE} {t('sar')})</Label>
                </div>
              )}
            
            <div className="md:col-span-3 flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t" data-invalid={errors.paymentType}>
              <Label className="font-bold">{t('table-header-payment-method')}:</Label>
              {serviceConfig?.hasCoupon && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox id="payment-coupon" checked={paymentType === 'coupon'} onCheckedChange={() => handlePaymentTypeChange('coupon')} disabled={noStaff || paymentType === 'not-paid'} />
                  <Label htmlFor="payment-coupon" className="cursor-pointer">{t('coupon-label')}</Label>
                </div>
              )}
               <div className="flex items-center space-x-2 rtl:space-x-reverse">
               <Checkbox id="payment-cash" checked={paymentType === 'cash'} onCheckedChange={() => handlePaymentTypeChange('cash')} disabled={noStaff || paymentType === 'not-paid'} />
                <Label htmlFor="payment-cash" className="cursor-pointer">{t('payment-method-cash')}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox id="payment-machine" checked={paymentType === 'machine'} onCheckedChange={() => handlePaymentTypeChange('machine')} disabled={noStaff || paymentType === 'not-paid'} />
                <Label htmlFor="payment-machine" className="cursor-pointer">{t('payment-method-machine')}</Label>
              </div>
                 <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox id="payment-not-paid" checked={paymentType === 'not-paid'} onCheckedChange={() => handlePaymentTypeChange('not-paid')} disabled={noStaff} />
                    <Label htmlFor="payment-not-paid" className="cursor-pointer">{t('payment-status-not-paid')}</Label>
                  </div>
            </div>
          </div>

          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={resetForm} disabled={noStaff}>{t('clear-btn')}</Button>
            <Button type="submit" disabled={noStaff}>{t('submit-btn')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
