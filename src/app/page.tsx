'use client';

import { useContext, useEffect } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isInitialized } = useContext(AppContext) as AppContextType;
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-2xl font-bold">Loading...</div>
    </div>
  );
}
