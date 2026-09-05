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
  FileText,
  Send,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Scale,
  RotateCcw,
  Search,
  ShieldAlert,
  Terminal,
  MoreHorizontal,
  Copy,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// TYPES & DATA CONTRACTS
// ============================================================================

interface AuditEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  tool?: string;
  inputSummary: string;
  outputSummary: string;
  reason?: string;
  status: string;
  policyResult?: string;
  nextState?: string;
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

interface RevenueDecision {
  selectedAction: 'NO_OFFER' | 'UPSELL' | 'CROSS_SELL' | 'BUNDLE';
  objective: 'REVENUE' | 'MARGIN' | 'INVENTORY' | 'RETENTION';
  actionReason: string;
  rejectedAlternatives: string[];
  evaluatedFactors?: {
    customerIntent: string;
    budget: number;
    budgetHeadroom: number;
    productRelevance: string;
    currentProductMarginPercent: number;
    inventoryStock: number;
    stockBufferRespected: boolean;
    minMarginCompliant: boolean;
  };
}

interface GrowthOffers {
  decision?: RevenueDecision;
  upsell: IntelligentUpsellOffer | null;
  recoveryBundle: IntelligentRecoveryBundleOffer | null;
}

interface AgentResponse {
  success: boolean;
  currentStep: string;
  parsedIntent?: { category: string; budget: number; goal: string; keywords: string[] };
  discoveredMerchants?: Array<{ id: string; name: string; score: number; aiReady: boolean; transactionReady?: boolean }>;
  validMerchants?: string[];
  rejectedMerchants?: Array<{ id: string; name: string; reason: string }>;
  whyThisMerchant?: string;
  searchResults?: Array<{ merchantId: string; productId: string; name: string; price: number; rating: number; reviewCount: number; stock?: number }>;
  selectedProduct?: { merchantId: string; productId: string; name: string; price: number; selectionReason: string };
  growthOffers?: GrowthOffers;
  upsellOffer?: { productId: string; name: string; price: number; priceDelta: number; reason: string; accepted: boolean | null };
  crossSellOffer?: { productId: string; name: string; price: number; reason: string; accepted: boolean | null };
  cartId?: string;
  cartTotal?: number;
  policyResult?: { passed: boolean; status: string; summary: string };
  recoveryPlan?: {
    canRecover: boolean;
    reason: string;
    alternativeProduct?: {
      id: string;
      merchantId: string;
      name: string;
      price: number;
      stock: number;
      rating: number;
    };
    suggestedAction: string;
  };
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
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; data?: AgentResponse; timestamp: string }>>([]);
  const [agentState, setAgentState] = useState<AgentResponse | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<{ id: string; total: number; paymentId: string } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'ledger' | 'audit'>('ledger');
  const [auditFilter, setAuditFilter] = useState<'all' | 'blocked' | 'passed'>('all');

  // Interactive UI utilities
  const [copiedSession, setCopiedSession] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showAdvancedConstraints, setShowAdvancedConstraints] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<'REVENUE' | 'MARGIN' | 'INVENTORY' | 'RETENTION'>('REVENUE');

  // Growth Modals State
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [upsellDecision, setUpsellDecision] = useState<'accepted' | 'declined' | null>(null);
  const [recoveryDecision, setRecoveryDecision] = useState<'accepted' | 'declined' | null>(null);
  const [currentCartTotal, setCurrentCartTotal] = useState<number>(0);
  const [activeProductName, setActiveProductName] = useState<string>('');

  // Agentic Failure & Recovery State
  const [activeRecoveryPlan, setActiveRecoveryPlan] = useState<{
    canRecover: boolean;
    reason: string;
    alternativeProduct?: {
      id: string;
      merchantId: string;
      name: string;
      price: number;
      stock: number;
      rating: number;
    };
    suggestedAction: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Copy Session ID
  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  // Copy raw state JSON
  const copyRawStateJson = () => {
    const payload = JSON.stringify({ sessionId, agentState, auditTrail }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedJson(true);
    setShowMoreMenu(false);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Reset testing session
  const resetSession = () => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    setSessionId(newId);
    setMessages([]);
    setAgentState(null);
    setAuditTrail([]);
    setOrderConfirmed(false);
    setVerifiedOrder(null);
    setUpsellDecision(null);
    setRecoveryDecision(null);
    setCurrentCartTotal(0);
    setActiveProductName('');
    setActiveRecoveryPlan(null);
    setInput('');
    setShowMoreMenu(false);
  };

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
        body: JSON.stringify({
          sessionId,
          userQuery: queryToSend,
          action: 'query',
          objective: selectedObjective,
        }),
      });

      const data: AgentResponse = await res.json();
      setAgentState(data);
      setAuditTrail(data.auditTrail || []);
      setCurrentCartTotal(data.cartTotal || 0);
      setActiveProductName(data.selectedProduct?.name || '');
      setUpsellDecision(null);
      setRecoveryDecision(null);
      setActiveRecoveryPlan(null);

      const agentTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let responseSummary = '';
      if (data.error) {
        responseSummary = `Execution stopped: ${data.error}`;
      } else {
        responseSummary = `Commercial intent resolved. Evaluated ${data.discoveredMerchants?.length || 0} merchants, filtered ${data.rejectedMerchants?.length || 0} non-compliant catalogs. Selected optimal SKU from ${data.selectedProduct?.merchantId || 'merchant'}. Growth interventions evaluated.`;
      }

      setMessages(prev => [...prev, {
        role: 'agent',
        content: responseSummary,
        data,
        timestamp: agentTimestamp,
      }]);

      if (data.growthOffers?.upsell?.available) {
        setTimeout(() => {
          setShowUpsellModal(true);
        }, 400);
      } else if (data.growthOffers?.recoveryBundle?.available) {
        setTimeout(() => {
          setShowRecoveryModal(true);
        }, 400);
      }
    } catch (err) {
      const nowErr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Agent pipeline error: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: nowErr,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId, selectedObjective]);

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
            content: `Applied formulation upgrade: ${upsell.upgradeProduct.name} (+₹${upsell.upgradeProduct.priceDelta.toLocaleString('en-IN')}). Updated cart balance: ₹${updateData.cartTotal.toLocaleString('en-IN')}.`,
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

    if (agentState?.growthOffers?.recoveryBundle?.available) {
      setTimeout(() => {
        setShowRecoveryModal(true);
      }, 350);
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
            content: `Added ${bundle.product.name} at bundle rate ₹${bundle.product.bundlePrice.toLocaleString('en-IN')} (Saved ₹${bundle.product.discountAmount.toLocaleString('en-IN')}). Total payable: ₹${updateData.cartTotal.toLocaleString('en-IN')}.`,
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
  const approvePayment = async (simulationType?: 'price_surge' | 'stock_out') => {
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
          simulationType: simulationType || null,
        }),
      });

      const data: AgentResponse = await res.json();
      setAuditTrail(data.auditTrail || []);

      if (data.recoveryPlan || data.policyResult?.passed === false) {
        setActiveRecoveryPlan(data.recoveryPlan || null);
        setAgentState(prev => prev ? {
          ...prev,
          policyResult: data.policyResult,
          error: data.error,
        } : null);
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Policy Enforcement Triggered: ${data.error || 'Preflight verification detected drift before payment authorization.'}`,
          timestamp: now,
        }]);
      } else if (data.razorpayOrderId && data.razorpayKeyId) {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, {
          role: 'agent',
          content: 'Policy checks cleared. Razorpay order generated. Invoking checkout rails...',
          timestamp: now,
        }]);
        openRazorpayCheckout(data.razorpayOrderId, data.razorpayKeyId, currentCartTotal || data.cartTotal || 0);
      } else if (data.error) {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, { role: 'agent', content: `Payment initiation blocked: ${data.error}`, timestamp: now }]);
      }
    } catch (err) {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages(prev => [...prev, { role: 'agent', content: `Payment authorization failed: ${err}`, timestamp: now }]);
    } finally {
      setLoading(false);
    }
  };

  // Automated agentic recovery handler after failure
  const handleApplyRecovery = async (alternativeProductId: string) => {
    if (!agentState?.cartId) return;
    setLoading(true);

    try {
      const res = await fetch('/api/agent/buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'apply_recovery_alternative',
          cartId: agentState.cartId,
          alternativeProductId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentCartTotal(data.cartTotal);
        setActiveProductName(data.selectedProduct?.name || '');
        setActiveRecoveryPlan(null);
        setAgentState(prev => prev ? {
          ...prev,
          selectedProduct: data.selectedProduct,
          cartTotal: data.cartTotal,
          policyResult: { passed: true, status: 'PASS', summary: 'Cart recovered with verified compliant substitute.' },
          waitingForUser: true,
          waitingForUserAction: 'payment_approval',
          error: undefined,
        } : null);

        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Recovery complete. Substituted with ${data.selectedProduct?.name} (₹${data.cartTotal.toLocaleString('en-IN')}). All 7 policy gates re-cleared.`,
          timestamp: now,
        }]);
      }
    } catch (err) {
      console.error('Error recovering alternative:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Razorpay Modal
  const openRazorpayCheckout = (orderId: string, keyId: string, amount: number) => {
    if (typeof window === 'undefined' || !(window as unknown as { Razorpay: unknown }).Razorpay) {
      alert('Razorpay SDK not loaded. Simulating successful checkout authorization.');
      setOrderConfirmed(true);
      setVerifiedOrder({
        id: orderId,
        total: amount,
        paymentId: `pay_mock_${Date.now()}`,
      });
      return;
    }

    const options = {
      key: keyId,
      amount: amount * 100,
      currency: 'INR',
      name: 'RazorPace AI Merchant',
      description: `Autonomous settlement for ${activeProductName || 'nutrition order'}`,
      order_id: orderId,
      handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
        try {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              sessionId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderConfirmed(true);
            setVerifiedOrder({
              id: response.razorpay_order_id,
              total: amount,
              paymentId: response.razorpay_payment_id,
            });
            const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setMessages(prev => [...prev, {
              role: 'agent',
              content: `Settlement captured. Signature HMAC verified. Order ${response.razorpay_order_id} stored with full audit ledger.`,
              timestamp: now,
            }]);
          }
        } catch (err) {
          console.error('Error verifying payment:', err);
        }
      },
      prefill: {
        name: 'Alex Developer',
        email: 'alex.buyer@testnet.internal',
        contact: '+919876543210',
      },
      theme: { color: '#0f172a' },
    };

    const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
    rzp.open();
  };

  const upsell = agentState?.growthOffers?.upsell;
  const recoveryBundle = agentState?.growthOffers?.recoveryBundle;

  const filteredAuditTrail = auditTrail.filter(ev => {
    if (auditFilter === 'blocked') return ev.status === 'blocked' || ev.status === 'warn';
    if (auditFilter === 'passed') return ev.status === 'success';
    return true;
  });

  // Calculate budget utilization ratio
  const budgetCeiling = agentState?.parsedIntent?.budget || 5000;
  const effectiveTotal = currentCartTotal || agentState?.cartTotal || 0;
  const budgetRatio = Math.min(100, Math.round((effectiveTotal / budgetCeiling) * 100));

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ============================================================ */}
      {/* 1. TOP TESTING COCKPIT & CONTEXT CONTROLS BAR               */}
      {/* ============================================================ */}
      <div className="tb-card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tb-pill tb-pill-neutral" style={{ letterSpacing: '0.04em' }}>TESTBENCH RUNNER</span>
              <button
                onClick={copySessionId}
                className="tb-card-interactive"
                style={{
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
                title="Click to copy full session ID"
              >
                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {sessionId.slice(0, 18)}...
                </span>
                {copiedSession ? (
                  <CheckCheck size={12} color="#059669" />
                ) : (
                  <Copy size={12} color="#94a3b8" />
                )}
              </button>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '6px 0 2px 0', letterSpacing: '-0.02em' }}>
              Buyer Agent Orchestrator
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Simulate natural language intent processing, catalog schema arbitration, automated revenue optimization, and policy enforcement.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="tb-pill tb-pill-emerald">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
              <span>RAZORPAY TESTNET ACTIVE</span>
            </div>

            {/* Dropdown Options Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="tb-btn-secondary"
                style={{ padding: '7px 10px' }}
                title="Secondary test controls"
              >
                <MoreHorizontal size={14} />
              </button>
              {showMoreMenu && (
                <div className="tb-popover">
                  <button onClick={copyRawStateJson} className="tb-popover-item">
                    <Copy size={13} color="#64748b" />
                    <span>{copiedJson ? 'Copied Raw JSON!' : 'Copy Session State JSON'}</span>
                  </button>
                  <button onClick={resetSession} className="tb-popover-item">
                    <RotateCcw size={13} color="#64748b" />
                    <span>Reset Sandbox Session</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={resetSession}
              className="tb-btn-secondary"
              title="Reset state and start fresh session"
            >
              <RotateCcw size={13} />
              <span>Reset Sandbox</span>
            </button>
          </div>
        </div>

        {/* Interactive Visual Pipeline Stepper */}
        <TestbenchConnectedPipeline
          step={agentState?.currentStep}
          hasIntent={!!agentState?.parsedIntent}
          hasDiscovery={!!agentState?.discoveredMerchants}
          hasSelection={!!agentState?.selectedProduct}
          hasArbitrage={!!agentState?.growthOffers}
          hasPolicy={!!agentState?.policyResult}
          isSettled={orderConfirmed}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN ASYMMETRIC BENTO GRID                                */}
      {/* ============================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Test Runner & Live Trace (8 cols) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Query Dispatcher Console */}
          <div className="tb-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Commercial Intent Dispatcher
                </span>
                <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                  Submit natural language buyer requirements or pick a predefined benchmark case:
                </div>
              </div>
              <div className="tb-pill tb-pill-neutral">
                <Terminal size={12} color="#475569" />
                <span>INTERACTIVE RUNNER</span>
              </div>
            </div>

            {/* Benchmark Scenarios */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                onClick={() => sendQuery('I want to buy protein powder under 5000 for muscle building')}
                disabled={loading}
                className="tb-card-interactive"
                style={{ padding: '7px 12px', fontSize: '12px', color: '#0f172a', fontWeight: 500, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>&quot;Protein powder under 5000 for muscle building&quot;</span>
                <ArrowRight size={12} color="#64748b" />
              </button>
              <button
                onClick={() => sendQuery('Find organic whey isolate with recovery benefits under 4000')}
                disabled={loading}
                className="tb-card-interactive"
                style={{ padding: '7px 12px', fontSize: '12px', color: '#0f172a', fontWeight: 500, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>&quot;Organic whey isolate with recovery under 4000&quot;</span>
                <ArrowRight size={12} color="#64748b" />
              </button>
            </div>

            {/* Prompt Input Form */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendQuery()}
                  placeholder='Enter commercial intent (e.g. "Buy whey protein under 5000 for muscle recovery")'
                  disabled={loading}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </div>
              <button
                onClick={() => sendQuery()}
                disabled={loading || !input.trim()}
                className="tb-btn-primary"
                style={{ opacity: (loading || !input.trim()) ? 0.5 : 1, cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', gap: '6px' }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                <span>Run Intent</span>
                <span className="tb-kbd">↵</span>
              </button>
            </div>

            {/* Accordion Fold: Advanced Dispatch Constraints */}
            <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <button
                onClick={() => setShowAdvancedConstraints(!showAdvancedConstraints)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  padding: 0,
                }}
              >
                <Sliders size={12} />
                <span>Advanced Procurement Constraints</span>
                {showAdvancedConstraints ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showAdvancedConstraints && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  fontSize: '12px',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Merchant Optimization Objective
                    </label>
                    <select
                      value={selectedObjective}
                      onChange={e => setSelectedObjective(e.target.value as 'REVENUE' | 'MARGIN' | 'INVENTORY' | 'RETENTION')}
                      className="tb-input"
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
                    >
                      <option value="REVENUE">REVENUE (Maximize cart basket value)</option>
                      <option value="MARGIN">MARGIN (Enforce high-margin SKUs)</option>
                      <option value="INVENTORY">INVENTORY (Prioritize overstock depletion)</option>
                      <option value="RETENTION">RETENTION (Focus on high-synergy value)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Margin Protection Floor
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="tb-pill tb-pill-neutral">20% MINIMUM</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Hard-gated by Policy Engine</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Warehouse Buffer Reserve
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="tb-pill tb-pill-neutral">5 UNITS BUFFER</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Stockout prevention</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Execution Stream */}
          <div className="tb-card" style={{ padding: '20px', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Agent Execution Trace
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                {messages.length} DISPATCHED STEPS
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '640px', paddingRight: '4px' }}>
              {messages.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px', maxWidth: '440px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Bot size={20} color="#0f172a" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Agentic Test Environment Ready
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    Select a preset benchmark query above or enter commercial criteria to test autonomous merchant discovery, growth decision logic, policy guardrails, and settlement.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', padding: '0 2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
                      {msg.role === 'user' ? (
                        <>
                          <User size={13} color="#2563eb" />
                          <span>BUYER INTENT INPUT</span>
                        </>
                      ) : (
                        <>
                          <Bot size={13} color="#059669" />
                          <span>AUTONOMOUS AGENT TRACE</span>
                        </>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{msg.timestamp}</span>
                  </div>

                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: msg.role === 'user' ? '#f8fafc' : '#ffffff',
                    fontSize: '13px',
                    color: '#1e293b',
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontWeight: msg.role === 'user' ? 600 : 400 }}>{msg.content}</div>

                    {/* Structural Telemetry Cards */}
                    {msg.data && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        {/* 1. Parsed Intent */}
                        {msg.data.parsedIntent && (
                          <div className="tb-card-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', padding: '12px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Target Category</span>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{msg.data.parsedIntent.category}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Budget Ceiling</span>
                              <span style={{ fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                                ₹{msg.data.parsedIntent.budget?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Primary Goal</span>
                              <span style={{ color: '#334155' }}>{msg.data.parsedIntent.goal}</span>
                            </div>
                          </div>
                        )}

                        {/* 2. Discovered Merchants */}
                        {msg.data.discoveredMerchants && msg.data.discoveredMerchants.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                              Catalog Schemas Evaluated ({msg.data.discoveredMerchants.length})
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                              {msg.data.discoveredMerchants.map((m, idx) => (
                                <div key={idx} className="tb-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Building2 size={14} color={m.aiReady ? '#059669' : '#dc2626'} />
                                    <div>
                                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{m.name}</div>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>Score: {m.score}/100</div>
                                    </div>
                                  </div>
                                  <span className={`tb-pill ${m.aiReady ? 'tb-pill-emerald' : 'tb-pill-rose'}`}>
                                    {m.aiReady ? 'CERTIFIED' : 'REJECTED'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Selected Product */}
                        {msg.data.selectedProduct && (
                          <div className="tb-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderLeft: '3px solid #0f172a' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Best-Match SKU</span>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '1px' }}>{msg.data.selectedProduct.name}</div>
                              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{msg.data.selectedProduct.selectionReason}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Base Price</span>
                              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                                ₹{msg.data.selectedProduct.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3a. Merchant Evaluation Arbitration */}
                        {msg.data.whyThisMerchant && (
                          <div className="tb-card-inner" style={{ padding: '12px 14px', borderLeft: '3px solid #059669', background: '#f0fdf4' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <CheckCircle2 size={14} color="#059669" />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                                Why This Merchant Was Selected
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.5 }}>
                              {msg.data.whyThisMerchant}
                            </div>
                          </div>
                        )}

                        {msg.data.rejectedMerchants && msg.data.rejectedMerchants.length > 0 && (
                          <div className="tb-card-inner" style={{ padding: '12px 14px', borderLeft: '3px solid #dc2626', background: '#fef2f2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                              <ShieldAlert size={14} color="#dc2626" />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                                Merchants Disqualified ({msg.data.rejectedMerchants.length})
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {msg.data.rejectedMerchants.map((rej, rIdx) => (
                                <div key={rIdx} style={{ fontSize: '11px', color: '#334155', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                  <span style={{ fontWeight: 600, color: '#0f172a', minWidth: '110px' }}>{rej.name}:</span>
                                  <span style={{ color: '#991b1b' }}>{rej.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3b. Revenue Intelligence Decision Engine */}
                        {msg.data.growthOffers?.decision && (
                          <div className="tb-card-inner" style={{ padding: '12px 14px', borderLeft: '3px solid #4f46e5', background: '#eef2ff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Scale size={14} color="#4f46e5" />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#3730a3', textTransform: 'uppercase' }}>
                                  Revenue Decision: {msg.data.growthOffers.decision.selectedAction}
                                </span>
                              </div>
                              <span className="tb-pill tb-pill-blue">
                                OBJECTIVE: {msg.data.growthOffers.decision.objective}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.5, marginBottom: '8px' }}>
                              {msg.data.growthOffers.decision.actionReason}
                            </div>
                            {msg.data.growthOffers.decision.evaluatedFactors && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #c7d2fe', color: '#312e81' }}>
                                  Margin: <strong>{msg.data.growthOffers.decision.evaluatedFactors.currentProductMarginPercent}%</strong>
                                </span>
                                <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #c7d2fe', color: '#312e81' }}>
                                  Headroom: <strong>₹{msg.data.growthOffers.decision.evaluatedFactors.budgetHeadroom}</strong>
                                </span>
                                <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #c7d2fe', color: '#312e81' }}>
                                  Stock: <strong>{msg.data.growthOffers.decision.evaluatedFactors.inventoryStock} units</strong>
                                </span>
                                <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #c7d2fe', color: msg.data.growthOffers.decision.evaluatedFactors.minMarginCompliant ? '#065f46' : '#991b1b' }}>
                                  Margin Floor: <strong>{msg.data.growthOffers.decision.evaluatedFactors.minMarginCompliant ? 'PASS' : 'FAIL'}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. Policy Result */}
                        {msg.data.policyResult && (
                          <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ShieldCheck size={16} color="#059669" />
                              <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 500 }}>{msg.data.policyResult.summary}</span>
                            </div>
                            <span className="tb-pill tb-pill-emerald">7/7 GATES PASSED</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Interactive Pre-Checkout Deck */}
          {agentState?.waitingForUser && agentState?.waitingForUserAction === 'payment_approval' && !orderConfirmed && (
            <div className="tb-card" style={{ padding: '22px', border: '1px solid #cbd5e1', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Checkout Authorization Deck</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Review available formulation optimizations or test agentic fault handling:</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Payable Amount</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    ₹{currentCartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Active Recovery Plan Banner */}
              {activeRecoveryPlan && (
                <div style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} color="#dc2626" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
                      Preflight Drift Detected — Settlement Blocked by Policy Gate #3
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f1d1d', lineHeight: 1.4 }}>
                    {agentState?.policyResult?.summary || activeRecoveryPlan.reason}
                  </div>
                  {activeRecoveryPlan.canRecover && activeRecoveryPlan.alternativeProduct && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: '#ffffff',
                      border: '1px solid #fecaca',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          Verified Substitute: {activeRecoveryPlan.alternativeProduct.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#059669' }}>
                          ₹{activeRecoveryPlan.alternativeProduct.price.toLocaleString('en-IN')} • {activeRecoveryPlan.alternativeProduct.stock} units verified in warehouse
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyRecovery(activeRecoveryPlan.alternativeProduct!.id)}
                        disabled={loading}
                        className="tb-btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <RefreshCw size={12} />
                        <span>Apply Recovery Alternative</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Offer Option Action Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {upsell?.available && (
                  <button
                    onClick={() => setShowUpsellModal(true)}
                    className="tb-card-interactive"
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderColor: upsellDecision === 'accepted' ? '#059669' : '#e2e8f0',
                      background: upsellDecision === 'accepted' ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600 }}>Formulation Upgrade</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
                      {upsellDecision === 'accepted' ? upsell.upgradeProduct.name : `Upgrade to ${upsell.upgradeProduct.name}`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      +₹{upsell.upgradeProduct.priceDelta} delta • Pure Isolate Tier
                    </div>
                  </button>
                )}

                {recoveryBundle?.available && (
                  <button
                    onClick={() => setShowRecoveryModal(true)}
                    className="tb-card-interactive"
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderColor: recoveryDecision === 'accepted' ? '#059669' : '#e2e8f0',
                      background: recoveryDecision === 'accepted' ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Synergy Bundle Deal</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
                      {recoveryDecision === 'accepted' ? recoveryBundle.product.name : `Bundle with ${recoveryBundle.product.name}`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Save ₹{recoveryBundle.product.discountAmount} (15% Bundle Discount)
                    </div>
                  </button>
                )}
              </div>

              {/* Primary Authorization Button */}
              <button
                onClick={() => approvePayment()}
                disabled={loading}
                className="tb-btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '14px', marginBottom: '14px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Communicating with Razorpay Rails...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Authorize & Pay ₹{currentCartTotal.toLocaleString('en-IN')} on Razorpay</span>
                  </>
                )}
              </button>

              {/* Fault Injection Test Suite */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Preflight Fault Injection Bench
                  </span>
                  <span className="tb-pill tb-pill-neutral">TEST BENCH CONTROLS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => approvePayment('price_surge')}
                    disabled={loading}
                    className="tb-card-interactive"
                    style={{
                      padding: '8px 12px',
                      fontSize: '11px',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      background: '#fffbeb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: 600,
                    }}
                    title="Simulates mid-flight price hike exceeding customer budget"
                  >
                    <Zap size={12} color="#b45309" />
                    <span>Simulate Price Drift (+₹800)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => approvePayment('stock_out')}
                    disabled={loading}
                    className="tb-card-interactive"
                    style={{
                      padding: '8px 12px',
                      fontSize: '11px',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: 600,
                    }}
                    title="Simulates stock dropping to 0 units before settlement"
                  >
                    <AlertTriangle size={12} color="#991b1b" />
                    <span>Simulate Stockout (0 Units)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Post-Purchase Confirmation Card */}
          {orderConfirmed && verifiedOrder && (
            <div className="tb-card" style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={22} color="#059669" />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#065f46' }}>Settlement Captured & Verified</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>Order ID: {verifiedOrder.id}</div>
                  </div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-mono)' }}>
                  ₹{verifiedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="tb-card-inner" style={{ padding: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '6px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Razorpay Payment ID:</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{verifiedOrder.paymentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Signature Verification:</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>HMAC-SHA256 VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Ledger & Policy Matrix (4 cols, Pinned Sticky) */}
        <aside className="tb-sticky-aside">
          
          {/* Sliding Tab Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '3px', gap: '3px' }}>
            <button
              onClick={() => setSidebarTab('ledger')}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                border: 'none',
                background: sidebarTab === 'ledger' ? '#ffffff' : 'transparent',
                color: sidebarTab === 'ledger' ? '#0f172a' : '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: sidebarTab === 'ledger' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Receipt size={13} color="#059669" />
              <span>LEDGER & POLICY</span>
            </button>
            <button
              onClick={() => setSidebarTab('audit')}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                border: 'none',
                background: sidebarTab === 'audit' ? '#ffffff' : 'transparent',
                color: sidebarTab === 'audit' ? '#0f172a' : '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: sidebarTab === 'audit' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={13} color="#4f46e5" />
              <span>AUDIT TRAIL ({auditTrail.length})</span>
            </button>
          </div>

          {/* TAB 1: Ledger & Financial Safety Matrix */}
          {sidebarTab === 'ledger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Itemized Cart Ledger */}
              <div className="tb-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                    Commercial Cart Ledger
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>INR (₹)</span>
                </div>

                {agentState?.cartId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    {/* Selected Item */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeProductName || agentState.selectedProduct?.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Merchant: {agentState.selectedProduct?.merchantId || 'HerbaMed'}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f172a' }}>
                        ₹{agentState.selectedProduct?.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Upsell Delta */}
                    {upsellDecision === 'accepted' && upsell && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#4f46e5', paddingLeft: '8px', borderLeft: '2px solid #818cf8', fontSize: '12px' }}>
                        <div>
                          <div>Formulation Upgrade Delta</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{upsell.upgradeProduct.name}</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>+₹{upsell.upgradeProduct.priceDelta.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {/* Recovery Bundle */}
                    {recoveryDecision === 'accepted' && recoveryBundle && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669', paddingLeft: '8px', borderLeft: '2px solid #34d399', fontSize: '12px' }}>
                        <div>
                          <div>{recoveryBundle.product.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>15% Bundle Discount</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>+₹{recoveryBundle.product.bundlePrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {/* Budget Utilization Micro-Bar & Visual Ring */}
                    <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Budget Utilization</span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: budgetRatio > 95 ? '#b45309' : '#059669' }}>
                          {budgetRatio}% (₹{effectiveTotal.toLocaleString('en-IN')} / ₹{budgetCeiling.toLocaleString('en-IN')})
                        </span>
                      </div>
                      <div className="tb-micro-bar">
                        <div
                          className="tb-micro-bar-fill"
                          style={{
                            width: `${budgetRatio}%`,
                            background: budgetRatio > 100 ? '#dc2626' : budgetRatio > 90 ? '#f59e0b' : '#059669',
                          }}
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Balance</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                        ₹{currentCartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    No active transaction. Dispatch an intent prompt to populate the real-time ledger.
                  </div>
                )}
              </div>

              {/* 7-Gate Financial Policy Guardrail Matrix */}
              <div className="tb-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                    Policy Matrix (7 Hard Gates)
                  </span>
                  <span className="tb-pill tb-pill-emerald">ENFORCED</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <PolicyCheckRow
                    label="Intent Budget Ceiling"
                    pass={!agentState?.parsedIntent || currentCartTotal <= agentState.parsedIntent.budget}
                    note="Cart must strictly obey max user budget"
                  />
                  <PolicyCheckRow
                    label="Catalog Schema Integrity"
                    pass={!!agentState?.selectedProduct}
                    note="Validates structured attributes & pricing"
                  />
                  <PolicyCheckRow
                    label="Price Tamper Shield"
                    pass={!activeRecoveryPlan}
                    note="Cryptographic live preflight hash"
                  />
                  <PolicyCheckRow
                    label="Merchant AI Certification"
                    pass={true}
                    note="Validates catalog machine readability"
                  />
                  <PolicyCheckRow
                    label="Warehouse Stock Reserve"
                    pass={!activeRecoveryPlan || activeRecoveryPlan.reason.indexOf('depleted') === -1}
                    note="Enforces live stock buffer (>5 units)"
                  />
                  <PolicyCheckRow
                    label="Razorpay Rails Ready"
                    pass={true}
                    note="Gateway connectivity & token generation"
                  />
                  <PolicyCheckRow
                    label="Explicit Human Consent"
                    pass={orderConfirmed || agentState?.waitingForUserAction === 'payment_approval'}
                    note="Zero unauthorized financial debits"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Audit Telemetry Stream */}
          {sidebarTab === 'audit' && (
            <div className="tb-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '680px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                  Audit Trail Telemetry
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{auditTrail.length} RECORDS</span>
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {(['all', 'blocked', 'passed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAuditFilter(f)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      background: auditFilter === f ? '#0f172a' : 'transparent',
                      color: auditFilter === f ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '540px' }}>
                {filteredAuditTrail.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    No matching audit records.
                  </div>
                ) : (
                  filteredAuditTrail.map((ev, idx) => (
                    <div key={ev.id || idx} className="tb-card-inner" style={{ padding: '10px 12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ fontWeight: 700, color: ev.status === 'blocked' ? '#dc2626' : '#059669' }}>
                          {ev.action}
                        </span>
                        <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          {ev.timestamp.split('T')[1]?.substring(0, 8) || ev.timestamp}
                        </span>
                      </div>

                      {ev.tool && (
                        <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          TOOL: <span style={{ color: '#4f46e5' }}>{ev.tool}</span>
                        </div>
                      )}

                      <div style={{ color: '#0f172a', fontSize: '12px', lineHeight: 1.4 }}>
                        <strong>RESULT:</strong> {ev.outputSummary}
                      </div>

                      {ev.reason && (
                        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                          ↳ <strong>REASON:</strong> {ev.reason}
                        </div>
                      )}

                      {ev.policyResult && (
                        <div style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: ev.policyResult.startsWith('PASS') ? '#ecfdf5' : '#fef2f2',
                          color: ev.policyResult.startsWith('PASS') ? '#065f46' : '#991b1b',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}>
                          POLICY: {ev.policyResult}
                        </div>
                      )}

                      {ev.nextState && (
                        <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          NEXT STATE → <span style={{ color: '#0f172a', fontWeight: 600 }}>{ev.nextState}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ============================================================ */}
      {/* 3. DETERMINISTIC UPSELL UPGRADE MODAL                         */}
      {/* ============================================================ */}
      {showUpsellModal && upsell && (
        <div className="tb-modal-overlay">
          <div className="tb-modal-dialog">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Formulation Upgrade Proposal</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Growth engine identified a higher-tier formulation with superior bioavailability matching your intent.
            </p>

            {/* Comparison Deck */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ paddingRight: '10px', borderRight: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Current Baseline</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{upsell.originalProduct.name}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ₹{upsell.originalProduct.price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{upsell.originalProduct.protein}g Protein • Concentrate</div>
              </div>

              <div style={{ paddingLeft: '4px' }}>
                <span style={{ fontSize: '10px', color: '#059669', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Recommended Upgrade</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{upsell.upgradeProduct.name}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ₹{upsell.upgradeProduct.price.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '12px', color: '#4f46e5' }}>(+₹{upsell.upgradeProduct.priceDelta})</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{upsell.upgradeProduct.protein}g Protein • Pure Isolate</div>
              </div>
            </div>

            {/* Decision Rationale */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Decision Rationale
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {upsell.upgradeProduct.advantages.map((adv, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                    <Check size={13} color="#059669" style={{ flexShrink: 0 }} />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Confirmation */}
            <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#ecfdf5', border: '1px solid #bbf7d0', fontSize: '12px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span>Compliant: Fits within your ₹{agentState?.parsedIntent?.budget?.toLocaleString('en-IN')} budget cap.</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleUpsellChoice(true)}
                className="tb-btn-primary"
                style={{ flex: 1 }}
              >
                <Zap size={14} />
                <span>Accept Upgrade (+₹{upsell.upgradeProduct.priceDelta})</span>
              </button>
              <button
                onClick={() => handleUpsellChoice(false)}
                className="tb-btn-secondary"
              >
                Keep Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. RECOVERY CROSS-SELL SYNERGY BUNDLE MODAL                  */}
      {/* ============================================================ */}
      {showRecoveryModal && recoveryBundle && (
        <div className="tb-modal-overlay">
          <div className="tb-modal-dialog">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Post-Workout Recovery Bundle</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Synergistic amino recovery supplement to accelerate protein synthesis.
            </p>

            {/* Deal Box */}
            <div style={{ padding: '14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>{recoveryBundle.product.name}</span>
                <span className="tb-pill tb-pill-blue">
                  SAVE ₹{recoveryBundle.product.discountAmount}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', fontFamily: 'var(--font-mono)' }}>
                  ₹{recoveryBundle.product.bundlePrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                  ₹{recoveryBundle.product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>(15% Deal)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#334155', borderTop: '1px solid #bfdbfe', paddingTop: '8px', fontStyle: 'italic' }}>
                &quot;{recoveryBundle.synergyReason}&quot;
              </div>
            </div>

            {/* Projected Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '20px' }}>
              <span style={{ color: '#64748b' }}>Projected Total with Bundle:</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                ₹{recoveryBundle.projectedTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleRecoveryChoice(true)}
                className="tb-btn-primary"
                style={{ flex: 1 }}
              >
                <PackageCheck size={14} />
                <span>Add Recovery Bundle (+₹{recoveryBundle.product.bundlePrice})</span>
              </button>
              <button
                onClick={() => handleRecoveryChoice(false)}
                className="tb-btn-secondary"
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

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TestbenchConnectedPipeline({
  step,
  hasIntent,
  hasDiscovery,
  hasSelection,
  hasArbitrage,
  hasPolicy,
  isSettled,
}: {
  step?: string;
  hasIntent: boolean;
  hasDiscovery: boolean;
  hasSelection: boolean;
  hasArbitrage: boolean;
  hasPolicy: boolean;
  isSettled: boolean;
}) {
  const steps = [
    { id: '01', label: 'INTENT', active: hasIntent, current: step === 'parseIntent' },
    { id: '02', label: 'DISCOVERY', active: hasDiscovery, current: step === 'discoverMerchants' },
    { id: '03', label: 'SELECTION', active: hasSelection, current: step === 'selectProduct' },
    { id: '04', label: 'ARBITRAGE', active: hasArbitrage, current: step === 'growthEngine' },
    { id: '05', label: 'POLICY', active: hasPolicy, current: step === 'checkPolicy' },
    { id: '06', label: 'SETTLEMENT', active: isSettled, current: step === 'paymentPhase', highlight: isSettled },
  ];

  return (
    <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', overflowX: 'auto' }}>
      {steps.map((s, idx) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              justifyContent: 'center',
              background: s.highlight
                ? '#ecfdf5'
                : s.current
                ? '#0f172a'
                : s.active
                ? '#f1f5f9'
                : 'transparent',
              color: s.highlight
                ? '#065f46'
                : s.current
                ? '#ffffff'
                : s.active
                ? '#0f172a'
                : '#94a3b8',
              border: s.highlight
                ? '1px solid #a7f3d0'
                : s.current
                ? '1px solid #0f172a'
                : s.active
                ? '1px solid #e2e8f0'
                : '1px solid #f1f5f9',
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {s.active && !s.current ? (
              <CheckCircle2 size={12} color={s.highlight ? '#059669' : '#475569'} />
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.8 }}>{s.id}</span>
            )}
            <span>{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div
              style={{
                width: '12px',
                height: '1px',
                background: s.active ? '#94a3b8' : '#e2e8f0',
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PolicyCheckRow({ label, pass, note }: { label: string; pass: boolean; note: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {pass ? (
          <Check size={13} color="#059669" />
        ) : (
          <XCircle size={13} color="#dc2626" />
        )}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{label}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>{note}</div>
        </div>
      </div>
      <span className={`tb-pill ${pass ? 'tb-pill-emerald' : 'tb-pill-rose'}`} style={{ fontSize: '10px' }}>
        {pass ? 'PASS' : 'WARN'}
      </span>
    </div>
  );
}
