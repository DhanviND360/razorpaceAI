import MerchantDashboard from '@/components/MerchantDashboard';

export const metadata = {
  title: 'Merchant Dashboard — RazorPace AI',
  description: 'View revenue analytics, catalog readiness scores, and AI-generated recommendations.',
};

export default function MerchantPage() {
  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>📊 Merchant Dashboard</h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          Revenue analytics calculated from actual transaction data. Catalog readiness scores computed by the real evaluator.
        </p>
      </div>
      <MerchantDashboard />
    </div>
  );
}
