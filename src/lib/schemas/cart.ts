import { z } from 'zod';

export const CartItemSchema = z.object({
  productId: z.string(),
  merchantId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  variantId: z.string().optional(),
  type: z.enum(['primary', 'upsell', 'cross-sell']).default('primary'),
});

export const CartSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  merchantId: z.string(),
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative(),
  shippingCost: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
  appliedOffers: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
