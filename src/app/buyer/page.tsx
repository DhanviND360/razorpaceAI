import BuyerChat from '@/components/BuyerChat';

export const metadata = {
  title: 'AI Buyer Demo — RazorPace AI',
  description: 'Experience the full agentic purchase flow with catalog evaluation, product selection, upsell/cross-sell, and real Razorpay payments.',
};

export default function BuyerPage() {
  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>🤖 AI Buyer Demo</h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          Enter a shopping request. The AI agent will discover merchants, evaluate catalogs, select products, negotiate with the Merchant Growth Agent, and complete a real Razorpay test payment.
        </p>
      </div>
      <BuyerChat />
    </div>
  );
}
