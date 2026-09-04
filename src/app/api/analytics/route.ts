import { NextResponse } from 'next/server';
import { calculateAnalytics } from '@/lib/analytics/calculator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics
 */
export async function GET() {
  const analytics = calculateAnalytics();
  return NextResponse.json(analytics);
}
