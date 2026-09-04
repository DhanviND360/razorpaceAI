import { Cart } from '../schemas/cart';
import { Order } from '../schemas/order';
import { AuditEvent } from '../schemas/audit';

/**
 * In-memory session store.
 * All state is lost on server restart — acceptable for hackathon demo.
 * Each "session" is keyed by a sessionId passed from the client.
 */

interface SessionData {
  carts: Map<string, Cart>;
  orders: Order[];
  auditEvents: AuditEvent[];
  agentState: Record<string, unknown>;
}

const sessions = new Map<string, SessionData>();

function getOrCreateSession(sessionId: string): SessionData {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      carts: new Map(),
      orders: [],
      auditEvents: [],
      agentState: {},
    });
  }
  return sessions.get(sessionId)!;
}

// Cart operations
export function getCart(sessionId: string, cartId: string): Cart | undefined {
  return getOrCreateSession(sessionId).carts.get(cartId);
}

export function saveCart(sessionId: string, cart: Cart): void {
  getOrCreateSession(sessionId).carts.set(cart.id, cart);
}

export function deleteCart(sessionId: string, cartId: string): void {
  getOrCreateSession(sessionId).carts.delete(cartId);
}

// Order operations
export function getOrders(sessionId: string): Order[] {
  return getOrCreateSession(sessionId).orders;
}

export function addOrder(sessionId: string, order: Order): void {
  getOrCreateSession(sessionId).orders.push(order);
}

export function updateOrder(sessionId: string, orderId: string, updates: Partial<Order>): Order | undefined {
  const session = getOrCreateSession(sessionId);
  const idx = session.orders.findIndex(o => o.id === orderId);
  if (idx === -1) return undefined;
  session.orders[idx] = { ...session.orders[idx], ...updates, updatedAt: new Date().toISOString() };
  return session.orders[idx];
}

export function getOrderByRazorpayId(sessionId: string, razorpayOrderId: string): Order | undefined {
  return getOrCreateSession(sessionId).orders.find(o => o.razorpayOrderId === razorpayOrderId);
}

// Audit operations
export function getAuditEvents(sessionId: string): AuditEvent[] {
  return getOrCreateSession(sessionId).auditEvents;
}

export function addAuditEvent(sessionId: string, event: AuditEvent): void {
  getOrCreateSession(sessionId).auditEvents.push(event);
}

export function clearAuditEvents(sessionId: string): void {
  getOrCreateSession(sessionId).auditEvents = [];
}

// Agent state (for LangGraph checkpointing within a session)
export function getAgentState(sessionId: string, agentId: string): unknown {
  return getOrCreateSession(sessionId).agentState[agentId];
}

export function saveAgentState(sessionId: string, agentId: string, state: unknown): void {
  getOrCreateSession(sessionId).agentState[agentId] = state;
}

// Get all sessions (for analytics)
export function getAllSessions(): Map<string, SessionData> {
  return sessions;
}

// Get all orders across all sessions (for analytics)
export function getAllOrders(): Order[] {
  const allOrders: Order[] = [];
  for (const session of sessions.values()) {
    allOrders.push(...session.orders);
  }
  return allOrders;
}

// Get all audit events across all sessions
export function getAllAuditEvents(): AuditEvent[] {
  const allEvents: AuditEvent[] = [];
  for (const session of sessions.values()) {
    allEvents.push(...session.auditEvents);
  }
  return allEvents;
}
