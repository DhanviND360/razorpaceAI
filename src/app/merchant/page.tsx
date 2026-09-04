import MerchantDashboard from '@/components/MerchantDashboard';
import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Merchant Intelligence & Revenue Dashboard — RazorPace AI',
  description: 'Real-time revenue analytics, catalog AI-readability evaluation, growth operator telemetry, and policy audit ledger.',
};

export default function MerchantPage() {
  return (
    <div className="dash-container">
      {/* Page Header */}
      <div className="dash-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em', margin: 0 }}>
            <BarChart3 size={24} color="#10b981" />
            Merchant Revenue & Intelligence
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.6, margin: '6px 0 0 0' }}>
            AI-influenced transaction volume, incremental alpha revenue, catalog machine-readability audits, and growth operator decisions.
          </p>
        </div>
      </div>

      <MerchantDashboard />
    </div>
  );
}

