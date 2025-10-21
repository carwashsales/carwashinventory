'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, User, PlusCircle, Trash2 } from 'lucide-react';
import type { Language } from '@/lib/translations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
  const { t, language, setLanguage, logout, user, staff, addStaff, removeStaff } = useApp();
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffNameEn, setNewStaffNameEn] = useState('');

  const handleAddStaff = () => {
    if (newStaffName.trim() && newStaffNameEn.trim()) {
      addStaff(newStaffName, newStaffNameEn);
      setNewStaffName('');
      setNewStaffNameEn('');
    }
  };

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('settings-title')}</CardTitle>
          {user?.email && (
            <CardDescription className="flex items-center gap-2 pt-2">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full" defaultValue='language'>
             <AccordionItem value="language">
              <AccordionTrigger className="text-lg font-medium">{t('language-settings-title')}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="language-select">{t('settings-language-label')}</Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                    <SelectTrigger id="language-select">
                      <SelectValue placeholder={t('settings-language-label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">{t('settings-arabic')}</SelectItem>
                      <SelectItem value="en">{t('settings-english')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="staff-management">
              <AccordionTrigger className="text-lg font-medium">{t('staff-management-title')}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>{t('staff-list-label')}</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
                      {staff.length > 0 ? (
                        staff.map(s => (
                          <div key={s.id} className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-muted">
                            <span>{language === 'ar' ? s.name : s.nameEn}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeStaff(s.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-2">{t('no-staff-text')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-md border p-4">
                    <h4 className="font-medium">{t('add-staff-member-title')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-staff-name-ar">{t('staff-name-ar-label')}</Label>
                        <Input 
                          id="new-staff-name-ar"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder={t('name-in-arabic-placeholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-staff-name-en">{t('staff-name-en-label')}</Label>
                        <Input 
                          id="new-staff-name-en"
                          value={newStaffNameEn}
                          onChange={(e) => setNewStaffNameEn(e.target.value)}
                          placeholder={t('name-in-english-placeholder')}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddStaff} className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>{t('add-staff-btn')}</span>
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span>{t('logout-text')}</span>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
