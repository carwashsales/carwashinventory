'use client';

import { useContext } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, HelpCircle, BarChart, DollarSign, PlusCircle, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

// A reusable card component for navigation
const ActionCard = ({ title, description, icon, path }: { title: string; description: string; icon: React.ReactNode; path: string; }) => {
  const router = useRouter();
  
  return (
    <Card 
      className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors duration-300 ease-in-out cursor-pointer group"
      onClick={() => router.push(path)}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 min-h-[180px]">
        <div className="text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform duration-300 ease-in-out mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-center text-slate-200 group-hover:text-white">{title}</h3>
        <p className="text-sm text-slate-400 text-center mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

// Header component
const Header = () => {
  const { t, user, logout } = useContext(AppContext) as AppContextType;
  const router = useRouter();

  return (
    <header className="flex justify-between items-center p-4 mb-8 border-b border-slate-700">
      <div className="text-sm font-medium text-slate-400">
        {user?.email}
      </div>
      <div className="flex items-center gap-2">
        <Button aria-label={t('settings-title')} variant="ghost" size="icon" onClick={() => router.push('/settings')}>
          <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
        </Button>
        <Button aria-label={t('logout-text')} variant="ghost" size="icon" onClick={logout}>
          <LogOut className="w-5 h-5 text-slate-400 hover:text-white" />
        </Button>
      </div>
    </header>
  );
};

// Main Home Page Component
export default function HomePage() {
  const { t, user } = useContext(AppContext) as AppContextType;

  // Define the navigation cards
  const cards = [
    { title: t('new-service-tab-text'), description: t('new-service-description'), icon: <PlusCircle size={48} />, path: '/new-service' },
    { title: t('reports-tab-text'), description: t('reports-description'), icon: <BarChart size={48} />, path: '/dashboard' },
    { title: t('inventory-and-expenses'), description: t('inventory-description'), icon: <DollarSign size={48} />, path: '/inventory' },
    { title: t('customer-history-tab-text'), description: t('customer-history-description'), icon: <Users size={48} />, path: '/customer-history' },
    { title: t('support-tab-text'), description: t('support-description'), icon: <HelpCircle size={48} />, path: '/support' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="p-4 md:p-6">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-100">{t('welcome-back')}, {user?.email}!</h1>
          <p className="text-slate-400 mt-2">{t('home-subtitle')}</p>
        </section>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {cards.map((card) => (
                <ActionCard key={card.title} {...card} />
            ))}
        </div>
      </main>
    </div>
  );
}
