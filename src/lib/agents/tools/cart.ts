import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getProductById } from '../../data/products';
import { saveCart, getCart } from '../../data/store';
import { Cart, CartItem } from '../../schemas/cart';

export const calculateCart = tool(
  async (input) => {
    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      merchantId: string;
      name: string;
      price: number;
      quantity: number;
      type: string;
      valid: boolean;
      issue?: string;
    }> = [];

    for (const item of input.items) {
      const product = getProductById(item.merchantId, item.productId);
      if (!product) {
        validatedItems.push({ ...item, name: item.productId, price: 0, type: item.type || 'primary', valid: false, issue: 'Product not found' });
        continue;
      }
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      validatedItems.push({
        productId: item.productId,
        merchantId: item.merchantId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        type: item.type || 'primary',
        valid: true,
      });
    }

    return JSON.stringify({
      items: validatedItems,
      subtotal,
      shippingCost: 0,
      discount: 0,
      total: subtotal,
      currency: 'INR',
      itemCount: validatedItems.filter(i => i.valid).length,
    });
  },
  {
    name: 'calculate_cart',
    description: 'Calculate cart totals from a list of items. Validates each product exists and computes subtotal/total.',
    schema: z.object({
      items: z.array(z.object({
        productId: z.string(),
        merchantId: z.string(),
        quantity: z.number().int().positive().default(1),
        type: z.string().optional().describe('primary, upsell, or cross-sell'),
      })),
    }),
  }
);

export const createCart = tool(
  async (input) => {
    const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const items: CartItem[] = [];
    let subtotal = 0;

    for (const item of input.items) {
      const product = getProductById(input.merchantId, item.productId);
      if (!product) continue;
      
      const cartItem: CartItem = {
        productId: product.id,
        merchantId: input.merchantId,
        name: product.name,
        price: product.price,
        quantity: item.quantity || 1,
        type: (item.type as 'primary' | 'upsell' | 'cross-sell') || 'primary',
      };
      items.push(cartItem);
      subtotal += cartItem.price * cartItem.quantity;
    }

    const cart: Cart = {
      id: cartId,
      customerId: input.customerId,
      merchantId: input.merchantId,
      items,
      subtotal,
      shippingCost: 0,
      discount: 0,
      total: subtotal,
      currency: 'INR',
      appliedOffers: [],
      createdAt: now,
      updatedAt: now,
    };

    saveCart(input.sessionId, cart);

    return JSON.stringify({
      cartId: cart.id,
      items: cart.items,
      subtotal: cart.subtotal,
      total: cart.total,
      currency: cart.currency,
      itemCount: cart.items.length,
    });
  },
  {
    name: 'create_cart',
    description: 'Create a new cart with the specified items for a customer. Saves the cart in the session store.',
    schema: z.object({
      sessionId: z.string().describe('Session ID for storage'),
      customerId: z.string().describe('Customer ID'),
      merchantId: z.string().describe('Merchant ID'),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive().default(1),
        type: z.string().optional().describe('primary, upsell, or cross-sell'),
      })),
    }),
  }
);

export const updateCart = tool(
  async (input) => {
    const cart = getCart(input.sessionId, input.cartId);
    if (!cart) {
      return JSON.stringify({ error: 'Cart not found', cartId: input.cartId });
    }

    // Add new items or update quantities
    for (const item of input.items) {
      const product = getProductById(cart.merchantId, item.productId);
      if (!product) continue;

      const existingIndex = cart.items.findIndex(i => i.productId === item.productId);
      if (existingIndex >= 0) {
        if (item.quantity === 0) {
          cart.items.splice(existingIndex, 1); // Remove item
        } else {
          cart.items[existingIndex].quantity = item.quantity || 1;
        }
      } else if (item.quantity > 0) {
        cart.items.push({
          productId: product.id,
          merchantId: cart.merchantId,
          name: product.name,
          price: product.price,
          quantity: item.quantity || 1,
          type: (item.type as 'primary' | 'upsell' | 'cross-sell') || 'primary',
        });
      }
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.total = cart.subtotal + cart.shippingCost - cart.discount;
    cart.updatedAt = new Date().toISOString();

    saveCart(input.sessionId, cart);

    return JSON.stringify({
      cartId: cart.id,
      items: cart.items,
      subtotal: cart.subtotal,
      total: cart.total,
      currency: cart.currency,
      itemCount: cart.items.length,
    });
  },
  {
    name: 'update_cart',
    description: 'Update cart items — add, remove (quantity=0), or change quantities. Recalculates totals.',
    schema: z.object({
      sessionId: z.string().describe('Session ID'),
      cartId: z.string().describe('The cart ID to update'),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().nonnegative().default(1),
        type: z.string().optional().describe('primary, upsell, or cross-sell'),
      })),
    }),
  }
);
