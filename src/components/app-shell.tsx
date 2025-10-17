
'use client';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
