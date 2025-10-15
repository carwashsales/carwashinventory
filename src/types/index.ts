export type Staff = {
  id: string;
  name: string;
  nameEn: string;
  userId: string;
};

export type Service = {
  id: string;
  timestamp: string;
  serviceType: string;
  carSize: string | null;
  staffId: string;
  staffName: string;
  staffNameEn: string;
  price: number;
  commission: number;
  userId: string;
  customerContact?: string;
  hasCoupon: boolean;
  paymentMethod?: 'cash' | 'machine';
  waxAddOn: boolean;
  isPaid: boolean;
};

export type ServicePrice = {
  price: number;
  commission: number;
  couponCommission?: number;
};

export type ServiceConfig = {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  prices: {
    [key: string]: ServicePrice;
  };
  needsSize: boolean;
  hasCoupon: boolean;
  userId: string;
};

export type ServiceTypesConfig = {
  [key:string]: Omit<ServiceConfig, 'id' | 'name' | 'userId' | 'nameAr' | 'nameEn'>;
};
