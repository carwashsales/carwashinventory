
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { translations, type Language } from '@/lib/translations';
import type { Service, Staff, ServiceConfig, InventoryItem, Expense, ProductType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { isSameDay } from 'date-fns';
import { SERVICE_TYPES } from '@/lib/constants';
import type { User } from '@supabase/supabase-js';

const t = (language: Language, key: keyof typeof translations.en): string => {
  const translation = translations[language][key] || translations.en[key];
  if (!translation) {
    const keyStr = key as string;
    return keyStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return translation;
};

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
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'userId' | 'productType'>) => Promise<InventoryItem | undefined>;
  updateInventoryItem: (id: string, item: Omit<InventoryItem, 'id' | 'userId' | 'productType'>) => Promise<void>;
  removeInventoryItem: (id: string) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'date'>) => Promise<Expense | undefined>;
  removeExpense: (id: string) => Promise<void>;
  loadExpenses: (currentUserId: string) => Promise<void>;
  productTypes: ProductType[];
  addProductType: (nameEn: string, nameAr: string) => Promise<void>;
  updateProductType: (id: string, nameEn: string, nameAr: string) => Promise<void>;
  removeProductType: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const langRef = useRef(language);

  const isAuthenticated = !!user;

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    langRef.current = lang;
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const t_ = useCallback((key: keyof typeof translations.en): string => {
    return t(language, key);
  }, [language]);

  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);

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
        toast({ title: t(langRef.current, 'service-type-added-success')});
        return formattedInsertedData;
      } else {
        const configs = formattedData.sort((a, b) => a.name.localeCompare(b.name));
        setServiceConfigs(configs);
        return configs;
      }
    } catch (error) {
      console.error("Error loading service configs:", error);
      toast({ title: t(langRef.current, 'service-type-updated-failed'), variant: "destructive" });
      return [];
    }
  }, [toast]);

  const addServiceConfig = async (config: Omit<ServiceConfig, 'id' | 'userId'>) => {
    if (!user) return;
    showLoading();
    try {
        const newConfig = { ...config, userId: user.id };
        const { error } = await supabase.from('service_configs').insert(newConfig);
        if (error) throw error;
        await loadServiceConfigs(user.id);
        toast({ title: t(langRef.current, 'service-type-added-success')});
    } catch(e) {
        console.error("Error adding service config:", e);
        toast({ title: t(langRef.current, 'service-type-added-failed'), variant: "destructive"});
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
        toast({ title: t(langRef.current, 'service-type-updated-success')});
    } catch(e) {
        console.error("Error updating service config:", e);
        toast({ title: t(langRef.current, 'service-type-updated-failed'), variant: "destructive"});
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
        toast({ title: t(langRef.current, 'service-type-removed-success')});
    } catch(e) {
        console.error("Error deleting service config:", e);
        toast({ title: t(langRef.current, 'service-type-removed-failed'), variant: "destructive"});
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
        title: t(langRef.current, 'login-failed'),
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
        title: t(langRef.current, 'signup-success-title'),
        description: t(langRef.current, 'signup-success-description'),
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t(langRef.current, 'signup-failed'),
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
      setServiceConfigs([]);
      setInventoryItems([]);
      setExpenses([]);
      setProductTypes([]);
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
      toast({ title: t(langRef.current, 'staff-added-success') });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({ title: t(langRef.current, 'staff-added-failed'), variant: 'destructive' });
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
      toast({ title: t(langRef.current, 'staff-removed-success') });
    } catch (error) {
      console.error('Error removing staff:', error);
      toast({ title: t(langRef.current, 'staff-removed-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const _loadServicesForDate = useCallback(async (userId: string, date: Date) => {
    showLoading();
    try {
      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('userId', userId)
        .gte('timestamp', startOfDay)
        .lte('timestamp', endOfDay)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      const formattedServices = data.map(s => ({ ...s, id: String(s.id), staffId: String(s.staffId) }));
      setServices(formattedServices as Service[]);
    } catch (error) {
      console.error('Error loading services for date: ', error);
      toast({ title: t(langRef.current, 'Failed to load services data.'), variant: 'destructive' });
      setServices([]);
    } finally {
      hideLoading();
    }
  }, [toast, showLoading, hideLoading]);

  const loadServicesForDate = useCallback(async (date: Date) => {
    if (user) {
      await _loadServicesForDate(user.id, date);
    }
  }, [user, _loadServicesForDate]);

  const addService = async (serviceData: Omit<Service, 'id' | 'timestamp'>) => {
    if (!user) return;
    showLoading();
    try {
      const now = new Date().toISOString();
      
      const serviceToSave = {
        ...serviceData,
        staffId: serviceData.staffId,
        timestamp: now,
        userId: user.id,
      };

      const { data, error } = await supabase.from('services').insert(serviceToSave).select();
      if (error) throw error;

      const newServiceForState = { ...data[0], id: String(data[0].id), staffId: String(data[0].staffId) } as Service;
      
      if(isSameDay(new Date(newServiceForState.timestamp), new Date())) {
        setServices(prev => [newServiceForState, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }

      toast({ title: t(langRef.current, 'service-saved') });
    } catch (error)
    {
      console.error('Error adding service: ', error);
      toast({ title: t(langRef.current, 'Failed to save service'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const loadInventoryItems = useCallback(async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*, productType:product_types(*)')
        .eq('userId', currentUserId)
        .order('id');
      if (error) throw error;
      const formattedItems = data.map(i => ({ 
        ...i, 
        id: String(i.id),
      }));
      setInventoryItems(formattedItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      setInventoryItems([]);
    }
  }, []);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'userId' | 'productType'>) => {
    if (!user) return;
    showLoading();
    try {
      const { data, error } = await supabase.from('inventory_items').insert({ ...item, userId: user.id }).select();
      if (error) throw error;
      const newItem = { ...data[0], id: String(data[0].id) };
      await loadInventoryItems(user.id);
      toast({ title: 'Inventory item added successfully' });
      return newItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({ title: 'Failed to add inventory item', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const updateInventoryItem = async (id: string, item: Omit<InventoryItem, 'id' | 'userId' | 'productType'>) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('inventory_items').update(item).eq('id', id);
      if (error) throw error;
      await loadInventoryItems(user.id);
      toast({ title: 'Inventory item updated successfully' });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({ title: 'Failed to update inventory item', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeInventoryItem = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw error;
      await loadInventoryItems(user.id);
      toast({ title: 'Inventory item removed successfully' });
    } catch (error) {
      console.error('Error removing inventory item:', error);
      toast({ title: 'Failed to remove inventory item', variant: 'destructive' });
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
      toast({ title: 'Expense added successfully' });
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({ title: 'Failed to add expense', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeExpense = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      await loadExpenses(user.id);
      toast({ title: 'Expense removed successfully' });
    } catch (error) {
      console.error('Error removing expense:', error);
      toast({ title: 'Failed to remove expense', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const loadProductTypes = useCallback(async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .eq('user_id', currentUserId)
        .order('name_en');
      if (error) throw error;
      const formattedTypes = data.map(t => ({ ...t, id: String(t.id) }));
      setProductTypes(formattedTypes);
    } catch (error) {
      console.error('Error loading product types:', error);
      setProductTypes([]);
    }
  }, []);

  const addProductType = async (nameEn: string, nameAr: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('product_types').insert({ name_en: nameEn, name_ar: nameAr, user_id: user.id });
      if (error) throw error;
      await loadProductTypes(user.id);
      toast({ title: t(langRef.current, 'product-type-added-success') });
    } catch (error) {
      console.error('Error adding product type:', error);
      toast({ title: t(langRef.current, 'product-type-added-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const updateProductType = async (id: string, nameEn: string, nameAr: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('product_types').update({ name_en: nameEn, name_ar: nameAr }).eq('id', id);
      if (error) throw error;
      await loadProductTypes(user.id);
      toast({ title: t(langRef.current, 'product-type-updated-success') });
    } catch (error) {
      console.error('Error updating product type:', error);
      toast({ title: t(langRef.current, 'product-type-updated-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeProductType = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      const { error } = await supabase.from('product_types').delete().eq('id', id);
      if (error) throw error;
      await loadProductTypes(user.id);
      toast({ title: t(langRef.current, 'product-type-removed-success') });
    } catch (error) {
      console.error('Error removing product type:', error);
      toast({ title: t(langRef.current, 'product-type-removed-failed'), variant: 'destructive' });
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
        loadInventoryItems(currentUser.id),
        loadExpenses(currentUser.id),
        loadProductTypes(currentUser.id),
        _loadServicesForDate(currentUser.id, new Date()),
      ]);
    } catch (e) {
      console.error("Failed to load initial data", e);
      toast({ title: t(langRef.current, 'Failed to load initial data'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  }, [loadStaff, loadServiceConfigs, loadInventoryItems, loadExpenses, loadProductTypes, _loadServicesForDate, showLoading, hideLoading, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (currentUser) {
          await loadInitialData(currentUser);
        }
        setIsInitialized(true);
      } else if (event === 'SIGNED_OUT') {
        setStaff([]);
        setServices([]);
        setServiceConfigs([]);
        setInventoryItems([]);
        setExpenses([]);
        setProductTypes([]);
        setIsInitialized(true);
      }
    });
    
    if (typeof window !== 'undefined' && !document.documentElement.lang) {
      setLanguage('ar');
    }

    return () => subscription.unsubscribe();
  }, [loadInitialData, setLanguage]);


  const value = {
    language,
    setLanguage,
    t: t_,
    isAuthenticated,
    user,
    login,
    signUp,
    logout,
    services,
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
    productTypes,
    addProductType,
    updateProductType,
    removeProductType,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
