
'use client';

import './globals.css';
import { AppProvider, AppContext } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';
import { useContext, useEffect, useState } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Header } from '@/components/header';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { usePathname } from 'next/navigation';

function AppContent({ children }: { children: React.ReactNode }) {
  const context = useContext(AppContext);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const path = usePathname();

  if (!context) {
    return <LoadingOverlay />;
  }

  const { isInitialized, isLoading, isAuthenticated, language } = context;

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-6">
        {children}
      </main>
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
