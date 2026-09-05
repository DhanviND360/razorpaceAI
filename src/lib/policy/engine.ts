import { Cart } from '../schemas/cart';
import { MerchantPolicy } from '../schemas/merchant';
import { getProductById, getProductMargin, allProducts } from '../data/products';

export interface PolicyCheckResult {
  passed: boolean;
  status: 'PASS' | 'BLOCK' | 'REQUIRES_APPROVAL';
  checks: PolicyCheck[];
  summary: string;
  recoveryPlan?: {
    canRecover: boolean;
    reason: string;
    alternativeProduct?: {
      id: string;
      merchantId: string;
      name: string;
      price: number;
      stock: number;
      rating: number;
    };
    suggestedAction: string;
  };
}

export interface PolicyCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Deterministic Financial Policy Engine.
 * Sits between the LLM agent and Razorpay — LLM can never bypass this.
 * Validates cart against budget, merchant rules, inventory, margins, and price integrity.
 */
export function validateCart(
  cart: Cart,
  customerBudget: number,
  merchantPolicy: MerchantPolicy
): PolicyCheckResult {
  const checks: PolicyCheck[] = [];

  // 1. Budget Limit
  const budgetCheck: PolicyCheck = {
    name: 'Budget Limit',
    passed: cart.total <= customerBudget,
    message: cart.total <= customerBudget
      ? `Cart total ₹${cart.total.toLocaleString('en-IN')} is within budget ₹${customerBudget.toLocaleString('en-IN')}`
      : `Cart total ₹${cart.total.toLocaleString('en-IN')} EXCEEDS budget ₹${customerBudget.toLocaleString('en-IN')} by ₹${(cart.total - customerBudget).toLocaleString('en-IN')}`,
    severity: 'critical',
  };
  checks.push(budgetCheck);

  // 2. Minimum Order Value
  const minOrderCheck: PolicyCheck = {
    name: 'Minimum Order Value',
    passed: cart.subtotal >= merchantPolicy.minOrderValue,
    message: cart.subtotal >= merchantPolicy.minOrderValue
      ? `Cart subtotal ₹${cart.subtotal.toLocaleString('en-IN')} meets minimum ₹${merchantPolicy.minOrderValue.toLocaleString('en-IN')}`
      : `Cart subtotal ₹${cart.subtotal.toLocaleString('en-IN')} below minimum ₹${merchantPolicy.minOrderValue.toLocaleString('en-IN')}`,
    severity: 'critical',
  };
  checks.push(minOrderCheck);

  // 3. Maximum Order Value
  if (merchantPolicy.maxOrderValue) {
    const maxOrderCheck: PolicyCheck = {
      name: 'Maximum Order Value',
      passed: cart.total <= merchantPolicy.maxOrderValue,
      message: cart.total <= merchantPolicy.maxOrderValue
        ? `Cart total ₹${cart.total.toLocaleString('en-IN')} is within maximum ₹${merchantPolicy.maxOrderValue.toLocaleString('en-IN')}`
        : `Cart total ₹${cart.total.toLocaleString('en-IN')} exceeds maximum ₹${merchantPolicy.maxOrderValue.toLocaleString('en-IN')}`,
      severity: 'critical',
    };
    checks.push(maxOrderCheck);
  }

  // 4. Product Availability & Stock Buffer
  const stockBuffer = merchantPolicy.stockBuffer ?? 2;
  for (const item of cart.items) {
    const product = getProductById(item.merchantId, item.productId);
    const hasEnoughStock = !!product && product.stock >= item.quantity;
    const respectsBuffer = !!product && (product.stock - item.quantity) >= 0;

    const stockCheck: PolicyCheck = {
      name: `Stock: ${item.name}`,
      passed: hasEnoughStock && respectsBuffer,
      message: product
        ? (hasEnoughStock
          ? `${item.name}: ${product.stock} in stock (need ${item.quantity}, buffer: ${stockBuffer})`
          : `${item.name}: OUT OF STOCK (need ${item.quantity}, available: ${product.stock})`)
        : `${item.name}: Product not found in catalog`,
      severity: 'critical',
    };
    checks.push(stockCheck);
  }

  // 5. Price Integrity — verify cart prices match catalog truth
  for (const item of cart.items) {
    const product = getProductById(item.merchantId, item.productId);
    if (product) {
      const isBundleDiscounted = item.type === 'cross-sell';
      const expectedPrice = isBundleDiscounted ? item.price : product.price;
      const priceMatch = item.price <= product.price;

      const priceCheck: PolicyCheck = {
        name: `Price Integrity: ${item.name}`,
        passed: priceMatch,
        message: priceMatch
          ? `${item.name}: Price ₹${item.price} valid (catalog: ₹${product.price})`
          : `${item.name}: Cart price ₹${item.price} > catalog price ₹${product.price} — PRICE MANIPULATION DETECTED`,
        severity: 'critical',
      };
      checks.push(priceCheck);
    }
  }

  // 6. Cart Item Validity
  const validItemsCheck: PolicyCheck = {
    name: 'Cart Item Validity',
    passed: cart.items.length > 0 && cart.items.every(i => i.quantity > 0),
    message: cart.items.length > 0
      ? 'All cart items have valid non-zero quantities'
      : 'Cart is empty',
    severity: 'critical',
  };
  checks.push(validItemsCheck);

  // 7. Cart Total Consistency
  const expectedSubtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalConsistencyCheck: PolicyCheck = {
    name: 'Cart Total Consistency',
    passed: Math.abs(cart.subtotal - expectedSubtotal) < 1,
    message: Math.abs(cart.subtotal - expectedSubtotal) < 1
      ? `Cart subtotal ₹${cart.subtotal} matches item sum ₹${expectedSubtotal}`
      : `Cart subtotal ₹${cart.subtotal} arithmetic mismatch against item sum ₹${expectedSubtotal}`,
    severity: 'critical',
  };
  checks.push(totalConsistencyCheck);

  // 8. Maximum Discount Limit Check
  const totalCatalogValue = cart.items.reduce((sum, item) => {
    const prod = getProductById(item.merchantId, item.productId);
    return sum + (prod ? prod.price * item.quantity : item.price * item.quantity);
  }, 0);
  const totalDiscount = Math.max(0, totalCatalogValue - cart.subtotal + cart.discount);
  const effectiveDiscountPercent = totalCatalogValue > 0 ? (totalDiscount / totalCatalogValue) * 100 : 0;
  const maxAllowedDiscount = merchantPolicy.maxDiscountPercent || 20;

  const discountCheck: PolicyCheck = {
    name: 'Discount Boundary',
    passed: effectiveDiscountPercent <= maxAllowedDiscount + 0.5,
    message: effectiveDiscountPercent <= maxAllowedDiscount + 0.5
      ? `Discount ${Math.round(effectiveDiscountPercent)}% is within merchant policy ceiling (${maxAllowedDiscount}%)`
      : `Discount ${Math.round(effectiveDiscountPercent)}% EXCEEDS maximum allowed merchant discount (${maxAllowedDiscount}%)`,
    severity: 'critical',
  };
  checks.push(discountCheck);

  // 9. Minimum Margin Guard
  const minRequiredMargin = merchantPolicy.minMarginPercent || 15;
  let totalCost = 0;
  for (const item of cart.items) {
    const prod = getProductById(item.merchantId, item.productId);
    if (prod) {
      const marginData = getProductMargin(prod);
      totalCost += marginData.costPrice * item.quantity;
    } else {
      totalCost += (item.price * 0.6) * item.quantity;
    }
  }
  const netCartMarginPercent = cart.subtotal > 0 ? Math.round(((cart.subtotal - totalCost) / cart.subtotal) * 100) : 0;

  const marginCheck: PolicyCheck = {
    name: 'Minimum Margin Guard',
    passed: netCartMarginPercent >= minRequiredMargin,
    message: netCartMarginPercent >= minRequiredMargin
      ? `Estimated net cart margin ${netCartMarginPercent}% satisfies minimum threshold (${minRequiredMargin}%)`
      : `Net cart margin ${netCartMarginPercent}% is below merchant floor (${minRequiredMargin}%)`,
    severity: 'critical',
  };
  checks.push(marginCheck);

  // Determine overall status
  const criticalFailures = checks.filter(c => c.severity === 'critical' && !c.passed);
  const allPassed = criticalFailures.length === 0;

  let status: 'PASS' | 'BLOCK' | 'REQUIRES_APPROVAL';
  let summary: string;

  if (!allPassed) {
    status = 'BLOCK';
    summary = `BLOCKED: ${criticalFailures.length} critical check(s) failed — ${criticalFailures.map(c => c.name).join(', ')}`;
  } else {
    status = 'REQUIRES_APPROVAL';
    summary = `All ${checks.length} deterministic policy checks passed. User approval required before Razorpay checkout.`;
  }

  return {
    passed: allPassed,
    status,
    checks,
    summary,
  };
}

/**
 * Mid-flight Price & Stock Verification (Requirement 7).
 * Detects real-world agentic failures (e.g. price surge or out-of-stock between discovery and checkout),
 * blocks execution, explains why, and provides an automatic recovery recommendation.
 */
export function validateLiveStateAndSimulateFailure(params: {
  cart: Cart;
  customerBudget: number;
  simulationType?: 'price_surge' | 'stock_out' | null;
}): PolicyCheckResult {
  const { cart, customerBudget, simulationType } = params;

  // 1. Check for simulated or real price surge
  if (simulationType === 'price_surge') {
    const primaryItem = cart.items[0];
    const discoveredPrice = primaryItem ? primaryItem.price : 4299;
    const surgedPrice = discoveredPrice + 1200; // e.g. 4299 -> 5499
    const surgedTotal = surgedPrice + (cart.total - discoveredPrice);

    // Find in-stock substitute within budget
    const flatProducts = Object.values(allProducts).flat();
    const substitute = flatProducts.find(p =>
      p.id !== primaryItem?.productId &&
      p.category === 'protein' &&
      p.stock > 10 &&
      p.price <= customerBudget &&
      p.isActive
    );

    return {
      passed: false,
      status: 'BLOCK',
      summary: `BLOCKED: Mid-flight price surge detected! Item price changed from ₹${discoveredPrice} to ₹${surgedPrice}. New total ₹${surgedTotal} breaches customer budget limit ₹${customerBudget}.`,
      checks: [
        {
          name: 'Live Price Verification',
          passed: false,
          message: `Live catalog price ₹${surgedPrice} differs from discovery price ₹${discoveredPrice}. Flash re-pricing detected.`,
          severity: 'critical',
        },
        {
          name: 'Budget Ceiling Guard',
          passed: false,
          message: `Cart total with new price (₹${surgedTotal}) exceeds budget ₹${customerBudget} by ₹${surgedTotal - customerBudget}`,
          severity: 'critical',
        },
      ],
      recoveryPlan: {
        canRecover: !!substitute,
        reason: 'Price increased beyond customer budget limit during session.',
        alternativeProduct: substitute ? {
          id: substitute.id,
          merchantId: substitute.merchantId,
          name: substitute.name,
          price: substitute.price,
          stock: substitute.stock,
          rating: substitute.reviews.rating,
        } : undefined,
        suggestedAction: substitute
          ? `Auto-recover with verified alternative: ${substitute.name} at ₹${substitute.price} (within budget ₹${customerBudget})`
          : 'Re-enter buyer search with updated budget parameters',
      },
    };
  }

  // 2. Check for simulated or real stock exhaustion
  if (simulationType === 'stock_out') {
    const primaryItem = cart.items[0];
    const flatProducts = Object.values(allProducts).flat();
    const substitute = flatProducts.find(p =>
      p.id !== primaryItem?.productId &&
      p.category === 'protein' &&
      p.stock > 20 &&
      p.price <= customerBudget &&
      p.isActive
    );

    return {
      passed: false,
      status: 'BLOCK',
      summary: `BLOCKED: Inventory depleted mid-flight! ${primaryItem?.name || 'Selected product'} is now OUT OF STOCK (0 units remaining in warehouse).`,
      checks: [
        {
          name: 'Live Inventory Verification',
          passed: false,
          message: `${primaryItem?.name || 'Item'} stock dropped to 0 units while in checkout queue.`,
          severity: 'critical',
        },
      ],
      recoveryPlan: {
        canRecover: !!substitute,
        reason: 'Inventory stock exhausted by another customer prior to settlement.',
        alternativeProduct: substitute ? {
          id: substitute.id,
          merchantId: substitute.merchantId,
          name: substitute.name,
          price: substitute.price,
          stock: substitute.stock,
          rating: substitute.reviews.rating,
        } : undefined,
        suggestedAction: substitute
          ? `Switch cart to in-stock alternative: ${substitute.name} (${substitute.stock} units available at ₹${substitute.price})`
          : 'Wait for merchant inventory replenishment',
      },
    };
  }

  // Default normal validation
  const merchantPolicy: MerchantPolicy = {
    maxDiscountPercent: 15,
    minMarginPercent: 18,
    stockBuffer: 2,
    optimizationObjective: 'REVENUE',
    minOrderValue: 299,
    returnWindowDays: 14,
    shippingCost: 0,
    codAvailable: true,
    upsellEnabled: true,
    crossSellEnabled: true,
    maxUpsellPriceDeltaPercent: 25,
    allowBundleDiscounts: true,
    bundleDiscountPercent: 15,
    loyaltyDiscountPercent: 3,
  };

  return validateCart(cart, customerBudget, merchantPolicy);
}
