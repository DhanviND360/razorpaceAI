import { Cart } from '../schemas/cart';
import { MerchantPolicy } from '../schemas/merchant';
import { getProductById } from '../data/products';

export interface PolicyCheckResult {
  passed: boolean;
  status: 'PASS' | 'BLOCK' | 'REQUIRES_APPROVAL';
  checks: PolicyCheck[];
  summary: string;
}

export interface PolicyCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Deterministic Policy Engine.
 * Sits between the LLM agent and Razorpay — LLM can never bypass this.
 * Validates cart against budget, merchant rules, inventory, and price integrity.
 */
export function validateCart(
  cart: Cart,
  customerBudget: number,
  merchantPolicy: MerchantPolicy
): PolicyCheckResult {
  const checks: PolicyCheck[] = [];

  // 1. Budget Check
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

  // 4. Product Availability
  for (const item of cart.items) {
    const product = getProductById(item.merchantId, item.productId);
    const stockCheck: PolicyCheck = {
      name: `Stock: ${item.name}`,
      passed: !!product && product.stock >= item.quantity,
      message: product
        ? (product.stock >= item.quantity
          ? `${item.name}: ${product.stock} in stock (need ${item.quantity})`
          : `${item.name}: Only ${product.stock} in stock (need ${item.quantity})`)
        : `${item.name}: Product not found`,
      severity: 'critical',
    };
    checks.push(stockCheck);
  }

  // 5. Price Consistency — verify cart prices match catalog
  for (const item of cart.items) {
    const product = getProductById(item.merchantId, item.productId);
    if (product) {
      const priceMatch = item.price === product.price;
      const priceCheck: PolicyCheck = {
        name: `Price Integrity: ${item.name}`,
        passed: priceMatch,
        message: priceMatch
          ? `${item.name}: Price ₹${item.price} matches catalog`
          : `${item.name}: Cart price ₹${item.price} ≠ catalog price ₹${product.price} — PRICE MANIPULATION DETECTED`,
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
      ? 'All cart items have valid quantities'
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
      ? `Cart subtotal ₹${cart.subtotal} is consistent with item prices`
      : `Cart subtotal ₹${cart.subtotal} does not match calculated ₹${expectedSubtotal}`,
    severity: 'critical',
  };
  checks.push(totalConsistencyCheck);

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
    summary = `All ${checks.length} policy checks passed. User approval required before payment.`;
  }

  return {
    passed: allPassed,
    status,
    checks,
    summary,
  };
}
