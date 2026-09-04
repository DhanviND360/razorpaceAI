'use client';

import { useState, useEffect } from 'react';

interface MerchantScore {
  merchantId: string;
  merchantName: string;
  productCount: number;
  catalogScore: number;
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

export default function MerchantDashboard() {
  const [merchants, setMerchants] = useState<MerchantScore[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catalogRes, analyticsRes] = await Promise.all([
          fetch('/api/catalog'),
          fetch('/api/analytics'),
        ]);
        const catalogData = await catalogRes.json();
        const analyticsData = await analyticsRes.json();
        setMerchants(catalogData.merchants || []);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Analytics Cards */}
      <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>📊 Revenue Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <MetricCard label="Total Revenue" value={`₹${analytics?.totalRevenue?.toLocaleString('en-IN') || '0'}`} />
        <MetricCard label="Baseline Revenue" value={`₹${analytics?.baselineRevenue?.toLocaleString('en-IN') || '0'}`} />
        <MetricCard label="Incremental Revenue" value={`₹${analytics?.incrementalRevenue?.toLocaleString('en-IN') || '0'}`} color="#22c55e" />
        <MetricCard label="Upsell Revenue" value={`₹${analytics?.upsellRevenue?.toLocaleString('en-IN') || '0'}`} />
        <MetricCard label="Cross-sell Revenue" value={`₹${analytics?.crossSellRevenue?.toLocaleString('en-IN') || '0'}`} />
        <MetricCard label="AOV Before AI" value={`₹${analytics?.aovBeforeAI?.toLocaleString('en-IN') || '0'}`} />
        <MetricCard label="AOV After AI" value={`₹${analytics?.aovAfterAI?.toLocaleString('en-IN') || '0'}`} color="#6366f1" />
        <MetricCard label="Incremental AOV" value={`₹${analytics?.incrementalAOV?.toLocaleString('en-IN') || '0'}`} color="#22c55e" />
        <MetricCard label="Total Orders" value={String(analytics?.totalOrders || 0)} />
        <MetricCard label="Successful Orders" value={String(analytics?.successfulOrders || 0)} color="#22c55e" />
        <MetricCard label="Failed Orders" value={String(analytics?.failedOrders || 0)} color={analytics?.failedOrders ? '#ef4444' : undefined} />
        <MetricCard label="Upsell Conversion" value={`${analytics?.upsellConversionRate || 0}%`} />
        <MetricCard label="Cross-sell Conversion" value={`${analytics?.crossSellConversionRate || 0}%`} />
      </div>

      {/* Recommendations */}
      {analytics?.recommendations?.length ? (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#111', borderRadius: '8px', border: '1px solid #222' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#888' }}>💡 Actionable Recommendations</h3>
          {analytics.recommendations.map((rec, i) => (
            <div key={i} style={{ padding: '6px 0', color: '#ccc', fontSize: '13px', borderBottom: '1px solid #1a1a1a' }}>
              • {rec}
            </div>
          ))}
        </div>
      ) : null}

      {/* Merchant Catalog Scores */}
      <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>🏪 Merchant Catalog Readiness</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {merchants.map(m => (
          <div key={m.merchantId} style={{
            padding: '16px', background: '#111', borderRadius: '8px',
            border: `1px solid ${m.aiReady ? '#22c55e33' : '#ef444433'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px' }}>{m.merchantName}</h3>
              <span style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                background: m.aiReady ? '#22c55e22' : '#ef444422',
                color: m.aiReady ? '#22c55e' : '#ef4444',
              }}>
                {m.aiReady ? 'AI Ready' : 'Not Ready'}
              </span>
            </div>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>{m.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#aaa', fontSize: '13px' }}>Catalog Score</span>
              <span style={{ fontWeight: 'bold', color: getScoreColor(m.catalogScore) }}>{m.catalogScore}/100</span>
            </div>
            <div style={{
              height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${m.catalogScore}%`,
                background: getScoreColor(m.catalogScore),
                borderRadius: '3px', transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>{m.productCount} products</span>
              <span>{m.transactionReady ? '✅ Tx Ready' : '❌ No Tx'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding: '16px', background: '#111', borderRadius: '8px',
      border: '1px solid #222',
    }}>
      <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: color || '#fff' }}>{value}</div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}
