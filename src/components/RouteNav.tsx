'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Activity, ArrowLeftRight, Layers } from 'lucide-react';

export default function RouteNav() {
  const pathname = usePathname();
  const isOnBuyer = pathname === '/buyer';
  const isOnMerchant = pathname === '/merchant';
  const isOnWorkflow = pathname === '/workflow';
  const isOnSubpage = isOnBuyer || isOnMerchant || isOnWorkflow;

  if (!isOnSubpage) return null;

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: 'rgba(255, 255, 255, 0.03)',
      padding: '3px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-hairline)',
    }}>
      <Link
        href="/buyer"
        style={{
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 500,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s ease',
          color: isOnBuyer ? '#fff' : 'var(--text-muted)',
          background: isOnBuyer ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
          border: isOnBuyer ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
        }}
      >
        <Cpu size={13} strokeWidth={1.75} color={isOnBuyer ? '#6366f1' : undefined} />
        <span>AI Buyer</span>
      </Link>

      <ArrowLeftRight size={11} color="var(--text-faint)" style={{ margin: '0 2px' }} />

      <Link
        href="/merchant"
        style={{
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 500,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s ease',
          color: isOnMerchant ? '#fff' : 'var(--text-muted)',
          background: isOnMerchant ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
          border: isOnMerchant ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
        }}
      >
        <Activity size={13} strokeWidth={1.75} color={isOnMerchant ? '#10b981' : undefined} />
        <span>Merchant Operator</span>
      </Link>

      <ArrowLeftRight size={11} color="var(--text-faint)" style={{ margin: '0 2px' }} />

      <Link
        href="/workflow"
        style={{
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 500,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s ease',
          color: isOnWorkflow ? '#fff' : 'var(--text-muted)',
          background: isOnWorkflow ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
          border: isOnWorkflow ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
        }}
      >
        <Layers size={13} strokeWidth={1.75} color={isOnWorkflow ? '#f59e0b' : undefined} />
        <span>Agent Workflow</span>
      </Link>
    </nav>
  );
}
