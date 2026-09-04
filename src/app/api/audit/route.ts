import { NextRequest, NextResponse } from 'next/server';
import { getAuditEvents, getAllAuditEvents } from '@/lib/data/store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audit?sessionId=xxx
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (sessionId) {
    const events = getAuditEvents(sessionId);
    return NextResponse.json({ events, count: events.length, sessionId });
  }

  const allEvents = getAllAuditEvents();
  return NextResponse.json({ events: allEvents, count: allEvents.length });
}
