import BuyerChat from '@/components/BuyerChat';
import { Cpu, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Autonomous Buyer Agent Sandbox — RazorPace AI',
  description: 'Senior-grade testing workbench for autonomous buyer agents executing commercial intent with deterministic policy guardrails and Razorpay settlement.',
};

export default function BuyerPage() {
  return (
    <div className="dash-container" style={{ paddingBottom: '80px' }}>
      {/* Dark Theme Page Header */}
      <div className="dash-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ padding: '3px 8px', fontSize: '10px' }}>
              AUTONOMOUS COMMERCE
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SIMULATION ENVIRONMENT
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em', margin: 0 }}>
            <Cpu size={24} color="#6366f1" />
            Autonomous Buyer Agent Sandbox
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.6, margin: '6px 0 0 0' }}>
            Interactive simulation workbench for testing conversational buyer intent processing, multi-merchant catalog arbitration, deterministic policy gating, and automated Razorpay checkout.
          </p>
        </div>

        {/* Dark Theme Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '11px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>RAZORPAY TESTNET ACTIVE</span>
          </div>
          <div className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '11px' }}>
            <ShieldCheck size={12} color="#94a3b8" />
            <span>7 HARD GATES ACTIVE</span>
          </div>
        </div>
      </div>

      {/* AI Agent Buyer Window Frame (Light Mode Application Window) */}
      <div className="agent-window-frame">
        {/* Window Chrome Titlebar */}
        <div className="agent-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', opacity: 0.8 }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', opacity: 0.8 }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', opacity: 0.8 }} />
            </div>
            <div style={{ height: '12px', width: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
              buyer-agent-client.app [Interactive Testing Canvas]
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              WINDOW MODE: LIGHT UI
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
              ENV: LOCAL:3000
            </span>
          </div>
        </div>

        {/* AI Agent Buyer Window Body (Pure Light UI) */}
        <div className="agent-window-body">
          <BuyerChat />
        </div>
      </div>
    </div>
  );
}
