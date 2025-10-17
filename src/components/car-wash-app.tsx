
'use client';

import { useApp } from '@/hooks/use-app';
import { AppShell } from '@/components/app-shell';

export function CarWashApp({ children }: { children: React.ReactNode }) {
  const { t } = useApp();

  return (
    <AppShell>
        {children}
    </AppShell>
  );
}
