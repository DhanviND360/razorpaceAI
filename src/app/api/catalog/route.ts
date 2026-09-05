import { NextResponse } from 'next/server';
import { getAllMerchants } from '@/lib/data/merchants';
import { allProducts } from '@/lib/data/products';
import { evaluateCatalog } from '@/lib/catalog/evaluator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog — list all merchants with catalog summaries
 */
export async function GET() {
  const merchants = getAllMerchants();

  const catalogList = merchants.map(m => {
    const products = allProducts[m.id] || [];
    const evaluation = evaluateCatalog(m, products);

    return {
      merchantId: m.id,
      merchantName: m.name,
      description: m.description,
      aiReadable: m.aiReadable,
      transactionReady: m.transactionReady,
      catalogEndpoint: m.catalogEndpoint,
      productCount: products.length,
      catalogScore: evaluation.overallScore,
      aiReadinessScore: evaluation.aiReadinessScore,
      commerceReadinessScore: evaluation.commerceReadinessScore,
      aiReady: evaluation.aiReady,
      commerceReady: evaluation.commerceReady,
      isFullyTransactable: evaluation.isFullyTransactable,
      dimensions: evaluation.dimensions,
      transactabilityBlockers: evaluation.transactabilityBlockers,
      recommendation: evaluation.recommendation,
    };
  });

  return NextResponse.json({
    merchants: catalogList,
    totalMerchants: catalogList.length,
    aiReadyCount: catalogList.filter(c => c.aiReady).length,
    fullyTransactableCount: catalogList.filter(c => c.isFullyTransactable).length,
  });
}
