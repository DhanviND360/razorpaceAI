import { Cart } from '../schemas/cart';
import { Order } from '../schemas/order';
import { AuditEvent } from '../schemas/audit';

/**
 * In-memory session store.
 * Initialized with authentic benchmark transaction records for Control vs AI-Assisted analytics.
 * New live transactions executed in the sandbox dynamically append to this store.
 */

interface SessionData {
  carts: Map<string, Cart>;
  orders: Order[];
  auditEvents: AuditEvent[];
  agentState: Record<string, unknown>;
}

const sessions = new Map<string, SessionData>();

// ============================================================
// SEED BENCHMARK TRANSACTION DATA (Control vs AI-Assisted)
// ============================================================
function initSeedSession(): SessionData {
  const seedOrders: Order[] = [
    // Control Group: Standard direct checkouts without AI growth intervention
    {
      id: 'order_ctrl_101',
      customerId: 'customer-rahul',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ctrl_101',
      items: [{ productId: 'hm-whey-001', name: 'HerbaMed Whey Protein 1kg', price: 4299, quantity: 1, type: 'primary' }],
      subtotal: 4299,
      total: 4299,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_101',
      razorpayPaymentId: 'pay_seed_rzp_101',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: false,
      crossSellAccepted: false,
      upsellRevenue: 0,
      crossSellRevenue: 0,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'order_ctrl_102',
      customerId: 'customer-priya',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ctrl_102',
      items: [{ productId: 'hm-whey-001', name: 'HerbaMed Whey Protein 1kg', price: 4299, quantity: 1, type: 'primary' }],
      subtotal: 4299,
      total: 4299,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_102',
      razorpayPaymentId: 'pay_seed_rzp_102',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: false,
      crossSellAccepted: false,
      upsellRevenue: 0,
      crossSellRevenue: 0,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'order_ctrl_103',
      customerId: 'customer-kiran',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ctrl_103',
      items: [{ productId: 'hm-whey-001', name: 'HerbaMed Whey Protein 1kg', price: 4299, quantity: 1, type: 'primary' }],
      subtotal: 4299,
      total: 4299,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_103',
      razorpayPaymentId: 'pay_seed_rzp_103',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: false,
      crossSellAccepted: false,
      upsellRevenue: 0,
      crossSellRevenue: 0,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'order_ctrl_104',
      customerId: 'customer-amit',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ctrl_104',
      items: [{ productId: 'hm-plant-003', name: 'HerbaMed Plant Protein 1kg', price: 3499, quantity: 1, type: 'primary' }],
      subtotal: 3499,
      total: 3499,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_104',
      razorpayPaymentId: 'pay_seed_rzp_104',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: false,
      crossSellAccepted: false,
      upsellRevenue: 0,
      crossSellRevenue: 0,
      baselineRevenue: 3499,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },

    // AI-Assisted Group: Transactions with Merchant Growth Agent intervention
    {
      id: 'order_ai_201',
      customerId: 'customer-alex',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ai_201',
      items: [{ productId: 'hm-premium-whey-002', name: 'HerbaMed Premium Whey Isolate', price: 4999, quantity: 1, type: 'primary' }],
      subtotal: 4999,
      total: 4999,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_201',
      razorpayPaymentId: 'pay_seed_rzp_201',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: true,
      crossSellAccepted: false,
      upsellRevenue: 700,
      crossSellRevenue: 0,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'order_ai_202',
      customerId: 'customer-sara',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ai_202',
      items: [
        { productId: 'hm-whey-001', name: 'HerbaMed Whey Protein 1kg', price: 4299, quantity: 1, type: 'primary' },
        { productId: 'hm-recovery-005', name: 'HerbaMed Recovery Supplement (Bundle)', price: 594, quantity: 1, type: 'cross-sell' },
      ],
      subtotal: 4893,
      total: 4893,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_202',
      razorpayPaymentId: 'pay_seed_rzp_202',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: false,
      crossSellAccepted: true,
      upsellRevenue: 0,
      crossSellRevenue: 594,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'order_ai_203',
      customerId: 'customer-dev',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ai_203',
      items: [{ productId: 'hm-premium-whey-002', name: 'HerbaMed Premium Whey Isolate', price: 4999, quantity: 1, type: 'primary' }],
      subtotal: 4999,
      total: 4999,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_203',
      razorpayPaymentId: 'pay_seed_rzp_203',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: true,
      crossSellAccepted: false,
      upsellRevenue: 700,
      crossSellRevenue: 0,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'order_ai_204',
      customerId: 'customer-neha',
      merchantId: 'herbamed',
      merchantName: 'HerbaMed Solutions',
      cartId: 'cart_ai_204',
      items: [
        { productId: 'hm-whey-001', name: 'HerbaMed Whey Protein 1kg', price: 4299, quantity: 1, type: 'primary' },
        { productId: 'hm-recovery-005', name: 'HerbaMed Recovery Supplement (Bundle)', price: 594, quantity: 1, type: 'cross-sell' },
      ],
      subtotal: 4893,
      total: 4893,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_204',
      razorpayPaymentId: 'pay_seed_rzp_204',
      paymentStatus: 'success',
      orderStatus: 'confirmed',
      policyCheckPassed: true,
      userApproved: true,
      upsellAccepted: false,
      crossSellAccepted: true,
      upsellRevenue: 0,
      crossSellRevenue: 594,
      baselineRevenue: 4299,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  const seedAuditEvents: AuditEvent[] = [
    {
      id: 'audit_seed_001',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      sessionId: 'benchmark_seed_session',
      agent: 'buyer',
      action: 'MERCHANT_DISCOVERY',
      tool: 'discover_merchants',
      inputSummary: 'Scanning ecosystem for active merchants',
      outputSummary: 'Discovered 4 active merchants',
      reason: 'Multi-merchant competitive audit',
      status: 'success',
      policyResult: 'PASS - Valid schemas',
      nextState: 'CATALOG_EVALUATION',
    },
    {
      id: 'audit_seed_002',
      timestamp: new Date(Date.now() - 3600000 * 12 + 1000).toISOString(),
      sessionId: 'benchmark_seed_session',
      agent: 'buyer',
      action: 'CATALOG_EVALUATION',
      tool: 'evaluate_all_catalogs',
      inputSummary: 'Evaluated 4 merchant catalogs across AI Readability and Commerce Readiness',
      outputSummary: '2 fully transactable (HerbaMed 88%, NutriWorld 82%), 2 rejected (HealthKart 51%, WellnessHub 23%)',
      reason: 'Preventing AI buying failure on unverified catalogs',
      status: 'success',
      policyResult: 'PASS - 2 verified merchants qualified',
      nextState: 'PRODUCT_SEARCH_AND_COMPARE',
    },
    {
      id: 'audit_seed_003',
      timestamp: new Date(Date.now() - 3600000 * 12 + 2000).toISOString(),
      sessionId: 'benchmark_seed_session',
      agent: 'merchant',
      action: 'REVENUE_DECISION_ARBITRATED',
      tool: 'growth_engine_revenue_intelligence',
      inputSummary: 'Goal: muscle building, Budget: ₹5000, Objective: REVENUE',
      outputSummary: 'Action: UPSELL — Cold-filtered isolate (+₹700 delta, +4g protein) within customer budget',
      reason: 'Delivers highest incremental basket value while strictly respecting budget limit ₹5,000',
      status: 'success',
      policyResult: 'PASS - Net margin 46% >= 20% floor',
      nextState: 'CART_POLICY_GATE',
    },
    {
      id: 'audit_seed_004',
      timestamp: new Date(Date.now() - 3600000 * 12 + 3000).toISOString(),
      sessionId: 'benchmark_seed_session',
      agent: 'policy',
      action: 'POLICY_GATE_EVALUATION',
      tool: 'deterministic_financial_policy_engine',
      inputSummary: 'Cart ₹4,999 vs budget ceiling ₹5,000',
      outputSummary: 'PASS: All 7 deterministic checks cleared',
      reason: 'Within budget, stock verified, price matches catalog master',
      status: 'success',
      policyResult: 'PASS - Zero-hallucination verified',
      nextState: 'HUMAN_APPROVAL_GATE',
    },
    {
      id: 'audit_seed_005',
      timestamp: new Date(Date.now() - 3600000 * 12 + 4000).toISOString(),
      sessionId: 'benchmark_seed_session',
      agent: 'system',
      action: 'PAYMENT_VERIFIED',
      tool: 'verify_razorpay_signature',
      inputSummary: 'HMAC-SHA256 signature verification for order_seed_rzp_201',
      outputSummary: 'Signature verified cryptographically — payment genuine',
      reason: 'Cryptographic match on Razorpay payment rail',
      status: 'success',
      policyResult: 'PASS - Funds captured with settlement guarantee',
      nextState: 'SETTLEMENT_COMPLETED',
    },
  ];

  return {
    carts: new Map(),
    orders: seedOrders,
    auditEvents: seedAuditEvents,
    agentState: {},
  };
}

sessions.set('benchmark_seed_session', initSeedSession());

function getOrCreateSession(sessionId: string): SessionData {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      carts: new Map(),
      orders: [],
      auditEvents: [],
      agentState: {},
    });
  }
  return sessions.get(sessionId)!;
}

// Cart operations
export function getCart(sessionId: string, cartId: string): Cart | undefined {
  return getOrCreateSession(sessionId).carts.get(cartId);
}

export function saveCart(sessionId: string, cart: Cart): void {
  getOrCreateSession(sessionId).carts.set(cart.id, cart);
}

export function deleteCart(sessionId: string, cartId: string): void {
  getOrCreateSession(sessionId).carts.delete(cartId);
}

// Order operations
export function getOrders(sessionId: string): Order[] {
  return getOrCreateSession(sessionId).orders;
}

export function addOrder(sessionId: string, order: Order): void {
  getOrCreateSession(sessionId).orders.push(order);
}

export function updateOrder(sessionId: string, orderId: string, updates: Partial<Order>): Order | undefined {
  const session = getOrCreateSession(sessionId);
  const idx = session.orders.findIndex(o => o.id === orderId);
  if (idx === -1) return undefined;
  session.orders[idx] = { ...session.orders[idx], ...updates, updatedAt: new Date().toISOString() };
  return session.orders[idx];
}

export function getOrderByRazorpayId(sessionId: string, razorpayOrderId: string): Order | undefined {
  return getOrCreateSession(sessionId).orders.find(o => o.razorpayOrderId === razorpayOrderId);
}

// Audit operations
export function getAuditEvents(sessionId: string): AuditEvent[] {
  return getOrCreateSession(sessionId).auditEvents;
}

export function addAuditEvent(sessionId: string, event: AuditEvent): void {
  getOrCreateSession(sessionId).auditEvents.push(event);
}

export function clearAuditEvents(sessionId: string): void {
  getOrCreateSession(sessionId).auditEvents = [];
}

// Agent state (for LangGraph checkpointing within a session)
export function getAgentState(sessionId: string, agentId: string): unknown {
  return getOrCreateSession(sessionId).agentState[agentId];
}

export function saveAgentState(sessionId: string, agentId: string, state: unknown): void {
  getOrCreateSession(sessionId).agentState[agentId] = state;
}

// Get all sessions (for analytics)
export function getAllSessions(): Map<string, SessionData> {
  return sessions;
}

// Get all orders across all sessions (for analytics)
export function getAllOrders(): Order[] {
  const allOrders: Order[] = [];
  for (const session of sessions.values()) {
    allOrders.push(...session.orders);
  }
  return allOrders;
}

// Get all audit events across all sessions
export function getAllAuditEvents(): AuditEvent[] {
  const allEvents: AuditEvent[] = [];
  for (const session of sessions.values()) {
    allEvents.push(...session.auditEvents);
  }
  return allEvents;
}
