import { NextRequest, NextResponse } from 'next/server';
import { runMerchantAgent } from '@/lib/agents/merchant-graph';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Merchant Growth Agent endpoint.
 * 
 * POST /api/agent/merchant
 * Body: { sessionId, customerId, customerGoal, customerBudget, merchantId, productId, productName, productPrice }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, customerId, customerGoal, customerBudget, merchantId, productId, productName, productPrice } = body;

    if (!sessionId || !merchantId || !productId) {
      return NextResponse.json(
        { error: 'sessionId, merchantId, and productId are required' },
        { status: 400 }
      );
    }

    const result = await runMerchantAgent({
      sessionId,
      customerId: customerId || 'customer-alex',
      customerGoal: customerGoal || 'general health',
      customerBudget: customerBudget || 5000,
      merchantId,
      productId,
      productName: productName || productId,
      productPrice: productPrice || 0,
    });

    return NextResponse.json({
      success: true,
      upsellOffer: result.upsellOffer,
      crossSellOffer: result.crossSellOffer,
      auditTrail: result.auditTrail,
    });
  } catch (error) {
    console.error('Merchant agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error', success: false },
      { status: 500 }
    );
  }
}
