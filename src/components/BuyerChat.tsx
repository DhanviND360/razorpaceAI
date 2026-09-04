'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AuditEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  reason?: string;
  status: string;
}

interface AgentResponse {
  success: boolean;
  currentStep: string;
  parsedIntent?: { category: string; budget: number; goal: string; keywords: string[] };
  discoveredMerchants?: Array<{ id: string; name: string; score: number; aiReady: boolean }>;
  validMerchants?: string[];
  rejectedMerchants?: Array<{ id: string; name: string; reason: string }>;
  searchResults?: Array<{ merchantId: string; productId: string; name: string; price: number; rating: number; reviewCount: number }>;
  selectedProduct?: { merchantId: string; productId: string; name: string; price: number; selectionReason: string };
  upsellOffer?: { productId: string; name: string; price: number; priceDelta: number; reason: string; accepted: boolean | null };
  crossSellOffer?: { productId: string; name: string; price: number; reason: string; accepted: boolean | null };
  cartId?: string;
  cartTotal?: number;
  policyResult?: { passed: boolean; status: string; summary: string };
  waitingForUser?: boolean;
  waitingForUserAction?: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  postPurchaseOffer?: string;
  error?: string;
  auditTrail?: AuditEvent[];
}

export default function BuyerChat() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; data?: AgentResponse }>>([]);
  const [agentState, setAgentState] = useState<AgentResponse | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendQuery = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/agent/buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userQuery: userMessage, action: 'query' }),
      });

      const data: AgentResponse = await res.json();
      setAgentState(data);
      setAuditTrail(data.auditTrail || []);

      // Build response message
      let responseContent = '';

      if (data.error) {
        responseContent = `❌ Error: ${data.error}`;
      } else {
        responseContent = formatAgentResponse(data);
      }

      setMessages(prev => [...prev, { role: 'agent', content: responseContent, data }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: `❌ Failed to reach agent: ${err}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId]);

  const approvePayment = async () => {
    if (!agentState?.cartId) return;
    setLoading(true);

    try {
      const res = await fetch('/api/agent/buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'approve_payment',
          cartId: agentState.cartId,
          cartTotal: agentState.cartTotal,
          selectedProduct: agentState.selectedProduct,
          parsedIntent: agentState.parsedIntent,
          upsellOffer: agentState.upsellOffer,
          crossSellOffer: agentState.crossSellOffer,
        }),
      });

      const data: AgentResponse = await res.json();
      setAuditTrail(data.auditTrail || []);

      if (data.razorpayOrderId && data.razorpayKeyId) {
        // Open Razorpay Checkout
        setMessages(prev => [...prev, {
          role: 'agent',
          content: '🔐 Payment approved. Opening Razorpay checkout...',
        }]);
        openRazorpayCheckout(data.razorpayOrderId, data.razorpayKeyId, agentState.cartTotal || 0);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'agent', content: `❌ ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: `❌ Payment approval failed: ${err}` }]);
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (orderId: string, keyId: string, amount: number) => {
    if (typeof window === 'undefined') return;

    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'RazorPace AI',
      description: `Order for ${agentState?.selectedProduct?.name || 'Product'}`,
      order_id: orderId,
      handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
        // Verify payment
        setMessages(prev => [...prev, { role: 'agent', content: '⏳ Verifying payment...' }]);
        try {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              cartId: agentState?.cartId,
              selectedProduct: agentState?.selectedProduct,
              upsellOffer: agentState?.upsellOffer,
              crossSellOffer: agentState?.crossSellOffer,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success && verifyData.verified) {
            setOrderConfirmed(true);
            setMessages(prev => [...prev, {
              role: 'agent',
              content: `✅ **Payment Verified & Order Confirmed!**\n\n` +
                `Order ID: ${verifyData.order.id}\n` +
                `Total: ₹${verifyData.order.total}\n` +
                `Payment ID: ${response.razorpay_payment_id}\n\n` +
                `${agentState?.postPurchaseOffer || ''}`,
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'agent',
              content: `❌ **Payment Verification Failed**\n\n${verifyData.message}\n\n${verifyData.retryAvailable ? '🔄 You can retry the payment.' : ''}`,
            }]);
          }

          // Refresh audit trail
          const auditRes = await fetch(`/api/audit?sessionId=${sessionId}`);
          const auditData = await auditRes.json();
          setAuditTrail(auditData.events || []);
        } catch (err) {
          setMessages(prev => [...prev, { role: 'agent', content: `❌ Verification error: ${err}` }]);
        }
      },
      modal: {
        ondismiss: function () {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: '⚠️ Payment cancelled. You can approve again to retry.',
          }]);
          // Record payment failure audit
          fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              razorpayOrderId: orderId,
              razorpayPaymentId: 'cancelled',
              razorpaySignature: 'cancelled',
            }),
          });
        },
      },
      prefill: {
        name: 'Alex (Demo)',
        email: 'alex@demo.com',
        contact: '9999999999',
      },
      theme: { color: '#6366f1' },
    };

    const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: '16px' }}>
      {/* Main Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          background: '#0a0a0a', borderRadius: '8px', border: '1px solid #222',
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>🤖 RazorPace AI Buyer</h2>
              <p>Try: &quot;I want whey protein under ₹5,000 for muscle growth&quot;</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '12px',
              padding: '12px',
              borderRadius: '8px',
              background: msg.role === 'user' ? '#1a1a3e' : '#111',
              borderLeft: msg.role === 'user' ? '3px solid #6366f1' : '3px solid #22c55e',
            }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                {msg.role === 'user' ? '👤 You' : '🤖 AI Agent'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Approval Button */}
          {agentState?.waitingForUser && agentState?.waitingForUserAction === 'payment_approval' && !orderConfirmed && (
            <div style={{
              padding: '16px', margin: '12px 0', borderRadius: '8px',
              background: '#1a2e1a', border: '1px solid #22c55e',
            }}>
              <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>✅ All policy checks passed. Approve payment?</p>
              <p style={{ marginBottom: '12px', color: '#aaa' }}>
                Cart Total: ₹{agentState.cartTotal?.toLocaleString('en-IN')}
              </p>
              <button
                onClick={approvePayment}
                disabled={loading}
                style={{
                  padding: '10px 24px', background: '#22c55e', color: '#000',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '14px',
                }}
              >
                {loading ? 'Processing...' : '💳 Approve & Pay'}
              </button>
            </div>
          )}

          {loading && (
            <div style={{ padding: '12px', color: '#888' }}>
              ⏳ Agent is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendQuery()}
            placeholder='Try: "I want whey protein under ₹5,000 for muscle growth"'
            disabled={loading}
            style={{
              flex: 1, padding: '12px 16px', background: '#111', border: '1px solid #333',
              borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
            }}
          />
          <button
            onClick={sendQuery}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 24px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', opacity: loading ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Audit Trail Sidebar */}
      <div style={{
        width: '360px', overflowY: 'auto', padding: '16px',
        background: '#0a0a0a', borderRadius: '8px', border: '1px solid #222',
      }}>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>
          📋 Audit Trail ({auditTrail.length} events)
        </h3>
        {auditTrail.map((event, i) => (
          <div key={event.id || i} style={{
            padding: '8px', marginBottom: '8px', borderRadius: '6px',
            background: '#111', borderLeft: `3px solid ${getStatusColor(event.status)}`,
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: getStatusColor(event.status) }}>{event.action}</span>
              <span style={{ color: '#666' }}>{event.agent}</span>
            </div>
            <div style={{ color: '#aaa', marginBottom: '2px' }}>{event.outputSummary}</div>
            {event.reason && (
              <div style={{ color: '#888', fontStyle: 'italic' }}>↳ {event.reason}</div>
            )}
          </div>
        ))}
        {auditTrail.length === 0 && (
          <p style={{ color: '#555', fontSize: '12px' }}>No events yet. Send a query to start.</p>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return '#22c55e';
    case 'failed': return '#ef4444';
    case 'blocked': return '#f97316';
    case 'pending': return '#eab308';
    case 'skipped': return '#6b7280';
    default: return '#6366f1';
  }
}

function formatAgentResponse(data: AgentResponse): string {
  const parts: string[] = [];

  if (data.parsedIntent) {
    parts.push(`📋 **Intent Parsed**`);
    parts.push(`   Category: ${data.parsedIntent.category}`);
    parts.push(`   Budget: ₹${data.parsedIntent.budget?.toLocaleString('en-IN')}`);
    parts.push(`   Goal: ${data.parsedIntent.goal}`);
    parts.push('');
  }

  if (data.discoveredMerchants?.length) {
    parts.push(`🏪 **${data.discoveredMerchants.length} Merchants Discovered**`);
    for (const m of data.discoveredMerchants) {
      const icon = m.aiReady ? '✅' : '❌';
      parts.push(`   ${icon} ${m.name} — Score: ${m.score}/100`);
    }
    parts.push('');
  }

  if (data.rejectedMerchants?.length) {
    parts.push(`🚫 **${data.rejectedMerchants.length} Merchants Rejected**`);
    for (const m of data.rejectedMerchants) {
      parts.push(`   ❌ ${m.name}: ${m.reason}`);
    }
    parts.push('');
  }

  if (data.selectedProduct) {
    parts.push(`🎯 **Product Selected**`);
    parts.push(`   ${data.selectedProduct.name}`);
    parts.push(`   ₹${data.selectedProduct.price?.toLocaleString('en-IN')} from ${data.selectedProduct.merchantId}`);
    parts.push(`   ${data.selectedProduct.selectionReason}`);
    parts.push('');
  }

  if (data.upsellOffer) {
    const icon = data.upsellOffer.accepted === true ? '✅' : data.upsellOffer.accepted === false ? '❌' : '💡';
    parts.push(`⬆️ **Upsell ${data.upsellOffer.accepted === true ? 'Accepted' : data.upsellOffer.accepted === false ? 'Rejected' : 'Proposed'}**`);
    parts.push(`   ${icon} ${data.upsellOffer.name} — ₹${data.upsellOffer.price?.toLocaleString('en-IN')} (+₹${data.upsellOffer.priceDelta?.toLocaleString('en-IN')})`);
    parts.push(`   ${data.upsellOffer.reason}`);
    parts.push('');
  }

  if (data.crossSellOffer) {
    const icon = data.crossSellOffer.accepted === true ? '✅' : data.crossSellOffer.accepted === false ? '❌' : '💡';
    parts.push(`➕ **Cross-sell ${data.crossSellOffer.accepted === true ? 'Accepted' : data.crossSellOffer.accepted === false ? 'Rejected' : 'Proposed'}**`);
    parts.push(`   ${icon} ${data.crossSellOffer.name} — ₹${data.crossSellOffer.price?.toLocaleString('en-IN')}`);
    parts.push(`   ${data.crossSellOffer.reason}`);
    parts.push('');
  }

  if (data.policyResult) {
    const icon = data.policyResult.passed ? '✅' : '🚫';
    parts.push(`🛡️ **Policy Check: ${data.policyResult.status}**`);
    parts.push(`   ${icon} ${data.policyResult.summary}`);
    parts.push('');
  }

  if (data.cartTotal) {
    parts.push(`🛒 **Cart Total: ₹${data.cartTotal.toLocaleString('en-IN')}**`);
    parts.push('');
  }

  if (data.waitingForUser && data.waitingForUserAction === 'payment_approval') {
    parts.push(`✅ **Ready for payment — approve below to proceed**`);
  }

  if (data.error && parts.length === 0) {
    parts.push(`❌ ${data.error}`);
  }

  return parts.join('\n') || 'Agent completed processing.';
}
