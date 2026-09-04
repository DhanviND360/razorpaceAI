export interface CustomerProfile {
  id: string;
  name: string;
  goal: string;
  preferences: string[];
  budgetRange: { min: number; max: number; currency: string };
  purchaseHistory: PurchaseRecord[];
  tags: string[];
}

export interface PurchaseRecord {
  productId: string;
  merchantId: string;
  productName: string;
  price: number;
  date: string;
  rating?: number;
}

export const demoCustomer: CustomerProfile = {
  id: 'customer-alex',
  name: 'Alex',
  goal: 'muscle building',
  preferences: ['budget-conscious', 'prefers-reliable-products', 'values-reviews', 'prefers-known-brands'],
  budgetRange: { min: 1000, max: 8000, currency: 'INR' },
  purchaseHistory: [
    {
      productId: 'hm-whey-001',
      merchantId: 'herbamed',
      productName: 'HerbaMed Whey Protein',
      price: 4299,
      date: '2026-07-15',
      rating: 4,
    },
    {
      productId: 'hm-bars-007',
      merchantId: 'herbamed',
      productName: 'HerbaMed Protein Bars (Box of 6)',
      price: 499,
      date: '2026-08-01',
      rating: 4,
    },
  ],
  tags: ['muscle-building', 'recovery', 'protein', 'returning-customer'],
};

export function getCustomerById(id: string): CustomerProfile | undefined {
  if (id === 'customer-alex' || id === 'alex') return demoCustomer;
  return undefined;
}

export function getCustomerPurchaseHistory(customerId: string): PurchaseRecord[] {
  const customer = getCustomerById(customerId);
  return customer?.purchaseHistory || [];
}
