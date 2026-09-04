import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>⚡ RazorPace AI</h1>
      <p style={{ color: '#888', fontSize: '18px', marginBottom: '32px' }}>
        AI-powered revenue growth and agentic commerce for merchants
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
        <Link href="/buyer" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '32px', background: '#111', borderRadius: '12px',
            border: '1px solid #6366f133', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
            <h2 style={{ color: '#6366f1', marginBottom: '8px' }}>AI Buyer Demo</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>
              Experience the full agentic purchase flow — catalog evaluation, product selection, 
              upsell/cross-sell, policy checks, and real Razorpay payments.
            </p>
          </div>
        </Link>

        <Link href="/merchant" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '32px', background: '#111', borderRadius: '12px',
            border: '1px solid #22c55e33', cursor: 'pointer',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <h2 style={{ color: '#22c55e', marginBottom: '8px' }}>Merchant Dashboard</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>
              View revenue analytics, catalog readiness scores, upsell/cross-sell metrics, 
              and AI-generated recommendations.
            </p>
          </div>
        </Link>
      </div>

      <div style={{
        padding: '24px', background: '#0a0a0a', borderRadius: '12px',
        border: '1px solid #222', textAlign: 'left',
      }}>
        <h3 style={{ marginBottom: '12px', color: '#888' }}>🏗️ Architecture</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#aaa' }}>
          <div>• LangGraph.js Agent Orchestration</div>
          <div>• Groq LLM (llama-3.3-70b)</div>
          <div>• 18 Typed Agent Tools</div>
          <div>• Deterministic Policy Engine</div>
          <div>• Real Razorpay Test Mode</div>
          <div>• HMAC-SHA256 Verification</div>
          <div>• 4-Merchant Ecosystem</div>
          <div>• Catalog Readability Scorer</div>
          <div>• Complete Audit Trail</div>
          <div>• Revenue Analytics</div>
        </div>
      </div>

      <div style={{
        marginTop: '24px', padding: '16px', background: '#1a1a3e',
        borderRadius: '8px', border: '1px solid #6366f133',
      }}>
        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '4px' }}>
          <strong>Judge Demo:</strong> Go to AI Buyer Demo and enter:
        </p>
        <p style={{ color: '#6366f1', fontSize: '15px', fontStyle: 'italic' }}>
          &quot;I want whey protein under ₹5,000 for muscle growth&quot;
        </p>
      </div>
    </div>
  );
}
