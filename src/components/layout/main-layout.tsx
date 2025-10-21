'use client';

import { useState, useContext } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppContext, AppContextType } from '@/contexts/app-context';
import Image from 'next/image';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useContext(AppContext) as AppContextType;

  return (
    // The sidebar is dark gray-900
    <div className="flex h-screen bg-gray-800 text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* The top bar has the same background as the main content area and no bottom border */}
        <header className="p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:bg-gray-700">
            <Menu />
          </Button>
          <div className="flex items-center gap-4">
            <Image src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User avatar" width={32} height={32} className="rounded-full" />
          </div>
        </header>
        <main className="flex-1 px-6 pb-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
