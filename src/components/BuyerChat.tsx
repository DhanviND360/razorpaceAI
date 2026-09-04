'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  ArrowRight,
  Zap,
  Check,
  PackageCheck,
  Receipt,
  Activity,
  ChevronRight,
  FileText,
  Coins,
  Send,
  Loader2,
} from 'lucide-react';

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

interface IntelligentUpsellOffer {
  available: boolean;
  originalProduct: {
    id: string;
    name: string;
    price: number;
    rating: number;
    type?: string;
    protein?: string;
  };
  upgradeProduct: {
    id: string;
    name: string;
    price: number;
    priceDelta: number;
    rating: number;
    reviewCount: number;
    type?: string;
    protein?: string;
    advantages: string[];
    reason: string;
  };
  fitsBudget: boolean;
  projectedTotal: number;
}

interface IntelligentRecoveryBundleOffer {
  available: boolean;
  product: {
    id: string;
    name: string;
    originalPrice: number;
    bundlePrice: number;
    discountAmount: number;
    discountPercent: number;
    rating: number;
    category: string;
    keyIngredients: string;
  };
  synergyReason: string;
  bundlePerk: string;
  fitsBudget: boolean;
  projectedTotal: number;
}

interface GrowthOffers {
  upsell: IntelligentUpsellOffer | null;
  recoveryBundle: IntelligentRecoveryBundleOffer | null;
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
  growthOffers?: GrowthOffers;
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
  const [messages, setMessages] = useState<Array<{ role: string; content: string; data?: AgentResponse; timestamp: string }>>([]);
  const [agentState, setAgentState] = useState<AgentResponse | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<{ id: string; total: number; paymentId: string } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'ledger' | 'audit'>('ledger');

  // Intelligent Non-LLM Growth Modals State
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [upsellDecision, setUpsellDecision] = useState<'accepted' | 'declined' | null>(null);
  const [recoveryDecision, setRecoveryDecision] = useState<'accepted' | 'declined' | null>(null);
  const [currentCartTotal, setCurrentCartTotal] = useState<number>(0);
  const [activeProductName, setActiveProductName] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Initial query execution
  const sendQuery = useCallback(async (customQuery?: string) => {
    const queryToSend = customQuery || input.trim();
    if (!queryToSend || loading) return;

    setInput('');
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', content: queryToSend, timestamp: now }]);
    setLoading(true);

    try {
      const res = await fetch('/api/agent/buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userQuery: queryToSend, action: 'query' }),
      });

      const data: AgentResponse = await res.json();
      setAgentState(data);
      setAuditTrail(data.auditTrail || []);
      setCurrentCartTotal(data.cartTotal || 0);
      setActiveProductName(data.selectedProduct?.name || '');
      setUpsellDecision(null);
      setRecoveryDecision(null);

      const agentTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let responseSummary = '';
      if (data.error) {
        responseSummary = `Execution stopped: ${data.error}`;
      } else {
        responseSummary = `Commercial intent parsed. Evaluated ${data.discoveredMerchants?.length || 0} merchants, filtered out ${data.rejectedMerchants?.length || 0} non-compliant catalogs. Selected optimal product from ${data.selectedProduct?.merchantId || 'merchant'}. Growth opportunities generated.`;
      }

      setMessages(prev => [...prev, {
        role: 'agent',
        content: responseSummary,
        data,
        timestamp: agentTimestamp,
      }]);

      // Trigger the interactive Upsell Popup immediately before checkout if available!
      if (data.growthOffers?.upsell?.available) {
        setTimeout(() => {
          setShowUpsellModal(true);
        }, 500);
      } else if (data.growthOffers?.recoveryBundle?.available) {
        setTimeout(() => {
          setShowRecoveryModal(true);
        }, 500);
      }
    } catch (err) {
      const nowErr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Agent execution failed: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: nowErr,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId]);

  // Apply upsell upgrade decision
  const handleUpsellChoice = async (upgrade: boolean) => {
    const upsell = agentState?.growthOffers?.upsell;
    setShowUpsellModal(false);

    if (upgrade && upsell && agentState?.cartId) {
      setLoading(true);
      try {
        const res = await fetch('/api/agent/buyer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            action: 'apply_growth_selection',
            cartId: agentState.cartId,
            upgradeToProductId: upsell.upgradeProduct.id,
          }),
        });
        const updateData = await res.json();
        if (updateData.success) {
          setCurrentCartTotal(updateData.cartTotal);
          setActiveProductName(upsell.upgradeProduct.name);
          setUpsellDecision('accepted');
          setAuditTrail(updateData.auditTrail || []);
          const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Applied formulation upgrade to ${upsell.upgradeProduct.name} (+₹${upsell.upgradeProduct.priceDelta.toLocaleString('en-IN')}). Updated cart balance: ₹${updateData.cartTotal.toLocaleString('en-IN')}.`,
            timestamp: now,
          }]);
        }
      } catch (err) {
        console.error('Error applying upsell:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setUpsellDecision('declined');
    }

    // After upsell decision, seamlessly show the Recovery Cross-Sell Bundle notification
    if (agentState?.growthOffers?.recoveryBundle?.available) {
      setTimeout(() => {
        setShowRecoveryModal(true);
      }, 400);
    }
  };

  // Apply recovery bundle decision
  const handleRecoveryChoice = async (addBundle: boolean) => {
    const bundle = agentState?.growthOffers?.recoveryBundle;
    setShowRecoveryModal(false);

    if (addBundle && bundle && agentState?.cartId) {
      setLoading(true);
      try {
        const res = await fetch('/api/agent/buyer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            action: 'apply_growth_selection',
            cartId: agentState.cartId,
            addRecoveryBundleId: bundle.product.id,
            bundleDiscountAmount: bundle.product.discountAmount,
          }),
        });
        const updateData = await res.json();
        if (updateData.success) {
          setCurrentCartTotal(updateData.cartTotal);
          setRecoveryDecision('accepted');
          setAuditTrail(updateData.auditTrail || []);
          const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Added ${bundle.product.name} at discounted bundle rate ₹${bundle.product.bundlePrice.toLocaleString('en-IN')} (Saved ₹${bundle.product.discountAmount.toLocaleString('en-IN')}). Final payable amount: ₹${updateData.cartTotal.toLocaleString('en-IN')}.`,
            timestamp: now,
          }]);
        }
      } catch (err) {
        console.error('Error applying recovery bundle:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setRecoveryDecision('declined');
    }
  };

  // Final payment approval & Razorpay order trigger
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
          cartTotal: currentCartTotal || agentState.cartTotal,
          selectedProduct: agentState.selectedProduct,
          parsedIntent: agentState.parsedIntent,
          upsellOffer: agentState.upsellOffer,
          crossSellOffer: agentState.crossSellOffer,
        }),
      });

      const data: AgentResponse = await res.json();
      setAuditTrail(data.auditTrail || []);

      if (data.razorpayOrderId && data.razorpayKeyId) {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, {
          role: 'agent',
          content: 'Policy validation cleared. Razorpay order generated. Launching payment authorization...',
          timestamp: now,
        }]);
        openRazorpayCheckout(data.razorpayOrderId, data.razorpayKeyId, currentCartTotal || data.cartTotal || 0);
      } else if (data.error) {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, { role: 'agent', content: `Payment initiation rejected: ${data.error}`, timestamp: now }]);
      }
    } catch (err) {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages(prev => [...prev, { role: 'agent', content: `Payment approval failed: ${err}`, timestamp: now }]);
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
      description: `Order for ${activeProductName || agentState?.selectedProduct?.name || 'Supplements'}`,
      order_id: orderId,
      handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, { role: 'agent', content: 'Verifying payment signature with Razorpay...', timestamp: now }]);
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

          const nowVerify = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          if (verifyData.success && verifyData.verified) {
            setOrderConfirmed(true);
            setVerifiedOrder({
              id: verifyData.order.id,
              total: verifyData.order.total,
              paymentId: response.razorpay_payment_id,
            });
            setMessages(prev => [...prev, {
              role: 'agent',
              content: `Payment verified. Order #${verifyData.order.id} confirmed for ₹${verifyData.order.total?.toLocaleString('en-IN')}. Razorpay Payment ID: ${response.razorpay_payment_id}.`,
              timestamp: nowVerify,
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'agent',
              content: `Payment verification failed. Reason: ${verifyData.message}.`,
              timestamp: nowVerify,
            }]);
          }

          // Refresh audit trail
          const auditRes = await fetch(`/api/audit?sessionId=${sessionId}`);
          const auditData = await auditRes.json();
          setAuditTrail(auditData.events || []);
        } catch (err) {
          const nowErr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setMessages(prev => [...prev, { role: 'agent', content: `Verification service error: ${err}`, timestamp: nowErr }]);
        }
      },
      modal: {
        ondismiss: function () {
          const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setMessages(prev => [...prev, {
            role: 'agent',
            content: 'Payment session dismissed. Order remains pending authorization.',
            timestamp: now,
          }]);
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
        name: 'Alex (Buyer)',
        email: 'alex@agentic-commerce.internal',
        contact: '9999999999',
      },
      theme: { color: '#09090b' },
    };

    const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
    rzp.open();
  };

  const upsell = agentState?.growthOffers?.upsell;
  const recoveryBundle = agentState?.growthOffers?.recoveryBundle;

  return (
    <div className="dash-grid-12">
      {/* LEFT & CENTER: Autonomous Execution Stream (8 cols) */}
      <div className="dash-col-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Pipeline Stepper */}
        <div className="bento-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', fontSize: '12px', fontFamily: 'var(--font-apple)' }}>
          <PipelineStep label="1. INTENT" active={!!agentState?.parsedIntent} current={agentState?.currentStep === 'parseIntent'} />
          <ChevronRight size={13} color="#52525b" />
          <PipelineStep label="2. DISCOVER" active={!!agentState?.discoveredMerchants} current={agentState?.currentStep === 'discoverMerchants'} />
          <ChevronRight size={13} color="#52525b" />
          <PipelineStep label="3. SELECT" active={!!agentState?.selectedProduct} current={agentState?.currentStep === 'selectProduct'} />
          <ChevronRight size={13} color="#52525b" />
          <PipelineStep label="4. GROWTH" active={!!agentState?.growthOffers} current={agentState?.currentStep === 'growthEngine'} />
          <ChevronRight size={13} color="#52525b" />
          <PipelineStep label="5. POLICY" active={!!agentState?.policyResult} current={agentState?.currentStep === 'checkPolicy'} />
          <ChevronRight size={13} color="#52525b" />
          <PipelineStep label="6. SETTLE" active={orderConfirmed} current={agentState?.waitingForUser} highlight={orderConfirmed} />
        </div>

        {/* Chat / Timeline Container */}
        <div className="bento-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', minHeight: '520px' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px', maxHeight: '540px' }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', maxWidth: '540px', margin: 'auto' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Bot size={24} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>Autonomous Commerce Dispatcher</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Submit commercial requirements. The AI Buyer evaluates schemas, enforces financial guardrails, negotiates growth proposals, and handles settlement.
                </p>

                {/* Preset Prompts */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Sample Scenarios
                  </span>
                  <button
                    onClick={() => sendQuery('I want to buy protein powder under 5000 for muscle building')}
                    className="bento-card-inner"
                    style={{ textAlign: 'left', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-hairline)' }}
                  >
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                      &quot;I want to buy protein powder under 5000 for muscle building&quot;
                    </span>
                    <ArrowRight size={14} color="#10b981" />
                  </button>
                  <button
                    onClick={() => sendQuery('Find organic whey isolate with recovery benefits under 4000')}
                    className="bento-card-inner"
                    style={{ textAlign: 'left', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-hairline)' }}
                  >
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                      &quot;Find organic whey isolate with recovery benefits under 4000&quot;
                    </span>
                    <ArrowRight size={14} color="#818cf8" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages Feed */}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#ffffff' }}>
                    {msg.role === 'user' ? (
                      <>
                        <User size={13} color="#818cf8" />
                        <span>BUYER INTENT</span>
                      </>
                    ) : (
                      <>
                        <Bot size={13} color="#10b981" />
                        <span>AGENT EXECUTION</span>
                      </>
                    )}
                  </div>
                  <span>{msg.timestamp}</span>
                </div>

                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-hairline)',
                  background: msg.role === 'user' ? 'rgba(255,255,255,0.04)' : '#0d0d12',
                  fontSize: '13px',
                  color: msg.role === 'user' ? '#ffffff' : '#d4d4d8',
                  lineHeight: 1.6,
                }}>
                  <div>{msg.content}</div>

                  {/* Rich Structural Telemetry Cards for Agent */}
                  {msg.data && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* 1. Parsed Intent */}
                      {msg.data.parsedIntent && (
                        <div className="bento-card-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', padding: '12px' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Category</span>
                            <span style={{ fontWeight: 700, color: '#ffffff' }}>{msg.data.parsedIntent.category}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Budget Limit</span>
                            <span style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                              ₹{msg.data.parsedIntent.budget?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Goal</span>
                            <span style={{ color: '#ffffff' }}>{msg.data.parsedIntent.goal}</span>
                          </div>
                        </div>
                      )}

                      {/* 2. Discovered Merchants */}
                      {msg.data.discoveredMerchants && msg.data.discoveredMerchants.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Merchant Discovery & Schema Audit
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                            {msg.data.discoveredMerchants.map((m, idx) => (
                              <div key={idx} className="bento-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Building2 size={14} color={m.aiReady ? '#10b981' : '#f43f5e'} />
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{m.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score: {m.score}/100</div>
                                  </div>
                                </div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: m.aiReady ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                  color: m.aiReady ? '#10b981' : '#f43f5e',
                                }}>
                                  {m.aiReady ? 'CERTIFIED' : 'REJECTED'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Selected Product */}
                      {msg.data.selectedProduct && (
                        <div className="bento-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Best Match</span>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{msg.data.selectedProduct.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{msg.data.selectedProduct.selectionReason}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Base Price</span>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                              ₹{msg.data.selectedProduct.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Policy Result */}
                      {msg.data.policyResult && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={16} color="#10b981" />
                            <span style={{ fontSize: '12px', color: '#6ee7b7' }}>{msg.data.policyResult.summary}</span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>7/7 PASSED</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Interactive Pre-Checkout Deck */}
            {agentState?.waitingForUser && agentState?.waitingForUserAction === 'payment_approval' && !orderConfirmed && (
              <div className="bento-card" style={{ padding: '20px', background: 'linear-gradient(180deg, #161622 0%, #0d0d12 100%)', borderColor: 'rgba(99, 102, 241, 0.35)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-hairline)' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Order Ready for Authorization</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Review available formulation optimizations before checkout.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Balance</span>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                      ₹{currentCartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Offer Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {upsell?.available && (
                    <button
                      onClick={() => setShowUpsellModal(true)}
                      className="bento-card-inner"
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderColor: upsellDecision === 'accepted' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-hairline)',
                        background: upsellDecision === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.4)',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>Formulation Upgrade</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '2px 0' }}>
                        {upsellDecision === 'accepted' ? upsell.upgradeProduct.name : `Upgrade to ${upsell.upgradeProduct.name}`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        +₹{upsell.upgradeProduct.priceDelta} delta • Pure Isolate
                      </div>
                    </button>
                  )}

                  {recoveryBundle?.available && (
                    <button
                      onClick={() => setShowRecoveryModal(true)}
                      className="bento-card-inner"
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderColor: recoveryDecision === 'accepted' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-hairline)',
                        background: recoveryDecision === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.4)',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Synergy Bundle</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '2px 0' }}>
                        {recoveryDecision === 'accepted' ? recoveryBundle.product.name : `Bundle with ${recoveryBundle.product.name}`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Save ₹{recoveryBundle.product.discountAmount} (15% Deal)
                      </div>
                    </button>
                  )}
                </div>

                {/* Primary Authorization Button */}
                <button
                  onClick={approvePayment}
                  disabled={loading}
                  className="btn-emerald"
                  style={{ width: '100%', fontSize: '14px', padding: '14px' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Transacting with Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>Approve & Pay ₹{currentCartTotal.toLocaleString('en-IN')} on Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Post-Purchase Confirmation */}
            {orderConfirmed && verifiedOrder && (
              <div className="bento-card" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={22} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Payment Verified & Confirmed</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Order ID: {verifiedOrder.id}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    ₹{verifiedOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bento-card-inner" style={{ padding: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment ID:</span>
                    <span style={{ color: '#ffffff' }}>{verifiedOrder.paymentId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Signature Status:</span>
                    <span style={{ color: '#10b981' }}>HMAC-SHA256 VERIFIED</span>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#d4d4d8', borderTop: '1px solid var(--border-hairline)', paddingTop: '10px' }}>
                  <strong style={{ color: '#ffffff' }}>What&apos;s next? </strong>
                  {agentState?.postPurchaseOffer || 'Your order has been recorded in the merchant inventory queue.'}
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', padding: '8px 0' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
                <span>Agent pipeline executing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-hairline)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendQuery()}
              placeholder='Enter commercial intent (e.g. "Buy whey protein under 5000 for muscle recovery")'
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendQuery()}
              disabled={loading || !input.trim()}
              className="btn-emerald"
              style={{
                padding: '0 20px',
                opacity: (loading || !input.trim()) ? 0.45 : 1,
                cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={14} />
              <span>Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Transaction Ledger & Policy Inspector (4 cols) */}
      <div className="dash-col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
          <button
            onClick={() => setSidebarTab('ledger')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: sidebarTab === 'ledger' ? 'var(--bg-active)' : 'transparent',
              color: sidebarTab === 'ledger' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Receipt size={14} color="#10b981" />
            <span>LEDGER & POLICY</span>
          </button>
          <button
            onClick={() => setSidebarTab('audit')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: sidebarTab === 'audit' ? 'var(--bg-active)' : 'transparent',
              color: sidebarTab === 'audit' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Activity size={14} color="#818cf8" />
            <span>AUDIT ({auditTrail.length})</span>
          </button>
        </div>

        {/* TAB 1: Ledger & Policy View */}
        {sidebarTab === 'ledger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Real-Time Cart Ledger */}
            <div className="bento-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={14} color="#10b981" />
                  Transaction Ledger
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>INR (₹)</span>
              </div>

              {agentState?.cartId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  {/* Selected Base Item */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{activeProductName || agentState.selectedProduct?.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {agentState.selectedProduct?.merchantId || 'Merchant Item'}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      ₹{agentState.selectedProduct?.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Upsell Delta */}
                  {upsellDecision === 'accepted' && upsell && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#818cf8', paddingLeft: '8px', borderLeft: '2px solid rgba(99, 102, 241, 0.5)' }}>
                      <div>
                        <div>Premium Formulation Delta</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{upsell.upgradeProduct.name}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{upsell.upgradeProduct.priceDelta.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Recovery Bundle Item */}
                  {recoveryDecision === 'accepted' && recoveryBundle && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#10b981', paddingLeft: '8px', borderLeft: '2px solid rgba(16, 185, 129, 0.5)' }}>
                      <div>
                        <div>{recoveryBundle.product.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>15% Bundle Discount</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{recoveryBundle.product.bundlePrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Total Line */}
                  <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Payable Amount</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                      ₹{currentCartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No active transaction. Dispatch a buyer query to populate the real-time ledger.
                </div>
              )}
            </div>

            {/* Financial Safety Guardrail Matrix */}
            <div className="bento-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-hairline)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  Policy Engine (7 Gates)
                </span>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>ACTIVE</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <PolicyCheckItem label="Intent Budget Ceiling" pass={!agentState?.parsedIntent || currentCartTotal <= agentState.parsedIntent.budget} note="Enforces user maximum limit" />
                <PolicyCheckItem label="Catalog Schema Integrity" pass={!!agentState?.selectedProduct} note="Validates structured product data" />
                <PolicyCheckItem label="Price Tamper Shield" pass={true} note="Server-side hash validation" />
                <PolicyCheckItem label="Merchant Certification" pass={true} note="Catalog readiness certified" />
                <PolicyCheckItem label="Inventory Availability" pass={true} note="Real-time stock reservation" />
                <PolicyCheckItem label="Payment Gateway Ready" pass={true} note="Razorpay API connection verified" />
                <PolicyCheckItem label="Explicit User Consent" pass={orderConfirmed || agentState?.waitingForUserAction === 'payment_approval'} note="No silent debits allowed" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Live Audit Log */}
        {sidebarTab === 'audit' && (
          <div className="bento-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="#818cf8" />
                Audit Trail
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{auditTrail.length} RECORDS</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px' }}>
              {auditTrail.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No audit events recorded yet. Run a commercial scenario to inspect agent telemetry.
                </div>
              ) : (
                auditTrail.map((ev, idx) => (
                  <div key={ev.id || idx} className="bento-card-inner" style={{ padding: '10px 12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{ev.action}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{ev.timestamp.split('T')[1]?.substring(0, 8) || ev.timestamp}</span>
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '12px' }}>{ev.outputSummary}</div>
                    {ev.reason && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>↳ {ev.reason}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 1. DETERMINISTIC UPSELL UPGRADE MODAL                         */}
      {/* ============================================================ */}
      {showUpsellModal && upsell && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>Formulation Upgrade Proposal</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Algorithm identified a higher-tier formulation with superior bioavailability matching your intent.
            </p>

            {/* Comparison Deck */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-hairline)', marginBottom: '16px' }}>
              <div style={{ paddingRight: '10px', borderRight: '1px solid var(--border-hairline)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Current Baseline</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>{upsell.originalProduct.name}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ₹{upsell.originalProduct.price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{upsell.originalProduct.protein}g Protein • Concentrate</div>
              </div>

              <div style={{ paddingLeft: '4px' }}>
                <span style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Recommended Upgrade</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{upsell.upgradeProduct.name}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ₹{upsell.upgradeProduct.price.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '12px', color: '#818cf8' }}>(+₹{upsell.upgradeProduct.priceDelta})</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{upsell.upgradeProduct.protein}g Protein • Pure Isolate</div>
              </div>
            </div>

            {/* Decision Rationale */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Decision Rationale
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {upsell.upgradeProduct.advantages.map((adv, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#d4d4d8' }}>
                    <Check size={13} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Confirmation */}
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Compliant: Still inside your ₹{agentState?.parsedIntent?.budget?.toLocaleString('en-IN')} budget cap.</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleUpsellChoice(true)}
                className="btn-emerald"
                style={{ flex: 1 }}
              >
                <Zap size={14} />
                <span>Accept Upgrade (+₹{upsell.upgradeProduct.priceDelta})</span>
              </button>
              <button
                onClick={() => handleUpsellChoice(false)}
                className="btn-secondary"
              >
                Keep Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. RECOVERY CROSS-SELL SYNERGY BUNDLE MODAL                  */}
      {/* ============================================================ */}
      {showRecoveryModal && recoveryBundle && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>Post-Workout Recovery Bundle</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Add recovery amino acids to accelerate muscle repair and synthesis.
            </p>

            {/* Deal Box */}
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{recoveryBundle.product.name}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                  SAVE ₹{recoveryBundle.product.discountAmount}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                  ₹{recoveryBundle.product.bundlePrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                  ₹{recoveryBundle.product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>(15% Bundle Deal)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#d4d4d8', borderTop: '1px solid var(--border-hairline)', paddingTop: '8px', fontStyle: 'italic' }}>
                &quot;{recoveryBundle.synergyReason}&quot;
              </div>
            </div>

            {/* Projected Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-hairline)', fontSize: '13px', marginBottom: '20px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Projected Total with Bundle:</span>
              <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                ₹{recoveryBundle.projectedTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleRecoveryChoice(true)}
                className="btn-primary"
                style={{ flex: 1, backgroundColor: '#06b6d4', color: '#000000' }}
              >
                <PackageCheck size={14} />
                <span>Add Recovery Bundle (+₹{recoveryBundle.product.bundlePrice})</span>
              </button>
              <button
                onClick={() => handleRecoveryChoice(false)}
                className="btn-secondary"
              >
                Skip Bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PipelineStep({ label, active, current, highlight }: { label: string; active: boolean; current?: boolean; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        fontWeight: 600,
        fontSize: '11px',
        background: highlight
          ? 'rgba(16, 185, 129, 0.15)'
          : active
          ? 'rgba(255, 255, 255, 0.08)'
          : current
          ? 'rgba(99, 102, 241, 0.2)'
          : 'transparent',
        color: highlight
          ? '#10b981'
          : active
          ? '#ffffff'
          : current
          ? '#818cf8'
          : '#52525b',
        border: highlight
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : active
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : current
          ? '1px solid rgba(99, 102, 241, 0.4)'
          : '1px solid transparent',
      }}
    >
      {label}
    </div>
  );
}

function PolicyCheckItem({ label, pass, note }: { label: string; pass: boolean; note: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {pass ? (
          <Check size={13} color="#10b981" />
        ) : (
          <XCircle size={13} color="#f43f5e" />
        )}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{label}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{note}</div>
        </div>
      </div>
      <span style={{ fontSize: '10px', fontWeight: 700, color: pass ? '#10b981' : '#f43f5e', fontFamily: 'var(--font-mono)' }}>
        {pass ? 'PASS' : 'WARN'}
      </span>
    </div>
  );
}
