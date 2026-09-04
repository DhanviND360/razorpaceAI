import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createRazorpayOrder, verifyRazorpaySignature, getRazorpayKeyId } from '../../razorpay/client';
import { getCart } from '../../data/store';

export const createRazorpayOrderTool = tool(
  async (input) => {
    try {
      const cart = getCart(input.sessionId, input.cartId);
      if (!cart) {
        return JSON.stringify({ error: 'Cart not found', cartId: input.cartId });
      }

      const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const order = await createRazorpayOrder({
        amount: cart.total,
        currency: cart.currency,
        receipt,
        notes: {
          cartId: input.cartId,
          customerId: cart.customerId,
          merchantId: cart.merchantId,
          sessionId: input.sessionId,
        },
      });

      return JSON.stringify({
        success: true,
        razorpayOrderId: order.id,
        amount: order.amount, // in paise
        amountInINR: cart.total,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        keyId: getRazorpayKeyId(), // Safe to send to client
        cartId: input.cartId,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Razorpay order',
      });
    }
  },
  {
    name: 'create_razorpay_order',
    description: 'Create a REAL Razorpay test order for a validated cart. Returns the order ID and key ID needed for client-side checkout. Only call AFTER policy check passes and user approves.',
    schema: z.object({
      sessionId: z.string().describe('Session ID'),
      cartId: z.string().describe('Cart ID (must be validated by policy engine first)'),
    }),
  }
);

export const verifyRazorpayPaymentTool = tool(
  async (input) => {
    try {
      const isValid = verifyRazorpaySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      );

      return JSON.stringify({
        verified: isValid,
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        status: isValid ? 'success' : 'failed',
        message: isValid
          ? 'Payment signature verified successfully. Payment is genuine.'
          : 'SIGNATURE MISMATCH — Payment verification failed. Do NOT fulfill this order.',
      });
    } catch (error) {
      return JSON.stringify({
        verified: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Verification failed',
      });
    }
  },
  {
    name: 'verify_razorpay_payment',
    description: 'Verify a Razorpay payment by checking the HMAC-SHA256 signature. MUST be called after payment to confirm authenticity.',
    schema: z.object({
      razorpayOrderId: z.string().describe('Razorpay order ID'),
      razorpayPaymentId: z.string().describe('Razorpay payment ID'),
      razorpaySignature: z.string().describe('Razorpay signature for verification'),
    }),
  }
);
