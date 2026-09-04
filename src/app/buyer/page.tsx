import BuyerChat from '@/components/BuyerChat';
import { Bot } from 'lucide-react';

export const metadata = {
  title: 'Autonomous Buyer Interface — RazorPace AI',
  description: 'Autonomous AI Buyer execution sandbox: catalog discovery, evaluation, intelligent growth optimization, policy gating, and Razorpay settlement.',
};

export default function BuyerPage() {
  return (
    <div className="dash-container">
      {/* Page Header */}
      <div className="dash-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em', margin: 0 }}>
            <Bot size={24} color="#10b981" />
            Autonomous AI Buyer
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.6, margin: '6px 0 0 0' }}>
            Autonomous agent executing commercial intent: catalog discovery, algorithmic evaluation, negotiation with the Merchant Growth Agent, policy enforcement, and cryptographic Razorpay settlement.
          </p>
        </div>
      </div>

      <BuyerChat />
    </div>
  );
}

