import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/razorpay/client';
import { getCart, addAuditEvent } from '@/lib/data/store';
import { createAuditEvent } from '@/lib/schemas/audit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/order
 * Creates a Razorpay test order for a validated cart.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, cartId } = body;

    if (!sessionId || !cartId) {
      return NextResponse.json({ error: 'sessionId and cartId required' }, { status: 400 });
    }

    const cart = getCart(sessionId, cartId);
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const receipt = `rcpt_${Date.now()}`;
    const order = await createRazorpayOrder({
      amount: cart.total,
      currency: cart.currency,
      receipt,
      notes: {
        cartId,
        customerId: cart.customerId,
        merchantId: cart.merchantId,
      },
    });

    const audit = createAuditEvent({
      sessionId,
      agent: 'system',
      action: 'RAZORPAY_ORDER_CREATED',
      tool: 'razorpay_sdk',
      inputSummary: `Cart ${cartId}, ₹${cart.total}`,
      outputSummary: `Order ${order.id} created`,
      status: 'success',
    });
    addAuditEvent(sessionId, audit);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      keyId: getRazorpayKeyId(),
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order', success: false },
      { status: 500 }
    );
  }
}
