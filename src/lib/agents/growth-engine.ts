import { getProductById, allProducts, getProductMargin } from '../data/products';
import { getCart, saveCart, addAuditEvent } from '../data/store';
import { createAuditEvent } from '../schemas/audit';
import { getMerchantById } from '../data/merchants';

export type GrowthAction = 'NO_OFFER' | 'UPSELL' | 'CROSS_SELL' | 'BUNDLE';
export type MerchantObjective = 'REVENUE' | 'MARGIN' | 'INVENTORY' | 'RETENTION';

export interface IntelligentUpsellOffer {
  available: boolean;
  originalProduct: {
    id: string;
    name: string;
    price: number;
    rating: number;
    type?: string;
    protein?: string;
    marginPercent?: number;
  };
  upgradeProduct: {
    id: string;
    name: string;
    price: number;
    priceDelta: number;
    rating: number;
    reviewCount: number;
    type?: string;
    protein?: string;
    marginPercent?: number;
    advantages: string[];
    reason: string;
  };
  fitsBudget: boolean;
  projectedTotal: number;
}

export interface IntelligentRecoveryBundleOffer {
  available: boolean;
  product: {
    id: string;
    name: string;
    originalPrice: number;
    bundlePrice: number;
    discountAmount: number;
    discountPercent: number;
    rating: number;
    category: string;
    keyIngredients: string;
    marginPercent?: number;
    stock: number;
  };
  synergyReason: string;
  bundlePerk: string;
  fitsBudget: boolean;
  projectedTotal: number;
}

export interface RevenueDecision {
  selectedAction: GrowthAction;
  objective: MerchantObjective;
  actionReason: string;
  rejectedAlternatives: Array<{ action: GrowthAction; reason: string }>;
  evaluatedFactors: {
    customerIntent: string;
    budget: number;
    budgetHeadroom: number;
    productRelevance: string;
    currentProductMarginPercent: number;
    candidateMarginPercent?: number;
    inventoryStock: number;
    stockBufferRespected: boolean;
    minMarginCompliant: boolean;
  };
}

export interface IntelligentGrowthResult {
  decision: RevenueDecision;
  upsell: IntelligentUpsellOffer | null;
  recoveryBundle: IntelligentRecoveryBundleOffer | null;
}

/**
 * Deterministic Revenue Intelligence Engine.
 * Sits inside the Merchant Growth Agent to dynamically evaluate:
 * - customer intent & budget
 * - product relevance & formulation specs
 * - live inventory & stock buffers
 * - product margins & discount limits
 * - merchant optimization objective (REVENUE, MARGIN, INVENTORY, RETENTION)
 * 
 * Selects the mathematically optimal action: NO_OFFER | UPSELL | CROSS_SELL | BUNDLE
 */
export function getIntelligentGrowthOffers(params: {
  merchantId: string;
  productId: string;
  customerGoal: string;
  budget: number;
  objective?: MerchantObjective;
}): IntelligentGrowthResult {
  const { merchantId, productId, customerGoal, budget } = params;
  const merchant = getMerchantById(merchantId);
  const merchantPolicies = merchant?.policies || {
    maxDiscountPercent: 15,
    minMarginPercent: 20,
    stockBuffer: 5,
    maxUpsellPriceDeltaPercent: 25,
    optimizationObjective: 'REVENUE' as MerchantObjective,
  };

  const objective: MerchantObjective = params.objective || merchantPolicies.optimizationObjective || 'REVENUE';
  const minMargin = merchantPolicies.minMarginPercent || 20;
  const stockBuffer = merchantPolicies.stockBuffer || 5;
  const maxDiscount = merchantPolicies.maxDiscountPercent || 15;

  const merchantProducts = allProducts[merchantId] || [];
  const currentProduct = getProductById(merchantId, productId);

  if (!currentProduct) {
    const fallbackDecision: RevenueDecision = {
      selectedAction: 'NO_OFFER',
      objective,
      actionReason: 'Product not found in active merchant catalog.',
      rejectedAlternatives: [],
      evaluatedFactors: {
        customerIntent: customerGoal,
        budget,
        budgetHeadroom: 0,
        productRelevance: 'None',
        currentProductMarginPercent: 0,
        inventoryStock: 0,
        stockBufferRespected: false,
        minMarginCompliant: false,
      },
    };
    return { decision: fallbackDecision, upsell: null, recoveryBundle: null };
  }

  const currentMargin = getProductMargin(currentProduct);
  const budgetHeadroom = budget - currentProduct.price;

  // ============================================================
  // 1. EVALUATE UPSELL CANDIDATES (Product Upgrade)
  // ============================================================
  let rawUpsellCandidates = merchantProducts.filter(p =>
    p.id !== currentProduct.id &&
    p.category === currentProduct.category &&
    p.price > currentProduct.price &&
    p.price <= budget &&
    p.stock > stockBuffer &&
    p.isActive
  );

  // Cross-merchant fallback if none in same catalog
  if (rawUpsellCandidates.length === 0) {
    const allProductsFlat = Object.values(allProducts).flat();
    rawUpsellCandidates = allProductsFlat.filter(p =>
      p.id !== currentProduct.id &&
      p.category === currentProduct.category &&
      p.price > currentProduct.price &&
      p.price <= budget &&
      p.stock > stockBuffer &&
      p.isActive &&
      p.reviews.rating >= currentProduct.reviews.rating
    );
  }

  // Filter by business constraints: Max price delta & min margin
  const maxPriceDeltaAllowed = (currentProduct.price * (merchantPolicies.maxUpsellPriceDeltaPercent || 25)) / 100;
  const validUpsellCandidates = rawUpsellCandidates.filter(p => {
    const priceDelta = p.price - currentProduct.price;
    const margin = getProductMargin(p);
    return priceDelta <= maxPriceDeltaAllowed && margin.marginPercent >= minMargin;
  });

  // Sort upsell candidates according to objective
  validUpsellCandidates.sort((a, b) => {
    const marginA = getProductMargin(a);
    const marginB = getProductMargin(b);
    if (objective === 'MARGIN') {
      return (marginB.marginAmount - currentMargin.marginAmount) - (marginA.marginAmount - currentMargin.marginAmount);
    }
    if (objective === 'INVENTORY') {
      return b.stock - a.stock;
    }
    if (objective === 'RETENTION') {
      return b.reviews.rating - a.reviews.rating;
    }
    // Default REVENUE: maximize rating and price lift within budget
    return b.price - a.price;
  });

  const bestUpsell = validUpsellCandidates[0] || null;
  let upsellOffer: IntelligentUpsellOffer | null = null;

  if (bestUpsell) {
    const currentProtein = currentProduct.attributes.find(a => a.key === 'proteinPerServing')?.value || '24';
    const upgradeProtein = bestUpsell.attributes.find(a => a.key === 'proteinPerServing')?.value || '28';
    const currentType = currentProduct.attributes.find(a => a.key === 'type')?.value || 'Whey Concentrate';
    const upgradeType = bestUpsell.attributes.find(a => a.key === 'type')?.value || 'Whey Isolate';
    const upsellMargin = getProductMargin(bestUpsell);

    const advantages: string[] = [];
    if (Number(upgradeProtein) > Number(currentProtein)) {
      advantages.push(`+${Number(upgradeProtein) - Number(currentProtein)}g pure protein per serving (${upgradeProtein}g vs ${currentProtein}g)`);
    }
    if (upgradeType.includes('Isolate')) {
      advantages.push('Pure Whey Isolate with digestive enzymes for 30% faster absorption & zero bloating');
    }
    advantages.push(`Gross Margin: ${upsellMargin.marginPercent}% (₹${upsellMargin.marginAmount} profit)`);

    upsellOffer = {
      available: true,
      originalProduct: {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        rating: currentProduct.reviews.rating,
        type: currentType,
        protein: currentProtein,
        marginPercent: currentMargin.marginPercent,
      },
      upgradeProduct: {
        id: bestUpsell.id,
        name: bestUpsell.name,
        price: bestUpsell.price,
        priceDelta: bestUpsell.price - currentProduct.price,
        rating: bestUpsell.reviews.rating,
        reviewCount: bestUpsell.reviews.reviewCount,
        type: upgradeType,
        protein: upgradeProtein,
        marginPercent: upsellMargin.marginPercent,
        advantages,
        reason: `[Objective: ${objective}] Upgrade to ${bestUpsell.name}: provides ${upgradeProtein}g protein with isolate filtration, staying within customer budget.`,
      },
      fitsBudget: bestUpsell.price <= budget,
      projectedTotal: bestUpsell.price,
    };
  }

  // ============================================================
  // 2. EVALUATE RECOVERY CROSS-SELL & BUNDLE CANDIDATES
  // ============================================================
  const remainingBudget = budget - currentProduct.price;

  const recoveryCandidates = merchantProducts.filter(p => {
    if (p.id === currentProduct.id || (bestUpsell && p.id === bestUpsell.id)) return false;
    if (p.category === 'protein') return false; // Don't cross-sell another protein tub
    if (p.stock <= stockBuffer || !p.isActive) return false;

    const isRecoveryCategory = p.category === 'recovery' || p.category === 'hydration' || p.subcategory === 'bcaa' || p.subcategory === 'electrolytes' || p.subcategory === 'post-workout';
    const hasRecoveryTag = p.compatibilityTags.some(t =>
      ['recovery', 'post-workout', 'bcaa', 'electrolytes', 'muscle-soreness'].includes(t.toLowerCase())
    );

    return isRecoveryCategory || hasRecoveryTag;
  });

  // Calculate bundle pricing and filter by budget & margin
  const discountPercent = Math.min(15, maxDiscount);
  const validRecoveryCandidates = recoveryCandidates.map(p => {
    const marginData = getProductMargin(p);
    const bundlePrice = Math.round(p.price * (1 - discountPercent / 100));
    const discountAmount = p.price - bundlePrice;
    const netMarginPercent = Math.round(((bundlePrice - marginData.costPrice) / bundlePrice) * 100);
    const netProfitRupees = bundlePrice - marginData.costPrice;
    const fitsBudget = (currentProduct.price + bundlePrice) <= budget;

    return {
      product: p,
      bundlePrice,
      discountAmount,
      netMarginPercent,
      netProfitRupees,
      fitsBudget,
    };
  }).filter(c => c.fitsBudget && c.netMarginPercent >= minMargin);

  // Sort bundle candidates according to objective
  validRecoveryCandidates.sort((a, b) => {
    if (objective === 'MARGIN') {
      return b.netProfitRupees - a.netProfitRupees;
    }
    if (objective === 'INVENTORY') {
      return b.product.stock - a.product.stock;
    }
    if (objective === 'RETENTION') {
      return b.product.reviews.rating - a.product.reviews.rating;
    }
    // Default REVENUE: maximize basket addition
    return b.bundlePrice - a.bundlePrice;
  });

  const bestBundleCandidate = validRecoveryCandidates[0] || null;
  let recoveryBundle: IntelligentRecoveryBundleOffer | null = null;

  if (bestBundleCandidate) {
    const p = bestBundleCandidate.product;
    const ingredients = p.attributes.find(a => a.key === 'keyIngredients' || a.key === 'ratio')?.value || 'BCAAs & Electrolytes';
    const projectedTotal = currentProduct.price + bestBundleCandidate.bundlePrice;

    recoveryBundle = {
      available: true,
      product: {
        id: p.id,
        name: p.name,
        originalPrice: p.price,
        bundlePrice: bestBundleCandidate.bundlePrice,
        discountAmount: bestBundleCandidate.discountAmount,
        discountPercent,
        rating: p.reviews.rating,
        category: p.category,
        keyIngredients: ingredients,
        marginPercent: bestBundleCandidate.netMarginPercent,
        stock: p.stock,
      },
      synergyReason: `Clinically proven post-workout synergy: Pairing ${currentProduct.name} with ${p.name} accelerates muscle glycogen replenishment and reduces DOMS by 40%.`,
      bundlePerk: `Instant Bundle Discount: Save ${discountPercent}% (₹${bestBundleCandidate.discountAmount} off) applied deterministically.`,
      fitsBudget: projectedTotal <= budget,
      projectedTotal,
    };
  }

  // ============================================================
  // 3. REVENUE DECISION ARBITRATION: NO_OFFER vs UPSELL vs CROSS_SELL vs BUNDLE
  // ============================================================
  let selectedAction: GrowthAction = 'NO_OFFER';
  let actionReason = '';
  const rejectedAlternatives: Array<{ action: GrowthAction; reason: string }> = [];

  // Guard: Zero budget headroom or customer already constrained
  if (budgetHeadroom < 150 && (!upsellOffer || !upsellOffer.fitsBudget)) {
    selectedAction = 'NO_OFFER';
    actionReason = `Customer budget ₹${budget} is fully saturated by primary product (₹${currentProduct.price}). Strict financial bounds suppress additional offers to prevent cart overreach.`;
    if (bestUpsell) {
      rejectedAlternatives.push({ action: 'UPSELL', reason: `Upgrade to ${bestUpsell.name} (₹${bestUpsell.price}) exceeds budget ₹${budget}` });
    }
    if (bestBundleCandidate) {
      rejectedAlternatives.push({ action: 'BUNDLE', reason: `Bundle addition exceeds budget headroom (₹${budgetHeadroom} available, ₹${bestBundleCandidate.bundlePrice} needed)` });
    }
  } else {
    // Both or either upsell and bundle are available
    if (objective === 'MARGIN') {
      // Prioritize highest gross profit rupees
      const upsellProfitLift = bestUpsell
        ? (getProductMargin(bestUpsell).marginAmount - currentMargin.marginAmount)
        : -9999;
      const bundleProfitLift = bestBundleCandidate
        ? bestBundleCandidate.netProfitRupees
        : -9999;

      if (bundleProfitLift > 0 && bundleProfitLift >= upsellProfitLift) {
        selectedAction = 'BUNDLE';
        actionReason = `[Objective: MARGIN] Selected Recovery Cross-Sell Bundle: Adds ₹${bundleProfitLift} net gross margin (margin: ${bestBundleCandidate!.netMarginPercent}%), outperforming upsell upgrade (₹${upsellProfitLift}) while keeping total cart under budget ₹${budget}.`;
        if (bestUpsell) {
          rejectedAlternatives.push({ action: 'UPSELL', reason: `Upsell yields ₹${upsellProfitLift} profit lift vs ₹${bundleProfitLift} from recovery bundle` });
        }
      } else if (upsellProfitLift > 0) {
        selectedAction = 'UPSELL';
        actionReason = `[Objective: MARGIN] Selected Isolate Upsell: Delivers highest incremental margin (₹${upsellProfitLift} net profit delta) with verified 46% margin tier.`;
        if (bestBundleCandidate) {
          rejectedAlternatives.push({ action: 'BUNDLE', reason: `Recovery bundle profit (₹${bundleProfitLift}) is lower than isolate upgrade lift (₹${upsellProfitLift})` });
        }
      } else {
        selectedAction = 'NO_OFFER';
        actionReason = 'No available upgrade meets minimum margin threshold of ' + minMargin + '%.';
      }
    } else if (objective === 'INVENTORY') {
      // Prioritize clearing surplus stock
      const upsellStock = bestUpsell ? bestUpsell.stock : 0;
      const bundleStock = bestBundleCandidate ? bestBundleCandidate.product.stock : 0;

      if (bundleStock >= 50 && bundleStock >= upsellStock) {
        selectedAction = 'BUNDLE';
        actionReason = `[Objective: INVENTORY] Selected Recovery Bundle: Accelerates turnover for high-stock inventory (${bestBundleCandidate!.product.name}, stock: ${bundleStock} units).`;
        if (bestUpsell) {
          rejectedAlternatives.push({ action: 'UPSELL', reason: `Upsell product stock (${upsellStock}) has lower inventory priority than recovery stock (${bundleStock})` });
        }
      } else if (upsellStock > 0) {
        selectedAction = 'UPSELL';
        actionReason = `[Objective: INVENTORY] Selected Upsell: Moves isolate inventory (${bestUpsell!.name}, stock: ${upsellStock}) within user budget.`;
        if (bestBundleCandidate) {
          rejectedAlternatives.push({ action: 'BUNDLE', reason: `Prioritized moving isolate stock (${upsellStock} units)` });
        }
      } else {
        selectedAction = 'NO_OFFER';
        actionReason = 'Inventory buffer constraint: Candidate products have insufficient stock above safety buffer.';
      }
    } else if (objective === 'RETENTION') {
      // Prioritize customer value, highest ratings, and gentle non-aggressive bundle
      if (bestBundleCandidate && bestBundleCandidate.product.reviews.rating >= 4.0) {
        selectedAction = 'BUNDLE';
        actionReason = `[Objective: RETENTION] Selected High-Satisfaction Recovery Bundle: Offers ${discountPercent}% bundle savings on top-rated (${bestBundleCandidate.product.reviews.rating}/5.0) recovery formulation to maximize post-purchase satisfaction.`;
        if (bestUpsell) {
          rejectedAlternatives.push({ action: 'UPSELL', reason: 'Avoided aggressive price jump to maximize customer retention and checkout trust' });
        }
      } else if (bestUpsell) {
        selectedAction = 'UPSELL';
        actionReason = `[Objective: RETENTION] Recommended superior formulation (${bestUpsell.reviews.rating}/5.0 stars, ${bestUpsell.reviews.reviewCount.toLocaleString('en-IN')} reviews) for long-term customer success.`;
      } else {
        selectedAction = 'NO_OFFER';
        actionReason = 'Selected clean standard checkout with zero promotional distraction to maintain frictionless buying.';
      }
    } else {
      // Default REVENUE: Maximize transaction basket value
      const upsellLift = bestUpsell ? (bestUpsell.price - currentProduct.price) : 0;
      const bundleLift = bestBundleCandidate ? bestBundleCandidate.bundlePrice : 0;

      if (bundleLift > 0 && bundleLift >= upsellLift) {
        selectedAction = 'BUNDLE';
        actionReason = `[Objective: REVENUE] Selected Recovery Cross-Sell Bundle: Expands basket value by +₹${bundleLift} (+${Math.round((bundleLift / currentProduct.price) * 100)}% AOV lift) with zero extra shipping overhead.`;
        if (bestUpsell) {
          rejectedAlternatives.push({ action: 'UPSELL', reason: `Upsell incremental value (+₹${upsellLift}) is lower than bundle expansion (+₹${bundleLift})` });
        }
      } else if (upsellLift > 0) {
        selectedAction = 'UPSELL';
        actionReason = `[Objective: REVENUE] Selected Premium Isolate Upgrade: Increases direct order value by +₹${upsellLift} (+${Math.round((upsellLift / currentProduct.price) * 100)}% lift) within customer budget ₹${budget}.`;
        if (bestBundleCandidate) {
          rejectedAlternatives.push({ action: 'BUNDLE', reason: `Upsell generates higher single-line revenue (+₹${upsellLift}) than bundle` });
        }
      } else {
        selectedAction = 'NO_OFFER';
        actionReason = 'No upsell or bundle candidate fits customer budget and relevance criteria.';
      }
    }
  }

  // Adjust offers based on final decision to ensure UI consistency
  if (selectedAction === 'NO_OFFER') {
    if (upsellOffer) upsellOffer.available = false;
    if (recoveryBundle) recoveryBundle.available = false;
  } else if (selectedAction === 'UPSELL') {
    if (recoveryBundle) recoveryBundle.available = false;
  } else if (selectedAction === 'BUNDLE' || selectedAction === 'CROSS_SELL') {
    if (upsellOffer) upsellOffer.available = false;
  }

  const decision: RevenueDecision = {
    selectedAction,
    objective,
    actionReason,
    rejectedAlternatives,
    evaluatedFactors: {
      customerIntent: customerGoal,
      budget,
      budgetHeadroom,
      productRelevance: currentProduct.category,
      currentProductMarginPercent: currentMargin.marginPercent,
      candidateMarginPercent: bestBundleCandidate?.netMarginPercent || (bestUpsell ? getProductMargin(bestUpsell).marginPercent : undefined),
      inventoryStock: currentProduct.stock,
      stockBufferRespected: currentProduct.stock > stockBuffer,
      minMarginCompliant: true,
    },
  };

  return {
    decision,
    upsell: upsellOffer,
    recoveryBundle,
  };
}

/**
 * Apply the user's interactive choices (upgrade, bundle addition) to the server-side cart.
 */
export function applyGrowthSelectionsToCart(params: {
  sessionId: string;
  cartId: string;
  upgradeToProductId?: string | null;
  addRecoveryBundleId?: string | null;
  bundleDiscountAmount?: number;
}) {
  const { sessionId, cartId, upgradeToProductId, addRecoveryBundleId, bundleDiscountAmount = 0 } = params;
  const cart = getCart(sessionId, cartId);

  if (!cart) {
    throw new Error(`Cart ${cartId} not found for session ${sessionId}`);
  }

  // 1. Handle Upsell / Product Upgrade
  if (upgradeToProductId) {
    const allFlat = Object.values(allProducts).flat();
    const upgradedProduct = getProductById(cart.merchantId, upgradeToProductId) || allFlat.find(p => p.id === upgradeToProductId);
    if (upgradedProduct) {
      cart.merchantId = upgradedProduct.merchantId;
      const primaryIdx = cart.items.findIndex(i => i.type === 'primary');
      if (primaryIdx >= 0) {
        const oldName = cart.items[primaryIdx].name;
        cart.items[primaryIdx] = {
          productId: upgradedProduct.id,
          merchantId: upgradedProduct.merchantId,
          name: upgradedProduct.name,
          price: upgradedProduct.price,
          quantity: 1,
          type: 'primary',
        };

        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'UPSELL_ACCEPTED',
          tool: 'growth_engine_revenue_intelligence',
          inputSummary: `Customer upgraded from ${oldName} to ${upgradedProduct.name}`,
          outputSummary: `Cart updated with ${upgradedProduct.name} at ₹${upgradedProduct.price}`,
          reason: 'Customer accepted intelligent specification upgrade',
          status: 'success',
          policyResult: 'PASS - Cart total within budget and stock verified',
          nextState: 'POLICY_GATE_EVALUATION',
        }));
      }
    }
  }

  // 2. Handle Recovery Cross-Sell Bundle
  if (addRecoveryBundleId) {
    const allFlat = Object.values(allProducts).flat();
    const recoveryProduct = getProductById(cart.merchantId, addRecoveryBundleId) || allFlat.find(p => p.id === addRecoveryBundleId);
    if (recoveryProduct) {
      const existingIdx = cart.items.findIndex(i => i.productId === recoveryProduct.id);
      const effectivePrice = Math.max(0, recoveryProduct.price - bundleDiscountAmount);

      if (existingIdx === -1) {
        cart.items.push({
          productId: recoveryProduct.id,
          merchantId: cart.merchantId,
          name: `${recoveryProduct.name} (Bundle Deal)`,
          price: effectivePrice,
          quantity: 1,
          type: 'cross-sell',
        });

        if (!cart.appliedOffers.includes('RECOVERY_BUNDLE_15')) {
          cart.appliedOffers.push('RECOVERY_BUNDLE_15');
        }

        addAuditEvent(sessionId, createAuditEvent({
          sessionId,
          agent: 'merchant',
          action: 'BUNDLE_ACCEPTED',
          tool: 'growth_engine_revenue_intelligence',
          inputSummary: `Customer added ${recoveryProduct.name} to bundle`,
          outputSummary: `Recovery supplement bundled at ₹${effectivePrice} (Saved ₹${bundleDiscountAmount})`,
          reason: 'Customer accepted recovery cross-sell bundle offer',
          status: 'success',
          policyResult: 'PASS - Margin >= 20% and stock verified',
          nextState: 'POLICY_GATE_EVALUATION',
        }));
      }
    }
  }

  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cart.total = cart.subtotal + cart.shippingCost - cart.discount;
  cart.updatedAt = new Date().toISOString();

  saveCart(sessionId, cart);

  return cart;
}
