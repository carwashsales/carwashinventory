'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';

interface SignUpFormProps {
  onSwitchView: () => void;
}

export function SignUpForm({ onSwitchView }: SignUpFormProps) {
  const { signUp, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('passwords-do-not-match'));
      return;
    }
    signUp(email, password);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
         <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
            <LanguageSwitcher />
          </div>
          <CardTitle className="text-2xl font-bold">{t('signup-title')}</CardTitle>
          <CardDescription>{t('signup-subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email-label')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('confirm-password-label')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('signup-button-text')}
            </Button>
          </form>
        </CardContent>
      <CardFooter className="flex-col items-center justify-center text-sm">
           <div className='flex justify-center items-center'>
            <p>{t('have-account-text')}</p>
            <Button variant="link" onClick={onSwitchView} className="p-1">
              {t('login-now-text')}
            </Button>
          </div>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              <Link href="/privacy-policy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
            </div>
        </CardFooter>
      </Card>
    </main>
  );
}
