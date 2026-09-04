import { NextRequest, NextResponse } from 'next/server';
import { runBuyerAgent, runPaymentPhase } from '@/lib/agents/buyer-graph';
import { getAuditEvents } from '@/lib/data/store';

export const maxDuration = 60; // Vercel Pro allows up to 60s; hobby is 10s
export const dynamic = 'force-dynamic';

/**
 * AI Buyer Agent endpoint.
 * 
 * POST /api/agent/buyer
 * Body: { sessionId, userQuery, customerId?, action?, cartId?, cartTotal?, ... }
 * 
 * Two modes:
 * 1. action="query" — runs the full buyer flow (intent → approval)
 * 2. action="approve_payment" — runs the payment phase after user approval
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, action = 'query' } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (action === 'query') {
      const { userQuery, customerId } = body;
      if (!userQuery) {
        return NextResponse.json({ error: 'userQuery is required' }, { status: 400 });
      }

      const result = await runBuyerAgent({
        sessionId,
        userQuery,
        customerId: customerId || 'customer-alex',
      });

      // Get all audit events for this session
      const auditTrail = getAuditEvents(sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        currentStep: result.currentStep,
        parsedIntent: result.parsedIntent,
        discoveredMerchants: result.discoveredMerchants,
        validMerchants: result.validMerchants,
        rejectedMerchants: result.rejectedMerchants,
        searchResults: result.searchResults,
        selectedProduct: result.selectedProduct,
        upsellOffer: result.upsellOffer,
        crossSellOffer: result.crossSellOffer,
        cartId: result.cartId,
        cartTotal: result.cartTotal,
        policyResult: result.policyResult,
        waitingForUser: result.waitingForUser,
        waitingForUserAction: result.waitingForUserAction,
        error: result.error,
        auditTrail,
      });
    }

    if (action === 'approve_payment') {
      const { cartId, cartTotal, customerId, selectedProduct, parsedIntent, upsellOffer, crossSellOffer } = body;

      if (!cartId) {
        return NextResponse.json({ error: 'cartId is required for payment approval' }, { status: 400 });
      }

      const result = await runPaymentPhase({
        sessionId,
        cartId,
        cartTotal: cartTotal || 0,
        customerId: customerId || 'customer-alex',
        selectedProduct,
        parsedIntent,
        upsellOffer,
        crossSellOffer,
      });

      const auditTrail = getAuditEvents(sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        currentStep: result.currentStep,
        razorpayOrderId: result.razorpayOrderId,
        razorpayKeyId: result.razorpayKeyId,
        waitingForUser: result.waitingForUser,
        waitingForUserAction: result.waitingForUserAction,
        postPurchaseOffer: result.postPurchaseOffer,
        error: result.error,
        auditTrail,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "query" or "approve_payment"' }, { status: 400 });
  } catch (error) {
    console.error('Buyer agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error', success: false },
      { status: 500 }
    );
  }
}
