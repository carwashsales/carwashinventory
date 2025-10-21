'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-10 bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu />
        </Button>
      </div>
    </header>
  );
}
