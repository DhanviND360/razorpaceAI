import { NextRequest, NextResponse } from 'next/server';
import { getCart, saveCart } from '@/lib/data/store';
import { getProductById } from '@/lib/data/products';
import { CartItem } from '@/lib/schemas/cart';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cart?sessionId=xxx&cartId=yyy
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const cartId = req.nextUrl.searchParams.get('cartId');

  if (!sessionId || !cartId) {
    return NextResponse.json({ error: 'sessionId and cartId required' }, { status: 400 });
  }

  const cart = getCart(sessionId, cartId);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  return NextResponse.json(cart);
}

/**
 * POST /api/cart — create or update cart
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, cartId, merchantId, customerId, items } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Update existing cart
    if (cartId) {
      const cart = getCart(sessionId, cartId);
      if (!cart) {
        return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
      }

      // Update items
      for (const item of items || []) {
        const product = getProductById(cart.merchantId, item.productId);
        if (!product) continue;

        const idx = cart.items.findIndex((i: CartItem) => i.productId === item.productId);
        if (idx >= 0) {
          if (item.quantity === 0) {
            cart.items.splice(idx, 1);
          } else {
            cart.items[idx].quantity = item.quantity;
          }
        } else {
          cart.items.push({
            productId: product.id,
            merchantId: cart.merchantId,
            name: product.name,
            price: product.price,
            quantity: item.quantity || 1,
            type: item.type || 'primary',
          });
        }
      }

      cart.subtotal = cart.items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
      cart.total = cart.subtotal;
      cart.updatedAt = new Date().toISOString();
      saveCart(sessionId, cart);
      return NextResponse.json(cart);
    }

    // Create new cart
    if (!merchantId || !customerId || !items?.length) {
      return NextResponse.json({ error: 'merchantId, customerId, and items required for new cart' }, { status: 400 });
    }

    const newCartId = `cart_${Date.now()}`;
    const now = new Date().toISOString();
    const cartItems: CartItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = getProductById(merchantId, item.productId);
      if (!product) continue;
      const cartItem: CartItem = {
        productId: product.id,
        merchantId,
        name: product.name,
        price: product.price,
        quantity: item.quantity || 1,
        type: item.type || 'primary',
      };
      cartItems.push(cartItem);
      subtotal += cartItem.price * cartItem.quantity;
    }

    const cart = {
      id: newCartId,
      customerId,
      merchantId,
      items: cartItems,
      subtotal,
      shippingCost: 0,
      discount: 0,
      total: subtotal,
      currency: 'INR',
      appliedOffers: [] as string[],
      createdAt: now,
      updatedAt: now,
    };

    saveCart(sessionId, cart);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
