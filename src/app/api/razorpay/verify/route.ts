import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay/client';
import { addOrder, updateOrder, getOrderByRazorpayId, addAuditEvent, getCart } from '@/lib/data/store';
import { createAuditEvent } from '@/lib/schemas/audit';
import { Order } from '@/lib/schemas/order';

export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/verify
 * Verifies payment signature and creates/updates order record.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature, cartId, selectedProduct, upsellOffer, crossSellOffer } = body;

    if (!sessionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (isValid) {
      // Payment successful — create confirmed order
      const cart = cartId ? getCart(sessionId, cartId) : null;

      // Calculate revenue breakdown
      const baselinePrice = selectedProduct?.price || 0;
      const upsellRevenue = upsellOffer?.accepted && upsellOffer?.price
        ? upsellOffer.price - baselinePrice
        : 0;
      const crossSellRevenue = crossSellOffer?.accepted && crossSellOffer?.price
        ? crossSellOffer.price
        : 0;

      const order: Order = {
        id: `order_${Date.now()}`,
        customerId: cart?.customerId || 'customer-alex',
        merchantId: cart?.merchantId || selectedProduct?.merchantId || '',
        merchantName: selectedProduct?.merchantId || '',
        cartId: cartId || '',
        items: cart?.items?.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          type: i.type || 'primary',
        })) || [],
        subtotal: cart?.subtotal || 0,
        total: cart?.total || 0,
        currency: 'INR',
        razorpayOrderId,
        razorpayPaymentId,
        paymentStatus: 'success',
        orderStatus: 'confirmed',
        policyCheckPassed: true,
        userApproved: true,
        upsellAccepted: !!upsellOffer?.accepted,
        crossSellAccepted: !!crossSellOffer?.accepted,
        upsellRevenue: Math.max(0, upsellRevenue),
        crossSellRevenue: Math.max(0, crossSellRevenue),
        baselineRevenue: baselinePrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addOrder(sessionId, order);

      const paymentAudit = createAuditEvent({
        sessionId,
        agent: 'system',
        action: 'PAYMENT_VERIFIED',
        tool: 'verify_razorpay_signature',
        inputSummary: `Payment ${razorpayPaymentId} for order ${razorpayOrderId}`,
        outputSummary: 'Payment signature verified — payment is genuine',
        reason: 'HMAC-SHA256 signature matches',
        status: 'success',
      });
      addAuditEvent(sessionId, paymentAudit);

      const orderAudit = createAuditEvent({
        sessionId,
        agent: 'system',
        action: 'ORDER_CONFIRMED',
        inputSummary: `Order ${order.id}`,
        outputSummary: `Order confirmed. Total: ₹${order.total}. Baseline: ₹${order.baselineRevenue}, Upsell: ₹${order.upsellRevenue}, Cross-sell: ₹${order.crossSellRevenue}`,
        status: 'success',
      });
      addAuditEvent(sessionId, orderAudit);

      return NextResponse.json({
        success: true,
        verified: true,
        order,
        message: 'Payment verified and order confirmed successfully.',
      });
    } else {
      // Payment failed — signature mismatch
      const failureAudit = createAuditEvent({
        sessionId,
        agent: 'system',
        action: 'PAYMENT_FAILED',
        tool: 'verify_razorpay_signature',
        inputSummary: `Payment ${razorpayPaymentId} for order ${razorpayOrderId}`,
        outputSummary: 'SIGNATURE MISMATCH — payment verification FAILED',
        reason: 'HMAC-SHA256 signature does not match',
        status: 'failed',
      });
      addAuditEvent(sessionId, failureAudit);

      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Payment verification failed. Signature mismatch. No order has been created.',
        retryAvailable: true,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed',
        message: 'Payment verification encountered an error. Please retry.',
        retryAvailable: true,
      },
      { status: 500 }
    );
  }
}
