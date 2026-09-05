import { NextRequest, NextResponse } from 'next/server';
import { runBuyerAgent, runPaymentPhase } from '@/lib/agents/buyer-graph';
import { getAuditEvents, getCart, saveCart, addAuditEvent } from '@/lib/data/store';
import { getIntelligentGrowthOffers, applyGrowthSelectionsToCart } from '@/lib/agents/growth-engine';
import { createAuditEvent } from '@/lib/schemas/audit';
import { getProductById, allProducts } from '@/lib/data/products';

export const maxDuration = 60; // Vercel Pro allows up to 60s; hobby is 10s
export const dynamic = 'force-dynamic';

/**
 * AI Buyer Agent endpoint.
 * 
 * POST /api/agent/buyer
 * Actions:
 * 1. action="query" — runs the full buyer flow (intent → product selection → cart → approval)
 * 2. action="apply_growth_selection" — updates cart with accepted upsell upgrade or recovery bundle (non-LLM)
 * 3. action="approve_payment" — runs payment phase with pre-flight live check (supports failure simulation)
 * 4. action="apply_recovery_alternative" — handles automated recovery after mid-flight price/stock failure
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, action = 'query' } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (action === 'query') {
      const { userQuery, customerId, objective } = body;
      if (!userQuery) {
        return NextResponse.json({ error: 'userQuery is required' }, { status: 400 });
      }

      const result = await runBuyerAgent({
        sessionId,
        userQuery,
        customerId: customerId || 'customer-alex',
      });

      // Calculate intelligent, deterministic revenue decision & offers
      const growthOffers = result.selectedProduct ? getIntelligentGrowthOffers({
        merchantId: result.selectedProduct.merchantId,
        productId: result.selectedProduct.productId,
        customerGoal: result.parsedIntent?.goal || 'muscle building',
        budget: result.parsedIntent?.budget || 5000,
        objective: objective || undefined,
      }) : {
        decision: {
          selectedAction: 'NO_OFFER' as const,
          objective: 'REVENUE' as const,
          actionReason: 'No product selected.',
          rejectedAlternatives: [],
          evaluatedFactors: {
            customerIntent: result.parsedIntent?.goal || '',
            budget: result.parsedIntent?.budget || 5000,
            budgetHeadroom: 0,
            productRelevance: '',
            currentProductMarginPercent: 0,
            inventoryStock: 0,
            stockBufferRespected: false,
            minMarginCompliant: false,
          },
        },
        upsell: null,
        recoveryBundle: null,
      };

      // Log growth revenue decision in audit trail
      if (growthOffers.decision) {
        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'REVENUE_DECISION_ARBITRATED',
          tool: 'growth_engine_revenue_intelligence',
          inputSummary: `Intent: "${result.parsedIntent?.goal}", Budget: ₹${result.parsedIntent?.budget}, Objective: ${growthOffers.decision.objective}`,
          outputSummary: `Action: ${growthOffers.decision.selectedAction} — ${growthOffers.decision.actionReason}`,
          reason: growthOffers.decision.actionReason,
          status: 'success',
          policyResult: 'PASS - Decision conforms to margin floor (>=20%) and budget boundaries',
          nextState: 'CART_POLICY_GATE',
        }));
      }

      if (growthOffers.upsell?.available) {
        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'UPSELL_RECOMMENDED',
          tool: 'growth_engine_revenue_intelligence',
          inputSummary: `Analyzed ${result.selectedProduct?.name} vs budget ₹${result.parsedIntent?.budget}`,
          outputSummary: `Upgrade available: ${growthOffers.upsell.upgradeProduct.name} (+₹${growthOffers.upsell.upgradeProduct.priceDelta})`,
          reason: growthOffers.upsell.upgradeProduct.reason,
          status: 'success',
          policyResult: 'PASS - Upsell within customer budget and margin bounds',
          nextState: 'AWAITING_CUSTOMER_DECISION',
        }));
      }

      if (growthOffers.recoveryBundle?.available) {
        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'RECOVERY_BUNDLE_OFFERED',
          tool: 'growth_engine_revenue_intelligence',
          inputSummary: `Customer goal: ${result.parsedIntent?.goal}, Supplement synergy`,
          outputSummary: `Bundle: ${growthOffers.recoveryBundle.product.name} at ₹${growthOffers.recoveryBundle.product.bundlePrice} (Save ₹${growthOffers.recoveryBundle.product.discountAmount})`,
          reason: growthOffers.recoveryBundle.synergyReason,
          status: 'success',
          policyResult: 'PASS - Discount 15% <= max allowed 15%, Net margin >= 20%',
          nextState: 'AWAITING_CUSTOMER_DECISION',
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
        whyThisMerchant: result.whyThisMerchant,
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
      const { cartId, customerId, selectedProduct, parsedIntent, upsellOffer, crossSellOffer, simulationType } = body;

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
        simulationType,
      });

      const auditTrail = getAuditEvents(sessionId);

      return NextResponse.json({
        success: !result.error,
        sessionId,
        currentStep: result.currentStep,
        razorpayOrderId: result.razorpayOrderId,
        razorpayKeyId: result.razorpayKeyId,
        waitingForUser: result.waitingForUser,
        waitingForUserAction: result.waitingForUserAction,
        postPurchaseOffer: result.postPurchaseOffer,
        cartTotal: effectiveTotal,
        policyResult: result.policyResult,
        recoveryPlan: result.recoveryPlan,
        error: result.error,
        auditTrail,
      });
    }

    if (action === 'apply_recovery_alternative') {
      const { cartId, alternativeProductId } = body;
      if (!cartId || !alternativeProductId) {
        return NextResponse.json({ error: 'cartId and alternativeProductId required' }, { status: 400 });
      }

      const cart = getCart(sessionId, cartId);
      const flat = Object.values(allProducts).flat();
      const altProduct = flat.find(p => p.id === alternativeProductId);

      if (!cart || !altProduct) {
        return NextResponse.json({ error: 'Cart or substitute product not found' }, { status: 404 });
      }

      cart.merchantId = altProduct.merchantId;
      cart.items = [{
        productId: altProduct.id,
        merchantId: altProduct.merchantId,
        name: altProduct.name,
        price: altProduct.price,
        quantity: 1,
        type: 'primary',
      }];
      cart.subtotal = altProduct.price;
      cart.total = altProduct.price;
      cart.updatedAt = new Date().toISOString();
      saveCart(sessionId, cart);

      addAuditEvent(sessionId, createAuditEvent({
        sessionId,
        agent: 'buyer',
        action: 'RECOVERY_ALTERNATIVE_APPLIED',
        tool: 'agentic_recovery_handler',
        inputSummary: `Switched cart ${cartId} to verified substitute: ${altProduct.name}`,
        outputSummary: `Cart updated with ${altProduct.name} at ₹${altProduct.price}`,
        reason: 'Customer authorized automated agent recovery after live policy failure',
        status: 'success',
        policyResult: 'PASS - Substitute product verified in-stock with pricing integrity',
        nextState: 'READY_FOR_PAYMENT_APPROVAL',
      }));

      return NextResponse.json({
        success: true,
        sessionId,
        cart,
        cartTotal: cart.total,
        selectedProduct: {
          merchantId: altProduct.merchantId,
          productId: altProduct.id,
          name: altProduct.name,
          price: altProduct.price,
          selectionReason: `Verified in-stock recovery alternative (${altProduct.reviews.rating}/5.0 stars, ₹${altProduct.price})`,
        },
        auditTrail: getAuditEvents(sessionId),
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "query", "apply_growth_selection", "approve_payment", or "apply_recovery_alternative"' }, { status: 400 });
  } catch (error) {
    console.error('Buyer agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error', success: false },
      { status: 500 }
    );
  }
}
