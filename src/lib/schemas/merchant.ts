import { z } from 'zod';

export const MerchantPolicySchema = z.object({
  maxDiscountPercent: z.number().min(0).max(100).default(10),
  returnWindowDays: z.number().int().nonnegative().default(7),
  freeShippingAbove: z.number().nonnegative().optional(),
  minOrderValue: z.number().nonnegative().default(0),
  maxOrderValue: z.number().positive().optional(),
  allowBundleDiscounts: z.boolean().default(false),
  bundleDiscountPercent: z.number().min(0).max(100).default(0),
  loyaltyDiscountPercent: z.number().min(0).max(100).default(0),
  shippingCost: z.number().nonnegative().default(0),
  codAvailable: z.boolean().default(false),
  upsellEnabled: z.boolean().default(true),
  crossSellEnabled: z.boolean().default(true),
  maxUpsellPriceDeltaPercent: z.number().min(0).max(100).default(25),
});

export const MerchantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  website: z.string().optional(),
  catalogEndpoint: z.string().optional(),
  transactionReady: z.boolean().default(false),
  aiReadable: z.enum(['high', 'partial', 'poor']),
  policies: MerchantPolicySchema,
  supportedPaymentMethods: z.array(z.string()).default(['razorpay']),
  contactEmail: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type MerchantPolicy = z.infer<typeof MerchantPolicySchema>;
export type Merchant = z.infer<typeof MerchantSchema>;
