'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Car, LayoutDashboard, ShoppingCart, DollarSign, Tag, FileText, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useContext(AppContext) as AppContextType;
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: t('dashboard-title'), icon: <LayoutDashboard /> },
    { href: '/inventory', label: t('inventory-title'), icon: <ShoppingCart /> },
    { href: '/new-service', label: t('orders-title'), icon: <DollarSign /> },
    { href: '/sales', label: t('sales-title'), icon: <Tag /> },
    { href: '/pricing', label: t('pricing-title'), icon: <FileText /> },
    { href: '/reports', label: t('reports-title'), icon: <FileText /> },
  ];

  const bottomNavItems = [
    { href: '/settings', label: t('settings-title'), icon: <Settings /> },
    { href: '/support', label: t('support-title'), icon: <HelpCircle /> },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/home" className="flex items-center gap-2">
          <Car className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">CleanSweep</h1>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex flex-col justify-between h-full p-4">
        <div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div>
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
