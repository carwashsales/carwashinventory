
'use client';

import './globals.css';
import { AppProvider, AppContext } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';
import { useContext } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';
import { CarWashApp } from '@/components/car-wash-app';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { useState } from 'react';

function AppContent({ children }: { children: React.ReactNode }) {
  const context = useContext(AppContext);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (!context) {
    return <LoadingOverlay />;
  }

  const { isInitialized, isLoading, isAuthenticated } = context;

  if (!isInitialized || isLoading) {
    return <LoadingOverlay />;
  }

  const renderAuth = () => {
    if (authView === 'login') {
      return <LoginForm onSwitchView={() => setAuthView('signup')} />;
    }
    return <SignUpForm onSwitchView={() => setAuthView('login')} />;
  };

  let path = '';
  if (typeof window !== 'undefined') {
    path = window.location.pathname;
  }

  if (!isAuthenticated) {
    if (path.includes('/privacy-policy')) {
      return <>{children}</>;
    }
    return renderAuth();
  }

  // If authenticated, render the children for all pages
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <AppContent>{children}</AppContent>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
