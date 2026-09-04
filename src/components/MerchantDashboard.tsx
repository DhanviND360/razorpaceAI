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
} from 'lucide-react';

interface CatalogDimension {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  details: string;
}

interface MerchantScore {
  merchantId: string;
  merchantName: string;
  productCount: number;
  catalogScore: number;
  dimensions?: CatalogDimension[];
  catalogEndpoint?: string;
  aiReady: boolean;
  transactionReady: boolean;
  description: string;
  recommendation: string;
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
  recommendations: string[];
}

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

export default function MerchantDashboard() {
  const [merchants, setMerchants] = useState<MerchantScore[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'readiness' | 'growth' | 'audit'>('overview');

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [catalogRes, analyticsRes, auditRes] = await Promise.all([
          fetch('/api/catalog'),
          fetch('/api/analytics'),
          fetch('/api/audit'),
        ]);
        const catalogData = await catalogRes.json();
        const analyticsData = await analyticsRes.json();
        const auditData = await auditRes.json();

        if (!ignore) {
          setMerchants(catalogData.merchants || []);
          setAnalytics(analyticsData);
          setAuditEvents(auditData.events || []);
          setSelectedMerchant(prev => prev || (catalogData.merchants?.length ? catalogData.merchants[0] : null));
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
      const [catalogRes, analyticsRes, auditRes] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/analytics'),
        fetch('/api/audit'),
      ]);
      const catalogData = await catalogRes.json();
      const analyticsData = await analyticsRes.json();
      const auditData = await auditRes.json();

      setMerchants(catalogData.merchants || []);
      setAnalytics(analyticsData);
      setAuditEvents(auditData.events || []);
      setSelectedMerchant(prev => prev || (catalogData.merchants?.length ? catalogData.merchants[0] : null));
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#a1a1aa' }}>
        <Activity size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: '#10b981' }} />
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-apple)' }}>Loading merchant analytics...</div>
      </div>
    );
  }

  const baselineRev = analytics?.baselineRevenue || 0;
  const incrementalRev = analytics?.incrementalRevenue || 0;
  const totalRev = analytics?.totalRevenue || 0;
  const incrementalPercent = baselineRev > 0 ? Math.round((incrementalRev / baselineRev) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 3 Core Questions Executive Briefing Card */}
      <div className="bento-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Autonomous Revenue Operations Overview
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Real-time telemetry answering the three primary operational questions.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <RotateCcw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Question 1: What is happening? */}
          <div className="bento-card-inner" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#818cf8' }}>
              <Activity size={15} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. What is happening?
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#ffffff' }}>{analytics?.totalOrders || 0} commercial orders</strong> evaluated across autonomous AI buyers. Certified catalogs stream inventory and dynamic pricing.
            </p>
            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '10px' }}>
              • {merchants.filter(m => m.aiReady).length} of {merchants.length} merchants AI-certified
            </div>
          </div>

          {/* Question 2: Why is it happening? */}
          <div className="bento-card-inner" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#34d399' }}>
              <Zap size={15} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Why is it happening?
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: 1.6, margin: 0 }}>
              Merchant Growth Agent injects <strong style={{ color: '#ffffff' }}>deterministic upsell upgrades</strong> and <strong style={{ color: '#ffffff' }}>recovery bundles</strong> matching customer intent and budget constraints.
            </p>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '10px' }}>
              • 0 hallucinations, 100% policy-gated
            </div>
          </div>

          {/* Question 3: How much money did it influence? */}
          <div className="bento-card-inner" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#38bdf8' }}>
              <Coins size={15} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. How much money did it influence?
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '4px 0 8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                ₹{totalRev.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                (+₹{incrementalRev.toLocaleString('en-IN')} Alpha)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
              AI recommendations produced a <strong style={{ color: '#10b981' }}>+{incrementalPercent}% net lift</strong> over baseline transaction intent.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Segmented Control) */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <TrendingUp size={14} color={activeTab === 'overview' ? '#10b981' : '#71717a'} />
          <span>REVENUE PERFORMANCE</span>
        </button>
        <button
          onClick={() => setActiveTab('readiness')}
          className={`tab-btn ${activeTab === 'readiness' ? 'active' : ''}`}
        >
          <Layers size={14} color={activeTab === 'readiness' ? '#6366f1' : '#71717a'} />
          <span>CATALOG AI-READINESS</span>
        </button>
        <button
          onClick={() => setActiveTab('growth')}
          className={`tab-btn ${activeTab === 'growth' ? 'active' : ''}`}
        >
          <Zap size={14} color={activeTab === 'growth' ? '#06b6d4' : '#71717a'} />
          <span>GROWTH OPERATOR</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
        >
          <ShieldCheck size={14} color={activeTab === 'audit' ? '#10b981' : '#71717a'} />
          <span>AUDIT LEDGER</span>
        </button>
      </div>

      {/* TAB 1: Revenue Performance Bento */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top KPI Cards Grid */}
          <div className="dash-kpi-grid">
            {/* Metric 1 */}
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
                <span style={{ color: 'var(--text-muted)' }}>Baseline: ₹{baselineRev.toLocaleString('en-IN')}</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>+{incrementalPercent}% Alpha</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  INCREMENTAL ALPHA
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

            {/* Metric 3 */}
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

            {/* Metric 4 */}
            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SETTLEMENT ORDERS
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

          {/* Revenue Composition & Conversion Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Revenue Composition Architecture */}
            <div className="bento-card" style={{ padding: '24px' }}>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Revenue Composition Architecture
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Deconstruction of commercial volume into baseline intent versus algorithmic growth alpha.
                </p>
              </div>

              {/* Stacked Visual Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ height: '14px', borderRadius: '7px', background: '#000000', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-hairline)' }}>
                  <div
                    style={{ width: `${totalRev > 0 ? (baselineRev / totalRev) * 100 : 70}%`, background: '#52525b', height: '100%', transition: 'width 0.5s ease' }}
                    title={`Baseline: ₹${baselineRev}`}
                  />
                  <div
                    style={{ width: `${totalRev > 0 ? ((analytics?.upsellRevenue || 0) / totalRev) * 100 : 18}%`, background: '#6366f1', height: '100%', transition: 'width 0.5s ease' }}
                    title={`Upsell Alpha: ₹${analytics?.upsellRevenue}`}
                  />
                  <div
                    style={{ width: `${totalRev > 0 ? ((analytics?.crossSellRevenue || 0) / totalRev) * 100 : 12}%`, background: '#10b981', height: '100%', transition: 'width 0.5s ease' }}
                    title={`Cross-Sell Alpha: ₹${analytics?.crossSellRevenue}`}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52525b' }} />
                    <span>Baseline (₹{baselineRev.toLocaleString('en-IN')})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                    <span>Upsell (₹{(analytics?.upsellRevenue || 0).toLocaleString('en-IN')})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span>Cross-Sell (₹{(analytics?.crossSellRevenue || 0).toLocaleString('en-IN')})</span>
                  </div>
                </div>
              </div>

              {/* Actionable Findings */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-hairline)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  Operational Findings
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analytics?.recommendations?.length ? (
                    analytics.recommendations.map((rec, i) => (
                      <div key={i} className="bento-card-inner" style={{ padding: '10px 14px', fontSize: '13px', color: '#d4d4d8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>{rec}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No operational notices active.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Growth Conversion Rates */}
            <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Growth Conversion Rates
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Acceptance velocity for autonomous upsell upgrades and synergistic bundles.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                  {/* Upgrade Rate */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>Formulation Upgrade Rate</span>
                      <span style={{ fontWeight: 700, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>{analytics?.upsellConversionRate || 0}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                      <div style={{ width: `${analytics?.upsellConversionRate || 0}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Bioavailability delta accepted by buyer agents
                    </span>
                  </div>

                  {/* Bundle Rate */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>Recovery Bundle Synergy Rate</span>
                      <span style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>{analytics?.crossSellConversionRate || 0}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                      <div style={{ width: `${analytics?.crossSellConversionRate || 0}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      15% bundle discount accepted alongside primary supplement
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>All growth proposals operate strictly within merchant margin floors and intent budget limits.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Catalog AI-Readiness Matrix */}
      {activeTab === 'readiness' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Merchant List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Evaluated Merchant Catalogs
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
                      <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: m.catalogScore >= 90 ? '#10b981' : m.catalogScore >= 60 ? '#f59e0b' : '#f43f5e' }}>
                        {m.catalogScore}/100
                      </div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '4px',
                        background: m.aiReady ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: m.aiReady ? '#10b981' : '#f43f5e',
                      }}>
                        {m.aiReady ? 'AI-CERTIFIED' : 'FAILED AUDIT'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>{m.productCount} products</span>
                    <span>{m.transactionReady ? 'Transaction Enabled' : 'No Payment API'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Merchant Dimension Breakdown */}
          <div>
            {selectedMerchant ? (
              <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{selectedMerchant.merchantName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{selectedMerchant.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: selectedMerchant.catalogScore >= 90 ? '#10b981' : '#f43f5e' }}>
                      {selectedMerchant.catalogScore}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* 10 Dimension Breakdown */}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
                    10-Dimension Machine-Readability Breakdown
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {selectedMerchant.dimensions?.map((dim, idx) => (
                      <div key={idx} className="bento-card-inner" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>{dim.name}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>{dim.score}/{dim.maxScore}</span>
                        </div>
                        <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${(dim.score / dim.maxScore) * 100}%`, height: '100%', background: dim.score === dim.maxScore ? '#10b981' : dim.score > 0 ? '#6366f1' : '#f43f5e' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {dim.details}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Machine Endpoint */}
                <div className="bento-card-inner" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    MCP / JSON-LD ENDPOINT
                  </div>
                  <div style={{ fontSize: '12px', color: '#818cf8', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                    {selectedMerchant.catalogEndpoint || 'None configured (Catalog missing structured endpoint)'}
                  </div>
                </div>

                {/* Recommendation */}
                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-hairline)', fontSize: '13px', color: '#d4d4d8' }}>
                  <strong style={{ color: '#ffffff' }}>Evaluator Verdict: </strong>
                  {selectedMerchant.recommendation}
                </div>
              </div>
            ) : (
              <div className="bento-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a merchant to inspect its algorithmic catalog evaluation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Growth Operator Decision Engine */}
      {activeTab === 'growth' && (
        <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Autonomous Revenue Operator Workflow
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              How customer intent is transformed into incremental transaction value.
            </p>
          </div>

          {/* 7 Pipeline Stages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 1</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>INTENT</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Goal & budget</div>
            </div>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 2</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>CATALOG</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stock & schema</div>
            </div>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 3</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>OPPORTUNITY</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Detect formula delta</div>
            </div>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 4</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>PROPOSAL</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Formulate upgrade</div>
            </div>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 5</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>RESPONSE</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Buyer accepts</div>
            </div>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 6</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>POLICY</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Safety & budget</div>
            </div>
            <div className="bento-card-inner" style={{ padding: '14px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>STEP 7</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>SETTLEMENT</div>
              <div style={{ fontSize: '11px', color: '#d4d4d8' }}>Razorpay payment</div>
            </div>
          </div>

          {/* Transparent Explainer Factors */}
          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-hairline)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '14px' }}>
              Transparent Decision Factors (6 Factor Matrix)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <div className="bento-card-inner" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>1. Customer Intent</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Directly extracted from user query (muscle building, weight management). No unprompted recommendations.</p>
              </div>
              <div className="bento-card-inner" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>2. Budget Ceiling</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Projected cart total with upgrades must never exceed the stated maximum intent budget cap.</p>
              </div>
              <div className="bento-card-inner" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>3. Purchase History</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Stack affinity informs complementary supplement suggestions without aggressive spam.</p>
              </div>
              <div className="bento-card-inner" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>4. Product Bioavailability</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Isolate vs Concentrate protein purity (+4g protein per serving, faster muscle protein synthesis).</p>
              </div>
              <div className="bento-card-inner" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>5. Live Inventory</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Proposals only trigger if the merchant has confirmed active stock in the catalog.</p>
              </div>
              <div className="bento-card-inner" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>6. Merchant Rules</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Ensures discounts stay strictly within the 15% maximum allowed margin policy.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Audit Ledger
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Immutable event stream recording AI Buyer, Merchant Agent, and Razorpay interactions.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {auditEvents.length} RECORDS
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', fontFamily: 'var(--font-apple)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Agent</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                  <th style={{ padding: '10px 12px' }}>Outcome Summary</th>
                  <th style={{ padding: '10px 12px' }}>Reason</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No audit events recorded yet. Run a commercial purchase in the AI Buyer interface.
                    </td>
                  </tr>
                ) : (
                  auditEvents.map((ev, i) => (
                    <tr key={ev.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {ev.timestamp.split('T')[1]?.substring(0, 8) || ev.timestamp}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#ffffff' }}>{ev.agent}</td>
                      <td style={{ padding: '12px', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>{ev.action}</td>
                      <td style={{ padding: '12px', color: '#d4d4d8', maxWidth: '300px' }}>{ev.outputSummary}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '240px' }}>{ev.reason || '—'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: ev.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : ev.status === 'failed' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ev.status === 'success' ? '#10b981' : ev.status === 'failed' ? '#f43f5e' : '#f59e0b',
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
