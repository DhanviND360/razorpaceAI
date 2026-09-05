import { Product } from '../schemas/product';
import { Merchant } from '../schemas/merchant';
import { allProducts } from '../data/products';

export interface TransactabilityBlocker {
  type: 'AI_READINESS' | 'COMMERCE_READINESS';
  issue: string;
  remedy: string;
  severity: 'blocker' | 'warning';
}

export interface CatalogScore {
  merchantId: string;
  merchantName: string;
  overallScore: number;
  aiReadinessScore: number;
  commerceReadinessScore: number;
  aiReady: boolean;
  commerceReady: boolean;
  isFullyTransactable: boolean;
  dimensions: CatalogDimension[];
  transactabilityBlockers: TransactabilityBlocker[];
  recommendation: string;
}

export interface CatalogDimension {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  details: string;
  category: 'ai' | 'commerce';
}

/**
 * Evaluates a merchant's catalog:
 * 1. AI READINESS: "Can an AI reliably understand this merchant?"
 * 2. COMMERCE READINESS: "Can an AI reliably complete a transaction with this merchant?"
 * 3. Identifies exact transactability blockers.
 */
export function evaluateCatalog(merchant: Merchant, products?: Product[]): CatalogScore {
  const catalog = products || allProducts[merchant.id] || [];
  const dimensions: CatalogDimension[] = [];

  // ==========================================
  // AI READINESS DIMENSIONS (Max 70 points)
  // ==========================================
  // 1. Product Structure (15 points)
  const structureScore = evaluateProductStructure(catalog);
  dimensions.push({ name: 'Product Structure', score: structureScore, maxScore: 15, weight: 15, details: `${catalog.length} products with structural completeness`, category: 'ai' });

  // 2. Attribute Completeness (10 points)
  const attrScore = evaluateAttributes(catalog);
  dimensions.push({ name: 'Attribute Completeness', score: attrScore, maxScore: 10, weight: 10, details: 'Product attributes, variants detail', category: 'ai' });

  // 3. Price Clarity (15 points)
  const priceScore = evaluatePriceClarity(catalog);
  dimensions.push({ name: 'Price Clarity', score: priceScore, maxScore: 15, weight: 15, details: 'Clear pricing with currency', category: 'ai' });

  // 4. Variants (10 points)
  const variantScore = evaluateVariants(catalog);
  dimensions.push({ name: 'Variants', score: variantScore, maxScore: 10, weight: 10, details: 'Size/flavor/option variants', category: 'ai' });

  // 5. Reviews (10 points)
  const reviewScore = evaluateReviews(catalog);
  dimensions.push({ name: 'Reviews', score: reviewScore, maxScore: 10, weight: 10, details: 'Rating and review data', category: 'ai' });

  // 6. Machine-readable Endpoints (5 points)
  const endpointScore = evaluateEndpoints(merchant);
  dimensions.push({ name: 'Machine-readable Endpoints', score: endpointScore, maxScore: 5, weight: 5, details: 'Structured API availability', category: 'ai' });

  // 7. Data Completeness (5 points)
  const completenessScore = evaluateDataCompleteness(catalog);
  dimensions.push({ name: 'Data Completeness', score: completenessScore, maxScore: 5, weight: 5, details: 'Overall field fill rate', category: 'ai' });

  // ==========================================
  // COMMERCE READINESS DIMENSIONS (Max 30 points)
  // ==========================================
  // 8. Inventory Tracking (10 points)
  const inventoryScore = evaluateInventory(catalog);
  dimensions.push({ name: 'Inventory', score: inventoryScore, maxScore: 10, weight: 10, details: 'Stock level tracking', category: 'commerce' });

  // 9. Policies & Limits (10 points)
  const policyScore = evaluatePolicies(merchant);
  dimensions.push({ name: 'Policies', score: policyScore, maxScore: 10, weight: 10, details: 'Return, shipping, discount policies', category: 'commerce' });

  // 10. Transaction Capability (10 points)
  const txScore = evaluateTransactionCapability(merchant);
  dimensions.push({ name: 'Transaction Capability', score: txScore, maxScore: 10, weight: 10, details: 'Can accept programmatic orders via Razorpay', category: 'commerce' });

  // Calculate separate scores
  const aiRawScore = structureScore + attrScore + priceScore + variantScore + reviewScore + endpointScore + completenessScore;
  const aiReadinessScore = Math.min(100, Math.round((aiRawScore / 70) * 100));

  const commerceRawScore = inventoryScore + policyScore + txScore;
  const commerceReadinessScore = Math.min(100, Math.round((commerceRawScore / 30) * 100));

  const overallScore = Math.round(aiRawScore + commerceRawScore);

  const aiReady = aiReadinessScore >= 60;
  const commerceReady = commerceReadinessScore >= 60 && merchant.transactionReady && merchant.supportedPaymentMethods.includes('razorpay');
  const isFullyTransactable = aiReady && commerceReady;

  // Pinpoint exact transactability blockers
  const transactabilityBlockers: TransactabilityBlocker[] = [];

  if (!merchant.transactionReady) {
    transactabilityBlockers.push({
      type: 'COMMERCE_READINESS',
      issue: 'Programmatic checkout disabled (transactionReady is false)',
      remedy: 'Enable automated agent checkout in merchant operator settings',
      severity: 'blocker',
    });
  }

  if (!merchant.supportedPaymentMethods.includes('razorpay')) {
    transactabilityBlockers.push({
      type: 'COMMERCE_READINESS',
      issue: 'No Razorpay payment rails configured',
      remedy: 'Connect Razorpay API credentials to enable instant bounded order settlement',
      severity: 'blocker',
    });
  }

  if (!merchant.catalogEndpoint) {
    transactabilityBlockers.push({
      type: 'COMMERCE_READINESS',
      issue: 'Missing machine-readable catalog endpoint',
      remedy: 'Expose standardized /api/agent/catalog REST or MCP endpoint',
      severity: 'blocker',
    });
  }

  if (inventoryScore < 7) {
    transactabilityBlockers.push({
      type: 'COMMERCE_READINESS',
      issue: 'Incomplete or unverified inventory stock tracking',
      remedy: 'Sync real-time warehouse inventory to avoid out-of-stock payment failures',
      severity: 'blocker',
    });
  }

  if (attrScore < 6) {
    transactabilityBlockers.push({
      type: 'AI_READINESS',
      issue: 'Sparse structured product attributes (<3 per item)',
      remedy: 'Add structured nutrition/formulation key-value specs for agent reasoning',
      severity: 'warning',
    });
  }

  if (variantScore < 5) {
    transactabilityBlockers.push({
      type: 'AI_READINESS',
      issue: 'Missing SKU variants (flavors, weights, pack sizes)',
      remedy: 'Define structured variants to prevent agent guessing',
      severity: 'warning',
    });
  }

  if (priceScore < 10) {
    transactabilityBlockers.push({
      type: 'AI_READINESS',
      issue: 'Inconsistent pricing or currency specification',
      remedy: 'Publish explicit prices in INR with tax transparency',
      severity: 'blocker',
    });
  }

  let recommendation: string;
  if (isFullyTransactable) {
    recommendation = 'Fully AI-Transactable: High machine readability and active Razorpay settlement capability.';
  } else if (aiReady && !commerceReady) {
    recommendation = 'AI-Understandable but NOT Transactable: AI can parse catalog, but payments or endpoints are blocked.';
  } else if (!aiReady && commerceReady) {
    recommendation = 'Transactable but Poor AI-Readability: Payment rails exist, but agents struggle to parse catalog data.';
  } else {
    recommendation = 'Legacy Web Store: Unstructured catalog and no programmatic payment capability.';
  }

  return {
    merchantId: merchant.id,
    merchantName: merchant.name,
    overallScore,
    aiReadinessScore,
    commerceReadinessScore,
    aiReady,
    commerceReady,
    isFullyTransactable,
    dimensions,
    transactabilityBlockers,
    recommendation,
  };
}

function evaluateProductStructure(products: Product[]): number {
  if (products.length === 0) return 0;
  let score = 0;
  const maxPerProduct = 15 / products.length;

  for (const p of products) {
    let productScore = 0;
    if (p.id) productScore += 0.2;
    if (p.name && p.name.length > 3) productScore += 0.2;
    if (p.description && p.description.length > 20) productScore += 0.3;
    if (p.category) productScore += 0.15;
    if (p.subcategory) productScore += 0.15;
    score += productScore * maxPerProduct;
  }
  return Math.min(15, Math.round(score * 10) / 10);
}

function evaluateAttributes(products: Product[]): number {
  if (products.length === 0) return 0;
  let totalAttrs = 0;
  for (const p of products) {
    totalAttrs += p.attributes.length;
  }
  const avgAttrs = totalAttrs / products.length;
  // 3+ attributes per product = full score
  return Math.min(10, Math.round((avgAttrs / 3) * 10 * 10) / 10);
}

function evaluatePriceClarity(products: Product[]): number {
  if (products.length === 0) return 0;
  let validPrices = 0;
  for (const p of products) {
    if (p.price > 0 && p.currency) validPrices++;
  }
  return Math.round((validPrices / products.length) * 15 * 10) / 10;
}

function evaluateInventory(products: Product[]): number {
  if (products.length === 0) return 0;
  let validStock = 0;
  for (const p of products) {
    if (p.stock >= 0) validStock++;
  }
  return Math.round((validStock / products.length) * 10 * 10) / 10;
}

function evaluateVariants(products: Product[]): number {
  if (products.length === 0) return 0;
  let withVariants = 0;
  for (const p of products) {
    if (p.variants.length > 0) withVariants++;
  }
  return Math.round((withVariants / products.length) * 10 * 10) / 10;
}

function evaluateReviews(products: Product[]): number {
  if (products.length === 0) return 0;
  let withReviews = 0;
  for (const p of products) {
    if (p.reviews.rating > 0 && p.reviews.reviewCount > 0) withReviews++;
  }
  return Math.round((withReviews / products.length) * 10 * 10) / 10;
}

function evaluatePolicies(merchant: Merchant): number {
  let score = 0;
  const p = merchant.policies;
  if (p.returnWindowDays > 0) score += 2;
  if (p.freeShippingAbove !== undefined) score += 1.5;
  if (p.maxDiscountPercent > 0) score += 1.5;
  if (p.minOrderValue !== undefined) score += 1;
  if (p.maxOrderValue !== undefined) score += 1;
  if (p.shippingCost !== undefined) score += 1;
  if (p.codAvailable !== undefined) score += 1;
  if (p.upsellEnabled || p.crossSellEnabled) score += 1;
  return Math.min(10, Math.round(score * 10) / 10);
}

function evaluateTransactionCapability(merchant: Merchant): number {
  let score = 0;
  if (merchant.transactionReady) score += 5;
  if (merchant.supportedPaymentMethods.length > 0) score += 3;
  if (merchant.supportedPaymentMethods.includes('razorpay')) score += 2;
  return Math.min(10, score);
}

function evaluateEndpoints(merchant: Merchant): number {
  let score = 0;
  if (merchant.catalogEndpoint) score += 3;
  if (merchant.website) score += 2;
  return Math.min(5, score);
}

function evaluateDataCompleteness(products: Product[]): number {
  if (products.length === 0) return 0;
  let totalFields = 0;
  let filledFields = 0;

  for (const p of products) {
    const fields = [
      p.id, p.name, p.description, p.category,
      p.price > 0, p.currency, p.stock >= 0,
      p.variants.length > 0, p.attributes.length > 0,
      p.reviews.rating > 0, p.reviews.reviewCount > 0,
      p.relatedProducts.length > 0, p.compatibilityTags.length > 0,
    ];
    totalFields += fields.length;
    filledFields += fields.filter(Boolean).length;
  }

  return Math.round((filledFields / totalFields) * 5 * 10) / 10;
}
