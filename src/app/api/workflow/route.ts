import { NextResponse } from 'next/server';
import { getAllAuditEvents, getAllOrders } from '@/lib/data/store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflow
 * Aggregates audit events and orders across all sessions,
 * groups by agent, and computes live status metrics.
 */
export async function GET() {
  try {
    const allEvents = getAllAuditEvents();
    const allOrders = getAllOrders();

    // Agent definitions with their roles in the system
    const agentDefinitions = [
      { id: 'buyer', name: 'Buyer Agent', role: 'Intent extraction, merchant discovery, product selection', color: '#6366f1' },
      { id: 'merchant', name: 'Merchant Growth Agent', role: 'Revenue optimization, upsell/cross-sell orchestration', color: '#10b981' },
      { id: 'policy', name: 'Policy Engine', role: 'Deterministic financial safety gates', color: '#f59e0b' },
      { id: 'system', name: 'Settlement Engine', role: 'Razorpay payment verification & order capture', color: '#3b82f6' },
    ];

    // Compute per-agent metrics
    const agentMetrics = agentDefinitions.map(def => {
      const events = allEvents.filter(e => e.agent === def.id);
      const successEvents = events.filter(e => e.status === 'success');
      const blockedEvents = events.filter(e => e.status === 'blocked' || e.status === 'failed');
      const lastEvent = events.length > 0 ? events[events.length - 1] : null;

      return {
        ...def,
        totalActions: events.length,
        successCount: successEvents.length,
        blockedCount: blockedEvents.length,
        successRate: events.length > 0 ? Math.round((successEvents.length / events.length) * 100) : 0,
        lastAction: lastEvent?.action || null,
        lastTimestamp: lastEvent?.timestamp || null,
        lastOutput: lastEvent?.outputSummary || null,
        status: lastEvent ? (Date.now() - new Date(lastEvent.timestamp).getTime() < 60000 ? 'active' : 'idle') : 'idle',
        recentEvents: events.slice(-5).reverse(),
      };
    });

    // Compute inter-agent connections from state transitions
    const connections = allEvents
      .filter(e => e.nextState)
      .map(e => ({
        from: e.agent,
        action: e.action,
        to: e.nextState!,
        timestamp: e.timestamp,
        status: e.status,
      }));

    // Recent timeline (last 20 events, newest first)
    const timeline = allEvents.slice(-20).reverse().map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      agent: e.agent,
      action: e.action,
      tool: e.tool,
      input: e.inputSummary,
      output: e.outputSummary,
      status: e.status,
      policyResult: e.policyResult,
      nextState: e.nextState,
    }));

    // Order summary
    const orderSummary = {
      total: allOrders.length,
      confirmed: allOrders.filter(o => o.orderStatus === 'confirmed').length,
      totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
      upsellRevenue: allOrders.reduce((sum, o) => sum + (o.upsellRevenue || 0), 0),
      crossSellRevenue: allOrders.reduce((sum, o) => sum + (o.crossSellRevenue || 0), 0),
    };

    return NextResponse.json({
      agents: agentMetrics,
      connections,
      timeline,
      orderSummary,
      totalEvents: allEvents.length,
    });
  } catch (error) {
    console.error('Workflow API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
