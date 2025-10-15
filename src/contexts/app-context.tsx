'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { translations, type Language } from '@/lib/translations';
import type { Service, Staff, ServiceConfig } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { isSameDay } from 'date-fns';
import { SERVICE_TYPES } from '@/lib/constants';
import type { User } from '@supabase/supabase-js';

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isAuthenticated: boolean;
  user: User | null;
  login: (user: string, pass: string) => void;
  signUp: (user: string, pass: string) => void;
  logout: () => void;
  services: Service[];
  allServices: Service[];
  loadAllServices: () => Promise<void>;
  staff: Staff[];
  addStaff: (name: string, nameEn: string) => void;
  removeStaff: (id: string) => void;
  addService: (service: Omit<Service, 'id' | 'timestamp'>) => void;
  loadServicesForDate: (date: Date) => void;
  isLoading: boolean;
  isInitialized: boolean;
  serviceConfigs: ServiceConfig[];
  addServiceConfig: (config: Omit<ServiceConfig, 'id' | 'userId'>) => Promise<void>;
  updateServiceConfig: (config: ServiceConfig) => Promise<void>;
  removeServiceConfig: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const t = useCallback((key: keyof typeof translations.en): string => {
    const translation = translations[language][key] || translations.en[key];
    if (!translation) {
      const keyStr = key as string;
      return keyStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return translation;
  }, [language]);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const loadServiceConfigs = useCallback(async (currentUserId: string): Promise<ServiceConfig[]> => {
    try {
      const { data, error } = await supabase
        .from('service_configs')
        .select('*')
        .eq('userId', currentUserId);
      
      if (error) throw error;

      if (data.length === 0) {
        const enTranslations = translations.en;
        const arTranslations = translations.ar;
        
        const newConfigsData = Object.entries(SERVICE_TYPES).map(([key, config]) => {
          const nameArKey = key as keyof typeof arTranslations;
          const nameEnKey = key as keyof typeof enTranslations;

          return {
            name: key,
            nameAr: arTranslations[nameArKey] || key,
            nameEn: enTranslations[nameEnKey] || key,
            userId: currentUserId,
            ...config,
          };
        });

        const { data: insertedData, error: insertError } = await supabase.from('service_configs').insert(newConfigsData).select();
        if (insertError) throw insertError;

        setServiceConfigs(insertedData);
        toast({ title: t('service-type-added-success')});
        return insertedData;
      } else {
        const configs = data.sort((a, b) => a.name.localeCompare(b.name));
        setServiceConfigs(configs);
        return configs;
      }
    } catch (error) {
      console.error("Error loading service configs:", error);
      toast({ title: t('service-type-updated-failed'), variant: "destructive" });
      return [];
    }
  }, [toast, t]);

  const addServiceConfig = async (config: Omit<ServiceConfig, 'id' | 'userId'>) => {
    if (!user) return;
    showLoading();
    try {
        const newConfig = { ...config, userId: user.id };
        const { error } = await supabase.from('service_configs').insert(newConfig);
        if (error) throw error;
        await loadServiceConfigs(user.id);
        toast({ title: t('service-type-added-success')});
    } catch(e) {
        console.error("Error adding service config:", e);
        toast({ title: t('service-type-added-failed'), variant: "destructive"});
    } finally {
        hideLoading();
    }
  };

  const updateServiceConfig = async (config: ServiceConfig) => {
    if (!user) return;
    showLoading();
    try {
        const { id, ...configData } = config;
        const { error } = await supabase.from('service_configs').update(configData).eq('id', id);
        if (error) throw error;
        await loadServiceConfigs(user.id);
        toast({ title: t('service-type-updated-success')});
    } catch(e) {
        console.error("Error updating service config:", e);
        toast({ title: t('service-type-updated-failed'), variant: "destructive"});
    } finally {
        hideLoading();
    }
  };
  
  const removeServiceConfig = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
        const { error } = await supabase.from('service_configs').delete().eq('id', id);
        if (error) throw error;
        await loadServiceConfigs(user.id);
        toast({ title: t('service-type-removed-success')});
    } catch(e) {
        console.error("Error deleting service config:", e);
        toast({ title: t('service-type-removed-failed'), variant: "destructive"});
    } finally {
        hideLoading();
    }
  };

  const login = async (email: string, password: string) => {
    showLoading();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error(error);
      toast({
        title: t('login-failed'),
        variant: 'destructive',
      });
    } finally {
      hideLoading();
    }
  };

  const signUp = async (email: string, password: string) => {
    showLoading();
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({
        title: t('signup-success-title'),
        description: t('signup-success-description'),
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('signup-failed'),
        variant: 'destructive',
      });
    } finally {
      hideLoading();
    }
  };

  const logout = async () => {
    showLoading();
    try {
      await supabase.auth.signOut();
      setStaff([]);
      setServices([]);
      setAllServices([]);
      setServiceConfigs([]);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoading();
    }
  };

  const loadStaff = useCallback(async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('userId', currentUserId)
        .order('name');
      if (error) throw error;
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
    }
  }, []);
  
  const addStaff = async (name: string, nameEn: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('staff').insert({ name, nameEn, userId: user.id });
      if (error) throw error;
      await loadStaff(user.id);
      toast({ title: t('staff-added-success') });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({ title: t('staff-added-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeStaff = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      await loadStaff(user.id);
      toast({ title: t('staff-removed-success') });
    } catch (error) {
      console.error('Error removing staff:', error);
      toast({ title: t('staff-removed-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const loadAllServices = useCallback(async () => {
    if (!user) return;
    showLoading();
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false });
      if (error) throw error;

      setAllServices(data as Service[]);
      
      const todayServices = (data as Service[])
        .filter(service => isSameDay(new Date(service.timestamp), new Date()))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setServices(todayServices);

    } catch (error) {
      console.error('Error loading all services: ', error);
      toast({ title: 'Failed to load services data.', variant: 'destructive' });
      setAllServices([]);
    } finally {
      hideLoading();
    }
  }, [toast, user]);

  const loadServicesForDate = useCallback((date: Date) => {
    const dailyServices = allServices
      .filter(service => isSameDay(new Date(service.timestamp), date))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setServices(dailyServices);
  }, [allServices]);

  const addService = async (serviceData: Omit<Service, 'id' | 'timestamp'>) => {
    if (!user) return;
    showLoading();
    try {
      const now = new Date().toISOString();
      
      const serviceToSave = {
        ...serviceData,
        timestamp: now,
      };

      const { data, error } = await supabase.from('services').insert(serviceToSave).select();
      if (error) throw error;

      const newServiceForState = data[0] as Service;
      
      const updatedAllServices = [newServiceForState, ...allServices];
      setAllServices(updatedAllServices);

      if(isSameDay(new Date(newServiceForState.timestamp), new Date())) {
        setServices(prev => [newServiceForState, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }

      toast({ title: t('service-saved') });
    } catch (error)
    {
      console.error('Error adding service: ', error);
      toast({ title: 'Failed to save service', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };
  
  const loadInitialData = useCallback(async (currentUser: User) => {
    showLoading();
    try {
        await Promise.all([
            loadStaff(currentUser.id),
            loadServiceConfigs(currentUser.id),
        ]);
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('userId', currentUser.id)
            .gte('timestamp', startOfDay)
            .lte('timestamp', endOfDay)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        setServices(data as Service[]);

    } catch (e) {
        console.error("Failed to load initial data", e);
        toast({ title: 'Failed to load initial data', variant: 'destructive' });
    } finally {
        hideLoading();
    }
  }, [loadStaff, loadServiceConfigs, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadInitialData(currentUser);
      } else {
        setStaff([]);
        setServices([]);
        setAllServices([]);
        setServiceConfigs([]);
      }
      setIsInitialized(true);
      setIsLoading(false);
    });
    
    if (typeof window !== 'undefined' && !document.documentElement.lang) {
      setLanguage('ar');
    }

    return () => subscription.unsubscribe();
  }, [loadInitialData, setLanguage]);


  const value = {
    language,
    setLanguage,
    t,
    isAuthenticated,
    user,
    login,
    signUp,
    logout,
    services,
    allServices,
    loadAllServices,
    staff,
    addStaff,
    removeStaff,
    addService,
    loadServicesForDate,
    isLoading,
    isInitialized,
    serviceConfigs,
    addServiceConfig,
    updateServiceConfig,
    removeServiceConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
