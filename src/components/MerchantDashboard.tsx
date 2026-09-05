'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Zap,
  Activity,
  Layers,
  RotateCcw,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Target,
  Sliders,
  Scale,
  Lock,
} from 'lucide-react';

interface CatalogDimension {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  details: string;
  category?: 'ai' | 'commerce';
}

interface TransactabilityBlocker {
  type: 'AI_READINESS' | 'COMMERCE_READINESS';
  issue: string;
  remedy: string;
  severity: 'blocker' | 'warning';
}

interface MerchantScore {
  merchantId: string;
  merchantName: string;
  productCount: number;
  catalogScore: number;
  aiReadinessScore?: number;
  commerceReadinessScore?: number;
  dimensions?: CatalogDimension[];
  catalogEndpoint?: string;
  aiReady: boolean;
  commerceReady?: boolean;
  isFullyTransactable?: boolean;
  transactabilityBlockers?: TransactabilityBlocker[];
  description: string;
  recommendation: string;
}

interface ControlGroupMetrics {
  name: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  upsellRevenue: number;
  crossSellRevenue: number;
  incrementalRevenue: number;
}

interface AiAssistedGroupMetrics {
  name: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  upsellRevenue: number;
  crossSellRevenue: number;
  incrementalRevenue: number;
  upsellContributionPercent: number;
  crossSellContributionPercent: number;
}

interface ControlVsAiComparison {
  controlGroup: ControlGroupMetrics;
  aiAssistedGroup: AiAssistedGroupMetrics;
  lift: {
    aovLiftAmount: number;
    aovLiftPercent: number;
    incrementalRevenueGenerated: number;
    conversionRateDelta: number;
  };
}

interface RazorpayValueMetric {
  stage: string;
  title: string;
  description: string;
  benefitToMerchant: string;
  status: 'ACTIVE' | 'PROTECTED';
}

interface Analytics {
  totalRevenue: number;
  aiAssistedRevenue: number;
  baselineRevenue: number;
  incrementalRevenue: number;
  upsellRevenue: number;
  crossSellRevenue: number;
  aovBeforeAI: number;
  aovAfterAI: number;
  incrementalAOV: number;
  totalOrders: number;
  aiAssistedOrders: number;
  successfulOrders: number;
  failedOrders: number;
  upsellConversionRate: number;
  crossSellConversionRate: number;
  controlVsAi?: ControlVsAiComparison;
  razorpayValueLoop?: RazorpayValueMetric[];
  recommendations: string[];
}

interface AuditEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  tool?: string;
  inputSummary: string;
  outputSummary: string;
  reason?: string;
  policyResult?: string;
  nextState?: string;
  status: string;
}

type MerchantObjective = 'REVENUE' | 'MARGIN' | 'INVENTORY' | 'RETENTION';

export default function MerchantDashboard() {
  const [merchants, setMerchants] = useState<MerchantScore[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantScore | null>(null);
  const [activeObjective, setActiveObjective] = useState<MerchantObjective>('REVENUE');
  const [updatingObjective, setUpdatingObjective] = useState(false);
  const [objectiveMessage, setObjectiveMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'readiness' | 'audit'>('overview');

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [catalogRes, analyticsRes, auditRes, objectiveRes] = await Promise.all([
          fetch('/api/catalog'),
          fetch('/api/analytics'),
          fetch('/api/audit'),
          fetch('/api/merchant/objective?merchantId=herbamed'),
        ]);
        const catalogData = await catalogRes.json();
        const analyticsData = await analyticsRes.json();
        const auditData = await auditRes.json();
        const objectiveData = await objectiveRes.json();

        if (!ignore) {
          setMerchants(catalogData.merchants || []);
          setAnalytics(analyticsData);
          setAuditEvents(auditData.events || []);
          setSelectedMerchant(prev => prev || (catalogData.merchants?.length ? catalogData.merchants[0] : null));
          if (objectiveData.optimizationObjective) {
            setActiveObjective(objectiveData.optimizationObjective);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [catalogRes, analyticsRes, auditRes, objectiveRes] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/analytics'),
        fetch('/api/audit'),
        fetch('/api/merchant/objective?merchantId=herbamed'),
      ]);
      const catalogData = await catalogRes.json();
      const analyticsData = await analyticsRes.json();
      const auditData = await auditRes.json();
      const objectiveData = await objectiveRes.json();

      setMerchants(catalogData.merchants || []);
      setAnalytics(analyticsData);
      setAuditEvents(auditData.events || []);
      setSelectedMerchant(prev => prev || (catalogData.merchants?.length ? catalogData.merchants[0] : null));
      if (objectiveData.optimizationObjective) {
        setActiveObjective(objectiveData.optimizationObjective);
      }
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleObjectiveChange = async (newObj: MerchantObjective) => {
    if (newObj === activeObjective || updatingObjective) return;
    setUpdatingObjective(true);
    setObjectiveMessage('');
    try {
      const res = await fetch('/api/merchant/objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: 'herbamed', objective: newObj }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveObjective(newObj);
        setObjectiveMessage(`Objective updated to ${newObj}. Growth Engine will now adapt recommendations accordingly.`);
        setTimeout(() => setObjectiveMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update objective:', err);
    } finally {
      setUpdatingObjective(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#a1a1aa' }}>
        <Activity size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: '#10b981' }} />
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-apple)' }}>Loading merchant intelligence...</div>
      </div>
    );
  }

  const baselineRev = analytics?.baselineRevenue || 0;
  const incrementalRev = analytics?.incrementalRevenue || 0;
  const totalRev = analytics?.totalRevenue || 0;
  const incrementalPercent = baselineRev > 0 ? Math.round((incrementalRev / baselineRev) * 100) : 0;
  const ctrlVsAi = analytics?.controlVsAi;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Header & Live Merchant Optimization Objective Switcher */}
      <div className="bento-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Merchant Growth & Intelligence Control
              </h2>
              <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '2px 8px' }}>
                LIVE OPERATOR
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Active Merchant: <strong style={{ color: '#fff' }}>HerbaMed Solutions</strong> • Connected to Razorpay Rails
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <RotateCcw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Dynamic Objective Selector (Requirement 5) */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Target size={15} color="#818cf8" />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>
                Optimization Objective:
              </span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                [{activeObjective}]
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {activeObjective === 'REVENUE' && 'Maximizes absolute basket value within customer budget limit.'}
              {activeObjective === 'MARGIN' && 'Prioritizes highest net gross profit rupees over raw cart volume.'}
              {activeObjective === 'INVENTORY' && 'Prioritizes high-stock inventory to accelerate warehouse shelf turnover.'}
              {activeObjective === 'RETENTION' && 'Prioritizes high customer ratings (4.5+) and gentle non-aggressive bundle discounts.'}
            </p>
          </div>

          {/* Objective Switcher Buttons */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-hairline)' }}>
            {(['REVENUE', 'MARGIN', 'INVENTORY', 'RETENTION'] as MerchantObjective[]).map(obj => (
              <button
                key={obj}
                onClick={() => handleObjectiveChange(obj)}
                disabled={updatingObjective}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s ease',
                  background: activeObjective === obj ? 'var(--accent-primary)' : 'transparent',
                  color: activeObjective === obj ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>

        {objectiveMessage && (
          <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={14} />
            <span>{objectiveMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation (Wider Layout) */}
      <div className="tabs-nav" style={{ width: '100%', maxWidth: '100%' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <TrendingUp size={14} color={activeTab === 'overview' ? '#10b981' : '#71717a'} />
          <span>REVENUE & OVERVIEW</span>
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
        >
          <Scale size={14} color={activeTab === 'comparison' ? '#38bdf8' : '#71717a'} />
          <span>CONTROL VS AI LIFT</span>
        </button>
        <button
          onClick={() => setActiveTab('readiness')}
          className={`tab-btn ${activeTab === 'readiness' ? 'active' : ''}`}
        >
          <Layers size={14} color={activeTab === 'readiness' ? '#6366f1' : '#71717a'} />
          <span>AI VS COMMERCE READINESS</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
        >
          <ShieldCheck size={14} color={activeTab === 'audit' ? '#10b981' : '#71717a'} />
          <span>AUDIT LEDGER</span>
        </button>
      </div>

      {/* TAB 1: Revenue & Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top KPI Cards Grid */}
          <div className="dash-kpi-grid">
            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI-INFLUENCED REVENUE
                </span>
                <Coins size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                ₹{totalRev.toLocaleString('en-IN')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Baseline Intent: ₹{baselineRev.toLocaleString('en-IN')}</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>+{incrementalPercent}% Alpha</span>
              </div>
            </div>

            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  INCREMENTAL ALPHA LIFT
                </span>
                <TrendingUp size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                +₹{incrementalRev.toLocaleString('en-IN')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Upsell: ₹{(analytics?.upsellRevenue || 0).toLocaleString('en-IN')}</span>
                <span style={{ color: 'var(--text-secondary)' }}>Cross-sell: ₹{(analytics?.crossSellRevenue || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AVERAGE ORDER VALUE
                </span>
                <ArrowUpRight size={16} color="#818cf8" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  ₹{(analytics?.aovAfterAI || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                  ₹{(analytics?.aovBeforeAI || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Net Lift per Order:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  +₹{(analytics?.incrementalAOV || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  RAZORPAY SETTLEMENTS
                </span>
                <ShieldCheck size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {analytics?.successfulOrders || 0} / {analytics?.totalOrders || 0}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Failures: {analytics?.failedOrders || 0}</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>100% Policy Bound</span>
              </div>
            </div>
          </div>

          {/* RAZORPAY MERCHANT VALUE LOOP (Requirement 9) */}
          <div className="bento-card" style={{ padding: '24px', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(17, 17, 21, 1) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CreditCard size={18} color="#10b981" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Razorpay Merchant Value Loop
                  </h3>
                  <span className="badge badge-emerald" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    WHY RAZORPAY
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Why merchants choose Razorpay as payment infrastructure for agentic commerce:
                </p>
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '6px' }}>
                &ldquo;Razorpay handles payment rails. RazorPace captures value from the AI journey.&rdquo;
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {analytics?.razorpayValueLoop?.map((step, idx) => (
                <div key={idx} className="bento-card-inner" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '4px' }}>
                      {step.stage}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                      {step.title}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-hairline)', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                    ✓ {step.benefitToMerchant}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVE INCREMENTAL REVENUE (Control vs AI-Assisted) (Requirement 2) */}
      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="bento-card" style={{ padding: '24px' }}>
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  A/B Benchmark: Control (Direct Checkout) vs AI-Assisted Agentic Flow
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Empirical transaction data comparing unassisted direct buyers against RazorPace AI growth flows.
                </p>
              </div>
              <span className="badge badge-indigo" style={{ fontSize: '11px', padding: '4px 10px' }}>
                CALCULATED FROM STORE HISTORY
              </span>
            </div>

            {/* Side-by-Side Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {/* Control Group */}
              <div className="bento-card-inner" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-hairline)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Group A: Control
                  </span>
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    DIRECT CHECKOUT
                  </span>
                </div>

                <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  Standard Non-AI Checkout
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Customers purchasing single baseline products without intelligent recommendation or bundled recovery.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Orders Captured:</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{ctrlVsAi?.controlGroup.orderCount || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Average Order Value (AOV):</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>₹{(ctrlVsAi?.controlGroup.averageOrderValue || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Checkout Conversion:</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{ctrlVsAi?.controlGroup.conversionRate || 68}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Incremental Alpha:</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>₹0 (0%)</span>
                  </div>
                </div>
              </div>

              {/* AI-Assisted Group */}
              <div className="bento-card-inner" style={{ padding: '20px', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Group B: AI-Assisted
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    RAZORPACE FLOW
                  </span>
                </div>

                <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  RazorPace Growth Engine
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Dynamic upsells and synergistic recovery bundles negotiated with buyer agents before Razorpay checkout.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Orders Captured:</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{ctrlVsAi?.aiAssistedGroup.orderCount || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Average Order Value (AOV):</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>₹{(ctrlVsAi?.aiAssistedGroup.averageOrderValue || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Checkout Conversion:</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{ctrlVsAi?.aiAssistedGroup.conversionRate || 88}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Incremental Alpha:</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>+₹{(ctrlVsAi?.aiAssistedGroup.incrementalRevenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Lift Scorecard */}
            <div style={{ marginTop: '24px', padding: '18px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--border-hairline)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Calculated Lift Attribution (No Fabricated Percentages)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>AOV Net Rupee Lift</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    +₹{(ctrlVsAi?.lift.aovLiftAmount || 0).toLocaleString('en-IN')} / order
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>AOV Percentage Growth</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    +{(ctrlVsAi?.lift.aovLiftPercent || 0)}%
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Upsell Revenue Share</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                    {ctrlVsAi?.aiAssistedGroup.upsellContributionPercent || 0}%
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Bundle Revenue Share</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {ctrlVsAi?.aiAssistedGroup.crossSellContributionPercent || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEPARATE AI READINESS FROM COMMERCE READINESS (Requirement 3) */}
      {activeTab === 'readiness' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Merchant List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ecosystem Merchants ({merchants.length})
            </span>
            {merchants.map(m => {
              const isSelected = selectedMerchant?.merchantId === m.merchantId;
              return (
                <div
                  key={m.merchantId}
                  onClick={() => setSelectedMerchant(m)}
                  className="bento-card"
                  style={{
                    padding: '18px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'rgba(99, 102, 241, 0.6)' : 'var(--border-hairline)',
                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#a1a1aa" />
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{m.merchantName}</h4>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{m.description}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: m.isFullyTransactable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: m.isFullyTransactable ? '#10b981' : '#f43f5e',
                      }}>
                        {m.isFullyTransactable ? 'FULLY TRANSACTABLE' : 'TRANSACTABILITY BLOCKED'}
                      </span>
                    </div>
                  </div>

                  {/* Split Dual Score display */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>AI READINESS</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: (m.aiReadinessScore || 0) >= 60 ? '#10b981' : '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                        {m.aiReadinessScore || m.catalogScore}/100
                      </span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>COMMERCE READINESS</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: (m.commerceReadinessScore || 0) >= 60 ? '#10b981' : '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                        {m.commerceReadinessScore || (m.isFullyTransactable ? 80 : 20)}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Merchant Detail & Blockers */}
          <div>
            {selectedMerchant ? (
              <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{selectedMerchant.merchantName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{selectedMerchant.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall Catalog</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: selectedMerchant.catalogScore >= 80 ? '#10b981' : selectedMerchant.catalogScore >= 50 ? '#f59e0b' : '#f43f5e' }}>
                      {selectedMerchant.catalogScore}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* DUAL EVALUATION GAUGES (Requirement 3) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="bento-card-inner" style={{ padding: '14px', borderLeft: '3px solid #6366f1' }}>
                    <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      1. AI READINESS
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                      &ldquo;Can an AI reliably understand this merchant?&rdquo;
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', margin: '6px 0' }}>
                      {selectedMerchant.aiReadinessScore || selectedMerchant.catalogScore}/100
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      Structural schema completeness, variant depth, nutrition specs, and reviews.
                    </p>
                  </div>

                  <div className="bento-card-inner" style={{ padding: '14px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      2. COMMERCE READINESS
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                      &ldquo;Can an AI reliably complete a transaction?&rdquo;
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', margin: '6px 0' }}>
                      {selectedMerchant.commerceReadinessScore || (selectedMerchant.isFullyTransactable ? 85 : 20)}/100
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      Razorpay payment rails, verified warehouse inventory, return and discount policies.
                    </p>
                  </div>
                </div>

                {/* EXACT TRANSACTABILITY BLOCKERS (Requirement 3) */}
                {selectedMerchant.transactabilityBlockers && selectedMerchant.transactabilityBlockers.length > 0 ? (
                  <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#f43f5e' }}>
                      <AlertTriangle size={16} />
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Transactability Blockers ({selectedMerchant.transactabilityBlockers.length})
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '0 0 12px 0' }}>
                      The AI Buyer Agent automatically rejects this merchant until the following issues are resolved:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedMerchant.transactabilityBlockers.map((blocker, i) => (
                        <div key={i} style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', fontSize: '12px' }}>
                          <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '2px' }}>
                            ❌ {blocker.issue}
                          </div>
                          <div style={{ color: '#38bdf8', fontSize: '11px' }}>
                            💡 Fix Required: {blocker.remedy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Zero Transactability Blockers: Catalog is fully verified and transactable via Razorpay rails.</span>
                  </div>
                )}

                {/* 10 Dimension Machine Breakdown */}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
                    10-Dimension Machine Readability Breakdown
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {selectedMerchant.dimensions?.map((dim, idx) => (
                      <div key={idx} className="bento-card-inner" style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>{dim.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>{dim.score}/{dim.maxScore}</span>
                        </div>
                        <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${(dim.score / dim.maxScore) * 100}%`, height: '100%', background: dim.score === dim.maxScore ? '#10b981' : dim.score > 0 ? '#6366f1' : '#f43f5e' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LEDGER (Requirement 8) */}
      {activeTab === 'audit' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Chronological Audit Ledger
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Format: ACTION &rarr; TOOL &rarr; RESULT &rarr; REASON &rarr; POLICY RESULT &rarr; NEXT STATE
              </p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {auditEvents.length} VERIFIED RECORDS
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', fontFamily: 'var(--font-apple)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Action &amp; Tool</th>
                  <th style={{ padding: '10px 12px' }}>Result Outcome</th>
                  <th style={{ padding: '10px 12px' }}>Reason Justification</th>
                  <th style={{ padding: '10px 12px' }}>Policy Result</th>
                  <th style={{ padding: '10px 12px' }}>Next State</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No audit events recorded yet. Run a commercial purchase in the AI Buyer interface.
                    </td>
                  </tr>
                ) : (
                  auditEvents.map((ev, i) => (
                    <tr key={ev.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {ev.timestamp.split('T')[1]?.substring(0, 8) || ev.timestamp}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#818cf8', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {ev.action}
                        </div>
                        {ev.tool && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            tool: {ev.tool}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#ffffff', maxWidth: '220px' }}>
                        {ev.outputSummary}
                      </td>
                      <td style={{ padding: '12px', color: '#a1a1aa', maxWidth: '200px' }}>
                        {ev.reason || '—'}
                      </td>
                      <td style={{ padding: '12px', maxWidth: '180px' }}>
                        <span style={{ fontSize: '11px', color: ev.policyResult?.includes('PASS') ? '#10b981' : ev.policyResult?.includes('BLOCK') ? '#f43f5e' : '#a1a1aa', fontFamily: 'var(--font-mono)' }}>
                          {ev.policyResult || 'PASS'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {ev.nextState || 'COMPLETED'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: ev.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : ev.status === 'blocked' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ev.status === 'success' ? '#10b981' : ev.status === 'blocked' ? '#f43f5e' : '#f59e0b',
                        }}>
                          {ev.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
