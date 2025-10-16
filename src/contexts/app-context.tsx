'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { translations, type Language } from '@/lib/translations';
import type { Service, Staff, ServiceConfig, InventoryItem, Expense } from '@/types';
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
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'userId'>) => Promise<InventoryItem | undefined>;
  updateInventoryItem: (id: string, item: Omit<InventoryItem, 'id' | 'userId'>) => Promise<void>;
  removeInventoryItem: (id: string) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'date'>) => Promise<Expense | undefined>;
  removeExpense: (id: string) => Promise<void>;
  loadExpenses: (currentUserId: string) => Promise<void>;
  loadAllData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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

      const formattedData = data.map(config => ({ ...config, id: String(config.id) }));

      if (formattedData.length === 0) {
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

        const formattedInsertedData = insertedData.map(config => ({ ...config, id: String(config.id) }));
        setServiceConfigs(formattedInsertedData);
        toast({ title: t('service-type-added-success')});
        return formattedInsertedData;
      } else {
        const configs = formattedData.sort((a, b) => a.name.localeCompare(b.name));
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
        const { error } = await supabase.from('service_configs').update(configData).eq('id', Number(id));
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
        const { error } = await supabase.from('service_configs').delete().eq('id', Number(id));
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
      setInventoryItems([]);
      setExpenses([]);
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
      const formattedStaff = data.map(s => ({ ...s, id: String(s.id) }));
      setStaff(formattedStaff);
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
      const { error } = await supabase.from('staff').delete().eq('id', Number(id));
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

      const formattedServices = data.map(s => ({ ...s, id: String(s.id), staffId: String(s.staffId) }));
      setAllServices(formattedServices as Service[]);
      
      const todayServices = (formattedServices as Service[])
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
        staffId: Number(serviceData.staffId),
        timestamp: now,
      };

      const { data, error } = await supabase.from('services').insert(serviceToSave).select();
      if (error) throw error;

      const newServiceForState = { ...data[0], id: String(data[0].id), staffId: String(data[0].staffId) } as Service;
      
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

  const loadInventoryItems = useCallback(async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('userId', currentUserId)
        .order('name');
      if (error) throw error;
      const formattedItems = data.map(i => ({ ...i, id: String(i.id) }));
      setInventoryItems(formattedItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      setInventoryItems([]);
    }
  }, []);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'userId'>) => {
    if (!user) return;
    showLoading();
    try {
      const { data, error } = await supabase.from('inventory_items').insert({ ...item, userId: user.id }).select();
      if (error) throw error;
      const newItem = { ...data[0], id: String(data[0].id) };
      await loadInventoryItems(user.id);
      toast({ title: t('inventory-item-added-success') });
      return newItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({ title: t('inventory-item-added-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const updateInventoryItem = async (id: string, item: Omit<InventoryItem, 'id' | 'userId'>) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('inventory_items').update(item).eq('id', Number(id));
      if (error) throw error;
      await loadInventoryItems(user.id);
      toast({ title: t('inventory-item-updated-success') });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({ title: t('inventory-item-updated-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeInventoryItem = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('inventory_items').delete().eq('id', Number(id));
      if (error) throw error;
      await loadInventoryItems(user.id);
      toast({ title: t('inventory-item-removed-success') });
    } catch (error) {
      console.error('Error removing inventory item:', error);
      toast({ title: t('inventory-item-removed-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const loadExpenses = useCallback(async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('userId', currentUserId)
        .order('date', { ascending: false });
      if (error) throw error;
      const formattedExpenses = data.map(e => ({ ...e, id: String(e.id) }));
      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'date'>) => {
    if (!user) return;
    showLoading();
    try {
      const { data, error } = await supabase.from('expenses').insert({ ...expense, userId: user.id, date: new Date().toISOString() }).select();
      if (error) throw error;
      const newExpense = { ...data[0], id: String(data[0].id) };
      await loadExpenses(user.id);
      toast({ title: t('expense-added-success') });
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({ title: t('expense-added-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeExpense = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', Number(id));
      if (error) throw error;
      await loadExpenses(user.id);
      toast({ title: t('expense-removed-success') });
    } catch (error) {
      console.error('Error removing expense:', error);
      toast({ title: t('expense-removed-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };
  
  const loadAllData = useCallback(async () => {
    if (!user) return;
    showLoading();
    try {
      await Promise.all([
        loadAllServices(),
        loadInventoryItems(user.id),
        loadExpenses(user.id),
      ]);
    } catch (e) {
        console.error("Failed to load all data", e);
        toast({ title: 'Failed to load all data', variant: 'destructive' });
    } finally {
        hideLoading();
    }
  }, [user, loadAllServices, loadInventoryItems, loadExpenses, toast]);

  const loadInitialData = useCallback(async (currentUser: User) => {
    showLoading();
    try {
        await Promise.all([
            loadStaff(currentUser.id),
            loadServiceConfigs(currentUser.id),
            loadInventoryItems(currentUser.id),
            loadExpenses(currentUser.id),
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
        const formattedServices = data.map(s => ({ ...s, id: String(s.id), staffId: String(s.staffId) }));
        setServices(formattedServices as Service[]);

    } catch (e) {
        console.error("Failed to load initial data", e);
        toast({ title: 'Failed to load initial data', variant: 'destructive' });
    } finally {
        hideLoading();
    }
  }, [loadStaff, loadServiceConfigs, loadInventoryItems, loadExpenses, toast]);

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
        setInventoryItems([]);
        setExpenses([]);
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
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    expenses,
    addExpense,
    removeExpense,
    loadExpenses,
    loadAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
