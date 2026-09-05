import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { AuditEvent } from '../schemas/audit';

/**
 * Shared agent state types for LangGraph graphs.
 */

// ============================================================
// BUYER AGENT STATE
// ============================================================
export const BuyerAgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
  sessionId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  customerId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => 'customer-alex',
  }),

  // Intent
  userQuery: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  parsedIntent: Annotation<{
    category: string;
    budget: number;
    goal: string;
    keywords: string[];
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Merchant discovery
  discoveredMerchants: Annotation<Array<{
    id: string;
    name: string;
    score: number;
    aiReady: boolean;
    transactionReady: boolean;
  }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  validMerchants: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  rejectedMerchants: Annotation<Array<{ id: string; name: string; reason: string }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  whyThisMerchant: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  simulationType: Annotation<'price_surge' | 'stock_out' | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Product selection
  searchResults: Annotation<Array<{
    merchantId: string;
    productId: string;
    name: string;
    price: number;
    rating: number;
    reviewCount: number;
    stock: number;
  }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  selectedProduct: Annotation<{
    merchantId: string;
    productId: string;
    name: string;
    price: number;
    selectionReason: string;
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Upsell/Cross-sell
  upsellOffer: Annotation<{
    productId: string;
    name: string;
    price: number;
    priceDelta: number;
    reason: string;
    accepted: boolean | null;
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  crossSellOffer: Annotation<{
    productId: string;
    name: string;
    price: number;
    reason: string;
    accepted: boolean | null;
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Cart & Payment
  cartId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  cartTotal: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
  policyResult: Annotation<{
    passed: boolean;
    status: string;
    summary: string;
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  userApproved: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),
  recoveryPlan: Annotation<{
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
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Razorpay
  razorpayOrderId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  razorpayKeyId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  paymentStatus: Annotation<'pending' | 'success' | 'failed'>({
    reducer: (_, next) => next,
    default: () => 'pending' as const,
  }),

  // Order
  orderId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),

  // Post-purchase
  postPurchaseOffer: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),

  // Agent control
  currentStep: Annotation<string>({
    reducer: (_, next) => next,
    default: () => 'start',
  }),
  error: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  auditTrail: Annotation<AuditEvent[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),

  // Streaming responses
  streamedResponse: Annotation<string>({
    reducer: (curr, next) => curr + next,
    default: () => '',
  }),

  // For multi-step: whether to wait for user input
  waitingForUser: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),
  waitingForUserAction: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
});

export type BuyerAgentStateType = typeof BuyerAgentState.State;

// ============================================================
// MERCHANT AGENT STATE
// ============================================================
export const MerchantAgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
  sessionId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),

  // Customer context
  customerId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  customerGoal: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  customerBudget: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),

  // Product context
  merchantId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  productId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  productName: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  productPrice: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),

  // Recommendations
  upsellCandidates: Annotation<Array<{
    id: string;
    name: string;
    price: number;
    priceDelta: number;
    advantages: string[];
  }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  crossSellCandidates: Annotation<Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    relevanceScore: number;
    complementaryReason: string;
  }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  // Selected offers
  upsellOffer: Annotation<{
    productId: string;
    name: string;
    price: number;
    priceDelta: number;
    reason: string;
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  crossSellOffer: Annotation<{
    productId: string;
    name: string;
    price: number;
    reason: string;
  } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Audit
  auditTrail: Annotation<AuditEvent[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
  currentStep: Annotation<string>({
    reducer: (_, next) => next,
    default: () => 'start',
  }),
});

export type MerchantAgentStateType = typeof MerchantAgentState.State;
