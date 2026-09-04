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
      dimensions: evaluation.dimensions,
      aiReady: evaluation.aiReady,
      recommendation: evaluation.recommendation,
    };
  });

  return NextResponse.json({
    merchants: catalogList,
    totalMerchants: catalogList.length,
    aiReadyCount: catalogList.filter(c => c.aiReady).length,
  });
}
