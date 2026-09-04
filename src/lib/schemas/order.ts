import { z } from 'zod';

export const RazorpayOrderSchema = z.object({
  id: z.string(),
  entity: z.string().default('order'),
  amount: z.number().positive(),
  amountPaid: z.number().nonnegative().default(0),
  amountDue: z.number().nonnegative(),
  currency: z.string().default('INR'),
  receipt: z.string(),
  status: z.enum(['created', 'attempted', 'paid']),
  createdAt: z.number().optional(),
});

export const PaymentResultSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  verified: z.boolean(),
  status: z.enum(['success', 'failed', 'pending']),
  failureReason: z.string().optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  merchantId: z.string(),
  merchantName: z.string(),
  cartId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    type: z.enum(['primary', 'upsell', 'cross-sell']).default('primary'),
  })),
  subtotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().optional(),
  paymentStatus: z.enum(['pending', 'success', 'failed']).default('pending'),
  orderStatus: z.enum(['created', 'confirmed', 'failed', 'cancelled']).default('created'),
  policyCheckPassed: z.boolean().default(false),
  userApproved: z.boolean().default(false),
  upsellAccepted: z.boolean().default(false),
  crossSellAccepted: z.boolean().default(false),
  upsellRevenue: z.number().nonnegative().default(0),
  crossSellRevenue: z.number().nonnegative().default(0),
  baselineRevenue: z.number().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RazorpayOrder = z.infer<typeof RazorpayOrderSchema>;
export type PaymentResult = z.infer<typeof PaymentResultSchema>;
export type Order = z.infer<typeof OrderSchema>;
