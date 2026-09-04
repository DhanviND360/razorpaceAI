import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import { Cpu, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "RazorPace AI — Agentic Commerce Infrastructure",
  description: "The intelligence layer between conversational AI commerce and Razorpay payment infrastructure. Make your merchant AI-discoverable, transactable, and revenue-optimized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        {/* Ambient Top Glow */}
        <div
          className="ambient-glow"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '240px',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15), transparent 70%)',
          }}
        />

        {/* Fixed Precision Navigation Bar */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(9, 9, 11, 0.88)',
          borderBottom: '1px solid var(--border-hairline)',
        }}>
          <div style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '0 24px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Logo Mark */}
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text-primary)',
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #1e1e24 0%, #2a2b36 100%)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}>
                ₹
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  RAZORPACE
                </span>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  AI / ENGINE
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
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
                href="/"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.15s ease',
                }}
              >
                Overview
              </Link>
              <Link
                href="/buyer"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Cpu size={13} strokeWidth={1.75} />
                <span>Autonomous Buyer</span>
              </Link>
              <Link
                href="/merchant"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Activity size={13} strokeWidth={1.75} />
                <span>Merchant Operator</span>
              </Link>
            </nav>

            {/* Right Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href="/buyer"
                className="btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                }}
              >
                Launch Console
              </Link>
            </div>
          </div>
        </header>

        {/* Global Body Container */}
        <div style={{ minHeight: '100vh', paddingTop: '56px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
