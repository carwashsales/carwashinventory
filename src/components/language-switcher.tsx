'use client';

import { Globe } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Language } from '@/lib/translations';

export function LanguageSwitcher() {
  const { t, language, setLanguage } = useApp();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className="w-auto gap-2">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ar">{t('settings-arabic')}</SelectItem>
        <SelectItem value="en">{t('settings-english')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
