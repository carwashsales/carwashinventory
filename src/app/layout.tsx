
'use client';

import './globals.css';
import { AppProvider, AppContext, AppContextType } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';
import { useContext, useEffect, useState } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Sidebar } from '@/components/sidebar';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

function AppContent({ children }: { children: React.ReactNode }) {
  const context = useContext(AppContext);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const path = usePathname();

  if (!context) {
    return <LoadingOverlay />;
  }

  const { isInitialized, isLoading, isAuthenticated, language } = context as AppContextType;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  if (!isInitialized || isLoading) {
    return <LoadingOverlay />;
  }

  const renderAuth = () => {
    if (authView === 'login') {
      return <LoginForm onSwitchView={() => setAuthView('signup')} />;
    }
    return <SignUpForm onSwitchView={() => setAuthView('login')} />;
  };

  if (!isAuthenticated) {
    if (path.includes('/privacy-policy')) {
      return <>{children}</>;
    }
    return renderAuth();
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-10 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AppProvider>
          <AppContent>{children}</AppContent>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
