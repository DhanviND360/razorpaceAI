import { StateGraph } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MerchantAgentState, MerchantAgentStateType } from './state';
import { getLLM } from './llm';
import { generateUpsellCandidates, generateCrossSellCandidates } from './tools/recommendations';
import { getCustomerProfile, getPurchaseHistory } from './tools/customer';
import { getProduct } from './tools/search';
import { getMerchantPolicy } from './tools/policy';
import { createAuditEvent } from '../schemas/audit';

const MERCHANT_SYSTEM_PROMPT = `You are the Merchant Growth Agent for a wellness/nutrition merchant.

Your GOAL is to increase merchant revenue through intelligent, legitimate upselling and cross-selling — while RESPECTING the customer's intent, budget, and preferences.

RULES:
1. ONLY recommend products that are genuinely relevant to the customer's stated goal
2. NEVER recommend an irrelevant expensive product just because it has higher margin
3. Upsell = recommend a BETTER version in the SAME category (e.g., regular → premium)
4. Cross-sell = recommend a COMPLEMENTARY product from a DIFFERENT category
5. ALWAYS explain WHY each recommendation is made
6. ALWAYS respect the customer's budget — don't upsell if it would exceed budget
7. Consider purchase history — don't recommend what they already bought recently
8. Check stock availability before recommending

For each recommendation, provide a structured explanation:
- What: The product being recommended
- Why: Specific reasons (better ingredients, higher protein, complements workout, etc.)
- Value: What the customer gains
- Price impact: How much more they'd spend

Be a helpful advisor, not a pushy salesperson.`;

async function analyzeCustomerContext(state: MerchantAgentStateType) {
  const llm = getLLM();

  // Gather customer data using tools
  const profileResult = await getCustomerProfile.invoke({ customerId: state.customerId });
  const historyResult = await getPurchaseHistory.invoke({ customerId: state.customerId });
  const productResult = await getProduct.invoke({ productId: state.productId, merchantId: state.merchantId });
  const policyResult = await getMerchantPolicy.invoke({ merchantId: state.merchantId });

  const prompt = `Analyze this customer context for making upsell/cross-sell recommendations:

Customer Profile: ${profileResult}
Purchase History: ${historyResult}
Current Product: ${productResult}
Merchant Policies: ${policyResult}
Customer Goal: ${state.customerGoal}
Customer Budget: ₹${state.customerBudget}

Summarize:
1. What the customer wants
2. What they've bought before
3. What would be genuinely helpful to recommend
4. Budget constraints to respect`;

  let outputPreview = `Analyzed context for customer ${state.customerId}: goal ${state.customerGoal}, budget ₹${state.customerBudget}`;
  try {
    const response = await llm.invoke([
      new SystemMessage(MERCHANT_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    if (typeof response.content === 'string' && response.content.trim()) {
      outputPreview = response.content.replace(/\n+/g, ' ').substring(0, 120);
    }
  } catch (err) {
    console.warn('customerContextAnalysis LLM notice:', err instanceof Error ? err.message : err);
  }

  const audit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'merchant',
    action: 'CUSTOMER_CONTEXT_ANALYSIS',
    tool: 'get_customer_profile, get_purchase_history',
    inputSummary: `Customer ${state.customerId}, Product ${state.productName}, Budget ₹${state.customerBudget}`,
    outputSummary: outputPreview,
    reason: 'Understanding customer needs before making recommendations',
    status: 'success',
  });

  return {
    currentStep: 'context_analyzed',
    auditTrail: [audit],
  };
}

async function generateUpsell(state: MerchantAgentStateType) {
  const llm = getLLM();

  const upsellResult = await generateUpsellCandidates.invoke({
    productId: state.productId,
    merchantId: state.merchantId,
    customerGoal: state.customerGoal,
    budget: state.customerBudget,
  });

  const candidates = JSON.parse(upsellResult);

  if (candidates.count === 0) {
    const audit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'merchant',
      action: 'UPSELL_SKIP',
      inputSummary: `No upsell candidates for ${state.productName}`,
      outputSummary: 'No higher-value alternatives available in same category',
      reason: 'No suitable upsell products found',
      status: 'skipped',
    });
    return { upsellOffer: null, upsellCandidates: [], currentStep: 'upsell_done', auditTrail: [audit] };
  }

  // LLM selects the best upsell
  const prompt = `Select the BEST upsell recommendation from these candidates for a customer with goal "${state.customerGoal}" and budget ₹${state.customerBudget}.

Current product: ${state.productName} at ₹${state.productPrice}
Candidates: ${JSON.stringify(candidates.candidates, null, 2)}

Rules:
- The upsell total must still be within budget (₹${state.customerBudget})
- Pick the one most relevant to "${state.customerGoal}"
- Consider the customer already has ${state.productName}

Respond in JSON format:
{
  "selectedProductId": "...",
  "selectedProductName": "...",
  "selectedProductPrice": ...,
  "priceDelta": ...,
  "reason": "A 2-3 sentence explanation of WHY this is a better choice for the customer's specific goal",
  "valueProposition": "What specific benefit the customer gets"
}`;

  let upsellOffer = null;
  try {
    const response = await llm.invoke([
      new SystemMessage(MERCHANT_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.selectedProductId && parsed.selectedProductPrice <= state.customerBudget) {
        upsellOffer = {
          productId: parsed.selectedProductId,
          name: parsed.selectedProductName,
          price: parsed.selectedProductPrice,
          priceDelta: parsed.priceDelta,
          reason: parsed.reason,
        };
      }
    }
  } catch (err) {
    console.warn('generateUpsell LLM notice:', err instanceof Error ? err.message : err);
    const candidate = candidates.candidates.find((c: { price: number }) => c.price <= state.customerBudget);
    if (candidate) {
      upsellOffer = {
        productId: candidate.id,
        name: candidate.name,
        price: candidate.price,
        priceDelta: candidate.price - state.productPrice,
        reason: `Recommended premium upgrade matching ${state.customerGoal}`,
      };
    }
  }

  const audit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'merchant',
    action: 'UPSELL_GENERATED',
    tool: 'generate_upsell_candidates',
    inputSummary: `${candidates.count} upsell candidates for ${state.productName}`,
    outputSummary: upsellOffer
      ? `Recommended: ${upsellOffer.name} at ₹${upsellOffer.price} (+₹${upsellOffer.priceDelta})`
      : 'No suitable upsell within budget',
    reason: upsellOffer?.reason || 'No upsell fits budget/relevance criteria',
    status: upsellOffer ? 'success' : 'skipped',
  });

  return {
    upsellOffer,
    upsellCandidates: candidates.candidates || [],
    currentStep: 'upsell_done',
    auditTrail: [audit],
  };
}

async function generateCrossSell(state: MerchantAgentStateType) {
  const llm = getLLM();

  // Calculate remaining budget after current product (and upsell if accepted)
  const currentProductPrice = state.upsellOffer ? state.upsellOffer.price : state.productPrice;
  const remainingBudget = state.customerBudget - currentProductPrice;

  if (remainingBudget <= 0) {
    const audit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'merchant',
      action: 'CROSS_SELL_SKIP',
      inputSummary: `No budget remaining for cross-sell (₹${remainingBudget})`,
      outputSummary: 'Skipped cross-sell — no remaining budget',
      reason: 'Customer budget fully consumed by primary product',
      status: 'skipped',
    });
    return { crossSellOffer: null, crossSellCandidates: [], currentStep: 'cross_sell_done', auditTrail: [audit] };
  }

  const crossSellResult = await generateCrossSellCandidates.invoke({
    productId: state.productId,
    merchantId: state.merchantId,
    customerGoal: state.customerGoal,
    budget: remainingBudget,
  });

  const candidates = JSON.parse(crossSellResult);

  if (candidates.count === 0) {
    const audit = createAuditEvent({
      sessionId: state.sessionId,
      agent: 'merchant',
      action: 'CROSS_SELL_SKIP',
      inputSummary: `No cross-sell candidates for ${state.productName}`,
      outputSummary: 'No complementary products found',
      status: 'skipped',
    });
    return { crossSellOffer: null, crossSellCandidates: [], currentStep: 'cross_sell_done', auditTrail: [audit] };
  }

  // Filter to products within remaining budget
  const affordableCandidates = candidates.candidates.filter(
    (c: { price: number }) => c.price <= remainingBudget
  );

  if (affordableCandidates.length === 0) {
    return { crossSellOffer: null, crossSellCandidates: [], currentStep: 'cross_sell_done', auditTrail: [] };
  }

  const prompt = `Select the BEST cross-sell (complementary product) for a customer buying "${state.productName}" with goal "${state.customerGoal}".

Remaining budget: ₹${remainingBudget}
Affordable candidates: ${JSON.stringify(affordableCandidates, null, 2)}

Rules:
- Must be within remaining budget ₹${remainingBudget}
- Must genuinely complement the primary product
- Must be relevant to "${state.customerGoal}"

Respond in JSON:
{
  "selectedProductId": "...",
  "selectedProductName": "...",
  "selectedProductPrice": ...,
  "reason": "2-3 sentence explanation of how this complements the primary product for the customer's goal"
}`;

  let crossSellOffer = null;
  try {
    const response = await llm.invoke([
      new SystemMessage(MERCHANT_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.selectedProductId && parsed.selectedProductPrice <= remainingBudget) {
        crossSellOffer = {
          productId: parsed.selectedProductId,
          name: parsed.selectedProductName,
          price: parsed.selectedProductPrice,
          reason: parsed.reason,
        };
      }
    }
  } catch (err) {
    console.warn('generateCrossSell LLM notice:', err instanceof Error ? err.message : err);
    const candidate = affordableCandidates[0];
    if (candidate) {
      crossSellOffer = {
        productId: candidate.id,
        name: candidate.name,
        price: candidate.price,
        reason: `Complementary addition within remaining budget for ${state.customerGoal}`,
      };
    }
  }

  const audit = createAuditEvent({
    sessionId: state.sessionId,
    agent: 'merchant',
    action: 'CROSS_SELL_GENERATED',
    tool: 'generate_cross_sell_candidates',
    inputSummary: `${affordableCandidates.length} affordable cross-sell candidates (budget: ₹${remainingBudget})`,
    outputSummary: crossSellOffer
      ? `Recommended: ${crossSellOffer.name} at ₹${crossSellOffer.price}`
      : 'No suitable cross-sell found',
    reason: crossSellOffer?.reason || 'No cross-sell fits criteria',
    status: crossSellOffer ? 'success' : 'skipped',
  });

  return {
    crossSellOffer,
    crossSellCandidates: affordableCandidates,
    currentStep: 'cross_sell_done',
    auditTrail: [audit],
  };
}

// Build the Merchant Growth Agent graph
function buildMerchantGraph() {
  const graph = new StateGraph(MerchantAgentState)
    .addNode('analyzeContext', analyzeCustomerContext)
    .addNode('generateUpsell', generateUpsell)
    .addNode('generateCrossSell', generateCrossSell)
    .addEdge('__start__', 'analyzeContext')
    .addEdge('analyzeContext', 'generateUpsell')
    .addEdge('generateUpsell', 'generateCrossSell')
    .addEdge('generateCrossSell', '__end__');

  return graph.compile();
}

let merchantGraph: ReturnType<typeof buildMerchantGraph> | null = null;

export function getMerchantGraph() {
  if (!merchantGraph) {
    merchantGraph = buildMerchantGraph();
  }
  return merchantGraph;
}

export type MerchantGraphResult = {
  upsellOffer: MerchantAgentStateType['upsellOffer'];
  crossSellOffer: MerchantAgentStateType['crossSellOffer'];
  auditTrail: MerchantAgentStateType['auditTrail'];
};

/**
 * Run the Merchant Growth Agent for a given product + customer context.
 * Returns upsell and cross-sell recommendations.
 */
export async function runMerchantAgent(params: {
  sessionId: string;
  customerId: string;
  customerGoal: string;
  customerBudget: number;
  merchantId: string;
  productId: string;
  productName: string;
  productPrice: number;
}): Promise<MerchantGraphResult> {
  const graph = getMerchantGraph();

  const result = await graph.invoke({
    sessionId: params.sessionId,
    customerId: params.customerId,
    customerGoal: params.customerGoal,
    customerBudget: params.customerBudget,
    merchantId: params.merchantId,
    productId: params.productId,
    productName: params.productName,
    productPrice: params.productPrice,
  });

  return {
    upsellOffer: result.upsellOffer,
    crossSellOffer: result.crossSellOffer,
    auditTrail: result.auditTrail,
  };
}
