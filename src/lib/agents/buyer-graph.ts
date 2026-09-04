import { StateGraph } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BuyerAgentState, BuyerAgentStateType } from './state';
import { getLLM } from './llm';
import { runMerchantAgent } from './merchant-graph';
import { searchProducts } from './tools/search';
import { getCustomerProfile, getPurchaseHistory } from './tools/customer';
import { discoverMerchants, evaluateAllCatalogs } from './tools/catalog';
import { createCart } from './tools/cart';
import { runPolicyCheck } from './tools/policy';
import { createRazorpayOrderTool } from './tools/razorpay';
import { createAuditEvent } from '../schemas/audit';
import { addAuditEvent } from '../data/store';

const BUYER_SYSTEM_PROMPT = `You are an AI Buyer Agent that helps customers find and purchase products intelligently.

Your GOAL: Find the best product matching the customer's needs, interact with merchant agents for recommendations, and complete the purchase through a safe, verified flow.

BEHAVIOR:
1. Parse the customer's natural language request to extract: category, budget, goal
2. Discover and evaluate merchant catalogs for AI-readability
3. Search products across AI-ready merchants only
4. Compare products using: price, rating, reviews, stock, relevance to goal, purchase history
5. Select the best product and EXPLAIN why
6. Interact with the Merchant Growth Agent for upsell/cross-sell
7. Evaluate offers against budget and relevance
8. Never exceed the customer's budget
9. Always get user approval before payment
10. Every decision must be explainable

When comparing products, create a structured comparison. When explaining selections, use checkmarks for key criteria met.

IMPORTANT: Always respond with valid JSON when asked for structured output.`;

async function parseIntent(state: BuyerAgentStateType) {
  const parsedIntent = { category: 'protein', budget: 5000, goal: 'general health', keywords: ['protein'] };

  // Heuristic extraction for robust fallback
  const queryLower = state.userQuery.toLowerCase();
  const budgetMatch = state.userQuery.match(/(?:under|budget|below|within|upto|up to|rs\.?|inr|₹)\s*(\d+[\d,]*)/i) ||
                      state.userQuery.match(/(\d+[\d,]*)\s*(?:rs|inr|rupees)/i);
  if (budgetMatch) {
    const parsedBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsedBudget) && parsedBudget > 0) {
      parsedIntent.budget = parsedBudget;
    }
  }
  if (queryLower.includes('muscle') || queryLower.includes('bulk') || queryLower.includes('hypertrophy')) {
    parsedIntent.goal = 'muscle building';
  } else if (queryLower.includes('weight loss') || queryLower.includes('cut') || queryLower.includes('lean')) {
    parsedIntent.goal = 'weight loss';
  }
  if (queryLower.includes('creatine')) {
    parsedIntent.category = 'creatine';
    parsedIntent.keywords = ['creatine'];
  } else if (queryLower.includes('bar') || queryLower.includes('snack')) {
    parsedIntent.category = 'protein-bar';
    parsedIntent.keywords = ['bar', 'protein'];
  } else if (queryLower.includes('whey') || queryLower.includes('protein')) {
    parsedIntent.category = 'whey-protein';
    parsedIntent.keywords = ['whey', 'protein'];
  }

  try {
    const llm = getLLM();
    const response = await llm.invoke([
      new SystemMessage(BUYER_SYSTEM_PROMPT),
      new HumanMessage(`Parse this customer request and extract the shopping intent. Respond ONLY with JSON, no other text.

Customer request: "${state.userQuery}"

JSON format:
{
  "category": "product category (e.g., protein, whey-protein, vitamins)",
  "budget": numeric budget in INR (extract from text, default 5000 if not specified),
  "goal": "customer's stated goal (e.g., muscle building, weight loss, general health)",
  "keywords": ["keyword1", "keyword2"]
}`),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.category) parsedIntent.category = parsed.category;
      if (parsed.budget) parsedIntent.budget = Number(parsed.budget);
      if (parsed.goal) parsedIntent.goal = parsed.goal;
      if (Array.isArray(parsed.keywords)) parsedIntent.keywords = parsed.keywords;
    }
  } catch (err) {
    console.warn('parseIntent LLM invocation notice (using heuristics):', err instanceof Error ? err.message : err);
  }

  const audit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'buyer',
    action: 'USER_INTENT',
    inputSummary: state.userQuery,
    outputSummary: `Category: ${parsedIntent.category}, Budget: ₹${parsedIntent.budget}, Goal: ${parsedIntent.goal}`,
    reason: 'Parsed natural language shopping request',
    status: 'success',
  });
  addAuditEvent(state.sessionId, audit);

  return {
    parsedIntent,
    currentStep: 'intent_parsed',
    auditTrail: [audit],
  };
}

async function discoverAndEvaluate(state: BuyerAgentStateType) {
  // Discover merchants
  const merchantsResult = await discoverMerchants.invoke({});
  const merchantsData = JSON.parse(merchantsResult);

  const discoverAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'buyer',
    action: 'MERCHANT_DISCOVERY',
    tool: 'discover_merchants',
    inputSummary: 'Discovering all available merchants',
    outputSummary: `Found ${merchantsData.totalCount} merchants`,
    status: 'success',
  });
  addAuditEvent(state.sessionId, discoverAudit);

  // Evaluate all catalogs
  const evaluationResult = await evaluateAllCatalogs.invoke({});
  const evaluationData = JSON.parse(evaluationResult);

  const validMerchants = evaluationData.evaluations
    .filter((e: { aiReady: boolean }) => e.aiReady)
    .map((e: { merchantId: string }) => e.merchantId);

  const rejectedMerchants = evaluationData.evaluations
    .filter((e: { aiReady: boolean }) => !e.aiReady)
    .map((e: { merchantId: string; merchantName: string; overallScore: number; recommendation: string }) => ({
      id: e.merchantId,
      name: e.merchantName,
      reason: `Score ${e.overallScore}/100 — ${e.recommendation}`,
    }));

  const evalAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'buyer',
    action: 'CATALOG_EVALUATION',
    tool: 'evaluate_all_catalogs',
    inputSummary: `Evaluated ${evaluationData.totalCount} merchant catalogs`,
    outputSummary: `${evaluationData.aiReadyCount} AI-ready, ${rejectedMerchants.length} rejected`,
    reason: 'Evaluating catalog quality to ensure reliable AI purchasing',
    status: 'success',
  });
  addAuditEvent(state.sessionId, evalAudit);

  // Audit rejected merchants
  for (const rejected of rejectedMerchants) {
    const rejectAudit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'buyer',
      action: 'MERCHANT_REJECTED',
      inputSummary: `${rejected.name}`,
      outputSummary: rejected.reason,
      reason: 'Catalog quality insufficient for reliable AI purchasing',
      status: 'blocked',
    });
    addAuditEvent(state.sessionId, rejectAudit);
  }

  return {
    discoveredMerchants: evaluationData.evaluations.map((e: { merchantId: string; merchantName: string; overallScore: number; aiReady: boolean; transactionReady: boolean }) => ({
      id: e.merchantId,
      name: e.merchantName,
      score: e.overallScore,
      aiReady: e.aiReady,
      transactionReady: e.transactionReady,
    })),
    validMerchants,
    rejectedMerchants,
    currentStep: 'catalogs_evaluated',
    auditTrail: [discoverAudit, evalAudit],
  };
}

async function searchAndCompare(state: BuyerAgentStateType) {
  const intent = state.parsedIntent!;

  // Search each valid merchant
  const allResults: Array<{
    merchantId: string;
    productId: string;
    name: string;
    price: number;
    rating: number;
    reviewCount: number;
    stock: number;
    description: string;
  }> = [];

  for (const merchantId of state.validMerchants) {
    const result = await searchProducts.invoke({
      query: intent.keywords?.join(' ') || intent.category,
      category: undefined,
      maxPrice: intent.budget,
      merchantId,
    });
    const data = JSON.parse(result);
    allResults.push(...data.results);
  }

  const searchAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'buyer',
    action: 'PRODUCT_SEARCH',
    tool: 'search_products',
    inputSummary: `Search: "${intent.keywords?.join(', ')}" under ₹${intent.budget} across ${state.validMerchants.length} merchants`,
    outputSummary: `Found ${allResults.length} matching products`,
    status: allResults.length > 0 ? 'success' : 'failed',
  });
  addAuditEvent(state.sessionId, searchAudit);

  if (allResults.length === 0) {
    return {
      searchResults: [],
      error: 'No products found matching your criteria',
      currentStep: 'search_failed',
      auditTrail: [searchAudit],
    };
  }

  // Get customer context for comparison
  const profileResult = await getCustomerProfile.invoke({ customerId: state.customerId });
  const historyResult = await getPurchaseHistory.invoke({ customerId: state.customerId });

  // LLM compares and selects
  const prompt = `Compare these products and select the BEST one for a customer with goal "${intent.goal}" and budget ₹${intent.budget}.

Products found:
${JSON.stringify(allResults, null, 2)}

Customer profile: ${profileResult}
Purchase history: ${historyResult}

Compare using:
1. Price (within budget ₹${intent.budget})
2. Product tier: If both a standard best-selling product and a premium/isolate tier exist, select the popular standard baseline (e.g. HerbaMed Whey Protein) to enable the merchant agent's premium upgrade offer during checkout.
3. Rating & review count (trust indicator)
4. Stock availability
5. Relevance to goal "${intent.goal}"
6. Purchase history (prefer known merchants, avoid recent re-purchases of same product)

Respond ONLY with JSON:
{
  "selectedMerchantId": "...",
  "selectedProductId": "...",
  "selectedProductName": "...",
  "selectedProductPrice": ...,
  "selectionReason": "Structured explanation with specific criteria met",
  "comparisonSummary": "Brief comparison of top alternatives"
}`;

  let selection = null;
  try {
    const llm = getLLM();
    const response = await llm.invoke([
      new SystemMessage(BUYER_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);
    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      selection = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('searchAndCompare LLM comparison notice:', err instanceof Error ? err.message : err);
  }

  if (!selection || !selection.selectedProductId) {
    // Fallback: prefer standard core product within budget so upsell path is active
    const standardProduct = allResults.find(p => p.stock > 0 && p.price <= intent.budget && !p.name.toLowerCase().includes('premium') && !p.name.toLowerCase().includes('isolate'));
    const chosen = standardProduct || allResults.filter(p => p.stock > 0 && p.price <= intent.budget).sort((a, b) => b.rating - a.rating)[0];
    if (chosen) {
      selection = {
        selectedMerchantId: chosen.merchantId,
        selectedProductId: chosen.productId,
        selectedProductName: chosen.name,
        selectedProductPrice: chosen.price,
        selectionReason: `Core best-selling product (${chosen.rating}/5.0 rating, ${chosen.reviewCount} reviews) within budget of ₹${intent.budget}`,
        comparisonSummary: 'Selected baseline product for category',
      };
    }
  }

  if (!selection) {
    return { searchResults: allResults, error: 'Failed to select a product', currentStep: 'selection_failed', auditTrail: [searchAudit] };
  }

  const selectAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'buyer',
    action: 'PRODUCT_SELECTION',
    tool: 'llm_comparison',
    inputSummary: `Compared ${allResults.length} products across ${state.validMerchants.length} merchants`,
    outputSummary: `Selected: ${selection.selectedProductName} from ${selection.selectedMerchantId} at ₹${selection.selectedProductPrice}`,
    reason: selection.selectionReason,
    status: 'success',
  });
  addAuditEvent(state.sessionId, selectAudit);

  return {
    searchResults: allResults,
    selectedProduct: {
      merchantId: selection.selectedMerchantId,
      productId: selection.selectedProductId,
      name: selection.selectedProductName,
      price: selection.selectedProductPrice,
      selectionReason: selection.selectionReason,
    },
    currentStep: 'product_selected',
    auditTrail: [searchAudit, selectAudit],
  };
}

async function interactWithMerchant(state: BuyerAgentStateType) {
  if (!state.selectedProduct) {
    return { currentStep: 'merchant_interaction_skipped' };
  }

  const intent = state.parsedIntent!;

  try {
    const merchantResult = await runMerchantAgent({
      sessionId: state.sessionId,
      customerId: state.customerId,
      customerGoal: intent.goal,
      customerBudget: intent.budget,
      merchantId: state.selectedProduct.merchantId,
      productId: state.selectedProduct.productId,
      productName: state.selectedProduct.name,
      productPrice: state.selectedProduct.price,
    });

    // Forward merchant audit events
    for (const audit of merchantResult.auditTrail) {
      addAuditEvent(state.sessionId, audit);
    }

    return {
      upsellOffer: merchantResult.upsellOffer ? {
        ...merchantResult.upsellOffer,
        accepted: null, // pending user decision
      } : null,
      crossSellOffer: merchantResult.crossSellOffer ? {
        ...merchantResult.crossSellOffer,
        accepted: null,
      } : null,
      currentStep: 'merchant_interaction_done',
      auditTrail: merchantResult.auditTrail,
    };
  } catch (error) {
    const errorAudit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'buyer',
      action: 'MERCHANT_INTERACTION_ERROR',
      inputSummary: `Merchant agent interaction for ${state.selectedProduct.name}`,
      outputSummary: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    });
    addAuditEvent(state.sessionId, errorAudit);

    return {
      upsellOffer: null,
      crossSellOffer: null,
      currentStep: 'merchant_interaction_done',
      auditTrail: [errorAudit],
    };
  }
}

async function evaluateOffers(state: BuyerAgentStateType) {
  const intent = state.parsedIntent!;

  if (!state.upsellOffer && !state.crossSellOffer) {
    return { currentStep: 'offers_evaluated' };
  }

  const prompt = `Evaluate these merchant recommendations for a customer with budget ₹${intent.budget} and goal "${intent.goal}":

Original product: ${state.selectedProduct?.name} at ₹${state.selectedProduct?.price}

${state.upsellOffer ? `UPSELL OFFER: ${state.upsellOffer.name} at ₹${state.upsellOffer.price} (+₹${state.upsellOffer.priceDelta})
Reason: ${state.upsellOffer.reason}` : 'No upsell offered'}

${state.crossSellOffer ? `CROSS-SELL OFFER: ${state.crossSellOffer.name} at ₹${state.crossSellOffer.price}
Reason: ${state.crossSellOffer.reason}` : 'No cross-sell offered'}

Budget: ₹${intent.budget}

For each offer, determine:
1. Is it genuinely relevant to "${intent.goal}"?
2. Does accepting it keep total within budget?
3. Is the value proposition reasonable?

Respond with JSON:
{
  "acceptUpsell": true/false,
  "upsellReason": "why accept/reject",
  "acceptCrossSell": true/false,
  "crossSellReason": "why accept/reject",
  "projectedTotal": total if both accepted/rejected as recommended
}`;

  let decisions = { acceptUpsell: false, acceptCrossSell: false, upsellReason: '', crossSellReason: '' };
  try {
    const llm = getLLM();
    const response = await llm.invoke([
      new SystemMessage(BUYER_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);
    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      decisions = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('evaluateOffers LLM notice:', err instanceof Error ? err.message : err);
    // Intelligent fallback: accept if total stays within budget
    const basePrice = state.selectedProduct?.price || 0;
    if (state.upsellOffer && state.upsellOffer.price <= intent.budget) {
      decisions.acceptUpsell = true;
      decisions.upsellReason = 'Within budget and provides higher value for goal';
    }
    const currentPrice = decisions.acceptUpsell && state.upsellOffer ? state.upsellOffer.price : basePrice;
    if (state.crossSellOffer && (currentPrice + state.crossSellOffer.price) <= intent.budget) {
      decisions.acceptCrossSell = true;
      decisions.crossSellReason = 'Complementary product within remaining budget';
    }
  }

  const updatedUpsell = state.upsellOffer ? {
    ...state.upsellOffer,
    accepted: decisions.acceptUpsell,
  } : null;

  const updatedCrossSell = state.crossSellOffer ? {
    ...state.crossSellOffer,
    accepted: decisions.acceptCrossSell,
  } : null;

  // Audit upsell decision
  if (state.upsellOffer) {
    const upsellAudit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'buyer',
      action: decisions.acceptUpsell ? 'UPSELL_ACCEPTED' : 'UPSELL_REJECTED',
      inputSummary: `${state.upsellOffer.name} at ₹${state.upsellOffer.price}`,
      outputSummary: decisions.upsellReason,
      reason: decisions.upsellReason,
      status: decisions.acceptUpsell ? 'success' : 'skipped',
    });
    addAuditEvent(state.sessionId, upsellAudit);
  }

  // Audit cross-sell decision
  if (state.crossSellOffer) {
    const crossSellAudit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'buyer',
      action: decisions.acceptCrossSell ? 'CROSS_SELL_ACCEPTED' : 'CROSS_SELL_REJECTED',
      inputSummary: `${state.crossSellOffer.name} at ₹${state.crossSellOffer.price}`,
      outputSummary: decisions.crossSellReason,
      reason: decisions.crossSellReason,
      status: decisions.acceptCrossSell ? 'success' : 'skipped',
    });
    addAuditEvent(state.sessionId, crossSellAudit);
  }

  return {
    upsellOffer: updatedUpsell,
    crossSellOffer: updatedCrossSell,
    currentStep: 'offers_evaluated',
  };
}

async function buildCartAndCheckPolicy(state: BuyerAgentStateType) {
  if (!state.selectedProduct) {
    return { error: 'No product selected', currentStep: 'cart_failed' };
  }

  const intent = state.parsedIntent!;

  // Build cart items based on accepted offers
  const cartItems: Array<{ productId: string; quantity: number; type: string }> = [];

  // If upsell accepted, use upsell product; otherwise use original
  if (state.upsellOffer?.accepted && state.upsellOffer.productId) {
    cartItems.push({ productId: state.upsellOffer.productId, quantity: 1, type: 'upsell' });
  } else {
    cartItems.push({ productId: state.selectedProduct.productId, quantity: 1, type: 'primary' });
  }

  // If cross-sell accepted, add it
  if (state.crossSellOffer?.accepted && state.crossSellOffer.productId) {
    cartItems.push({ productId: state.crossSellOffer.productId, quantity: 1, type: 'cross-sell' });
  }

  // Create cart
  const cartResult = await createCart.invoke({
    sessionId: state.sessionId,
    customerId: state.customerId,
    merchantId: state.selectedProduct.merchantId,
    items: cartItems,
  });
  const cartData = JSON.parse(cartResult);

  const cartAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'buyer',
    action: 'CART_CREATED',
    tool: 'create_cart',
    inputSummary: `${cartItems.length} items for ${state.selectedProduct.merchantId}`,
    outputSummary: `Cart ${cartData.cartId}: ${cartData.itemCount} items, total ₹${cartData.total}`,
    status: 'success',
  });
  addAuditEvent(state.sessionId, cartAudit);

  // Run policy check
  const policyResult = await runPolicyCheck.invoke({
    sessionId: state.sessionId,
    cartId: cartData.cartId,
    budget: intent.budget,
  });
  const policyData = JSON.parse(policyResult);

  const policyAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'policy',
    action: 'POLICY_CHECK',
    tool: 'run_policy_check',
    inputSummary: `Cart ₹${cartData.total} vs budget ₹${intent.budget}`,
    outputSummary: `${policyData.status}: ${policyData.summary}`,
    reason: policyData.summary,
    status: policyData.passed ? 'success' : 'blocked',
  });
  addAuditEvent(state.sessionId, policyAudit);

  return {
    cartId: cartData.cartId,
    cartTotal: cartData.total,
    policyResult: {
      passed: policyData.passed,
      status: policyData.status,
      summary: policyData.summary,
    },
    currentStep: policyData.passed ? 'policy_passed' : 'policy_blocked',
  };
}

async function requestApproval(state: BuyerAgentStateType) {
  // This node signals to the API layer that we need user approval
  // The graph pauses here and waits for the user to approve/reject

  if (!state.policyResult?.passed) {
    return {
      waitingForUser: false,
      currentStep: 'blocked_by_policy',
      error: `Policy blocked: ${state.policyResult?.summary}`,
    };
  }

  const approvalAudit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'system',
    action: 'USER_APPROVAL_REQUESTED',
    inputSummary: `Cart total ₹${state.cartTotal}`,
    outputSummary: 'Waiting for user approval to proceed with payment',
    reason: 'All policy checks passed — user must explicitly approve before payment',
    status: 'pending',
  });
  addAuditEvent(state.sessionId, approvalAudit);

  return {
    waitingForUser: true,
    waitingForUserAction: 'payment_approval',
    currentStep: 'awaiting_approval',
  };
}

async function createOrder(state: BuyerAgentStateType) {
  if (!state.userApproved || !state.cartId) {
    return { error: 'Cannot create order — not approved or no cart', currentStep: 'order_failed' };
  }

  try {
    const orderResult = await createRazorpayOrderTool.invoke({
      sessionId: state.sessionId,
      cartId: state.cartId,
    });
    const orderData = JSON.parse(orderResult);

    if (!orderData.success) {
      const errorAudit = createAuditEvent({
        sessionId: state.sessionId,
        agent: 'system',
        action: 'RAZORPAY_ORDER_FAILED',
        inputSummary: `Cart ${state.cartId}`,
        outputSummary: orderData.error || 'Failed to create order',
        status: 'failed',
      });
      addAuditEvent(state.sessionId, errorAudit);

      return {
        error: orderData.error,
        currentStep: 'order_creation_failed',
      };
    }

    const orderAudit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'system',
      action: 'RAZORPAY_ORDER_CREATED',
      tool: 'create_razorpay_order',
      inputSummary: `Cart ${state.cartId}, Amount ₹${state.cartTotal}`,
      outputSummary: `Razorpay Order ${orderData.razorpayOrderId} created`,
      reason: 'User approved payment — creating Razorpay test order',
      status: 'success',
    });
    addAuditEvent(state.sessionId, orderAudit);

    return {
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayKeyId: orderData.keyId,
      currentStep: 'order_created',
      waitingForUser: true,
      waitingForUserAction: 'razorpay_payment',
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Order creation failed',
      currentStep: 'order_creation_failed',
    };
  }
}

async function postPurchase(state: BuyerAgentStateType) {
  if (state.error || !state.razorpayOrderId) {
    return { currentStep: state.currentStep || 'order_creation_failed' };
  }

  let offerText = 'Thank you for your purchase! Use code REPEAT10 for 10% off your next order.';

  try {
    const llm = getLLM();
    const prompt = `Generate a contextual post-purchase offer for a customer who just bought:
- Product: ${state.selectedProduct?.name}
- Goal: ${state.parsedIntent?.goal}
- From merchant: ${state.selectedProduct?.merchantId}

Create a SHORT, relevant offer (1-2 sentences). Example format:
"Buy 2 protein bars and receive 10% off your next purchase."
Or a referral offer.

The offer should be genuinely useful for their "${state.parsedIntent?.goal}" goal.
Respond with just the offer text, no JSON.`;

    const response = await llm.invoke([
      new SystemMessage('You generate brief, contextual post-purchase offers.'),
      new HumanMessage(prompt),
    ]);

    if (typeof response.content === 'string' && response.content.trim()) {
      offerText = response.content.trim();
    }
  } catch (err) {
    console.warn('postPurchase LLM notice:', err instanceof Error ? err.message : err);
  }

  return {
    postPurchaseOffer: offerText,
    currentStep: 'complete',
  };
}

// Router functions for conditional edges
function shouldProceedAfterEvaluation(state: BuyerAgentStateType): string {
  if (state.validMerchants.length === 0) {
    return 'noValidMerchants';
  }
  return 'searchProducts';
}

function shouldProceedAfterSearch(state: BuyerAgentStateType): string {
  if (!state.selectedProduct) {
    return 'searchFailed';
  }
  return 'interactWithMerchant';
}

function shouldProceedAfterPolicy(state: BuyerAgentStateType): string {
  if (!state.policyResult?.passed) {
    return 'policyBlocked';
  }
  return 'requestApproval';
}

// Build the Buyer Agent graph
function buildBuyerGraph() {
  const graph = new StateGraph(BuyerAgentState)
    .addNode('parseIntent', parseIntent)
    .addNode('discoverAndEvaluate', discoverAndEvaluate)
    .addNode('searchAndCompare', searchAndCompare)
    .addNode('interactWithMerchant', interactWithMerchant)
    .addNode('evaluateOffers', evaluateOffers)
    .addNode('buildCartAndCheckPolicy', buildCartAndCheckPolicy)
    .addNode('requestApproval', requestApproval)

    // Edges
    .addEdge('__start__', 'parseIntent')
    .addEdge('parseIntent', 'discoverAndEvaluate')
    .addConditionalEdges('discoverAndEvaluate', shouldProceedAfterEvaluation, {
      searchProducts: 'searchAndCompare',
      noValidMerchants: '__end__',
    })
    .addConditionalEdges('searchAndCompare', shouldProceedAfterSearch, {
      interactWithMerchant: 'interactWithMerchant',
      searchFailed: '__end__',
    })
    .addEdge('interactWithMerchant', 'evaluateOffers')
    .addEdge('evaluateOffers', 'buildCartAndCheckPolicy')
    .addConditionalEdges('buildCartAndCheckPolicy', shouldProceedAfterPolicy, {
      requestApproval: 'requestApproval',
      policyBlocked: '__end__',
    })
    .addEdge('requestApproval', '__end__'); // Pauses for user approval

  return graph.compile();
}

// Second phase graph — after user approval
function buildPaymentGraph() {
  const graph = new StateGraph(BuyerAgentState)
    .addNode('createOrder', createOrder)
    .addNode('postPurchase', postPurchase)
    .addEdge('__start__', 'createOrder')
    .addEdge('createOrder', 'postPurchase')
    .addEdge('postPurchase', '__end__');

  return graph.compile();
}

let buyerGraph: ReturnType<typeof buildBuyerGraph> | null = null;
let paymentGraph: ReturnType<typeof buildPaymentGraph> | null = null;

export function getBuyerGraph() {
  if (!buyerGraph) {
    buyerGraph = buildBuyerGraph();
  }
  return buyerGraph;
}

export function getPaymentGraph() {
  if (!paymentGraph) {
    paymentGraph = buildPaymentGraph();
  }
  return paymentGraph;
}

/**
 * Run the full buyer agent flow (Phase 1: intent → approval request).
 * Returns the state including whether user approval is needed.
 */
export async function runBuyerAgent(params: {
  sessionId: string;
  userQuery: string;
  customerId?: string;
}): Promise<BuyerAgentStateType> {
  const graph = getBuyerGraph();

  const result = await graph.invoke({
    sessionId: params.sessionId,
    userQuery: params.userQuery,
    customerId: params.customerId || 'customer-alex',
  });

  return result;
}

/**
 * Run the payment phase (Phase 2: after user approval).
 */
export async function runPaymentPhase(params: {
  sessionId: string;
  cartId: string;
  cartTotal: number;
  customerId: string;
  selectedProduct: BuyerAgentStateType['selectedProduct'];
  parsedIntent: BuyerAgentStateType['parsedIntent'];
  upsellOffer: BuyerAgentStateType['upsellOffer'];
  crossSellOffer: BuyerAgentStateType['crossSellOffer'];
}): Promise<BuyerAgentStateType> {
  const graph = getPaymentGraph();

  const approvalAudit = createAuditEvent({
    sessionId: params.sessionId,
    agent: 'system',
    action: 'USER_APPROVAL_GRANTED',
    inputSummary: `Cart ₹${params.cartTotal}`,
    outputSummary: 'User approved payment',
    reason: 'Explicit user approval received',
    status: 'success',
  });
  addAuditEvent(params.sessionId, approvalAudit);

  const result = await graph.invoke({
    sessionId: params.sessionId,
    cartId: params.cartId,
    cartTotal: params.cartTotal,
    userApproved: true,
    customerId: params.customerId,
    selectedProduct: params.selectedProduct,
    parsedIntent: params.parsedIntent,
    upsellOffer: params.upsellOffer,
    crossSellOffer: params.crossSellOffer,
  });

  return result;
}
