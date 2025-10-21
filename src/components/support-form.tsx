'use client';

import { useState, useContext } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SupportForm() {
  const { t } = useContext(AppContext) as AppContextType;
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the support request to a backend service
    console.log({ subject, message });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{t('support-form-thank-you')}</h2>
        <p>{t('support-form-submitted')}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('support-form-title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">{t('support-form-subject')}</label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('support-form-subject-placeholder')}
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">{t('support-form-message')}</label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('support-form-message-placeholder')}
              required
              rows={6}
            />
          </div>
          <Button type="submit">{t('support-form-submit-btn')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
