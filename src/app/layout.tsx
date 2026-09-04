import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RazorPace AI — Agentic Commerce Platform",
  description: "AI-powered revenue growth and agentic commerce for merchants. Built with LangGraph.js and Razorpay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#000',
          color: '#e5e5e5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
        }}
      >
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid #222',
          background: '#0a0a0a',
        }}>
          <a href="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
            ⚡ RazorPace AI
          </a>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/buyer" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '14px' }}>
              🤖 AI Buyer Demo
            </a>
            <a href="/merchant" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '14px' }}>
              📊 Merchant Dashboard
            </a>
          </div>
        </nav>
        <main style={{ padding: '16px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
