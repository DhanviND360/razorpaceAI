import { NextRequest, NextResponse } from 'next/server';
import { getMerchantById, getAllMerchants } from '@/lib/data/merchants';
import { allProducts } from '@/lib/data/products';
import { evaluateCatalog } from '@/lib/catalog/evaluator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog/evaluate?merchant=herbamed
 * 
 * If no merchant specified, evaluates all merchants.
 */
export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get('merchant');

  if (merchantId) {
    const merchant = getMerchantById(merchantId);
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }
    const products = allProducts[merchantId] || [];
    const score = evaluateCatalog(merchant, products);
    return NextResponse.json(score);
  }

  // Evaluate all
  const merchants = getAllMerchants();
  const evaluations = merchants.map(m => {
    const products = allProducts[m.id] || [];
    return evaluateCatalog(m, products);
  });

  evaluations.sort((a, b) => b.overallScore - a.overallScore);

  return NextResponse.json({
    evaluations,
    summary: {
      totalMerchants: evaluations.length,
      aiReadyCount: evaluations.filter(e => e.aiReady).length,
      averageScore: Math.round(evaluations.reduce((s, e) => s + e.overallScore, 0) / evaluations.length),
      topMerchant: evaluations[0]?.merchantName || 'None',
    },
  });
}
