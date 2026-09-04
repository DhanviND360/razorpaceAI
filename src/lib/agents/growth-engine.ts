import { getProductById, allProducts } from '../data/products';
import { getCart, saveCart, addAuditEvent } from '../data/store';
import { createAuditEvent } from '../schemas/audit';

export interface IntelligentUpsellOffer {
  available: boolean;
  originalProduct: {
    id: string;
    name: string;
    price: number;
    rating: number;
    type?: string;
    protein?: string;
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
  };
  synergyReason: string;
  bundlePerk: string;
  fitsBudget: boolean;
  projectedTotal: number;
}

export interface IntelligentGrowthResult {
  upsell: IntelligentUpsellOffer | null;
  recoveryBundle: IntelligentRecoveryBundleOffer | null;
}

/**
 * Deterministic, rule-based growth engine.
 * Selects upsell upgrades and recovery cross-sell bundles with ZERO LLM dependency.
 * Fast, reliable, and mathematically accurate.
 */
export function getIntelligentGrowthOffers(params: {
  merchantId: string;
  productId: string;
  customerGoal: string;
  budget: number;
}): IntelligentGrowthResult {
  const { merchantId, productId, customerGoal, budget } = params;
  const merchantProducts = allProducts[merchantId] || [];
  const currentProduct = getProductById(merchantId, productId);

  if (!currentProduct) {
    return { upsell: null, recoveryBundle: null };
  }

  // ============================================================
  // 1. INTELLIGENT UPSELL (Product Upgrade)
  // ============================================================
  let upsellOffer: IntelligentUpsellOffer | null = null;

  // Find products in the same category/subcategory with higher price/specifications
  let upsellCandidates = merchantProducts.filter(p => 
    p.id !== currentProduct.id &&
    p.category === currentProduct.category &&
    p.price > currentProduct.price &&
    p.price <= budget &&
    p.stock > 0 &&
    p.isActive
  );

  // If no upgrade in the current merchant, check other AI-ready merchants for a superior alternative within budget
  if (upsellCandidates.length === 0) {
    const allProductsFlat = Object.values(allProducts).flat();
    upsellCandidates = allProductsFlat.filter(p => 
      p.id !== currentProduct.id &&
      p.category === currentProduct.category &&
      p.price > currentProduct.price &&
      p.price <= budget &&
      p.stock > 0 &&
      p.isActive &&
      p.reviews.rating >= currentProduct.reviews.rating
    );
  }

  upsellCandidates.sort((a, b) => {
    if (b.reviews.rating !== a.reviews.rating) {
      return b.reviews.rating - a.reviews.rating;
    }
    return a.price - b.price;
  });

  const bestUpsell = upsellCandidates[0];

  if (bestUpsell) {
    const currentProtein = currentProduct.attributes.find(a => a.key === 'proteinPerServing')?.value || '24';
    const upgradeProtein = bestUpsell.attributes.find(a => a.key === 'proteinPerServing')?.value || '28';
    const currentType = currentProduct.attributes.find(a => a.key === 'type')?.value || 'Whey Concentrate';
    const upgradeType = bestUpsell.attributes.find(a => a.key === 'type')?.value || 'Whey Isolate';

    const advantages: string[] = [];
    if (Number(upgradeProtein) > Number(currentProtein)) {
      advantages.push(`+${Number(upgradeProtein) - Number(currentProtein)}g pure protein per serving (${upgradeProtein}g vs ${currentProtein}g)`);
    }
    if (upgradeType.includes('Isolate')) {
      advantages.push('Pure Whey Isolate with digestive enzymes for 30% faster absorption & zero bloating');
    }
    if (bestUpsell.reviews.rating > currentProduct.reviews.rating) {
      advantages.push(`Superior customer satisfaction: ${bestUpsell.reviews.rating}/5.0 (${bestUpsell.reviews.reviewCount.toLocaleString('en-IN')} reviews) vs ${currentProduct.reviews.rating}/5.0`);
    } else {
      advantages.push(`Highly rated formula: ${bestUpsell.reviews.rating}/5.0 (${bestUpsell.reviews.reviewCount.toLocaleString('en-IN')} reviews)`);
    }

    const priceDelta = bestUpsell.price - currentProduct.price;

    upsellOffer = {
      available: true,
      originalProduct: {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        rating: currentProduct.reviews.rating,
        type: currentType,
        protein: currentProtein,
      },
      upgradeProduct: {
        id: bestUpsell.id,
        name: bestUpsell.name,
        price: bestUpsell.price,
        priceDelta,
        rating: bestUpsell.reviews.rating,
        reviewCount: bestUpsell.reviews.reviewCount,
        type: upgradeType,
        protein: upgradeProtein,
        advantages,
        reason: `Upgrade to ${bestUpsell.name}: provides ${upgradeProtein}g protein/serving with cold-filtered isolate for accelerated muscle synthesis matching your ${customerGoal} goal.`,
      },
      fitsBudget: bestUpsell.price <= budget,
      projectedTotal: bestUpsell.price,
    };
  }

  // ============================================================
  // 2. INTELLIGENT RECOVERY CROSS-SELL BUNDLE
  // ============================================================
  let recoveryBundle: IntelligentRecoveryBundleOffer | null = null;

  // Base price for bundle calculation (use upsell price if available, else current)
  const basePrice = upsellOffer ? upsellOffer.upgradeProduct.price : currentProduct.price;
  const remainingBudget = budget - basePrice;

  // Search for recovery supplements (BCAAs, electrolytes, glutamine, post-workout)
  // Exclude other protein tubs so we bundle a genuine recovery supplement
  const recoveryCandidates = merchantProducts.filter(p => {
    if (p.id === currentProduct.id || (bestUpsell && p.id === bestUpsell.id)) return false;
    if (p.category === 'protein') return false; // Exclude redundant protein powders
    if (p.stock <= 0 || !p.isActive) return false;

    const isRecoveryCategory = p.category === 'recovery' || p.category === 'hydration' || p.subcategory === 'bcaa' || p.subcategory === 'electrolytes' || p.subcategory === 'post-workout';
    const hasRecoveryTag = p.compatibilityTags.some(t => 
      ['recovery', 'post-workout', 'bcaa', 'electrolytes', 'muscle-soreness'].includes(t.toLowerCase())
    );

    return isRecoveryCategory || hasRecoveryTag;
  }).sort((a, b) => {
    // Prioritize products that comfortably fit the remaining budget
    const aFits = a.price <= remainingBudget;
    const bFits = b.price <= remainingBudget;
    if (aFits && !bFits) return -1;
    if (!aFits && bFits) return 1;
    return b.reviews.rating - a.reviews.rating;
  });

  const bestRecovery = recoveryCandidates[0];

  if (bestRecovery) {
    const discountPercent = 15; // 15% instant bundle savings
    const bundlePrice = Math.round(bestRecovery.price * (1 - discountPercent / 100));
    const discountAmount = bestRecovery.price - bundlePrice;
    const projectedTotal = basePrice + bundlePrice;
    const ingredients = bestRecovery.attributes.find(a => a.key === 'keyIngredients' || a.key === 'ratio')?.value || 'BCAAs & Electrolytes';

    recoveryBundle = {
      available: true,
      product: {
        id: bestRecovery.id,
        name: bestRecovery.name,
        originalPrice: bestRecovery.price,
        bundlePrice,
        discountAmount,
        discountPercent,
        rating: bestRecovery.reviews.rating,
        category: bestRecovery.category,
        keyIngredients: ingredients,
      },
      synergyReason: `Essential recovery pairing: Combining protein with ${bestRecovery.name} reduces delayed-onset muscle soreness (DOMS) by 40% and restores electrolytes after heavy training.`,
      bundlePerk: `Special Bundle Deal: Save ${discountPercent}% (₹${discountAmount} off) when bundled with your protein order!`,
      fitsBudget: projectedTotal <= budget,
      projectedTotal,
    };
  }

  return {
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
      // Find the primary product to replace
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
          inputSummary: `Customer upgraded from ${oldName} to ${upgradedProduct.name}`,
          outputSummary: `Cart updated with ${upgradedProduct.name} at ₹${upgradedProduct.price}`,
          reason: 'Customer accepted intelligent upsell recommendation',
          status: 'success',
        }));
      }
    }
  }

  // 2. Handle Recovery Cross-Sell Bundle
  if (addRecoveryBundleId) {
    const allFlat = Object.values(allProducts).flat();
    const recoveryProduct = getProductById(cart.merchantId, addRecoveryBundleId) || allFlat.find(p => p.id === addRecoveryBundleId);
    if (recoveryProduct) {
      // Check if already in cart
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
          action: 'CROSS_SELL_ACCEPTED',
          inputSummary: `Customer added ${recoveryProduct.name} to bundle`,
          outputSummary: `Recovery supplement bundled at ₹${effectivePrice} (Saved ₹${bundleDiscountAmount})`,
          reason: 'Customer accepted recovery cross-sell bundle offer',
          status: 'success',
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
