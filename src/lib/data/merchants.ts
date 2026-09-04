import { Merchant } from '../schemas/merchant';

export const merchants: Merchant[] = [
  {
    id: 'herbamed',
    name: 'HerbaMed Solutions',
    description: 'Premium wellness and nutrition products. AI-powered personalized recommendations with full transaction capability.',
    category: 'health-wellness',
    website: 'https://herbamed.example.com',
    catalogEndpoint: '/api/agent/catalog?merchant=herbamed',
    transactionReady: true,
    aiReadable: 'high',
    policies: {
      maxDiscountPercent: 15,
      returnWindowDays: 14,
      freeShippingAbove: 1000,
      minOrderValue: 299,
      maxOrderValue: 50000,
      allowBundleDiscounts: true,
      bundleDiscountPercent: 5,
      loyaltyDiscountPercent: 3,
      shippingCost: 49,
      codAvailable: true,
      upsellEnabled: true,
      crossSellEnabled: true,
      maxUpsellPriceDeltaPercent: 20,
    },
    supportedPaymentMethods: ['razorpay', 'cod'],
    contactEmail: 'support@herbamed.example.com',
    isActive: true,
  },
  {
    id: 'nutriworld',
    name: 'NutriWorld',
    description: 'Global nutrition brand offering premium sports and health supplements with comprehensive product information.',
    category: 'health-wellness',
    website: 'https://nutriworld.example.com',
    catalogEndpoint: '/api/agent/catalog?merchant=nutriworld',
    transactionReady: true,
    aiReadable: 'high',
    policies: {
      maxDiscountPercent: 10,
      returnWindowDays: 10,
      freeShippingAbove: 1500,
      minOrderValue: 499,
      maxOrderValue: 30000,
      allowBundleDiscounts: true,
      bundleDiscountPercent: 3,
      loyaltyDiscountPercent: 2,
      shippingCost: 79,
      codAvailable: false,
      upsellEnabled: true,
      crossSellEnabled: true,
      maxUpsellPriceDeltaPercent: 15,
    },
    supportedPaymentMethods: ['razorpay'],
    contactEmail: 'hello@nutriworld.example.com',
    isActive: true,
  },
  {
    id: 'healthkart',
    name: 'HealthKart Demo',
    description: 'Health supplements store.',
    category: 'health-wellness',
    website: 'https://healthkart.example.com',
    catalogEndpoint: undefined, // No machine-readable endpoint
    transactionReady: false,
    aiReadable: 'partial',
    policies: {
      maxDiscountPercent: 5,
      returnWindowDays: 7,
      minOrderValue: 0,
      shippingCost: 99,
      codAvailable: false,
      upsellEnabled: false,
      crossSellEnabled: false,
      maxUpsellPriceDeltaPercent: 0,
      allowBundleDiscounts: false,
      bundleDiscountPercent: 0,
      loyaltyDiscountPercent: 0,
    },
    supportedPaymentMethods: [],
    isActive: true,
  },
  {
    id: 'wellnesshub',
    name: 'WellnessHub',
    description: 'Supplements',
    category: 'health',
    transactionReady: false,
    aiReadable: 'poor',
    policies: {
      maxDiscountPercent: 0,
      returnWindowDays: 0,
      minOrderValue: 0,
      shippingCost: 0,
      codAvailable: false,
      upsellEnabled: false,
      crossSellEnabled: false,
      maxUpsellPriceDeltaPercent: 0,
      allowBundleDiscounts: false,
      bundleDiscountPercent: 0,
      loyaltyDiscountPercent: 0,
    },
    supportedPaymentMethods: [],
    isActive: true,
  },
];

export function getMerchantById(id: string): Merchant | undefined {
  return merchants.find(m => m.id === id);
}

export function getAllMerchants(): Merchant[] {
  return merchants;
}

export function getActiveMerchants(): Merchant[] {
  return merchants.filter(m => m.isActive);
}
