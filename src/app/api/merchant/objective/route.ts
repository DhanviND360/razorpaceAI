import { NextRequest, NextResponse } from 'next/server';
import { getMerchantById, updateMerchantObjective } from '@/lib/data/merchants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/merchant/objective?merchantId=herbamed
 * Returns the current merchant objective & policy constraints
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get('merchantId') || 'herbamed';
  const merchant = getMerchantById(merchantId);

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
  }

  return NextResponse.json({
    merchantId: merchant.id,
    merchantName: merchant.name,
    optimizationObjective: merchant.policies.optimizationObjective || 'REVENUE',
    policies: merchant.policies,
  });
}

/**
 * POST /api/merchant/objective
 * Body: { merchantId, objective: 'REVENUE' | 'MARGIN' | 'INVENTORY' | 'RETENTION' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId = 'herbamed', objective } = body;

    const validObjectives = ['REVENUE', 'MARGIN', 'INVENTORY', 'RETENTION'] as const;
    if (!objective || !validObjectives.includes(objective)) {
      return NextResponse.json(
        { error: `Invalid objective. Must be one of: ${validObjectives.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = updateMerchantObjective(merchantId, objective);
    if (!updated) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      merchantId: updated.id,
      merchantName: updated.name,
      optimizationObjective: updated.policies.optimizationObjective,
      message: `Merchant objective updated to ${objective}. Growth engine will now optimize recommendations accordingly.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update objective' },
      { status: 500 }
    );
  }
}
