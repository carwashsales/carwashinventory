import type { ServiceTypesConfig } from '@/types';

export const SERVICE_TYPES: ServiceTypesConfig = {
  'full-wash': {
    prices: {
      small: { price: 20, commission: 8, couponCommission: 4 },
      medium: { price: 25, commission: 10, couponCommission: 5 },
      big: { price: 30, commission: 12, couponCommission: 6 },
      'long-gmc': { price: 35, commission: 14, couponCommission: 7 },
      microbus: { price: 40, commission: 16, couponCommission: 8 },
      'long-coaster': { price: 60, commission: 24, couponCommission: 12 },
    },
    needsSize: true,
    hasCoupon: true,
  },
  'inside-only': {
    prices: { default: { price: 10, commission: 4 } },
    needsSize: false,
    hasCoupon: false,
  },
  'outside-only': {
    prices: {
      small: { price: 15, commission: 5 },
      medium: { price: 20, commission: 8 },
      big: { price: 25, commission: 10 },
      'long-gmc': { price: 30, commission: 12 },
      microbus: { price: 35, commission: 14 },
      'long-coaster': { price: 50, commission: 20 },
    },
    needsSize: true,
    hasCoupon: false,
  },
  'water-only': {
    prices: { default: { price: 10, commission: 4 } },
    needsSize: false,
    hasCoupon: false,
  },
  'engine-wash-only': {
    prices: { default: { price: 10, commission: 4 } },
    needsSize: false,
    hasCoupon: false,
  },
  'mirrors-only': {
    prices: { default: { price: 5, commission: 2 } },
    needsSize: false,
    hasCoupon: false,
  },
  'carpets-covering': {
    prices: { default: { price: 10, commission: 2 } },
    needsSize: false,
    hasCoupon: false,
  },
  'carpet-cleaning': {
    prices: { default: { price: 10, commission: 4 } },
    needsSize: false,
    hasCoupon: false,
  },
  'ac-wash': {
    prices: { default: { price: 10, commission: 4 } },
    needsSize: false,
    hasCoupon: false,
  },
};
