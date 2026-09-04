import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getAllOrders } from '@/lib/data/store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders?sessionId=xxx
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (sessionId) {
    const orders = getOrders(sessionId);
    return NextResponse.json({ orders, count: orders.length });
  }

  // Return all orders (for analytics)
  const allOrders = getAllOrders();
  return NextResponse.json({ orders: allOrders, count: allOrders.length });
}
