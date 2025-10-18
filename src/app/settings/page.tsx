
'use client';

import { SettingsDialog as Settings } from '@/components/settings-dialog';
import { AppShell } from '@/components/app-shell';

export default function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}
