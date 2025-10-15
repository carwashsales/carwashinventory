
'use client';

import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import Link from 'next/link';

export function SubPageHeader() {
  const { t } = useApp();

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" legacyBehavior passHref>
          <Button asChild>
            <a>
              <ArrowLeft className="h-4 w-4" />
              <span>{t('back-to-app-btn')}</span>
            </a>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
