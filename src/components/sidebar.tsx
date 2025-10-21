'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, ShoppingCart, DollarSign, Tag, FileText, Settings, LifeBuoy, X } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
  { href: '/inventory', icon: ShoppingCart, label: 'inventory-management-title' },
  { href: '/sales', icon: DollarSign, label: 'new-service-tab-text' },
  { href: '/pricing', icon: Tag, label: 'manage-services-tab-text' },
  { href: '/expenses', icon: FileText, label: 'expense-management-title' },
  { href: '/reports', icon: FileText, label: 'reports-tab-text' },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useApp();
  const pathname = usePathname();

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
          <Car size={32} />
          <span>CleanSweep</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X />
        </Button>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800 ${pathname === link.href ? 'bg-gray-800' : ''}`}>
            <link.icon className="h-5 w-5" />
            {t(link.label as any)}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-gray-800 space-y-2">
        <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800">
          <Settings className="h-5 w-5" />
          {t('settings-title')}
        </Link>
        <Link href="/support" className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800">
          <LifeBuoy className="h-5 w-5" />
          {t('support-tab-text')}
        </Link>
      </div>
    </aside>
  );
}
