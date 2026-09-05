import AgentWorkflow from '@/components/AgentWorkflow';
import { Layers } from 'lucide-react';

export const metadata = {
  title: 'Agent Workflow — RazorPace AI',
  description: 'Live visualization of the multi-agent orchestration pipeline: buyer agent, merchant growth agent, policy engine, and settlement engine working in concert.',
};

export default function WorkflowPage() {
  return (
    <div className="dash-container" style={{ paddingBottom: '80px' }}>
      {/* Page Header */}
      <div className="dash-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ padding: '3px 8px', fontSize: '10px' }}>
              MULTI-AGENT SYSTEM
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              LIVE ORCHESTRATION VIEW
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em', margin: 0 }}>
            <Layers size={24} color="#6366f1" />
            Agent Workflow
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.6, margin: '6px 0 0 0' }}>
            Real-time view of the autonomous agent pipeline — buyer discovery, merchant growth optimization, policy enforcement, and Razorpay settlement working in concert.
          </p>
        </div>
      </div>

      <AgentWorkflow />
    </div>
  );
}
