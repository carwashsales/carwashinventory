
'use client';

import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { LogOut, User } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SubPageHeader } from '@/components/subpage-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function SettingsPage() {
  const { t, logout, user } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SubPageHeader />
      <main className="container mx-auto flex-1 py-10">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>{t('settings-title')}</CardTitle>
            {user?.email && (
              <CardDescription className="flex items-center gap-2 pt-2">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="language">
                <AccordionTrigger>{t('language-settings-title')}</AccordionTrigger>
                <AccordionContent>
                  <LanguageSwitcher />
                </AccordionContent>
              </AccordionItem>
              {/* Other settings can be added here as AccordionItems */}
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>{t('logout-text')}</span>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

// Dummy components to avoid breaking the build, as they might not be defined elsewhere
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6">{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-2xl font-bold">{children}</h2>;
const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={`text-muted-foreground ${className}`}>{children}</p>
);
const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const CardFooter = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>;
