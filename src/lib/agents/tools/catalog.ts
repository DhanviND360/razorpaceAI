import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getAllMerchants } from '../../data/merchants';
import { allProducts } from '../../data/products';
import { evaluateCatalog } from '../../catalog/evaluator';

export const discoverMerchants = tool(
  async () => {
    const merchants = getAllMerchants();
    return JSON.stringify({
      merchants: merchants.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        category: m.category,
        aiReadable: m.aiReadable,
        transactionReady: m.transactionReady,
        catalogEndpoint: m.catalogEndpoint || null,
        productCount: (allProducts[m.id] || []).length,
      })),
      totalCount: merchants.length,
    });
  },
  {
    name: 'discover_merchants',
    description: 'Discover all available merchants in the ecosystem. Returns basic info about each merchant including AI-readability level and transaction capability.',
    schema: z.object({}),
  }
);

export const evaluateMerchantCatalog = tool(
  async (input) => {
    const merchants = getAllMerchants();
    const merchant = merchants.find(m => m.id === input.merchantId);
    if (!merchant) {
      return JSON.stringify({ error: 'Merchant not found', merchantId: input.merchantId });
    }
    
    const score = evaluateCatalog(merchant);
    return JSON.stringify(score);
  },
  {
    name: 'evaluate_merchant_catalog',
    description: 'Evaluate a merchant catalog for AI-readability on a 0-100 scale. Returns score breakdown across 10 dimensions and whether the merchant is AI-ready for transactions.',
    schema: z.object({
      merchantId: z.string().describe('The merchant ID to evaluate'),
    }),
  }
);

export const evaluateAllCatalogs = tool(
  async () => {
    const merchants = getAllMerchants();
    const evaluations = merchants.map(m => {
      const score = evaluateCatalog(m);
      return {
        merchantId: m.id,
        merchantName: m.name,
        overallScore: score.overallScore,
        aiReadinessScore: score.aiReadinessScore,
        commerceReadinessScore: score.commerceReadinessScore,
        aiReady: score.aiReady,
        commerceReady: score.commerceReady,
        isFullyTransactable: score.isFullyTransactable,
        transactionReady: m.transactionReady,
        transactabilityBlockers: score.transactabilityBlockers,
        recommendation: score.recommendation,
      };
    });

    // Sort by score descending
    evaluations.sort((a, b) => b.overallScore - a.overallScore);

    return JSON.stringify({
      evaluations,
      aiReadyCount: evaluations.filter(e => e.aiReady).length,
      fullyTransactableCount: evaluations.filter(e => e.isFullyTransactable).length,
      totalCount: evaluations.length,
      rejectedMerchants: evaluations.filter(e => !e.isFullyTransactable).map(e => ({
        id: e.merchantId,
        name: e.merchantName,
        score: e.overallScore,
        reason: e.transactabilityBlockers.length > 0
          ? `${e.transactabilityBlockers[0].issue} (Fix: ${e.transactabilityBlockers[0].remedy})`
          : e.recommendation,
      })),
    });
  },
  {
    name: 'evaluate_all_catalogs',
    description: 'Evaluate ALL merchant catalogs at once. Returns ranked scores and identifies which merchants are AI-ready vs rejected.',
    schema: z.object({}),
  }
);
