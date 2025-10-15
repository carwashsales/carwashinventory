'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/hooks/use-app';
import type { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { differenceInDays, format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

interface CustomerData {
  contact: string;
  services: Service[];
  fullWashCount: number;
  lastVisitDays: number | null;
}

export function CustomerHistory() {
  const { t, language, allServices, serviceConfigs, loadAllServices } = useApp();
  const [searchContact, setSearchContact] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (allServices.length === 0) {
      loadAllServices();
    }
  }, [allServices, loadAllServices]);

  const processedCustomers = useMemo((): CustomerData[] => {
    const customerMap = new Map<string, Service[]>();
    allServices.forEach(s => {
      if (s.customerContact) {
        if (!customerMap.has(s.customerContact)) {
          customerMap.set(s.customerContact, []);
        }
        customerMap.get(s.customerContact)!.push(s);
      }
    });

    return Array.from(customerMap.entries()).map(([contact, services]) => {
      const sortedServices = services.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const fullWashCount = sortedServices.filter(s => s.serviceType === 'full-wash' && s.isPaid).length;
      const lastVisitDays = sortedServices.length > 0 ? differenceInDays(new Date(), new Date(sortedServices[0].timestamp)) : null;
      return { contact, services: sortedServices, fullWashCount, lastVisitDays };
    });
  }, [allServices]);
  
  const filteredCustomers = useMemo(() => {
    if (showAll) return processedCustomers;
    if (!searchContact) return [];
    return processedCustomers.filter(c => c.contact === searchContact);
  }, [searchContact, showAll, processedCustomers]);
  
  const getMessage = (customer: CustomerData) => {
    const locationUrl = 'https://share.google/UB0m98HiDNbftnJAc';
    const remainingWashes = 6 - (customer.fullWashCount % 6);
    
    if (customer.lastVisitDays !== null && customer.lastVisitDays > 30) {
      return t('whatsapp-reengagement-message').replace('{location}', locationUrl);
    } else if (customer.fullWashCount > 0 && customer.fullWashCount % 6 === 0) {
      return t('whatsapp-free-wash-message').replace('{location}', locationUrl);
    } else {
      return t('whatsapp-standard-message')
        .replace('{count}', remainingWashes.toString())
        .replace('{location}', locationUrl);
    }
  };

  const handleSendWhatsApp = (contact: string) => {
    const customer = processedCustomers.find(c => c.contact === contact);
    if (!customer) return;
    const message = getMessage(customer);
    const whatsappUrl = `https://wa.me/${contact}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleSendToSelected = () => {
    if (selectedCustomers.size === 0) return;
    const message = t('whatsapp-bulk-message');
    const contacts = Array.from(selectedCustomers).join(',');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const toggleCustomerSelection = (contact: string) => {
    setSelectedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contact)) {
        newSet.delete(contact);
      } else {
        newSet.add(contact);
      }
      return newSet;
    });
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('customer-history-title')}</CardTitle>
          <CardDescription>{t('customer-history-description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="customer-search">{t('customer-contact-label')}</Label>
              <Input
                id="customer-search"
                value={searchContact}
                onChange={(e) => {
                  setSearchContact(e.target.value);
                  setShowAll(false);
                }}
                placeholder={t('customer-contact-placeholder')}
              />
            </div>
            <Button onClick={() => { setShowAll(true); setSearchContact(''); }}>
              {t('show-all-customers-btn')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredCustomers.length > 0 && (
        <Card>
          {showAll && (
            <CardHeader>
                <Button onClick={handleSendToSelected} disabled={selectedCustomers.size === 0} className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white">
                  <WhatsAppIcon />
                  <span>{t('send-to-selected-btn')} ({selectedCustomers.size})</span>
                </Button>
            </CardHeader>
          )}
          <CardContent>
            {filteredCustomers.map(customer => (
               <Card key={customer.contact} className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                       <div className="flex items-center gap-4">
                        {showAll && (
                          <Checkbox
                            id={`select-${customer.contact}`}
                            checked={selectedCustomers.has(customer.contact)}
                            onCheckedChange={() => toggleCustomerSelection(customer.contact)}
                          />
                        )}
                        <div>
                            <CardTitle>{t('service-history-for')} {customer.contact}</CardTitle>
                            <CardDescription className="pt-2">
                                {t('full-wash-count')}: {customer.fullWashCount}
                            </CardDescription>
                        </div>
                       </div>
                        <Button onClick={() => handleSendWhatsApp(customer.contact)} disabled={customer.services.length === 0} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                            <WhatsAppIcon />
                            <span>{t('send-whatsapp-notification')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('table-header-date')}</TableHead>
                        <TableHead>{t('table-header-service')}</TableHead>
                        <TableHead>{t('table-header-size')}</TableHead>
                        <TableHead className="text-right">{t('table-header-price')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customer.services.length > 0 ? (
                        customer.services.map((s: Service) => (
                            <TableRow key={s.id}>
                            <TableCell>{format(new Date(s.timestamp), 'PPP', { locale: language === 'ar' ? arSA : undefined })}</TableCell>
                            <TableCell>{getServiceTypeName(s)}</TableCell>
                            <TableCell>{getCarSizeName(s.carSize)}</TableCell>
                            <TableCell className="text-right">{s.price} {t('sar')}</TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">{t('no-history-for-customer')}</TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
            ))}
            {filteredCustomers.length === 0 && !showAll && (
              <p className="text-center text-muted-foreground pt-4">{t('no-history-for-customer')}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
