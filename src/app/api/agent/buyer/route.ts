import { NextRequest, NextResponse } from 'next/server';
import { runBuyerAgent, runPaymentPhase } from '@/lib/agents/buyer-graph';
import { getAuditEvents, getCart } from '@/lib/data/store';
import { getIntelligentGrowthOffers, applyGrowthSelectionsToCart } from '@/lib/agents/growth-engine';
import { createAuditEvent } from '@/lib/schemas/audit';
import { addAuditEvent } from '@/lib/data/store';

export const maxDuration = 60; // Vercel Pro allows up to 60s; hobby is 10s
export const dynamic = 'force-dynamic';

/**
 * AI Buyer Agent endpoint.
 * 
 * POST /api/agent/buyer
 * Body: { sessionId, userQuery, customerId?, action?, cartId?, cartTotal?, ... }
 * 
 * Actions:
 * 1. action="query" — runs the full buyer flow (intent → product selection → cart → approval)
 * 2. action="apply_growth_selection" — updates cart with accepted upsell upgrade or recovery bundle (non-LLM)
 * 3. action="approve_payment" — runs the payment phase after user approval to create Razorpay order
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

      // Calculate intelligent, deterministic upsell & recovery bundle offers (Zero-LLM)
      const growthOffers = result.selectedProduct ? getIntelligentGrowthOffers({
        merchantId: result.selectedProduct.merchantId,
        productId: result.selectedProduct.productId,
        customerGoal: result.parsedIntent?.goal || 'muscle building',
        budget: result.parsedIntent?.budget || 5000,
      }) : { upsell: null, recoveryBundle: null };

      // Log growth offers in audit trail
      if (growthOffers.upsell?.available) {
        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'UPSELL_RECOMMENDED',
          tool: 'growth_engine_heuristic',
          inputSummary: `Analyzed ${result.selectedProduct?.name} vs budget ₹${result.parsedIntent?.budget}`,
          outputSummary: `Upgrade available: ${growthOffers.upsell.upgradeProduct.name} (+₹${growthOffers.upsell.upgradeProduct.priceDelta})`,
          reason: growthOffers.upsell.upgradeProduct.reason,
          status: 'success',
        }));
      }

      if (growthOffers.recoveryBundle?.available) {
        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'RECOVERY_BUNDLE_OFFERED',
          tool: 'growth_engine_heuristic',
          inputSummary: `Customer goal: ${result.parsedIntent?.goal}, Supplement synergy`,
          outputSummary: `Bundle: ${growthOffers.recoveryBundle.product.name} at ₹${growthOffers.recoveryBundle.product.bundlePrice} (Save ₹${growthOffers.recoveryBundle.product.discountAmount})`,
          reason: growthOffers.recoveryBundle.synergyReason,
          status: 'success',
        }));
      }

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
        growthOffers,
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

    if (action === 'apply_growth_selection') {
      const { cartId, upgradeToProductId, addRecoveryBundleId, bundleDiscountAmount } = body;
      if (!cartId) {
        return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
      }

      const updatedCart = applyGrowthSelectionsToCart({
        sessionId,
        cartId,
        upgradeToProductId,
        addRecoveryBundleId,
        bundleDiscountAmount,
      });

      const auditTrail = getAuditEvents(sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        cart: updatedCart,
        cartTotal: updatedCart.total,
        items: updatedCart.items,
        auditTrail,
      });
    }

    if (action === 'approve_payment') {
      const { cartId, customerId, selectedProduct, parsedIntent, upsellOffer, crossSellOffer } = body;

      if (!cartId) {
        return NextResponse.json({ error: 'cartId is required for payment approval' }, { status: 400 });
      }

      // Get authoritative cart from store to ensure exact amount
      const liveCart = getCart(sessionId, cartId);
      const effectiveTotal = liveCart ? liveCart.total : (body.cartTotal || 0);

      const result = await runPaymentPhase({
        sessionId,
        cartId,
        cartTotal: effectiveTotal,
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
        cartTotal: effectiveTotal,
        error: result.error,
        auditTrail,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "query", "apply_growth_selection", or "approve_payment"' }, { status: 400 });
  } catch (error) {
    console.error('Buyer agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error', success: false },
      { status: 500 }
    );
  }
}
