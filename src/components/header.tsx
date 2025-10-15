'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/settings-dialog';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const { t } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">{t('app-title')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">{t('settings-title')}</span>
            </Button>
          </div>
        </div>
      </header>
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
