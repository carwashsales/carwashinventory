'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface LoginFormProps {
  onSwitchView: () => void;
}

export function LoginForm({ onSwitchView }: LoginFormProps) {
  const { login, t } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };
  
  const handleEmailContact = () => {
    const email = 'banksray206@gmail.com';
    const subject = t('support-title');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/966545699674', '_blank');
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
              <LanguageSwitcher />
            </div>
            <CardTitle className="text-2xl font-bold">{t('login-title')}</CardTitle>
            <CardDescription>{t('login-subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username-label')}</Label>
                <Input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password-label')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t('login-button-text')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-center justify-center text-sm">
            <div className='flex justify-center items-center'>
              <p>{t('no-account-text')}</p>
              <Button variant="link" onClick={onSwitchView} className="p-1">
                {t('create-account-text')}
              </Button>
            </div>
             <div className='flex justify-center'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="p-1">{t('contact-us-text')}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('contact-us-text')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('contact-dialog-description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='sm:justify-center'>
                      <AlertDialogAction onClick={handleEmailContact}>{t('contact-email-btn')}</AlertDialogAction>
                      <AlertDialogAction onClick={handleWhatsAppContact}>{t('contact-whatsapp-btn')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
               <div className="mt-4 text-center text-xs text-muted-foreground">
                  <Link href="/privacy-policy" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
